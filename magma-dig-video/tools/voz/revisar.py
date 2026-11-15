#!/usr/bin/env python3
"""Acha frases "suspeitas" numa saída de falar.py e tenta outras tomadas (sementes), escolhendo
a melhor por medida. Escreve um JSON de frases novo com as sementes escolhidas.

  .cache/venv-voz/bin/python tools/voz/revisar.py frases.json build/voz/saida --motor qwen --voz narrador-jovem \
      --atempo 0.87 --sementes 5,6,7 -o frases_revisadas.json

Problemas contados por frase (quanto menos, melhor):
  3 x palavras que Whisper e Parakeet erram (sem contar nomes/onomatopeias de medir.NOMES)
  2 x vírgulas com < 120 ms de silêncio (antes de alongar_virgulas.py)
  1 x fim de afirmação subindo (> +1,5 st) ou pergunta sem pico (< +3 st)
  1 x sílabas/s fora de [0,7; 1,3] x mediana do lote (fala espremida ou arrastada)
Frase com 0 problemas não é regerada. Empate fica com a tomada original.
Indicadores de ASR/F0: não garantem que a palavra soa inteira ao ouvido.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import medir as D  # noqa: E402
import pontuacao as P  # noqa: E402
from timbre import silabas  # noqa: E402


def erros_asr(a16, texto):
    ref = D.norm_words(texto)
    out = {}
    for k in ("whisper", "parakeet"):
        h = D.transcribe(a16, k)
        _, w = D.wer(ref, D.norm_words(h))
        out[k] = (h, {r for r, _ in w if r and not all(x in D.NOMES for x in r.split())})
    both = out["whisper"][1] & out["parakeet"][1]
    n = sum(len(r.split()) for r in both)
    return n, out["whisper"][0], out["parakeet"][0]


def avaliar(pasta):
    pasta = Path(pasta)
    d = json.loads((pasta / "tempos.json").read_text())
    pr = P.analisar(pasta)
    vir = {}
    for v in pr["virgulas"]:
        vir.setdefault(v["i"], []).append(v["silencio_ms"])
    res = []
    for f, fin in zip(d["frases"], pr["finais"]):
        a = D.load16(pasta / f["wav"])
        n_asr, hw, hp = erros_asr(a, f["texto"])
        sps = silabas(f["texto"]) / max(len(a) / 16000, 1e-3)
        if fin["tipo"] == "pergunta":
            sobe = 0 if (fin["f0_pico_final_st"] or 0) >= 3 else 1
        else:
            sobe = 1 if (fin["f0_final_st"] or 0) > 1.5 else 0
        res.append({"i": f["i"], "texto": f["texto"], "seed": f.get("seed", 0), "falado": f["falado"],
                    "asr_ambos_erram": n_asr, "whisper": hw, "parakeet": hp, "virgulas_ms": vir.get(f["i"], []),
                    "virgulas_fracas": sum(x < 120 for x in vir.get(f["i"], [])), "fim_errado": sobe,
                    "silabas_s": round(sps, 2)})
    med = float(np.median([r["silabas_s"] for r in res if len(r["texto"]) > 12]))
    for r in res:
        r["ritmo_fora"] = int(len(r["texto"]) > 12 and not (0.7 * med <= r["silabas_s"] <= 1.3 * med))
        r["problemas"] = 3 * r["asr_ambos_erram"] + 2 * r["virgulas_fracas"] + r["fim_errado"] + r["ritmo_fora"]
    return res, med


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("frases_json")
    ap.add_argument("pasta")
    ap.add_argument("--motor", default="qwen")
    ap.add_argument("--voz", default="narrador-jovem")
    ap.add_argument("--atempo", default="1.0")
    ap.add_argument("--sementes", default="5,6,7")
    ap.add_argument("-o", "--saida", required=True)
    ap.add_argument("--relatorio")
    a = ap.parse_args()
    frases = json.loads(Path(a.frases_json).read_text())
    base, med = avaliar(a.pasta)
    cand = [r for r in base if r["problemas"] > 0]
    print(f"mediana {med:.2f} sílabas/s; {len(cand)} frases suspeitas de {len(base)}", flush=True)
    for r in cand:
        print(f"  [{r['i']}] {r['problemas']} pts {r['texto']} | W: {r['whisper']} | P: {r['parakeet']} | "
              f"vírg {r['virgulas_ms']} fim_errado {r['fim_errado']} ritmo {r['silabas_s']}", flush=True)
    melhor = {r["i"]: r for r in cand}
    tmp = Path(tempfile.mkdtemp(prefix="revisar-", dir=str(Path(a.pasta).parent)))
    for s in [int(x) for x in a.sementes.split(",")]:
        lote = []
        for r in cand:
            it = {"texto": r["texto"], "seed": s}
            if frases[r["i"]].get("falado"):
                it["falado"] = frases[r["i"]]["falado"]
            lote.append(it)
        jp = tmp / f"s{s}.json"
        jp.write_text(json.dumps(lote, ensure_ascii=False))
        subprocess.run([sys.executable, "-W", "ignore", str(HERE / "falar.py"), "--motor", a.motor, "--voz", a.voz,
                        "--atempo", a.atempo, str(jp), "-o", str(tmp / f"s{s}")], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        res, _ = avaliar(tmp / f"s{s}")
        for r, orig in zip(res, cand):
            r["ritmo_fora"] = int(len(r["texto"]) > 12 and not (0.7 * med <= r["silabas_s"] <= 1.3 * med))
            r["problemas"] = 3 * r["asr_ambos_erram"] + 2 * r["virgulas_fracas"] + r["fim_errado"] + r["ritmo_fora"]
            if r["problemas"] < melhor[orig["i"]]["problemas"]:
                r["i"] = orig["i"]
                melhor[orig["i"]] = r
        print(f"semente {s}: " + ", ".join(f"[{o['i']}]{r['problemas']}" for r, o in zip(res, cand)), flush=True)
    trocadas = []
    for i, r in melhor.items():
        if r["seed"] != frases[i].get("seed", 0):
            frases[i]["seed"] = r["seed"]
            trocadas.append(i)
    Path(a.saida).write_text(json.dumps(frases, ensure_ascii=False, indent=1))
    rel = {"mediana_silabas_s": med, "suspeitas": cand, "escolhidas": list(melhor.values()), "trocadas": trocadas}
    if a.relatorio:
        Path(a.relatorio).write_text(json.dumps(rel, ensure_ascii=False, indent=1))
    print(f"{len(trocadas)} frases trocadas de semente: {trocadas}")
    print("continuam com problema:", [(i, r["texto"], r["problemas"]) for i, r in melhor.items() if r["problemas"] > 0])


if __name__ == "__main__":
    main()
