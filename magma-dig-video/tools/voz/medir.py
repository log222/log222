#!/usr/bin/env python3
"""Mede amostras de voz sem ouvido: ida e volta no ASR (Whisper-small e Parakeet
TDT v3, ambos via sherpa-onnx em .cache/asr), palavras/s, pausas, clipping,
variação de F0 e preditores de naturalidade (UTMOS22 e DNSMOS).

  .cache/venv-voz/bin/python tools/voz/medir.py --texto-arquivo tools/voz/amostra_texto.txt \
      build/voz/amostras/*.wav -o build/voz/medidas.json

Todos os números são INDICADORES: não substituem ouvir.
- WER: ASR não é perfeito em PT-BR; "MAGMA DIG" e "Crac" erram em todos os motores.
- UTMOS foi treinado em inglês (VoiceMOS 2022); DNSMOS mede limpeza/qualidade
  de sinal mais do que prosódia. Comparação relativa entre motores, nada mais.
"""
import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
ASR_W = ROOT / ".cache" / "asr" / "sherpa-onnx-whisper-small"
ASR_P = ROOT / ".cache" / "asr" / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
UTMOS = ROOT / ".cache" / "voz-modelos" / "utmos" / "utmos.jit"

# Palavras que o ASR não tem como acertar (nome inventado, onomatopeia): saem do WER
# "sem nomes" e são relatadas à parte.
NOMES = {"magma", "dig", "crac", "zeca"}

_rec = {}


def _asr(kind):
    import sherpa_onnx
    if kind not in _rec:
        if kind == "whisper":
            _rec[kind] = sherpa_onnx.OfflineRecognizer.from_whisper(
                encoder=str(ASR_W / "small-encoder.int8.onnx"), decoder=str(ASR_W / "small-decoder.int8.onnx"),
                tokens=str(ASR_W / "small-tokens.txt"), language="pt", task="transcribe", num_threads=4)
        else:
            _rec[kind] = sherpa_onnx.OfflineRecognizer.from_transducer(
                encoder=str(ASR_P / "encoder.int8.onnx"), decoder=str(ASR_P / "decoder.int8.onnx"),
                joiner=str(ASR_P / "joiner.int8.onnx"), tokens=str(ASR_P / "tokens.txt"),
                model_type="nemo_transducer", num_threads=4)
    return _rec[kind]


def transcribe(a16, kind):
    """Whisper-small do sherpa só aceita até 30 s: corta em silêncios."""
    rec = _asr(kind)
    out = []
    for seg in _chunks(a16, 16000, 28.0 if kind == "whisper" else 120.0):
        s = rec.create_stream()
        s.accept_waveform(16000, seg)
        rec.decode_stream(s)
        out.append(s.result.text.strip())
    return " ".join(out)


def _chunks(a, sr, max_s):
    if len(a) <= max_s * sr:
        return [a]
    hop = sr // 100
    n = len(a) // hop
    rms = np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
    out, start = [], 0
    while len(a) - start > max_s * sr:
        lo, hi = (start + int(0.5 * max_s * sr)) // hop, (start + int(max_s * sr)) // hop
        cut = (lo + int(np.argmin(rms[lo:hi]))) * hop
        out.append(a[start:cut])
        start = cut
    out.append(a[start:])
    return out


def norm_words(text):
    from num2words import num2words
    text = re.sub(r"(?<=\d)\.(?=\d{3})", "", text)
    out = []
    for w in re.findall(r"\w+", text.lower(), flags=re.UNICODE):
        if w.isdigit():
            out += num2words(int(w), lang="pt_BR").replace("-", " ").replace(",", " ").split()
        else:
            out.append(w)
    return [strip_acc(w) for w in out if w != "e"]


def strip_acc(w):
    return unicodedata.normalize("NFKD", w).encode("ascii", "ignore").decode()


def wer(ref, hyp):
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    errs, wrong = 0, []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != "equal":
            errs += max(i2 - i1, j2 - j1)
            wrong.append([" ".join(ref[i1:i2]), " ".join(hyp[j1:j2])])
    return errs / max(1, len(ref)), wrong


def wer_sem_nomes(ref, hyp, wrong):
    """WER ignorando trechos cuja referência é só nome/onomatopeia."""
    errs = 0
    for r, h in wrong:
        rw = r.split()
        if rw and all(w in NOMES for w in rw):
            continue
        errs += max(len(rw), len(h.split()))
    return errs / max(1, len([w for w in ref if w not in NOMES]))


def voiced(a, sr, rel_db=-35.0):
    hop = int(sr * 0.01)
    n = max(1, len(a) // hop)
    r = np.sqrt((a[: n * hop].reshape(n, hop).astype(np.float64) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r)
    return db > np.percentile(db, 95) + rel_db


def pauses(a, sr, min_s=0.25):
    m = voiced(a, sr)
    idx = np.nonzero(m)[0]
    if len(idx) == 0:
        return 0.0, []
    m = m[idx[0]: idx[-1] + 1]
    out, i = [], 0
    while i < len(m):
        if not m[i]:
            j = i
            while j < len(m) and not m[j]:
                j += 1
            if (j - i) * 0.01 >= min_s:
                out.append(round((j - i) * 0.01, 2))
            i = j
        else:
            i += 1
    return (idx[-1] - idx[0] + 1) * 0.01, out


def f0_stats(a16):
    import librosa
    f0, vflag, _ = librosa.pyin(a16, fmin=60, fmax=500, sr=16000, frame_length=1024, hop_length=320)
    f = f0[vflag & ~np.isnan(f0)]
    if len(f) < 20:
        return {}
    st = 12 * np.log2(f / np.median(f))
    return {"f0_mediana_hz": round(float(np.median(f)), 1),
            "f0_desvio_semitons": round(float(np.std(st)), 2),
            "f0_faixa_p5_p95_semitons": round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2)}


def dnsmos(a16):
    try:
        from speechmos import dnsmos as D
        r = D.run(np.clip(a16, -1, 1), sr=16000)
        return {"dnsmos_ovrl": round(float(r["ovrl_mos"]), 2), "dnsmos_sig": round(float(r["sig_mos"]), 2),
                "dnsmos_p808": round(float(r["p808_mos"]), 2)}
    except Exception as e:  # noqa: BLE001
        return {"dnsmos_erro": str(e)[:120]}


def utmos(a16):
    try:
        from _utmos import utmos as U
        # UTMOS em janelas de ~10 s (o modelo foi treinado em frases curtas)
        segs = [s for s in _chunks(a16, 16000, 10.0) if len(s) > 16000]
        return {"utmos": round(float(np.mean([U(s, UTMOS) for s in segs])), 3)}
    except Exception as e:  # noqa: BLE001
        return {"utmos_erro": str(e)[:120]}


def load16(path):
    import subprocess
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def medir(path, texto):
    a16 = load16(path)
    info = sf.info(str(path)) if str(path).endswith(".wav") else None
    raw, sr = (sf.read(str(path), dtype="float32") if info else (a16, 16000))
    if raw.ndim > 1:
        raw = raw.mean(1)
    ref = norm_words(texto)
    nw = len(re.findall(r"\S+", texto))
    fala, pz = pauses(a16, 16000)
    res = {"arquivo": str(path), "duracao_s": round(len(a16) / 16000, 2), "fala_s": round(fala, 2),
           "palavras_por_s": round(nw / max(fala, 1e-6), 2),
           "pausas_ge_0.25s": len(pz), "maior_pausa_s": max(pz) if pz else 0.0,
           "pausas_ge_0.5s": sum(p >= 0.5 for p in pz),
           "pico": round(float(np.abs(raw).max()), 3), "amostras_clip": int((np.abs(raw) >= 0.999).sum())}
    for kind in ("whisper", "parakeet"):
        hyp_text = transcribe(a16, kind)
        hyp = norm_words(hyp_text)
        e, wrong = wer(ref, hyp)
        res[f"wer_{kind}"] = round(e, 3)
        res[f"wer_{kind}_sem_nomes"] = round(wer_sem_nomes(ref, hyp, wrong), 3)
        res[f"palavras_a_mais_{kind}"] = len(hyp) - len(ref)
        res[f"transcricao_{kind}"] = hyp_text
        res[f"trocas_{kind}"] = wrong
    res.update(f0_stats(a16))
    res.update(dnsmos(a16))
    res.update(utmos(a16))
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("arquivos", nargs="+")
    ap.add_argument("--texto-arquivo", default=str(HERE / "amostra_texto.txt"))
    ap.add_argument("-o", "--saida")
    a = ap.parse_args()
    texto = Path(a.texto_arquivo).read_text().strip()
    out = {}
    if a.saida and Path(a.saida).exists():
        out = json.loads(Path(a.saida).read_text())
    for f in a.arquivos:
        r = medir(f, texto)
        out[Path(f).stem] = r
        print(f"{Path(f).stem:28s} {r['duracao_s']:5.1f}s {r['palavras_por_s']:.2f}p/s pausas>=.5:{r['pausas_ge_0.5s']} "
              f"max {r['maior_pausa_s']:.2f} WERw {r['wer_whisper_sem_nomes']:.1%} WERp {r['wer_parakeet_sem_nomes']:.1%} "
              f"F0sd {r.get('f0_desvio_semitons')} UTMOS {r.get('utmos')} DNS {r.get('dnsmos_ovrl')} clip {r['amostras_clip']}",
              flush=True)
        if a.saida:
            Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
