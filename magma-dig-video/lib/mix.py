"""Mixagem: narração + efeitos (por dados) + trilha opcional com ducking,
normalização para LUFS alvo e limitador de pico verdadeiro. Saída estéreo 48 kHz."""
from __future__ import annotations

import subprocess

import numpy as np
import pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d
from scipy.signal import lfilter, resample_poly

from . import music as M
from . import sfx as X

SR = 48000


def db(x):
    return 10 ** (x / 20)


def load_audio_file(path, sr=SR):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, 2).copy()


def _onepole(x, attack, release, rate):
    """seguidor de envelope com ataque/release diferentes (x amostrado a `rate` Hz)."""
    a_a, a_r = np.exp(-1 / (attack * rate)), np.exp(-1 / (release * rate))
    y = np.empty_like(x); v = 0.0
    for i, s in enumerate(x):
        c = a_a if s > v else a_r
        v = c * v + (1 - c) * s
        y[i] = v
    return y


def voice_activity(voice, hop=480):
    """0..1 por amostra: 1 enquanto há fala (com ataque 40 ms, release 400 ms)."""
    n = len(voice) // hop + 1
    pad = np.zeros(n * hop); pad[: len(voice)] = np.abs(voice)
    rms = np.sqrt((pad.reshape(n, hop) ** 2).mean(1))
    thr = max(1e-4, np.percentile(rms[rms > 1e-5], 60) * 0.25) if (rms > 1e-5).any() else 1
    act = (rms > thr).astype(float)
    # lookahead de 2 blocos (o duck começa antes da voz)
    act = np.maximum(act, np.concatenate([act[2:], [0, 0]]))
    env = _onepole(act, 0.04, 0.4, SR / hop)
    return np.repeat(env, hop)[: len(voice)]


def limiter(x, ceiling_db=-1.0, release=0.08):
    """limitador com lookahead de 5 ms sobre pico verdadeiro (4x)."""
    ceil = db(ceiling_db)
    up = resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]
    if len(pk) < len(x):
        pk = np.pad(pk, (0, len(x) - len(pk)))
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    la = int(0.005 * SR)
    g = minimum_filter1d(g, size=2 * la + 1)
    a = np.exp(-1 / (release * SR))
    # release suave (filtro de 1 polo sobre a redução), sem deixar passar picos
    g_s = lfilter([1 - a], [1, -a], g - 1) + 1
    g = np.minimum(g, g_s)
    return x * g[:, None]


def mixdown(voice24, events, dur, cfg, trilha=True, trilha_arquivo=None, seed=0):
    """voice24: narração mono 24 kHz. events: [{t, nome, vol (dB), kw}].
    cfg: estilo['audio']. Retorna (stereo float32 48k, info)."""
    n = int(np.ceil(dur * SR))
    v = resample_poly(voice24, 2, 1).astype(np.float64) * db(cfg.get("voz_db", 0))
    voice = np.zeros(n); voice[: min(n, len(v))] = v[:n]
    fx = np.zeros(n)
    for e in events:
        a = X.make(e["nome"], seed=e.get("seed", 0), **e.get("kw", {})).astype(np.float64)
        a = a * db(cfg.get("sfx_db", -6) + e.get("vol", 0))
        p = int(round(e["t"] * SR))
        if p < 0:
            a = a[-p:]; p = 0
        m = min(len(a), n - p)
        if m > 0:
            fx[p:p + m] += a[:m]
    bus = np.stack([voice + fx, voice + fx], axis=1)
    info = {}
    if trilha:
        if trilha_arquivo:
            mus = load_audio_file(trilha_arquivo).astype(np.float64)
            if len(mus) < n:
                mus = np.tile(mus, (int(np.ceil(n / len(mus))), 1))
            mus = mus[:n]
            t = np.arange(n) / SR
            mus *= (np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 1.5))[:, None]
        else:
            mm = M.make(dur, seed=seed).astype(np.float64)
            mus = np.stack([mm, mm], axis=1)[:n]
        act = voice_activity(voice)
        gdb = cfg.get("trilha_db", -20) - cfg.get("ducking_db", 9) * act
        bus += mus * db(gdb)[:, None]
    meter = pyln.Meter(SR)
    target = cfg.get("lufs", -14.0)
    out = bus
    for _ in range(3):
        lufs = meter.integrated_loudness(out)
        out = out * db(target - lufs)
        out = limiter(out, cfg.get("pico_dbtp", -1.0))
    info["lufs"] = round(meter.integrated_loudness(out), 2)
    up = resample_poly(out, 4, 1, axis=0)
    info["pico_dbtp"] = round(20 * np.log10(np.abs(up).max() + 1e-12), 2)
    return out.astype(np.float32), info
