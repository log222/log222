"""Monta a faixa de narração + JSON de tempos (frase e palavra).

Formato do JSON de tempos (o mesmo para TTS e para áudio gravado):
{
  "versao": 1,
  "audio": "narracao.wav",          # relativo ao JSON
  "sr": 24000,
  "fonte": "tts" | "gravado",
  "voz": "pm_alex", "velocidade": 1.0,
  "duracao": 12.34,
  "frases": [
    {"i": 0, "grupo": "b1", "texto": "O Zeca cavou.", "falado": "O Zeca cavou.",
     "ini": 0.30, "fim": 1.52,
     "palavras": [{"w": "O", "ini": 0.30, "fim": 0.41}, ...]}
  ]
}
Tempos em segundos, absolutos dentro de "audio".
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

from . import tts_engine as T

CACHE = T.ROOT / ".cache" / "tts"


def synth_cached(text: str, voice: str, speed: float) -> np.ndarray:
    CACHE.mkdir(parents=True, exist_ok=True)
    h = hashlib.sha1(f"{voice}|{speed:.3f}|{text}".encode()).hexdigest()[:16]
    p = CACHE / f"{voice}-{h}.wav"
    if p.exists():
        a, _ = sf.read(p, dtype="float32")
        return a
    a = T.synth(text, voice, speed)
    sf.write(p, a, T.SR)
    return a


def phrase_entry(i, texto, grupo, audio, offset, pron):
    words = T.tokenize(texto)
    spoken = T.apply_pronunciation(words, pron)
    wt = T.estimate_word_times(audio, words, spoken)
    return {
        "i": i, "grupo": grupo, "texto": texto,
        "falado": " ".join(w for w in spoken if w),
        "ini": round(offset, 3), "fim": round(offset + len(audio) / T.SR, 3),
        "palavras": [{"w": w, "ini": round(offset + a, 3), "fim": round(offset + b, 3)}
                     for w, (a, b) in zip(words, wt)],
    }


def build_tts(phrases, out_dir: Path, voice="pm_alex", speed=1.0, pron=None,
              lead_in=0.25, tail=0.0, write_phrase_wavs=True):
    """phrases: lista de dicts {texto, grupo?, pausa_depois (s), silencio_antes (s)}.
    Escreve out_dir/narracao.wav, out_dir/frases/NNN.wav e out_dir/tempos.json."""
    out_dir = Path(out_dir)
    (out_dir / "frases").mkdir(parents=True, exist_ok=True)
    parts, entries, t = [np.zeros(int(lead_in * T.SR), np.float32)], [], lead_in
    for i, ph in enumerate(phrases):
        pre = float(ph.get("silencio_antes", 0.0))
        if pre:
            parts.append(np.zeros(int(round(pre * T.SR)), np.float32)); t += int(round(pre * T.SR)) / T.SR
        texto = ph["texto"]
        if not texto.strip():
            continue
        words = T.tokenize(texto)
        spoken_text = " ".join(w for w in T.apply_pronunciation(words, pron) if w)
        a = synth_cached(spoken_text, voice, speed)
        if write_phrase_wavs:
            sf.write(out_dir / "frases" / f"{i:03d}.wav", a, T.SR)
        e = phrase_entry(i, texto, ph.get("grupo"), a, t, pron)
        e["wav"] = f"frases/{i:03d}.wav"
        entries.append(e)
        parts.append(a); t += len(a) / T.SR
        gap = float(ph.get("pausa_depois", 0.35))
        n = int(round(gap * T.SR))
        parts.append(np.zeros(n, np.float32)); t += n / T.SR
    if tail:
        parts.append(np.zeros(int(tail * T.SR), np.float32))
    audio = np.concatenate(parts)
    sf.write(out_dir / "narracao.wav", audio, T.SR)
    data = {"versao": 1, "audio": "narracao.wav", "sr": T.SR, "fonte": "tts", "voz": voice,
            "velocidade": speed, "duracao": round(len(audio) / T.SR, 3), "frases": entries}
    (out_dir / "tempos.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    return data


# --------------------------------------------------------- áudio gravado
def load_any(path: Path, sr=T.SR) -> np.ndarray:
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr),
                        "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def realign(audio_path, phrases, out_dir: Path, pron=None, min_sil=0.18):
    """Alinhamento simples por frase de um áudio gravado único: escolhe, entre os
    silêncios do áudio, os N-1 que melhor batem com as fronteiras esperadas
    (proporcionais ao nº de fonemas de cada frase). Palavras: mesmo estimador do TTS."""
    out_dir = Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    a = load_any(audio_path)
    sf.write(out_dir / "narracao.wav", a, T.SR)
    texts = [p["texto"] for p in phrases if p["texto"].strip()]
    groups = [p.get("grupo") for p in phrases if p["texto"].strip()]
    N = len(texts)
    m = T.voiced_mask(a)
    vi = np.nonzero(m)[0]
    s0, s1 = vi[0] * 0.01, (vi[-1] + 1) * 0.01
    sil = [s for s in T.silences(a, min_s=min_sil) if s0 < s[0] and s[1] < s1]
    w = np.array([sum(T.phoneme_weight(x) for x in T.apply_pronunciation(T.tokenize(t), pron) if x)
                  for t in texts], dtype=float)
    exp = s0 + (s1 - s0) * np.cumsum(w)[:-1] / w.sum()  # N-1 fronteiras esperadas
    if N > 1 and len(sil) < N - 1:
        raise SystemExit(f"Só achei {len(sil)} pausas no áudio para {N} frases. Grave com pausas "
                         f"(~0,3 s) entre frases ou forneça o JSON de tempos.")
    bounds = []
    if N > 1:
        mids = np.array([(x + y) / 2 for x, y in sil]); lens = np.array([y - x for x, y in sil])
        S, K, span = len(sil), N - 1, (s1 - s0)
        cost = ((mids[None, :] - exp[:, None]) / span) ** 2 * 400 - np.log(lens)[None, :]
        dp = np.full((K, S), np.inf); bk = np.zeros((K, S), int)
        dp[0] = cost[0]
        for k in range(1, K):
            best, arg = np.inf, -1
            for j in range(S):
                if j - 1 >= 0 and dp[k - 1, j - 1] < best:
                    best, arg = dp[k - 1, j - 1], j - 1
                dp[k, j] = cost[k, j] + best; bk[k, j] = arg
        j = int(np.argmin(dp[K - 1])); sel = [j]
        for k in range(K - 1, 0, -1):
            j = bk[k, j]; sel.append(j)
        bounds = [sil[j] for j in reversed(sel)]
    edges = [s0] + [b for pair in bounds for b in pair] + [s1]
    entries = []
    for i in range(N):
        ini, fim = edges[2 * i], edges[2 * i + 1]
        seg = a[int(ini * T.SR): int(fim * T.SR)]
        entries.append(phrase_entry(i, texts[i], groups[i], seg, ini, pron))
    data = {"versao": 1, "audio": "narracao.wav", "sr": T.SR, "fonte": "gravado",
            "origem": str(audio_path), "duracao": round(len(a) / T.SR, 3), "frases": entries}
    (out_dir / "tempos.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    return data


def load_tempos(json_path: Path, audio_override=None):
    """Lê um JSON de tempos existente (ex.: editado à mão) e copia o áudio para 24 kHz."""
    json_path = Path(json_path)
    data = json.loads(json_path.read_text())
    src = Path(audio_override) if audio_override else json_path.parent / data["audio"]
    return data, load_any(src)
