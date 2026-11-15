#!/usr/bin/env python3
"""Transcreve de volta a narração montada (build/<nome>/narracao.wav + tempos.json) com Whisper-small
e Parakeet, fala por fala, e lista palavras que divergem do texto. "Suspeita forte" = os DOIS ASR erram
no mesmo trecho (provável pronúncia ruim, não erro do ASR).

  .cache/venv/bin/python tools/verificar_narracao.py build/parte-01
"""
import difflib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "tools"))
import avaliar_vozes as A  # noqa: E402


def diffs(ref, hyp):
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    out = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != "equal":
            out.append((i1, i2, " ".join(ref[i1:i2]), " ".join(hyp[j1:j2])))
    return out


def main():
    d = Path(sys.argv[1])
    tp = json.loads((d / "tempos.json").read_text())
    audio, sr = sf.read(d / "narracao.wav", dtype="float32")
    wh, pk = A.asr(), A.asr_parakeet()
    tot_ref, err_w, err_p, report = 0, 0, 0, []
    for f in tp["frases"]:
        seg = audio[int(max(0, f["ini"] - 0.1) * sr): int((f["fim"] + 0.15) * sr)]
        a16 = resample_poly(seg, 2, 3).astype(np.float32)
        tw = A.transcribe(wh, a16)[0]
        tpk = A.transcribe(pk, a16)[0]
        ref = A.norm_words(f["texto"])
        dw, dp = diffs(ref, A.norm_words(tw)), diffs(ref, A.norm_words(tpk))
        tot_ref += len(ref)
        err_w += sum(max(i2 - i1, 1) for i1, i2, _, _ in dw)
        err_p += sum(max(i2 - i1, 1) for i1, i2, _, _ in dp)
        both = [(x, y, z) for (i1, i2, x, y) in dw for (k1, k2, _, z) in dp if i1 < k2 + 1 and k1 < i2 + 1 and x]
        report.append({"fala": f["grupo"], "texto": f["texto"], "whisper": tw, "parakeet": tpk,
                       "dif_whisper": [(x, y) for _, _, x, y in dw], "dif_parakeet": [(x, y) for _, _, x, y in dp],
                       "suspeita_forte": both})
        if dw or dp:
            print(f"[{f['grupo']}] {f['texto']}")
            if dw: print(f"   whisper : {tw}\n      dif: {[(x, y) for _, _, x, y in dw]}")
            if dp: print(f"   parakeet: {tpk}\n      dif: {[(x, y) for _, _, x, y in dp]}")
            if both: print(f"   >>> SUSPEITA FORTE (os dois erram): {both}")
    print(f"\nWER aprox.: whisper {err_w / tot_ref:.1%}, parakeet {err_p / tot_ref:.1%} ({tot_ref} palavras)")
    (d / "verificacao_asr.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print("->", d / "verificacao_asr.json")


if __name__ == "__main__":
    main()
