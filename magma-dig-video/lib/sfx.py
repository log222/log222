"""Biblioteca de efeitos SINTETIZADOS (numpy/scipy, nada baixado). 48 kHz mono float32.

Uso: from lib import sfx; a = sfx.make("picareta", seed=1)   # ou sfx.NAMES
Cada função aceita **kw opcionais (dur, pitch...). Determinístico por seed.
Gere WAVs para ouvir/inspecionar: python3 -m lib.sfx build/sfx
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000


def _t(dur):
    return np.arange(int(dur * SR)) / SR


def _env(n, a=0.002, d=0.2, curve=4.0):
    """envelope ataque linear + decaimento exponencial (d = tempo até ~-60 dB / curve)."""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e


def _bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def _lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def _hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def _norm(x, peak=0.9):
    m = np.abs(x).max()
    return (x / m * peak).astype(np.float32) if m > 0 else x.astype(np.float32)


def _room(x, size=0.35, mix=0.18, seed=0):
    """reverb barato (caverna): ruído com decaimento exponencial como IR."""
    r = np.random.default_rng(seed + 99)
    n = int(size * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / size)
    ir = _lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    wet = fftconvolve(x, ir)
    out = np.zeros(len(wet)); out[: len(x)] += x
    return out * (1 - mix) + wet * mix


def picareta(seed=0, pitch=1.0, **_):
    """picaretada em pedra: estalo metálico inarmônico + baque + cascalho."""
    r = np.random.default_rng(seed)
    n = int(0.6 * SR); t = np.arange(n) / SR
    ring = sum(a * np.sin(2 * np.pi * f * pitch * t + r.uniform(0, 6)) * np.exp(-t * dk)
               for f, a, dk in [(1870, 0.5, 38), (2960, 0.35, 45), (4410, 0.25, 60), (6230, 0.15, 80)])
    click = _bp(r.standard_normal(n), 1500, 9000) * _env(n, 0.0005, 0.03, 6)
    thump = np.sin(2 * np.pi * 110 * pitch * t * (1 - 0.3 * t)) * _env(n, 0.001, 0.08, 5)
    gravel = np.zeros(n)
    for _ in range(9):
        p = int(r.uniform(0.03, 0.35) * SR); m = int(0.012 * SR)
        gravel[p:p + m] += _bp(r.standard_normal(m), 800, 6000) * np.hanning(m) * r.uniform(0.1, 0.35)
    return _norm(_room(1.0 * click + 0.55 * ring + 0.8 * thump + gravel, 0.4, 0.2, seed))


def rachar(seed=0, dur=0.45, **_):
    """bloco rachando: série de estalos secos acelerando + crepitar."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); x = np.zeros(n)
    times = np.cumsum(r.uniform(0.01, 0.06, 40)); times = times[times < dur * 0.85]
    for i, tt in enumerate(times):
        p = int(tt * SR); m = int(r.uniform(0.004, 0.012) * SR)
        if p + m >= n:
            break
        x[p:p + m] += _bp(r.standard_normal(m), 1200, 8000) * np.exp(-np.arange(m) / m * 5) * (0.4 + 0.6 * i / len(times))
    crackle = _hp(r.standard_normal(n), 3000) * _env(n, 0.05, dur, 3) * 0.08
    low = _lp(r.standard_normal(n), 300) * _env(n, 0.01, 0.2, 5) * 0.6
    return _norm(_room(x + crackle + low, 0.3, 0.15, seed))


def quebrar(seed=0, **_):
    """bloco quebrando: estalo + baque grave + entulho caindo."""
    r = np.random.default_rng(seed)
    n = int(1.1 * SR); t = np.arange(n) / SR
    crack = np.zeros(n); c = rachar(seed, 0.18); crack[: len(c)] = c[:n] * 0.7
    boom = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 20)) * t) * _env(n, 0.002, 0.25, 4)
    noise = _lp(r.standard_normal(n), 2500) * _env(n, 0.002, 0.15, 5) * 0.7
    rubble = np.zeros(n)
    for _ in range(26):
        p = int(r.uniform(0.06, 0.8) * SR); m = int(r.uniform(0.01, 0.04) * SR)
        if p + m < n:
            lo = r.uniform(300, 1500)
            rubble[p:p + m] += _bp(r.standard_normal(m), lo, lo * 4) * np.hanning(m) * r.uniform(0.1, 0.4) * (1 - p / n)
    return _norm(_room(crack + boom + noise + rubble, 0.5, 0.22, seed))


def moeda(seed=0, pitch=1.0, **_):
    """moeda clássica: B5 -> E6 com harmônicos."""
    n = int(0.7 * SR); t = np.arange(n) / SR
    x = np.zeros(n); s = int(0.075 * SR)
    for f, st in [(987.77, 0), (1318.5, s)]:
        tt = t[: n - st]; f *= pitch
        tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.15 * np.sin(2 * np.pi * 3 * f * tt))
        x[st:] += tone * _env(n - st, 0.001, 0.45 if st else 0.08, 5)
    return _norm(_room(x, 0.25, 0.12, seed), 0.8)


def ding(seed=0, pitch=1.0, **_):
    """sino de recompensa (parciais de sino)."""
    n = int(1.6 * SR); t = np.arange(n) / SR; f = 1046.5 * pitch
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d)
            for k, a, d in [(1, 1, 2.5), (2.0, 0.4, 3.5), (2.76, 0.35, 4.5), (5.4, 0.2, 7), (8.93, 0.1, 10)])
    x *= np.minimum(1, t / 0.002)
    return _norm(_room(x, 0.6, 0.2, seed), 0.8)


def whoosh(seed=0, dur=0.55, up=True, **_):
    """whoosh de transição: ruído com passa-banda varrendo."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    noise = r.standard_normal(n)
    out = np.zeros(n); blk = 512
    centers = 250 * (14 ** np.sin(np.pi * k)) if up else 3500 * (0.08 ** k)
    zi = None
    for i in range(0, n, blk):
        c = float(centers[min(i + blk // 2, n - 1)])
        sos = butter(2, [max(60, c / 1.8), min(SR / 2 - 100, c * 1.8)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = sosfilt(sos, noise[i:i + blk], zi=zi)
        out[i:i + blk] = y
    env = np.sin(np.pi * k) ** 1.6
    return _norm(out * env, 0.7)


def ronco(seed=0, dur=2.2, **_):
    """ronco grave / tremor de terra."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    brown = np.cumsum(r.standard_normal(n)); brown -= _lp(brown, 5)
    rum = _lp(brown, 120, 4)
    am = 0.7 + 0.3 * np.sin(2 * np.pi * 5.5 * t + np.sin(2 * np.pi * 0.7 * t) * 2)
    sub = np.sin(2 * np.pi * 38 * t) * 0.5
    env = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.6)
    grit = _bp(r.standard_normal(n), 200, 900) * 0.04
    return _norm((rum / (np.abs(rum).max() + 1e-9) + sub + grit) * am * env, 0.9)


def tictac(seed=0, dur=4.0, bpm=120, **_):
    """tic-tac de relógio (alternando tic agudo e tac mais grave)."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); x = np.zeros(n); step = 60 / bpm
    for i in range(int(dur / step)):
        p = int(i * step * SR); m = int(0.03 * SR)
        if p + m >= n:
            break
        f = 3800 if i % 2 == 0 else 2700
        tt = np.arange(m) / SR
        click = (np.sin(2 * np.pi * f * tt) * 0.6 + _hp(r.standard_normal(m), 2000) * 0.5) * np.exp(-tt * 260)
        x[p:p + m] += click
    return _norm(_room(x, 0.2, 0.15, seed), 0.7)


def sting(seed=0, dur=2.6, **_):
    """sting de suspense: cluster dissonante crescendo + impacto grave."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in [110, 116.5, 164.8, 233.1, 246.9]:  # A2, A#2, E3, A#3, B3
        for det in (-0.25, 0.25):
            ph = r.uniform(0, 1)
            saw = 2 * ((t * (f + det) + ph) % 1) - 1
            x += saw
    w = (t / dur) ** 2
    x = _lp(x, 900, 2) * (1 - w) + _lp(x, 3300, 2) * w  # filtro abrindo
    swell = (t / dur) ** 1.8 * np.minimum(1, (dur - t) / 0.08)
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * 9 * t)
    hi = _bp(r.standard_normal(n), 4000, 9000) * (t / dur) ** 3 * 0.25
    out = (x / 10 * trem + hi) * swell
    hit = np.zeros(n); hn = int(0.6 * SR)
    th = np.arange(hn) / SR
    return _norm(_room(np.concatenate([out, np.sin(2 * np.pi * (45 + 40 * np.exp(-th * 15)) * th) * np.exp(-th * 5) * 1.2]), 0.9, 0.25, seed))


def boom(seed=0, **_):
    """impacto grave (corte/cliffhanger)."""
    r = np.random.default_rng(seed)
    n = int(1.8 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (40 + 80 * np.exp(-t * 12)) * t) * np.exp(-t * 2.2)
    x += _lp(r.standard_normal(n), 1500) * np.exp(-t * 14) * 0.6
    return _norm(_room(x, 1.2, 0.3, seed))


def pop(seed=0, pitch=1.0, **_):
    """pop curto de UI (número/ícone aparecendo)."""
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 500 * pitch * (1 + 2.5 * np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
    return _norm(x, 0.7)


def subida(seed=0, dur=1.5, **_):
    """riser: ruído + tom subindo (prepara uma revelação)."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    f = 200 * (8 ** k)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    nz = _hp(r.standard_normal(n), 1500) * 0.25
    return _norm((tone + nz) * k ** 2 * np.minimum(1, (dur - t) / 0.03), 0.7)


def clique(seed=0, pitch=1.0, **_):
    """clique de interruptor/lanterna acendendo: dois estalos curtos + leve zumbido de partida."""
    r = np.random.default_rng(seed)
    n = int(0.35 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for st, a in [(0, 1.0), (int(0.018 * SR), 0.55)]:
        m = int(0.006 * SR)
        x[st:st + m] += _bp(r.standard_normal(m), 2500 * pitch, 9000) * np.exp(-np.arange(m) / m * 4) * a
        x[st:st + m] += np.sin(2 * np.pi * 1400 * pitch * np.arange(m) / SR) * np.exp(-np.arange(m) / m * 3) * 0.4 * a
    hum = (np.sin(2 * np.pi * 120 * t) + 0.4 * np.sin(2 * np.pi * 240 * t)) * np.minimum(1, t / 0.05) * np.exp(-t * 6) * 0.08
    hum[: int(0.02 * SR)] = 0
    return _norm(_room(x + hum, 0.15, 0.1, seed), 0.8)


def apagar(seed=0, **_):
    """lanterna apagando: clique + zumbido caindo de tom e morrendo."""
    n = int(0.6 * SR); t = np.arange(n) / SR
    c = clique(seed, pitch=0.8).astype(np.float64)
    f = 120 * (1 - 0.5 * t / 0.6)
    hum = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 0.25
    x = hum.copy(); x[: len(c)] += c[:n] * 0.9
    return _norm(x, 0.8)


def zumbido(seed=0, dur=1.2, **_):
    """zumbido elétrico de lâmpada (60/120 Hz + chiado), entra e sai suave."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t) + 0.25 * np.sin(2 * np.pi * 360 * t)
    x += _bp(r.standard_normal(n), 3000, 7000) * 0.15 * (1 + 0.5 * np.sin(2 * np.pi * 7 * t))
    env = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.3)
    return _norm(x * env, 0.5)


def giz(seed=0, dur=0.7, **_):
    """giz riscando na parede: ruído agudo granulado em 2-3 traços."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); x = np.zeros(n)
    strokes = [(0.0, 0.28), (0.33, 0.62)] if dur >= 0.6 else [(0.0, dur * 0.9)]
    for a, b in strokes:
        s0, s1 = int(a * SR), min(n, int(b * SR)); m = s1 - s0
        tt = np.arange(m) / SR
        grain = (r.random(m) < 0.25) * r.standard_normal(m)
        y = _bp(grain + 0.3 * r.standard_normal(m), 1800, 7500) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))
        x[s0:s1] += y * np.sin(np.pi * np.arange(m) / m) ** 0.5
    return _norm(_room(x, 0.2, 0.12, seed), 0.6)


def acorde(seed=0, tipo="claro", **_):
    """acorde curto (tipo: claro=maior, quente=maior grave, recompensa=arpejo brilhante,
    subindo=arpejo ascendente, grave=nota grave, dissonante=cluster)."""
    chords = {"claro": [523.25, 659.25, 783.99], "quente": [261.63, 329.63, 392.0, 523.25],
              "recompensa": [783.99, 987.77, 1174.66, 1567.98], "subindo": [392.0, 493.88, 587.33, 783.99],
              "grave": [65.41, 98.0], "dissonante": [233.08, 246.94, 349.23, 369.99]}
    fs = chords.get(tipo, chords["claro"])
    dur = 2.2 if tipo != "grave" else 1.8
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    arp = tipo in ("recompensa", "subindo")
    for i, f in enumerate(fs):
        st = int(i * 0.07 * SR) if arp else 0
        tt = t[: n - st]
        tone = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) + 0.1 * np.sin(2 * np.pi * 3.01 * f * tt)
        env = np.minimum(1, tt / (0.01 if arp else 0.06)) * np.exp(-tt * (2.2 if arp else 1.6))
        x[st:] += tone * env
    if tipo == "grave":
        x = np.tanh(x * 1.5)
    return _norm(_room(x, 0.8, 0.25, seed), 0.75)


def coracao(seed=0, batidas=2, bpm=60, **_):
    """batida de coração grave (tum-tum)."""
    beat = 60 / bpm
    n = int((batidas * beat + 0.6) * SR); x = np.zeros(n)
    for b in range(batidas):
        for off, a in [(0, 1.0), (0.18, 0.7)]:
            p = int((b * beat + off) * SR); m = int(0.25 * SR)
            tt = np.arange(m) / SR
            x[p:p + m] += np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 14) * a
    return _norm(_room(x, 0.5, 0.15, seed), 0.9)


def passos(seed=0, n=4, intervalo=0.28, **_):
    """passinhos na terra/cascalho."""
    r = np.random.default_rng(seed)
    N = int((n * intervalo + 0.3) * SR); x = np.zeros(N)
    for i in range(n):
        p = int((i * intervalo + r.uniform(-0.02, 0.02)) * SR) + 100; m = int(0.09 * SR)
        tt = np.arange(m) / SR
        y = _bp(r.standard_normal(m), 300, 3500) * np.exp(-tt * 45) * r.uniform(0.6, 1)
        y += np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 40) * 0.5
        x[p:p + m] += y
    return _norm(_room(x, 0.25, 0.12, seed), 0.7)


LIB = {"picareta": picareta, "rachar": rachar, "quebrar": quebrar, "moeda": moeda, "ding": ding,
       "whoosh": whoosh, "ronco": ronco, "tictac": tictac, "sting": sting, "boom": boom, "pop": pop,
       "subida": subida, "clique": clique, "apagar": apagar, "zumbido": zumbido, "giz": giz,
       "acorde": acorde, "coracao": coracao, "passos": passos}
NAMES = sorted(LIB)

_cache: dict = {}


def make(name: str, seed: int = 0, **kw) -> np.ndarray:
    if name not in LIB:
        raise KeyError(f"sfx desconhecido '{name}'. Disponíveis: {', '.join(NAMES)}")
    key = (name, seed, tuple(sorted(kw.items())))
    if key not in _cache:
        _cache[key] = LIB[name](seed=seed, **kw)
    return _cache[key]


if __name__ == "__main__":
    import sys
    from pathlib import Path
    import soundfile as sf
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "build/sfx"); out.mkdir(parents=True, exist_ok=True)
    for nm in NAMES:
        a = make(nm)
        sf.write(out / f"{nm}.wav", a, SR)
        print(f"{nm:9s} {len(a) / SR:5.2f}s pico {np.abs(a).max():.2f}")
