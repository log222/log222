"""Escrita atômica (tmp + os.replace) e trava de pasta: várias invocações do pipeline podem rodar ao
mesmo tempo sem que uma leia arquivo pela metade da outra."""
from __future__ import annotations

import fcntl
import os
from pathlib import Path


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
    f = open(d / ".lock", "w")
    try:
        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        f.close()
        return None
    f.write(str(os.getpid())); f.flush()
    return f
