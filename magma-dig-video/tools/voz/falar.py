#!/usr/bin/env python3
"""Lista de frases -> um WAV por frase (48 kHz mono) + tempos.json + narracao.wav.

  PY=.cache/venv-voz/bin/python
  $PY tools/voz/falar.py --motor supertonic --voz M1 --velocidade 1.15 frases.txt -o build/voz/saida/
  $PY tools/voz/falar.py --motor qwen --voz narrador-jovem frases.txt -o build/voz/q/
  $PY tools/voz/falar.py --motor chatterbox --voz narrador-jovem -t "Crac. Uma moeda." -o build/voz/cb/
  $PY tools/voz/falar.py --lista-vozes

Entrada: .txt (1 frase por linha), .json (lista de strings ou de {texto, grupo,
pausa_depois, seed, falado}) ou -t repetido. `falado` substitui o texto lido pelo motor
(sem passar pelo dicionário) — ex.: reticências no lugar de uma vírgula que o motor engoliu. `seed` por frase
fixa a tomada dos motores autorregressivos (Qwen, Chatterbox) independentemente da
posição no lote; sem ela vale --seed (padrão 0). Pronúncia: tools/voz/pronuncia.json (grafia ->
grafia falada, só no áudio; seções "padrao" e por motor). O texto original vai
para o JSON ("texto"); o que o motor leu vai em "falado".

Saída (mesmo formato de tempos.json do tts.py, com sr 48000 e campos extras):
  frases/NNN.wav, narracao.wav (frases + --pausa entre elas), tempos.json
Palavras: tempos ESTIMADOS (proporcionais a letras); o pipeline pode refinar.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
SR = 48000
CACHE = ROOT / ".cache" / "voz-cache"
WORD_RE = re.compile(r"\S+")


# ------------------------------------------------------------ pronúncia
def carregar_pron(path, motor):
    if not path or not Path(path).exists():
        return {}
    d = json.loads(Path(path).read_text())
    if not any(isinstance(v, dict) for v in d.values()):
        return d
    out = dict(d.get("padrao", {}))
    out.update(d.get(motor, {}))
    return out


def _nk(s):
    return re.sub(r"[^\w]", "", s.lower(), flags=re.UNICODE)


def aplicar_pron(texto, pron):
    """Troca palavras/expressões (casando sem pontuação e sem caixa), preservando a
    pontuação colada à última palavra."""
    words = WORD_RE.findall(texto)
    if not pron:
        return texto
    keys = sorted(((k.split(), v) for k, v in pron.items()), key=lambda kv: -len(kv[0]))
    out, i = [], 0
    while i < len(words):
        for kw, v in keys:
            seg = words[i:i + len(kw)]
            if len(seg) == len(kw) and all(_nk(a) == _nk(b) for a, b in zip(seg, kw)):
                lead = re.match(r"^[^\w]*", seg[0], flags=re.UNICODE).group(0)
                tail = re.search(r"[^\w]*$", seg[-1], flags=re.UNICODE).group(0)
                out.append(lead + v + tail)
                i += len(kw)
                break
        else:
            out.append(words[i])
            i += 1
    return " ".join(out)


# ------------------------------------------------------------ áudio
def trim(a, sr, keep=0.03, rel_db=-38.0):
    hop = int(sr * 0.01)
    n = len(a) // hop
    if n < 3:
        return a
    r = np.sqrt((a[: n * hop].reshape(n, hop).astype(np.float64) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r)
    idx = np.nonzero(db > np.percentile(db, 95) + rel_db)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] * hop - int(keep * sr))
    e = min(len(a), (idx[-1] + 1) * hop + int(keep * sr))
    return a[s:e]


def pos(a, sr, atempo):
    """Reamostra para 48 kHz (soxr) e muda o ritmo com Rubber Band (formantes preservados,
    sem mudar a altura) — melhor que atempo para desacelerar."""
    af = [f"aresample={SR}:resampler=soxr"]
    if abs(atempo - 1.0) > 1e-3:
        af.append(f"rubberband=tempo={atempo:.4f}:formant=preserved:pitchq=quality:window=standard")
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                        "-af", ",".join(af), "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"],
                       input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    b = np.frombuffer(r.stdout, dtype=np.float32).copy()
    b = trim(b, SR)
    fade = int(0.005 * SR)
    if len(b) > 2 * fade:
        b[:fade] *= np.linspace(0, 1, fade)
        b[-fade:] *= np.linspace(1, 0, fade)
    pk = float(np.abs(b).max()) if len(b) else 0.0
    if pk > 0.891:  # teto -1 dBFS
        b *= 0.891 / pk
    return b


def palavras_estimadas(texto, ini, dur):
    ws = WORD_RE.findall(texto)
    pesos = [max(1.0, len(re.sub(r"[^\w]", "", w)) + (2.0 if re.search(r"[,.!?;:]$", w) else 0.0)) for w in ws]
    tot, t, out = sum(pesos), ini, []
    for w, p in zip(ws, pesos):
        d = dur * p / tot
        out.append({"w": w, "ini": round(t, 3), "fim": round(t + d, 3)})
        t += d
    return out


# ------------------------------------------------------------ main
def ler_frases(a):
    fr = [{"texto": t} for t in a.texto]
    if a.arquivo:
        p = Path(a.arquivo)
        if p.suffix == ".json":
            fr += [{"texto": x} if isinstance(x, str) else x for x in json.loads(p.read_text())]
        else:
            fr += [{"texto": l.strip()} for l in p.read_text().splitlines() if l.strip()]
    return fr


def main():
    import motores as M
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("arquivo", nargs="?")
    ap.add_argument("-t", "--texto", action="append", default=[])
    ap.add_argument("-o", "--saida")
    ap.add_argument("--motor", default="supertonic", choices=sorted(M.MOTORES))
    ap.add_argument("--voz", default=None, help="voz pronta (ex.: M1, F2, pm_alex, Ryan) ou nome em vozes_qwen.json")
    ap.add_argument("--velocidade", type=float, default=1.0, help="velocidade nativa do motor (Supertonic/Kokoro)")
    ap.add_argument("--atempo", type=float, default=1.0, help="muda o ritmo depois da síntese (Rubber Band, formantes preservados): <1 desacelera")
    ap.add_argument("--pausa", type=float, default=0.32, help="pausa entre frases em narracao.wav (s); ponto pede >= 0,3 s")
    ap.add_argument("--inicio", type=float, default=0.10)
    ap.add_argument("--pron", default=str(HERE / "pronuncia.json"))
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--virgula", default=None, help='reforço de vírgula só no texto falado, ex.: "..." ou ";" '
                    "(o texto do JSON continua com a vírgula)")
    ap.add_argument("--sem-cache", action="store_true")
    ap.add_argument("--lista-vozes", action="store_true")
    a = ap.parse_args()
    if a.lista_vozes:
        print("supertonic:", ", ".join(M.ST3_VOZES))
        print("kokoro: pm_alex, pm_santa, pf_dora")
        print("qwen / qwen-design / chatterbox (descrições em vozes_qwen.json):", ", ".join(M.QWEN_DESIGN))
        print("qwen-custom: Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna, Sohee")
        return
    if not a.saida:
        ap.error("-o/--saida é obrigatório")
    frases = ler_frases(a)
    if not frases:
        ap.error("nenhuma frase")
    padrao_voz = {"supertonic": "M1", "kokoro": "pm_alex", "qwen-custom": "Ryan"}.get(a.motor, "narrador-jovem")
    voz = a.voz or padrao_voz
    pron = carregar_pron(a.pron, a.motor)
    fn = M.MOTORES[a.motor]
    out = Path(a.saida)
    (out / "frases").mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)

    entries, faixa, t = [], [np.zeros(int(a.inicio * SR), np.float32)], a.inicio
    t0 = time.time()
    gen_s = 0.0
    for i, ph in enumerate(frases):
        texto = ph["texto"].strip()
        falado = aplicar_pron(texto, pron)
        if ph.get("falado"):  # override por frase do texto falado (ex.: "velha... um bloco")
            falado = ph["falado"]
        elif a.virgula:
            falado = re.sub(r",(?=\s)", a.virgula, falado)
        seed = int(ph.get("seed", a.seed))  # semente por frase (JSON) — não depende da posição no lote
        key = hashlib.sha1(f"{a.motor}|{voz}|{a.velocidade:.3f}|s{seed}|{falado}|"
                           f"{os.environ.get('VOZ_CB_EXAG','')}{os.environ.get('VOZ_CB_CFG','')}"
                           f"{os.environ.get('VOZ_ST3_PASSOS','')}{os.environ.get('VOZ_REF_TEMPO','')}"
                           f"{os.environ.get('VOZ_QWEN_TEMP','')}".encode()).hexdigest()[:16]
        cp = CACHE / f"{a.motor}-{key}.npz"
        if cp.exists() and not a.sem_cache:
            z = np.load(cp)
            raw, sr, el = z["a"], int(z["sr"]), float(z["el"])
        else:
            ts = time.time()
            raw, sr = fn(falado, voz, a.velocidade, seed)
            el = time.time() - ts
            np.savez(cp, a=raw, sr=sr, el=el)
        gen_s += el
        b = pos(trim(np.asarray(raw, np.float32), sr), sr, a.atempo)
        wav = f"frases/{i:03d}.wav"
        sf.write(out / wav, b, SR, subtype="PCM_16")
        dur = len(b) / SR
        e = {"i": i, "grupo": ph.get("grupo"), "texto": texto, "falado": falado, "wav": wav,
             "duracao": round(dur, 3), "ini": round(t, 3), "fim": round(t + dur, 3),
             "palavras": palavras_estimadas(texto, t, dur), "geracao_s": round(el, 2), "seed": seed}
        # duração fora do esperado (letras/s) = provável palavra engolida, repetição ou cauda alucinada
        cps = len(re.sub(r"[^\w]", "", falado)) / max(dur * a.atempo, 1e-3)
        if len(falado) > 8 and not (6.0 <= cps <= 22.0):
            e["suspeita"] = f"{cps:.1f} letras/s"
        entries.append(e)
        print(f"[{i + 1}/{len(frases)}] {dur:5.2f}s (gerado em {el:5.1f}s) {texto}", flush=True)
        gap = float(ph.get("pausa_depois", a.pausa)) if i < len(frases) - 1 else 0.25
        faixa += [b, np.zeros(int(gap * SR), np.float32)]
        t += dur + gap
    audio = np.concatenate(faixa)
    sf.write(out / "narracao.wav", audio, SR, subtype="PCM_16")
    nw = sum(len(WORD_RE.findall(e["texto"])) for e in entries)
    fala = sum(e["duracao"] for e in entries)
    data = {"versao": 1, "audio": "narracao.wav", "sr": SR, "fonte": "tts", "motor": a.motor, "voz": voz,
            "velocidade": a.velocidade, "atempo": a.atempo, "virgula": a.virgula, "licenca": M.LICENCAS.get(a.motor),
            "duracao": round(len(audio) / SR, 3), "palavras_estimadas": True,
            "geracao_s": round(gen_s, 1), "frases": entries}
    (out / "tempos.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"{len(entries)} frases, {nw} palavras, {data['duracao']:.2f}s total, {nw / max(data['duracao'], 1e-6):.2f} "
          f"palavras/s no total ({nw / max(fala, 1e-6):.2f} de fala); geração {gen_s:.0f}s "
          f"(parede {time.time() - t0:.0f}s) -> {out / 'tempos.json'}")


if __name__ == "__main__":
    main()
