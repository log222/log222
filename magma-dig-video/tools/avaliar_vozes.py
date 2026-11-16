#!/usr/bin/env python3
"""Gera amostras de cada voz em build/amostras/ e mede objetivamente:
duração, palavras/s, clipping, maior silêncio interno, inteligibilidade (WER via
Whisper-small do sherpa-onnx, transcrição de volta) e erro do tempo de palavra
estimado vs. timestamps de token do Whisper.

  .cache/venv/bin/python tools/avaliar_vozes.py [--vozes pm_alex,pf_dora] [--velocidade 1.0] [--texto "..."]
"""
import os as _os, sys as _sys  # Windows: textos e JSON em UTF-8 (equivale a PYTHONUTF8=1); nada muda no Linux
if _os.name == "nt" and not _sys.flags.utf8_mode:
    _os.environ["PYTHONUTF8"] = "1"; _sys.exit(__import__("subprocess").call([_sys.executable] + _sys.argv))
import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from lib import narration as N  # noqa: E402
from lib import tts_engine as T  # noqa: E402

TEXTO = ("Na primeira noite, o Zeca desceu sozinho até a camada 312. A picareta dele bateu "
         "numa pedra que brilhava como brasa. Em MAGMA DIG, ninguém tinha cavado tão fundo. "
         "Ele juntou 1.500 moedas, mas a lava não perdoa: o coração da montanha começou a tremer, "
         "e o capitão gritou: saiam já!")

ASR_DIR = ROOT / ".cache" / "asr" / "sherpa-onnx-whisper-small"
PK_DIR = ROOT / ".cache" / "asr" / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"


def asr_parakeet():
    """Parakeet TDT v3 (multilíngue, inclui pt): dá timestamps por token (passo 80 ms)."""
    import sherpa_onnx
    if not PK_DIR.exists():
        return None
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(PK_DIR / "encoder.int8.onnx"), decoder=str(PK_DIR / "decoder.int8.onnx"),
        joiner=str(PK_DIR / "joiner.int8.onnx"), tokens=str(PK_DIR / "tokens.txt"),
        model_type="nemo_transducer", num_threads=4)


def asr():
    import sherpa_onnx
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(ASR_DIR / "small-encoder.int8.onnx"), decoder=str(ASR_DIR / "small-decoder.int8.onnx"),
        tokens=str(ASR_DIR / "small-tokens.txt"), language="pt", task="transcribe", num_threads=4)


def transcribe(rec, audio16):
    s = rec.create_stream()
    s.accept_waveform(16000, audio16)
    rec.decode_stream(s)
    r = s.result
    return r.text.strip(), list(getattr(r, "tokens", []) or []), list(getattr(r, "timestamps", []) or [])


def norm_words(text):
    from num2words import num2words
    text = re.sub(r"(?<=\d)\.(?=\d{3})", "", text)
    out = []
    for w in re.findall(r"[\w]+", text.lower(), flags=re.UNICODE):
        if w.isdigit():
            out += num2words(int(w), lang="pt_BR").replace("-", " ").replace(",", " ").split()
        else:
            out.append(w)
    return [w for w in out if w != "e"]  # "mil e quinhentos" vs "mil quinhentos"


def strip_acc(w):
    return unicodedata.normalize("NFKD", w).encode("ascii", "ignore").decode()


def wer(ref, hyp):
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    errs, wrong = 0, []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != "equal":
            errs += max(i2 - i1, j2 - j1)
            wrong.append((" ".join(ref[i1:i2]), " ".join(hyp[j1:j2])))
    return errs / max(1, len(ref)), wrong


def asr_word_starts(tokens, stamps):
    """Agrupa tokens do ASR em palavras (token que começa com espaço = palavra nova)."""
    words = []
    for tok, ts in zip(tokens, stamps):
        if tok.startswith(" ") or not words:
            words.append([tok.strip(), ts])
        else:
            words[-1][0] += tok
    return [(w, t) for w, t in words if re.search(r"\w", w)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vozes", default=",".join(T.ALL_VOICES))
    ap.add_argument("--velocidade", type=float, default=1.0)
    ap.add_argument("--texto", default=TEXTO)
    ap.add_argument("--saida", default=str(ROOT / "build" / "amostras"))
    a = ap.parse_args()
    out = Path(a.saida); out.mkdir(parents=True, exist_ok=True)
    from scipy.signal import resample_poly
    rec = asr()
    pk = asr_parakeet()
    ref = norm_words(a.texto)
    nwords = len(T.tokenize(a.texto))
    report = {}
    for v in a.vozes.split(","):
        frases = [{"texto": s, "pausa_depois": 0.35} for s in T.split_sentences(a.texto)]
        d = N.build_tts(frases, out / v, voice=v, speed=a.velocidade, lead_in=0.2)
        audio, _ = sf.read(out / v / "narracao.wav", dtype="float32")
        sf.write(out / f"{v}.wav", audio, T.SR)
        dur = len(audio) / T.SR
        fala = sum(f["fim"] - f["ini"] for f in d["frases"])
        peak = float(np.abs(audio).max())
        clip = int((np.abs(audio) >= 0.999).sum())
        sil_int = max([y - x for f in d["frases"]
                       for x, y in T.silences(audio[int(f["ini"] * T.SR):int(f["fim"] * T.SR)], min_s=0.05)]
                      or [0.0])
        a16 = resample_poly(audio, 2, 3).astype(np.float32)
        text, _, _ = transcribe(rec, a16)
        pk_text, toks, stamps = transcribe(pk, a16) if pk else ("", [], [])
        hyp = norm_words(text)
        e_pk, wrong_pk = wer(ref, norm_words(pk_text)) if pk else (None, [])
        e, wrong = wer(ref, hyp)
        e_acc, _ = wer([strip_acc(w) for w in ref], [strip_acc(w) for w in hyp])
        # erro do tempo de palavra: início estimado vs. início pelo Parakeet (palavras casadas)
        est = [(re.sub(r"[^\w]", "", p["w"].lower()), p["ini"]) for f in d["frases"] for p in f["palavras"]]
        aw = [(re.sub(r"[^\w]", "", w.lower()), t) for w, t in asr_word_starts(toks, stamps)]
        sm = difflib.SequenceMatcher(a=[x for x, _ in est], b=[x for x, _ in aw], autojunk=False)
        sdiffs = [(est[i + k][1] - aw[j + k][1]) for i, j, n in sm.get_matching_blocks() for k in range(n)]
        diffs = [abs(x) for x in sdiffs]
        report[v] = {
            "duracao_s": round(dur, 2), "fala_s": round(fala, 2),
            "palavras_por_s": round(nwords / fala, 2), "pico": round(peak, 3), "amostras_clip": clip,
            "maior_silencio_interno_s": round(sil_int, 2),
            "wer": round(e, 3), "wer_sem_acentos": round(e_acc, 3), "transcricao": text,
            "trocas": wrong,
            "wer_parakeet": None if e_pk is None else round(e_pk, 3), "transcricao_parakeet": pk_text,
            "trocas_parakeet": wrong_pk,
            "tempo_palavra_vs_asr_ms": {
                "n": len(diffs), "mediana": round(1000 * float(np.median(diffs)), 0) if diffs else None,
                "p90": round(1000 * float(np.percentile(diffs, 90)), 0) if diffs else None,
                "vies_mediano": round(1000 * float(np.median(sdiffs)), 0) if diffs else None},
        }
        print(f"\n== {v}: {dur:.1f}s, {nwords / fala:.2f} pal/s, pico {peak:.2f}, clip {clip}, "
              f"sil.int {sil_int:.2f}s, WER {e:.1%} (sem acento {e_acc:.1%})")
        print("   ASR:", text)
        print("   trocas:", wrong)
        print(f"   Parakeet WER {e_pk:.1%}:", pk_text, wrong_pk)
        print("   tempo palavra (|estimado-parakeet|):", report[v]["tempo_palavra_vs_asr_ms"])
    (out / "relatorio.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print("\n->", out / "relatorio.json")


if __name__ == "__main__":
    main()
