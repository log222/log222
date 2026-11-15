#!/usr/bin/env python3
"""Mede a prosódia de pontuação de uma saída de falar.py (pasta com tempos.json + frases/).

  .cache/venv-voz/bin/python tools/voz/pontuacao.py build/voz/am/qwen-narrador-jovem [outras...] -o build/voz/pontuacao.json

Por frase:
- VÍRGULA: silêncio entre a palavra antes e a palavra depois da vírgula. As palavras são
  localizadas pelos timestamps de token do Parakeet (passo 80 ms); o silêncio é o maior trecho
  < -32 dB (relativo ao p95 da frase) nessa janela. Sem alinhamento, usa a posição proporcional
  às letras (marcado "estimado").
- PONTO: o silêncio entre frases vem do CLI (--pausa + bordas) e é relatado da narracao.wav.
- FIM DE FRASE: variação de F0 (semitons) dos últimos ~150 ms com voz vs. os 350 ms anteriores.
  Pergunta deve subir (> +1,5 st); afirmação não deveria subir (> +1,5 st = "soa como pergunta").
Indicadores: não substituem ouvir.
"""
import argparse
import difflib
import json
import re
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import medir as D  # noqa: E402


def asr_words(a16):
    rec = D._asr("parakeet")
    s = rec.create_stream()
    s.accept_waveform(16000, a16)
    rec.decode_stream(s)
    r = s.result
    words = []
    for tok, ts in zip(list(r.tokens), list(r.timestamps)):
        if tok.startswith(" ") or not words:
            words.append([tok.strip(), ts])
        else:
            words[-1][0] += tok
    return [(D.strip_acc(re.sub(r"[^\w]", "", w.lower())), t) for w, t in words if re.search(r"\w", w)]


def ref_words(texto):
    out = []
    for w in re.findall(r"\S+", texto):
        core = D.strip_acc(re.sub(r"[^\w]", "", w.lower()))
        if core:
            out.append((core, re.search(r"[,;:]$", w) is not None))
    return out


def silence_runs(a16, t0, t1, rel_db=-32.0):
    hop = 160
    n = len(a16) // hop
    r = np.sqrt((a16[: n * hop].reshape(n, hop).astype(np.float64) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r)
    thr = np.percentile(db, 95) + rel_db
    i0, i1 = max(0, int(t0 * 100)), min(n, int(t1 * 100))
    best, cur = 0, 0
    for k in range(i0, i1):
        cur = cur + 1 if db[k] < thr else 0
        best = max(best, cur)
    return best * 0.01


def f0_final(a16):
    """Devolve (inclinação final, pico final) em semitons.
    Em PT-BR a pergunta sim/não sobe na ÚLTIMA SÍLABA TÔNICA e pode cair na átona final
    ("se-GUN-dos?"): por isso o critério principal é o PICO: p90 do F0 nos últimos 600 ms com voz
    menos a mediana do resto da frase (pergunta: alto; afirmação: baixo/negativo)."""
    import librosa
    from scipy.signal import medfilt
    f0, vflag, _ = librosa.pyin(a16, fmin=60, fmax=500, sr=16000, frame_length=1024, hop_length=160)
    idx = np.nonzero(vflag & ~np.isnan(f0))[0]
    if len(idx) < 30:
        return None, None
    v = medfilt(f0[idx], 5)
    end = idx[-1]
    last, prev = v[idx > end - 15], v[(idx > end - 50) & (idx <= end - 15)]
    fin, rest = v[idx > end - 60], v[idx <= end - 60]
    slope = round(float(12 * np.log2(np.median(last) / np.median(prev))), 2) if len(last) > 3 and len(prev) > 5 else None
    pico = round(float(12 * np.log2(np.percentile(fin, 90) / np.median(rest if len(rest) > 10 else v))), 2)
    return slope, pico


def analisar(pasta):
    pasta = Path(pasta)
    d = json.loads((pasta / "tempos.json").read_text())
    virgulas, finais, gaps = [], [], []
    fr = d["frases"]
    for k in range(len(fr) - 1):
        gaps.append(fr[k + 1]["ini"] - fr[k]["fim"])
    for f in fr:
        a16 = D.load16(pasta / f["wav"])
        texto = f["texto"]
        rw = ref_words(f["texto"])
        aw = asr_words(a16) if any(c for _, c in rw) else []
        sm = difflib.SequenceMatcher(a=[w for w, _ in rw], b=[w for w, _ in aw], autojunk=False)
        amap = {i + q: j + q for i, j, n in sm.get_matching_blocks() for q in range(n)}
        dur = len(a16) / 16000
        cum = np.cumsum([len(w) for w, _ in rw])
        for i, (w, comma) in enumerate(rw):
            if not comma or i + 1 >= len(rw):
                continue
            if i in amap and i + 1 in amap:
                t0, t1, how = aw[amap[i]][1], aw[amap[i + 1]][1] + 0.08, "asr"
            else:
                pos = dur * cum[i] / cum[-1]
                t0, t1, how = pos - 0.35, pos + 0.35, "estimado"
            virgulas.append({"frase": texto, "depois_de": w, "silencio_ms": int(1000 * silence_runs(a16, t0, t1)),
                             "alinhamento": how})
        tipo = "pergunta" if texto.rstrip().endswith("?") else "afirmacao"
        sl, pk = f0_final(a16)
        finais.append({"frase": texto, "tipo": tipo, "f0_final_st": sl, "f0_pico_final_st": pk})
    q = [x for x in finais if x["tipo"] == "pergunta"]
    afirm = [x for x in finais if x["tipo"] == "afirmacao" and x["f0_final_st"] is not None]
    afp = [x["f0_pico_final_st"] for x in finais if x["tipo"] == "afirmacao" and x["f0_pico_final_st"] is not None]
    vm = [v["silencio_ms"] for v in virgulas]
    return {
        "pasta": str(pasta),
        "virgulas": virgulas,
        "virgula_ms_min": min(vm) if vm else None, "virgula_ms_mediana": int(np.median(vm)) if vm else None,
        "virgulas_lt_120ms": sum(v < 120 for v in vm), "n_virgulas": len(vm),
        "pausa_entre_frases_ms_min": int(1000 * min(gaps)) if gaps else None,
        "perguntas": q,
        "afirmacoes_que_sobem_gt_1.5st": [x["frase"] for x in afirm if x["f0_final_st"] > 1.5],
        "afirmacoes_f0_final_mediana_st": round(float(np.median([x["f0_final_st"] for x in afirm])), 2) if afirm else None,
        "afirmacoes_pico_final_mediana_st": round(float(np.median(afp)), 2) if afp else None,
        "finais": finais,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pastas", nargs="+")
    ap.add_argument("-o", "--saida")
    a = ap.parse_args()
    out = json.loads(Path(a.saida).read_text()) if a.saida and Path(a.saida).exists() else {}
    for p in a.pastas:
        r = analisar(p)
        out[Path(p).name] = r
        qs = ", ".join(f"inclinação {x['f0_final_st']}st, pico {x['f0_pico_final_st']}st" for x in r["perguntas"])
        print(f"{Path(p).name:28s} vírgulas(ms): {[(v['depois_de'], v['silencio_ms']) for v in r['virgulas']]} "
              f"<120:{r['virgulas_lt_120ms']}/{r['n_virgulas']} | entre frases min {r['pausa_entre_frases_ms_min']} ms | "
              f"pergunta F0 fim {qs} | afirmações que sobem: {len(r['afirmacoes_que_sobem_gt_1.5st'])} "
              f"(mediana {r['afirmacoes_f0_final_mediana_st']} st; pico final mediano {r['afirmacoes_pico_final_mediana_st']} st)", flush=True)
        if a.saida:
            Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
