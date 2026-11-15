"""Tempo de palavra HÍBRIDO: âncoras do ASR (Parakeet TDT v3, timestamps por token)
onde a palavra reconhecida casa com o texto + interpolação por fonemas entre âncoras.
Serve para TTS e para narração gravada (alinhamento palavra a palavra do arquivo inteiro).
Se o modelo ASR não estiver em .cache/asr, cai no estimador por fonemas (tts_engine).
"""
from __future__ import annotations

import difflib
import functools
import re
import unicodedata

import numpy as np
from scipy.signal import resample_poly

from . import tts_engine as T

PK_DIR = T.ROOT / ".cache" / "asr" / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
ASR_LEAD = 0.0   # correção de viés do timestamp do Parakeet (s); medido ~0 no teste de emenda


def available() -> bool:
    return (PK_DIR / "encoder.int8.onnx").exists()


@functools.lru_cache(maxsize=1)
def _rec():
    import sherpa_onnx
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(PK_DIR / "encoder.int8.onnx"), decoder=str(PK_DIR / "decoder.int8.onnx"),
        joiner=str(PK_DIR / "joiner.int8.onnx"), tokens=str(PK_DIR / "tokens.txt"),
        model_type="nemo_transducer", num_threads=4)


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", w)


def _expand_number(word, t0, t1):
    """'167' -> ['cento','e','sessenta','e','sete'] com tempo dividido por letras."""
    from num2words import num2words
    try:
        parts = num2words(int(word), lang="pt_BR").replace("-", " ").replace(",", " ").split()
    except Exception:
        return [(word, t0, t1)]
    L = [max(1, len(p)) for p in parts]
    e = np.concatenate([[0], np.cumsum(L)]) / sum(L)
    return [(p, t0 + (t1 - t0) * e[i], t0 + (t1 - t0) * e[i + 1]) for i, p in enumerate(parts)]


def asr_words(audio: np.ndarray, sr: int = T.SR, chunk_s: float = 25.0):
    """[(palavra_normalizada, ini, fim)] do áudio inteiro (em blocos cortados em silêncios)."""
    a16 = resample_poly(audio, 16000 // np.gcd(16000, sr), sr // np.gcd(16000, sr)).astype(np.float32)
    n = len(a16)
    # pontos de corte: silêncio mais próximo de cada múltiplo de chunk_s
    cuts = [0]
    if n / 16000 > chunk_s:
        sil = T.silences(a16, 16000, min_s=0.15)
        mids = [(x + y) / 2 for x, y in sil]
        k = chunk_s
        while k < n / 16000 - 5:
            if mids:
                c = min(mids, key=lambda m: abs(m - k))
                if c * 16000 > cuts[-1] + 16000 * 5:
                    cuts.append(int(c * 16000))
            k += chunk_s
    cuts.append(n)
    out = []
    rec = _rec()
    for s0, s1 in zip(cuts[:-1], cuts[1:]):
        st = rec.create_stream()
        st.accept_waveform(16000, np.concatenate([a16[s0:s1], np.zeros(8000, np.float32)]))
        rec.decode_stream(st)
        r = st.result
        toks, ts = list(r.tokens), list(r.timestamps)
        durs = list(r.durations) if r.durations else [0.08] * len(toks)
        words = []
        for tok, t, d in zip(toks, ts, durs):
            if tok.startswith(" ") or not words:
                words.append([tok.strip(), t, t + max(d, 0.04)])
            else:
                words[-1][0] += tok
                words[-1][2] = t + max(d, 0.04)
        off = s0 / 16000
        for w, a, b in words:
            nw = norm(w)
            if not nw:
                continue
            if nw.isdigit():
                out += [(norm(p), off + x, off + y) for p, x, y in _expand_number(nw, a, b)]
            else:
                out.append((nw, off + a, off + b))
    return out


def hybrid_times(audio: np.ndarray, words: list[str], spoken: list[str] | None = None, sr: int = T.SR,
                 asr=None, stats: dict | None = None):
    """Tempos (ini, fim) relativos ao áudio para cada palavra do TEXTO.
    asr: lista de asr_words já calculada (opcional). stats recebe contagem de âncoras."""
    spoken = spoken or words
    n = len(words)
    dur = len(audio) / sr
    if not available():
        return T.estimate_word_times(audio, words, spoken, sr)
    if asr is None:
        asr = asr_words(audio, sr)
    # o ASR ouve a forma FALADA (pronúncia); compare com ela, mas números do texto também por extenso
    ref = []
    for w, s in zip(words, spoken):
        x = norm(s if s and not s.startswith("/") else w)
        ref.append(x)
    sm = difflib.SequenceMatcher(a=ref, b=[x for x, _, _ in asr], autojunk=False)
    anchor = [None] * n
    for i, j, k in sm.get_matching_blocks():
        for q in range(k):
            # palavra de 1 letra isolada é âncora fraca: só aceita dentro de bloco >= 2
            if len(ref[i + q]) <= 1 and k < 2:
                continue
            anchor[i + q] = (max(0.0, asr[j + q][1] - ASR_LEAD), asr[j + q][2])
    if stats is not None:
        stats["palavras"] = stats.get("palavras", 0) + n
        stats["ancoras"] = stats.get("ancoras", 0) + sum(a is not None for a in anchor)
    # interpola os buracos com o estimador por fonemas dentro do intervalo livre
    est_full = T.estimate_word_times(audio, words, spoken, sr)
    times = [None] * n
    i = 0
    while i < n:
        if anchor[i] is not None:
            times[i] = list(anchor[i]); i += 1; continue
        j = i
        while j < n and anchor[j] is None:
            j += 1
        lo = anchor[i - 1][1] if i > 0 else 0.0
        hi = anchor[j][0] if j < n else dur
        if hi - lo < 0.05 * (j - i):          # sem espaço: usa o estimador puro
            for q in range(i, j):
                times[q] = list(est_full[q])
        else:
            seg = audio[int(lo * sr): int(hi * sr)]
            sub = T.estimate_word_times(seg, words[i:j], spoken[i:j], sr) if len(seg) > sr * 0.03 else \
                [(0, (hi - lo))] * (j - i)
            for q, (x, y) in zip(range(i, j), sub):
                times[q] = [lo + x, lo + y]
        i = j
    # início que caiu em silêncio (timestamp do ASR adiantado, comum na 1ª palavra após pausa):
    # empurra para o começo da voz, se a voz começar antes do fim da palavra
    vm = T.voiced_mask(audio, sr)
    for q in range(n):
        f0 = int(times[q][0] * 100)
        if f0 < len(vm) and not vm[f0:f0 + 3].any():
            f1 = int(times[q][1] * 100)
            on = np.nonzero(vm[f0:max(f0 + 1, f1)])[0]
            if len(on):
                times[q][0] = (f0 + on[0]) / 100
    # consistência: monotônico, fim = início da próxima (sem buraco dentro da fala contínua)
    for q in range(n):
        times[q][0] = max(times[q][0], times[q - 1][0] + 0.02 if q else 0.0)
    for q in range(n - 1):
        nxt = times[q + 1][0]
        if times[q][1] > nxt or nxt - times[q][1] < 0.12:
            times[q][1] = nxt
        times[q][1] = max(times[q][1], times[q][0] + 0.04)
    times[-1][1] = max(times[-1][1], min(dur, times[-1][0] + 0.1))
    return [(round(a, 3), round(b, 3)) for a, b in times]
