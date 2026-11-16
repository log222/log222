#!/usr/bin/env python3
"""Compara timbre e ritmo de saídas de falar.py contra uma referência.

  .cache/venv-voz/bin/python tools/voz/timbre.py --ref build/voz/rt/base build/voz/rt/b-ref085 build/voz/rt/c-pos085

Por pasta: palavras/s e sílabas/s dentro da fala (soma das frases), similaridade de locutor
(cosseno do embedding do VoiceEncoder do Chatterbox, MIT — o mesmo tipo de embedding usado para
clonar), F0 mediano (Hz) e centróide espectral mediano (Hz). Similaridade ~0,9+ = mesmo locutor
para esse encoder; isso NÃO garante que soa igual ao ouvido.
"""
import os as _os, sys as _sys  # Windows: textos e JSON em UTF-8 (equivale a PYTHONUTF8=1); nada muda no Linux
if _os.name == "nt" and not _sys.flags.utf8_mode:
    _os.environ["PYTHONUTF8"] = "1"; _sys.exit(__import__("subprocess").call([_sys.executable] + _sys.argv))
import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
import medir as D  # noqa: E402

_VE = None


def ve():
    global _VE
    if _VE is None:
        import torch
        from huggingface_hub import snapshot_download
        cb = ROOT / ".cache" / "voz-modelos" / "cb-space"
        sys.path.insert(0, str(cb))
        try:
            from chatterbox.src.chatterbox.models.voice_encoder import VoiceEncoder
        except ImportError:  # sem as dependências do Chatterbox inteiro: só o subpacote do encoder (mesmo código)
            sys.path.insert(0, str(cb / "chatterbox" / "src" / "chatterbox" / "models"))
            from voice_encoder import VoiceEncoder
        d = Path(snapshot_download("ResembleAI/chatterbox", allow_patterns=["ve.pt"]))
        _VE = VoiceEncoder()
        _VE.load_state_dict(torch.load(d / "ve.pt", map_location="cpu", weights_only=True))
        _VE.eval()
    return _VE


def silabas(t):
    t = D.strip_acc(t.lower())
    return len(re.findall(r"[aeiouy]+", t))


def analisar(pasta):
    import librosa
    pasta = Path(pasta)
    d = json.loads((pasta / "tempos.json").read_text())
    wavs = [D.load16(pasta / f["wav"]) for f in d["frases"]]
    fala = sum(len(w) for w in wavs) / 16000
    nw = sum(len(re.findall(r"\S+", f["texto"])) for f in d["frases"])
    ns = sum(silabas(f["texto"]) for f in d["frases"])
    a = np.concatenate(wavs)
    emb = ve().embeds_from_wavs([a], sample_rate=16000).mean(0)
    f0, vf, _ = librosa.pyin(a, fmin=60, fmax=400, sr=16000, frame_length=1024, hop_length=320)
    cen = librosa.feature.spectral_centroid(y=a, sr=16000)[0]
    rms = librosa.feature.rms(y=a)[0]
    cen = cen[rms > np.percentile(rms, 50)]
    return {"palavras_s": round(nw / fala, 2), "silabas_s": round(ns / fala, 2), "fala_s": round(fala, 2),
            "f0_hz": round(float(np.nanmedian(f0[vf])), 1), "centroide_hz": int(np.median(cen)),
            "_emb": emb / np.linalg.norm(emb)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ref", required=True)
    ap.add_argument("pastas", nargs="+")
    ap.add_argument("-o", "--saida")
    a = ap.parse_args()
    r0 = analisar(a.ref)
    out = {}
    for p in [a.ref] + a.pastas:
        r = r0 if p == a.ref else analisar(p)
        r["sim_locutor"] = round(float(np.dot(r["_emb"], r0["_emb"])), 3)
        e = r.pop("_emb") if p != a.ref else r["_emb"]
        out[Path(p).name] = {k: v for k, v in r.items() if k != "_emb"}
        print(f"{Path(p).name:16s} {out[Path(p).name]}", flush=True)
        del e
    if a.saida:
        Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
