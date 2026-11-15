"""Trilha sintetizada simples e discreta (loop de 4 compassos, clima de caverna).
make(dur_s, bpm=92, seed=0) -> float32 mono 48 kHz, com fade in/out."""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
# Am - F - Dm - E  (fundamental, notas do acorde em Hz)
PROG = [(110.00, [220.00, 261.63, 329.63]),
        (87.31, [174.61, 220.00, 261.63]),
        (73.42, [146.83, 174.61, 220.00]),
        (82.41, [164.81, 207.65, 246.94])]


def _lp(x, f, o=2):
    return sosfilt(butter(o, f, btype="low", fs=SR, output="sos"), x)


def make(dur: float, bpm: float = 92, seed: int = 0) -> np.ndarray:
    r = np.random.default_rng(seed)
    n = int(dur * SR) + SR
    out = np.zeros(n)
    beat = 60 / bpm
    bar = 4 * beat
    nbars = int(np.ceil(n / SR / bar))
    for b in range(nbars):
        root, chord = PROG[b % 4]
        s0 = int(b * bar * SR); L = int(bar * SR)
        if s0 >= n:
            break
        L = min(L, n - s0)
        t = np.arange(L) / SR
        # pad: serras desafinadas, filtradas, ataque lento
        pad = np.zeros(L)
        for f in chord:
            for det in (-0.6, 0.6):
                pad += 2 * ((t * (f + det) + r.uniform()) % 1) - 1
        pad = _lp(pad, 700) * 0.05
        env = np.minimum(1, t / 0.6) * np.minimum(1, (bar - t) / 0.25)
        out[s0:s0 + L] += pad * env
        # baixo: semínimas
        for k in range(4):
            p = s0 + int(k * beat * SR); m = min(int(beat * SR), n - p)
            if m <= 0:
                continue
            tt = np.arange(m) / SR
            bs = np.tanh(1.5 * np.sin(2 * np.pi * root * tt)) * np.exp(-tt * 3.5) * np.minimum(1, tt / 0.01)
            out[p:p + m] += bs * 0.22
        # arpejo: colcheias, pluck senoidal
        arp = chord + [chord[0] * 2, chord[2], chord[1]]
        for k in range(8):
            p = s0 + int(k * beat / 2 * SR); m = min(int(0.5 * SR), n - p)
            if m <= 0:
                continue
            tt = np.arange(m) / SR; f = arp[k % len(arp)] * 2
            pl = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 9) * np.minimum(1, tt / 0.003)
            out[p:p + m] += pl * 0.05
        # percussão leve: bumbo nos tempos 1 e 3, shaker nas colcheias
        for k in (0, 2):
            p = s0 + int(k * beat * SR); m = min(int(0.3 * SR), n - p)
            if m > 0:
                tt = np.arange(m) / SR
                out[p:p + m] += np.sin(2 * np.pi * (50 + 70 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * 0.25
        for k in range(8):
            p = s0 + int(k * beat / 2 * SR); m = min(int(0.05 * SR), n - p)
            if m > 0:
                nz = r.standard_normal(m) * np.exp(-np.arange(m) / SR * 80)
                out[p:p + m] += sosfilt(butter(2, 6000, "high", fs=SR, output="sos"), nz) * (0.03 if k % 2 else 0.018)
    out = out[: int(dur * SR)]
    t = np.arange(len(out)) / SR
    out *= np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.5)
    m = np.abs(out).max()
    return (out / m * 0.8).astype(np.float32) if m else out.astype(np.float32)


def make_suspensa(dur: float, seed: int = 0) -> np.ndarray:
    """camada 'suspensa': acorde sus2 sustentado sem resolver (A sus2 com 9ª e 4ª), tremolo lento,
    sem bateria nem arpejo. Mesmo nível de pico da trilha normal."""
    r = np.random.default_rng(seed + 7)
    n = int(dur * SR) + SR
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in [110.0, 164.81, 246.94, 293.66, 329.63]:   # A2 E3 B3 D4 E4
        for det in (-0.5, 0.5):
            x += 2 * ((t * (f + det) + r.uniform()) % 1) - 1
    x = _lp(x, 900) * 0.06
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.35 * t)
    hi = np.sin(2 * np.pi * 1318.5 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t)) * 0.01   # agudo "pendurado"
    out = (x + hi)[: int(dur * SR)]
    m = np.abs(out).max()
    return (out / m * 0.8).astype(np.float32) if m else out.astype(np.float32)


def automation(events, n, modos=("normal", "suspensa")):
    """events: [{t, db, rampa, modo}] (ordem qualquer). Devolve {modo: ganho linear por amostra}.
    Estado inicial: modo normal, 0 dB. Cada evento faz rampa linear (em amplitude) do estado atual
    para o novo, começando em t e terminando em t + rampa."""
    st = {"db": 0.0, "modo": "normal"}
    amp = lambda s, m: (10 ** (s["db"] / 20) if s["db"] > -79 else 0.0) if s["modo"] == m else 0.0
    pts = {m: [(0.0, amp(st, m))] for m in modos}
    for e in sorted(events, key=lambda e: e["t"]):
        new = {"db": float(e.get("db", st["db"])), "modo": e.get("modo", st["modo"])}
        t0, t1 = max(0.0, e["t"]), max(0.0, e["t"]) + max(0.005, float(e.get("rampa", 0.3)))
        for m in modos:
            pts[m] += [(t0, amp(st, m)), (t1, amp(new, m))]
        st = new
    tt = np.arange(n) / SR
    return {m: np.interp(tt, [p[0] for p in v], [p[1] for p in v]) for m, v in pts.items()}
