"""Motor de voz EXTERNO (plugável): chama o CLI tools/voz/falar.py (venv .cache/venv-voz) ou lê uma pasta
já gerada por ele, com cache próprio e robusto por (motor, voz, velocidade, atempo, take, texto falado).

- A pronúncia é aplicada AQUI (dicionário por motor do story) e o CLI recebe um dicionário vazio,
  para não aplicar duas vezes.
- "take" (por fala, padrão 0) escolhe a tomada: mude o take de uma fala para ouvir outra versão
  (motores autorregressivos: Qwen, Chatterbox). O take entra na chave do cache.
- Geração é serializada por motor com trava de arquivo: duas execuções simultâneas não geram a mesma
  frase duas vezes (a segunda espera e acha o cache).
- Saída: float32 mono 24 kHz sem silêncio nas pontas (taxa interna do pipeline).
"""
from __future__ import annotations

import fcntl
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from . import fsutil as FS
from . import tts_engine as T

ROOT = T.ROOT
CLI = ROOT / "tools" / "voz" / "falar.py"
PY = ROOT / ".cache" / "venv-voz" / "bin" / "python"
CACHE = ROOT / ".cache" / "tts-ext"
INTERNOS = set(T.ALL_VOICES)       # motor "kokoro" interno usa lib.tts_engine


def key(motor, voz, vel, atempo, take, falado):
    return hashlib.sha1(f"{motor}|{voz}|{vel:.3f}|{atempo:.3f}|{take}|{falado}".encode()).hexdigest()[:20]


def _to24(a, sr):
    a = np.asarray(a, np.float32)
    if a.ndim > 1:
        a = a.mean(axis=1)
    if sr != T.SR:
        g = np.gcd(T.SR, sr)
        a = resample_poly(a, T.SR // g, sr // g).astype(np.float32)
    return T.trim_silence(a)


def _path(motor, k):
    return CACHE / motor / f"{k}.wav"


def disponivel():
    return CLI.exists() and PY.exists()


def gerar(itens, motor, voz, vel=1.0, atempo=1.0, regerar=(), log=print):
    """itens: [{"id", "falado", "take"}]. Devolve {id: audio24k}. Gera só o que falta no cache."""
    out, falta = {}, []
    for it in itens:
        k = key(motor, voz, vel, atempo, it.get("take", 0), it["falado"])
        p = _path(motor, k)
        if p.exists() and it["id"] not in regerar:
            a, sr = sf.read(p, dtype="float32")
            out[it["id"]] = _to24(a, sr)
        else:
            falta.append((it, k))
    if not falta:
        return out
    if not disponivel():
        raise SystemExit(f"motor '{motor}': CLI {CLI} ou venv {PY} ausente (rode tools/voz/instalar.sh)")
    (CACHE / motor).mkdir(parents=True, exist_ok=True)
    vazio = CACHE / "sem_pron.json"
    if not vazio.exists():
        FS.write_text(vazio, "{}")
    with open(CACHE / f"{motor}.lock", "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)           # serializa geração por motor (espera a outra execução)
        # outra execução pode ter gerado enquanto esperávamos
        resto = []
        for it, k in falta:
            p = _path(motor, k)
            if p.exists() and it["id"] not in regerar:
                a, sr = sf.read(p, dtype="float32"); out[it["id"]] = _to24(a, sr)
            else:
                resto.append((it, k))
        por_take = {}
        for it, k in resto:
            por_take.setdefault(int(it.get("take", 0)), []).append((it, k))
        for take, grupo in sorted(por_take.items()):
            with tempfile.TemporaryDirectory(dir=CACHE / motor) as td:
                td = Path(td)
                (td / "lista.json").write_text(json.dumps([{"texto": it["falado"]} for it, _ in grupo], ensure_ascii=False))
                cmd = [str(PY), str(CLI), "--motor", motor, "--voz", voz, "--velocidade", str(vel), "--atempo", str(atempo),
                       "--seed", str(1000 * take), "--pron", str(vazio), "--pausa", "0", str(td / "lista.json"), "-o", str(td / "o")]
                if any(it["id"] in regerar for it, _ in grupo):
                    cmd.append("--sem-cache")
                log(f"  [voz {motor}/{voz}] gerando {len(grupo)} fala(s) (take {take})...")
                r = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
                if r.returncode != 0:
                    raise SystemExit(f"CLI de voz falhou:\n{r.stderr[-3000:]}")
                d = json.loads((td / "o" / "tempos.json").read_text())
                if len(d["frases"]) != len(grupo):
                    raise SystemExit(f"CLI devolveu {len(d['frases'])} frases para {len(grupo)} pedidas")
                for (it, k), fr in zip(grupo, d["frases"]):
                    a, sr = sf.read(td / "o" / fr["wav"], dtype="float32")
                    FS.write_wav(_path(motor, k), a, sr)
                    out[it["id"]] = _to24(a, sr)
                    (CACHE / motor / f"{k}.json").write_text(json.dumps(
                        {"motor": motor, "voz": voz, "velocidade": vel, "atempo": atempo, "take": take,
                         "falado": it["falado"], "fala": it["id"], "geracao_s": fr.get("geracao_s")}, ensure_ascii=False))
    return out


def ler_pasta(pasta, falas):
    """Usa uma pasta já gerada pelo CLI (tempos.json + frases/NNN.wav): casa cada fala pelo texto."""
    pasta = Path(pasta)
    d = json.loads((pasta / "tempos.json").read_text())
    nk = lambda s: "".join(ch for ch in s.lower() if ch.isalnum())
    por_texto = {nk(f["texto"]): f for f in d["frases"]}
    out, faltam = {}, []
    for f in falas:
        fr = por_texto.get(nk(f["texto"].replace("*", "")))
        if not fr:
            faltam.append(f["id"]); continue
        a, sr = sf.read(pasta / fr["wav"], dtype="float32")
        out[f["id"]] = _to24(a, sr)
    if faltam:
        raise SystemExit(f"a pasta {pasta} não tem as falas {faltam} (o texto precisa ser idêntico)")
    return out
