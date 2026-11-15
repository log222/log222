"""Motor de TTS (Kokoro / Piper via sherpa-onnx) + estimativa de tempo por palavra.

Tudo aqui trabalha a 24 kHz mono float32 (taxa nativa do Kokoro); a mixagem
reamostra para 48 kHz.
"""
from __future__ import annotations

import functools
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / ".cache" / "models"
SR = 24000

KOKORO_VOICES = ["pm_alex", "pm_santa", "pf_dora"]
PIPER_VOICES = {"piper_faber": "vits-piper-pt_BR-faber-medium"}
ALL_VOICES = KOKORO_VOICES + list(PIPER_VOICES)

WORD_RE = re.compile(r"\S+")


# --------------------------------------------------------------------- engines
@functools.lru_cache(maxsize=1)
def _kokoro():
    from kokoro_onnx import Kokoro
    return Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))


@functools.lru_cache(maxsize=4)
def _piper(name: str):
    import sherpa_onnx
    d = MODELS / PIPER_VOICES[name]
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=str(d / "pt_BR-faber-medium.onnx"),
                tokens=str(d / "tokens.txt"),
                data_dir=str(d / "espeak-ng-data"),
            ),
            num_threads=2,
        ),
    )
    return sherpa_onnx.OfflineTts(cfg)


def synth(text: str, voice: str = "pm_alex", speed: float = 1.0) -> np.ndarray:
    """Sintetiza UMA frase. Retorna float32 24 kHz sem silêncio nas pontas."""
    if voice in KOKORO_VOICES:
        k = _kokoro()
        if "/" in text:  # trechos /IPA/ vindos do dicionário de pronúncia
            parts = re.split(r"(/[^/]+/)", text)
            ph = " ".join(p[1:-1] if p.startswith("/") and p.endswith("/") and len(p) > 2
                          else k.tokenizer.phonemize(p, "pt-br") for p in parts if p.strip())
            # pontuação logo após um trecho IPA (ex.: "/dˈiɡ/,") fica colada
            ph = re.sub(r"\s+([,.!?;:])", r"\1", " ".join(ph.split()))
            audio, sr = k.create(ph, voice=voice, speed=speed, is_phonemes=True, trim=True)
        else:
            audio, sr = k.create(text, voice=voice, speed=speed, lang="pt-br", trim=True)
        assert sr == SR
        return trim_silence(np.asarray(audio, dtype=np.float32))
    if voice in PIPER_VOICES:
        # sherpa-onnx 2.x não traz mais o frontend espeak para Piper: fonemizamos
        # aqui (mesmo espeak-ng do Kokoro) e passamos os codepoints.
        import sherpa_onnx
        tts = _piper(voice)
        ph = _espeak_raw(text)
        g = sherpa_onnx.GenerationConfig()
        g.phoneme_codepoints = [[ord(c) for c in ph]]
        g.speed = speed
        out = tts.generate(text, g)
        if out.sample_rate <= 0 or len(out.samples) == 0:
            raise RuntimeError(f"Piper falhou em {text!r}")
        a = np.asarray(out.samples, dtype=np.float32)
        if out.sample_rate != SR:
            from scipy.signal import resample_poly
            from math import gcd
            g = gcd(SR, out.sample_rate)
            a = resample_poly(a, SR // g, out.sample_rate // g).astype(np.float32)
        return trim_silence(a)
    raise ValueError(f"voz desconhecida: {voice} (use {ALL_VOICES})")


@functools.lru_cache(maxsize=1)
def _espeak_backend():
    import espeakng_loader
    from phonemizer.backend import EspeakBackend
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    return EspeakBackend("pt-br", preserve_punctuation=True, with_stress=True)


def _espeak_raw(text: str) -> str:
    return " ".join(_espeak_backend().phonemize([text])[0].split())


# ------------------------------------------------------------------ análise
def frame_rms(a: np.ndarray, sr: int = SR, hop_s: float = 0.01) -> np.ndarray:
    hop = int(sr * hop_s)
    n = max(1, len(a) // hop)
    a = a[: n * hop].reshape(n, hop)
    return np.sqrt((a.astype(np.float64) ** 2).mean(axis=1) + 1e-12)


def voiced_mask(a: np.ndarray, sr: int = SR, hop_s: float = 0.01, rel_db: float = -35.0) -> np.ndarray:
    r = frame_rms(a, sr, hop_s)
    db = 20 * np.log10(r)
    ref = np.percentile(db, 95)
    return db > ref + rel_db


def trim_silence(a: np.ndarray, sr: int = SR, keep_s: float = 0.03) -> np.ndarray:
    if len(a) == 0:
        return a
    m = voiced_mask(a, sr)
    idx = np.nonzero(m)[0]
    if len(idx) == 0:
        return a
    hop = int(sr * 0.01)
    s = max(0, idx[0] * hop - int(keep_s * sr))
    e = min(len(a), (idx[-1] + 1) * hop + int(keep_s * sr))
    return a[s:e]


def silences(a: np.ndarray, sr: int = SR, min_s: float = 0.12, rel_db: float = -35.0):
    """Lista de (ini, fim) em segundos de silêncios internos >= min_s."""
    m = voiced_mask(a, sr, rel_db=rel_db)
    out, i, n = [], 0, len(m)
    while i < n:
        if not m[i]:
            j = i
            while j < n and not m[j]:
                j += 1
            if i > 0 and j < n and (j - i) * 0.01 >= min_s:
                out.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return out


# ----------------------------------------------------- pronúncia e fonemas
def _norm_key(s: str) -> str:
    return re.sub(r"[^\w]", "", s.lower(), flags=re.UNICODE)


def tokenize(text: str) -> list[str]:
    return WORD_RE.findall(text)


def apply_pronunciation(words: list[str], pron: dict[str, str] | None) -> list[str]:
    """Para cada palavra ORIGINAL devolve sua forma falada (mesmo comprimento da
    lista). Chaves com várias palavras ("MAGMA DIG") são suportadas: a forma
    falada inteira fica na primeira palavra e as seguintes ficam vazias."""
    spoken = list(words)
    if not pron:
        return spoken
    keys = sorted(((k.split(), v) for k, v in pron.items()), key=lambda kv: -len(kv[0]))
    i = 0
    while i < len(words):
        for kw, v in keys:
            n = len(kw)
            seg = words[i : i + n]
            if len(seg) == n and all(_norm_key(a) == _norm_key(b) for a, b in zip(seg, kw)):
                # preserva pontuação da última palavra (pausas do TTS)
                tail = re.search(r"[^\w]*$", seg[-1], flags=re.UNICODE).group(0)
                spoken[i] = v + tail
                for k in range(1, n):
                    spoken[i + k] = ""
                i += n
                break
        else:
            i += 1
    return spoken


@functools.lru_cache(maxsize=20000)
def phoneme_weight(word: str) -> float:
    """Peso ~ número de fonemas (espeak pt-br). Pontuação adiciona um pouco."""
    m = re.search(r"/([^/]+)/", word)
    core = re.sub(r"[^\w]", "", word, flags=re.UNICODE)
    if not core:
        return 0.0
    try:
        ph = m.group(1) if m else _kokoro().tokenizer.phonemize(core, "pt-br")
        ph = ph.replace(" ", "")
    except Exception:
        return max(1.0, float(len(core)))
    # vogais pesam mais que consoantes; sílaba tônica alonga (ajustado contra
    # timestamps do Parakeet nas amostras: mediana ~80 ms, p90 ~200 ms)
    w = 0.0
    for c in ph:
        if c == "ˈ":
            w += 0.4
        elif c in "ˌː̃":
            continue
        elif c in _VOWELS:
            w += 1.3
        else:
            w += 0.8
    return max(0.6, w)


_VOWELS = set("aeiouɐɛɔəɪʊæyɨ")


# ------------------------------------------------------------ alinhamento
def estimate_word_times(audio: np.ndarray, words: list[str], spoken: list[str] | None = None,
                        sr: int = SR) -> list[tuple[float, float]]:
    """Distribui as palavras sobre o TEMPO VOZEADO da frase, proporcional aos
    fonemas. Fronteiras que caem num silêncio são encaixadas nas bordas dele.
    Retorna (ini, fim) relativos ao início do áudio da frase."""
    spoken = spoken or words
    n = len(words)
    if n == 0:
        return []
    dur = len(audio) / sr
    m = voiced_mask(audio, sr).astype(np.float64)
    if m.sum() < 3:
        m = np.ones_like(m)
    cum = np.concatenate([[0.0], np.cumsum(m)])  # cum[k] = vozeado até frame k
    total = cum[-1]
    wts = []
    for w_orig, w_sp in zip(words, spoken):
        wts.append(phoneme_weight(w_sp) if w_sp else 0.35)  # palavra "absorvida" pela anterior
    wts = np.array(wts)
    # pontuação: pequena folga no fim da palavra (respiro natural)
    cw = np.concatenate([[0.0], np.cumsum(wts)]) / wts.sum()
    times = []
    for i in range(n):
        f0, f1 = cw[i] * total, cw[i + 1] * total
        # início = ÚLTIMO frame onde cum <= f0 (sai do silêncio), fim = PRIMEIRO onde cum >= f1
        k0 = int(np.searchsorted(cum, f0, side="right") - 1)
        k1 = int(np.searchsorted(cum, f1, side="left"))
        t0 = min(dur, k0 * 0.01)
        t1 = min(dur, max(t0 + 0.04, k1 * 0.01))
        times.append((t0, t1))
    times[0] = (0.0, times[0][1])
    times[-1] = (times[-1][0], dur)
    return times


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    return [p for p in parts if p.strip()]


def strip_markup(word: str) -> tuple[str, bool]:
    """'*Zeca*,' -> ('Zeca,', True)."""
    emph = "*" in word
    return word.replace("*", ""), emph


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
