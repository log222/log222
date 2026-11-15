"""Pausas por pontuação, determinísticas e independentes do motor de voz.

Regras (config/estilo.json -> tempo.pausas, segundos de silêncio entre o fim de uma palavra e o início da próxima):
  fim_frase (. ? !)   exato   0,40   — a frase é sintetizada sozinha; o silêncio do motor nas pontas é aparado
  reticencias (… ...) exato   0,30   e substituído pelo valor configurado.
  dois_pontos (:)     exato   0,30   — dentro da frase: o silêncio que o motor fez é encurtado/alongado para o alvo
  virgula (,)         mínimo  0,15   — dentro da frase: só alonga o silêncio existente; sem silêncio, não força
  ponto_virgula (;)   mínimo  0,15
Silêncio = trecho não vozeado (limiar relativo, quadros de 10 ms) entre o meio de uma palavra e o meio da seguinte.
"""
from __future__ import annotations

import re

import numpy as np

from . import tts_engine as T

KEEP = 0.02           # silêncio mantido em cada ponta ao aparar uma frase
MIN_RUN = 0.03        # menor silêncio que conta como "pausa existente"
FADE = 0.004


def tipo(word: str):
    w = word.rstrip("\"'”»)")
    if w.endswith("...") or w.endswith("…"):
        return "reticencias"
    if re.search(r"[.!?]$", w):
        return "fim_frase"
    if w.endswith(":"):
        return "dois_pontos"
    if w.endswith(";"):
        return "ponto_virgula"
    if w.endswith(","):
        return "virgula"
    return None


def alvo_fim(n_palavras, regras):
    """pausa depois de fim de frase: menor depois de fragmento curto ("Crac.", "Dia um.") se configurado."""
    if n_palavras <= int(regras.get("fragmento_max_palavras", 0)):
        return float(regras.get("fim_frase_fragmento", regras["fim_frase"]))
    return float(regras["fim_frase"])


def alvo(words, k, regras):
    """alvo da pausa depois da palavra k (considera fragmento para fim de frase)."""
    tp = tipo(words[k])
    if tp == "fim_frase":
        j = k
        while j > 0 and tipo(words[j - 1]) not in ("fim_frase", "reticencias"):
            j -= 1
        return alvo_fim(k - j + 1, regras)
    return float(regras[tp])


MODO = {"fim_frase": "exato", "reticencias": "exato", "dois_pontos": "exato", "virgula": "min", "ponto_virgula": "min"}


def frases(words):
    """[(i0, i1)] índices de palavras de cada frase (termina em . ! ? …)."""
    out, s = [], 0
    for i, w in enumerate(words):
        if tipo(w) in ("fim_frase", "reticencias"):
            out.append((s, i + 1)); s = i + 1
    if s < len(words):
        out.append((s, len(words)))
    return out


def trim(a, sr=T.SR):
    return T.trim_silence(a, sr, keep_s=KEEP)


def _run(audio, sr, t0, t1):
    """maior trecho não vozeado em [t0, t1] -> (ini, fim) s, ou None."""
    m = T.voiced_mask(audio, sr)
    a, b = max(0, int(t0 * 100)), min(len(m), int(np.ceil(t1 * 100)))
    best, k = None, a
    while k < b:
        if not m[k]:
            j = k
            while j < b and not m[j]:
                j += 1
            if best is None or j - k > best[1] - best[0]:
                best = (k, j)
            k = j
        else:
            k += 1
    if best is None or (best[1] - best[0]) * 0.01 < MIN_RUN:
        return None
    return best[0] * 0.01, best[1] * 0.01


def medir(audio, times, words, sr=T.SR):
    """pausa real em cada palavra pontuada (exceto a última): [(k, tipo, segundos ou 0.0)]."""
    out = []
    for k in range(len(words) - 1):
        tp = tipo(words[k])
        if not tp:
            continue
        r = _run(audio, sr, (times[k][0] + times[k][1]) / 2, (times[k + 1][0] + times[k + 1][1]) / 2)
        out.append((k, tp, round(r[1] - r[0], 3) if r else 0.0))
    return out


def ajustar(audio, times, words, regras, sr=T.SR, forcar=("fim_frase", "reticencias")):
    """Ajusta as pausas internas do clipe. Devolve (audio, times, relatorio).
    relatorio: [{k, palavra, tipo, alvo, antes, depois, acao}] — acao: ok | alongada | encurtada | forçada | sem pausa."""
    audio = audio.astype(np.float32)
    times = [list(t) for t in times]
    rel = []
    for k in range(len(words) - 1):
        tp = tipo(words[k])
        if not tp:
            continue
        alvo_ = alvo(words, k, regras)
        r = _run(audio, sr, (times[k][0] + times[k][1]) / 2, (times[k + 1][0] + times[k + 1][1]) / 2)
        antes = round(r[1] - r[0], 3) if r else 0.0
        modo = MODO[tp]
        acao, delta, at = "ok", 0.0, None
        if r is None:
            if tp in forcar:                              # fim de frase sem silêncio: insere na fronteira
                at, delta, acao = (times[k][1] + times[k + 1][0]) / 2, alvo_, "forçada"
            else:
                acao = "sem pausa"
        elif modo == "min" and antes < alvo_ - 0.01:
            at, delta, acao = (r[0] + r[1]) / 2, alvo_ - antes, "alongada"
        elif modo == "exato" and abs(antes - alvo_) > 0.02:
            at, delta = (r[0] + r[1]) / 2, alvo_ - antes
            acao = "alongada" if delta > 0 else "encurtada"
            if delta < 0:   # não come mais que o silêncio (mantém 10 ms de cada lado)
                delta = max(delta, -(antes - 0.02))
        if at is not None and abs(delta) > 0.005:
            p = int(at * sr); n = int(round(abs(delta) * sr)); f = int(FADE * sr)
            if delta > 0:
                pre, post = audio[:p].copy(), audio[p:].copy()
                pre[-f:] *= np.linspace(1, 0, f); post[:f] *= np.linspace(0, 1, f)
                audio = np.concatenate([pre, np.zeros(n, np.float32), post])
            else:
                a0, a1 = p - n // 2, p - n // 2 + n
                pre, post = audio[:a0].copy(), audio[a1:].copy()
                pre[-f:] *= np.linspace(1, 0, f); post[:f] *= np.linspace(0, 1, f)
                audio = np.concatenate([pre, post])
            d = (n / sr) * (1 if delta > 0 else -1)
            for q in range(k + 1, len(times)):
                times[q][0] += d; times[q][1] += d
        depois = round(antes + (delta if acao != "sem pausa" else 0), 3) if acao != "forçada" else alvo_
        rel.append({"k": k, "palavra": words[k], "tipo": tp, "alvo": alvo_, "antes": antes,
                    "depois": round(depois, 3), "acao": acao})
    return audio, [tuple(t) for t in times], rel


def trim2(a, sr=T.SR):
    """como trim(), mas devolve também quantos segundos saíram do começo."""
    m = T.voiced_mask(a, sr)
    idx = np.nonzero(m)[0]
    if len(idx) == 0:
        return a, 0.0
    hop = int(sr * 0.01)
    s = max(0, idx[0] * hop - int(KEEP * sr))
    e = min(len(a), (idx[-1] + 1) * hop + int(KEEP * sr))
    return a[s:e], s / sr
