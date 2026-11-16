#!/usr/bin/env python3
"""Garante silêncio mínimo nas vírgulas de uma saída de falar.py, inserindo silêncio DIGITAL no
meio do silêncio que o motor já fez (emenda dentro do silêncio: não corta som). Reescreve
frases/NNN.wav, tempos.json (ini/fim/duração/palavras) e narracao.wav.

  .cache/venv-voz/bin/python tools/voz/alongar_virgulas.py build/voz/saida --min 0.22 [--pausa 0.32]

Vírgula com menos de --existente (padrão 40 ms) de silêncio não é mexida (inserir ali cortaria
uma palavra ao meio): ela é listada para regerar com outra seed / "falado".
"""
import os as _os, sys as _sys  # Windows: textos e JSON em UTF-8 (equivale a PYTHONUTF8=1); nada muda no Linux
if _os.name == "nt" and not _sys.flags.utf8_mode:
    _os.environ["PYTHONUTF8"] = "1"; _sys.exit(__import__("subprocess").call([_sys.executable] + _sys.argv))
import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import pontuacao as P  # noqa: E402
from falar import palavras_estimadas, SR  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pasta")
    ap.add_argument("--min", type=float, default=0.22)
    ap.add_argument("--existente", type=float, default=0.04)
    ap.add_argument("--pausa", type=float, default=None, help="pausa entre frases (padrão: a do tempos.json)")
    a = ap.parse_args()
    pasta = Path(a.pasta)
    d = json.loads((pasta / "tempos.json").read_text())
    r = P.analisar(pasta)
    por_frase = {}
    for v in r["virgulas"]:
        por_frase.setdefault(v["i"], []).append(v)
    pendentes = []
    for i, vs in por_frase.items():
        f = d["frases"][i]
        w, sr = sf.read(pasta / f["wav"], dtype="float32")
        # da direita para a esquerda, para os índices não andarem
        for v in sorted(vs, key=lambda x: -x["silencio_ini_s"]):
            dur = v["silencio_ms"] / 1000
            if dur >= a.min:
                continue
            if dur < a.existente:
                pendentes.append((f["texto"], v["depois_de"], v["silencio_ms"]))
                continue
            meio = int((v["silencio_ini_s"] + v["silencio_fim_s"]) / 2 * sr)
            w = np.concatenate([w[:meio], np.zeros(int((a.min - dur) * sr), np.float32), w[meio:]])
            v["alongada_para_ms"] = int(a.min * 1000)
        sf.write(pasta / f["wav"], w, sr, subtype="PCM_16")
    # remonta tempos e narração
    pausa_padrao = a.pausa
    t = d["frases"][0]["ini"]
    faixa = [np.zeros(int(t * SR), np.float32)]
    for k, f in enumerate(d["frases"]):
        w, _ = sf.read(pasta / f["wav"], dtype="float32")
        dur = len(w) / SR
        gap_orig = (d["frases"][k + 1]["ini"] - f["fim"]) if k + 1 < len(d["frases"]) else 0.25
        gap = pausa_padrao if (pausa_padrao is not None and k + 1 < len(d["frases"])) else gap_orig
        f.update(duracao=round(dur, 3), ini=round(t, 3), fim=round(t + dur, 3),
                 palavras=palavras_estimadas(f["texto"], t, dur))
        faixa += [w, np.zeros(int(gap * SR), np.float32)]
        t += dur + gap
    audio = np.concatenate(faixa)
    sf.write(pasta / "narracao.wav", audio, SR, subtype="PCM_16")
    d["duracao"] = round(len(audio) / SR, 3)
    d["virgula_min_s"] = a.min
    (pasta / "tempos.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))
    n = sum(1 for v in r["virgulas"] if "alongada_para_ms" in v)
    print(f"{n} vírgulas alongadas para {int(a.min*1000)} ms; {len(pendentes)} sem silêncio para alongar (regerar): {pendentes}")


if __name__ == "__main__":
    main()
