"""Escrita atômica (tmp + os.replace) e trava de pasta: várias invocações do pipeline podem rodar ao
mesmo tempo sem que uma leia arquivo pela metade da outra."""
from __future__ import annotations

import os
import time
from pathlib import Path

try:
    import fcntl
except ImportError:  # Windows: trava com msvcrt (mesma semântica: exclusiva, com ou sem espera)
    fcntl = None
    import msvcrt


def flock(f, esperar=True):
    """Trava exclusiva no arquivo aberto `f`. Sem esperar: OSError se outra invocação já tem a trava."""
    if fcntl:
        fcntl.flock(f, fcntl.LOCK_EX | (0 if esperar else fcntl.LOCK_NB))
        return
    f.seek(0)
    while True:
        try:
            msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
            return
        except OSError:
            if not esperar:
                raise
            time.sleep(0.5)


def open_lock(p):
    """Abre o arquivo de trava sem truncar (no Windows, truncar um arquivo travado por outro processo falha)."""
    return open(p, "a+" if fcntl is None else "w")


def _tmp(p: Path) -> Path:
    p = Path(p)
    return p.with_name(f".{p.stem}.tmp{os.getpid()}{p.suffix}")


def write_text(p, s: str):
    p = Path(p); t = _tmp(p)
    t.write_text(s)
    os.replace(t, p)


def write_wav(p, audio, sr):
    import soundfile as sf
    p = Path(p); t = _tmp(p)
    sf.write(t, audio, sr)
    os.replace(t, p)


def lock_dir(d: Path):
    """Tenta travar a pasta (exclusivo, sem esperar). Devolve o arquivo aberto (mantenha a referência)
    ou None se outra invocação já estiver usando a pasta."""
    d = Path(d); d.mkdir(parents=True, exist_ok=True)
    f = open_lock(d / ".lock")
    try:
        flock(f, esperar=False)
    except OSError:
        f.close()
        return None
    f.seek(0); f.truncate()
    f.write(str(os.getpid())); f.flush()
    return f
