#!/usr/bin/env python3
"""TTS PT-BR: lista de frases -> WAV por frase + narracao.wav + tempos.json.

Exemplos:
  .cache/venv/bin/python tts.py frases.txt -o build/tts              # 1 frase por linha
  .cache/venv/bin/python tts.py -t "O Zeca cavou." -t "E achou ouro." -o build/tts --voz pm_santa
  .cache/venv/bin/python tts.py frases.txt -o build/tts --pron story/pronuncia.json --velocidade 1.05
  # alinhar uma gravação própria (1 arquivo) às mesmas frases:
  .cache/venv/bin/python tts.py frases.txt -o build/gravado --alinhar minha_voz.m4a
"""
import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import narration as N  # noqa: E402
from lib import tts_engine as T  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("arquivo", nargs="?", help=".txt (1 frase por linha) ou .json (lista de strings "
                    "ou de {texto, grupo, pausa_depois})")
    ap.add_argument("-t", "--texto", action="append", default=[], help="frase (repetível)")
    ap.add_argument("-o", "--saida", required=True, help="pasta de saída")
    ap.add_argument("--voz", default="pm_alex", choices=T.ALL_VOICES)
    ap.add_argument("--velocidade", type=float, default=1.0)
    ap.add_argument("--pausa", type=float, default=0.35, help="pausa entre frases (s)")
    ap.add_argument("--inicio", type=float, default=0.25, help="silêncio no início (s)")
    ap.add_argument("--pron", help="JSON {grafia: grafia_fonetica} (só afeta o áudio)")
    ap.add_argument("--alinhar", metavar="AUDIO", help="não sintetiza: alinha este áudio gravado às frases")
    a = ap.parse_args()

    phrases = [{"texto": t} for t in a.texto]
    if a.arquivo:
        p = Path(a.arquivo)
        if p.suffix == ".json":
            for x in json.loads(p.read_text()):
                phrases.append({"texto": x} if isinstance(x, str) else x)
        else:
            phrases += [{"texto": l.strip()} for l in p.read_text().splitlines() if l.strip()]
    if not phrases:
        ap.error("nenhuma frase")
    for ph in phrases:
        ph.setdefault("pausa_depois", a.pausa)
    pron = json.loads(Path(a.pron).read_text()) if a.pron else None
    os.environ.setdefault("OMP_NUM_THREADS", "4")
    if a.alinhar:
        d = N.realign(a.alinhar, phrases, Path(a.saida), pron=pron)
    else:
        d = N.build_tts(phrases, Path(a.saida), voice=a.voz, speed=a.velocidade, pron=pron, lead_in=a.inicio)
    nw = sum(len(f["palavras"]) for f in d["frases"])
    fala = sum(f["fim"] - f["ini"] for f in d["frases"])
    print(f"{len(d['frases'])} frases, {nw} palavras, {d['duracao']:.2f}s total, "
          f"{nw / max(fala, 1e-6):.2f} palavras/s de fala -> {Path(a.saida) / 'tempos.json'}")


if __name__ == "__main__":
    main()
