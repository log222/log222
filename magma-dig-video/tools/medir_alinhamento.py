#!/usr/bin/env python3
"""Mede o erro do tempo de palavra onde existe VERDADE conhecida: emenda de duas frases sintetizadas
separadamente (A+B). O início real da 1ª palavra de B é o ponto da emenda (+ a margem de silêncio do trim),
e o fim real da última palavra de A é o ponto da emenda (- a margem). Compara estimador por fonemas vs. híbrido
(âncoras do Parakeet + interpolação).
  .cache/venv/bin/python tools/medir_alinhamento.py story/parte-01.json [--pares 30]
Limite: só mede palavras nas emendas (início/fim de frase); o meio da frase não tem verdade conhecida.
"""
import os as _os, sys as _sys  # Windows: textos e JSON em UTF-8 (equivale a PYTHONUTF8=1); nada muda no Linux
if _os.name == "nt" and not _sys.flags.utf8_mode:
    _os.environ["PYTHONUTF8"] = "1"; _sys.exit(__import__("subprocess").call([_sys.executable] + _sys.argv))
import argparse
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from lib import align as AL  # noqa: E402
from lib import narration as N  # noqa: E402
from lib import tts_engine as T  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("story")
    ap.add_argument("--pares", type=int, default=30)
    ap.add_argument("--margem", type=float, default=0.0, help="silêncio deixado em cada ponta antes de emendar (s)")
    a = ap.parse_args()
    st = json.loads(Path(a.story).read_text())
    pron = st.get("pronuncia", {})
    sents = [s for f in st["falas"] for s in T.split_sentences(f["texto"]) if len(s.split()) >= 2]
    res = {"est": [], "hib": []}
    pairs = list(zip(sents[:-1], sents[1:]))[: a.pares]
    for sa, sb in pairs:
        parts = []
        for s in (sa, sb):
            w = s.split(); sp = T.apply_pronunciation(w, pron)
            x = N.synth_cached(" ".join(q for q in sp if q), st.get("voz", "pm_alex"), float(st.get("velocidade", 1.0)))
            # corta o trim de 30 ms para a emenda ficar "colada" (sem silêncio que denuncie a fronteira)
            m = T.voiced_mask(x); idx = np.nonzero(m)[0]
            s0 = max(0, idx[0] * 240 - int(a.margem * T.SR)); s1 = min(len(x), (idx[-1] + 1) * 240 + int(a.margem * T.SR))
            parts.append((x[s0:s1], w, sp, s0, idx))
        audio = np.concatenate([parts[0][0], parts[1][0]])
        join = len(parts[0][0]) / T.SR
        words = parts[0][1] + parts[1][1]; spoken = parts[0][2] + parts[1][2]
        k = len(parts[0][1])
        est = T.estimate_word_times(audio, words, spoken)
        hib = AL.hybrid_times(audio, words, spoken)
        true_b = join + a.margem
        true_a = join - a.margem
        res["est"].append((est[k][0] - true_b, est[k - 1][1] - true_a))
        res["hib"].append((hib[k][0] - true_b, hib[k - 1][1] - true_a))
    for kname, v in res.items():
        v = np.array(v)
        ini, fim = np.abs(v[:, 0]) * 1000, np.abs(v[:, 1]) * 1000
        print(f"{'estimador' if kname == 'est' else 'híbrido  '}: início 1ª palavra de B: mediana {np.median(ini):.0f} ms, "
              f"p90 {np.percentile(ini, 90):.0f} ms, viés {np.median(v[:, 0]) * 1000:+.0f} ms | fim da última de A: "
              f"mediana {np.median(fim):.0f} ms, p90 {np.percentile(fim, 90):.0f} ms  (n={len(v)})")


if __name__ == "__main__":
    main()
