"""UTMOS22 (balacoon/utmos, TorchScript traçado em CUDA) em CPU.

O .jit tem `torch.device("cuda:0")` gravado no código TorchScript; na primeira
vez geramos uma cópia com esse device trocado por CPU (o código fica em texto
dentro do zip) e carregamos a cópia. Saída: MOS previsto 1–5 (treinado em inglês,
VoiceMOS 2022): use só como indicador relativo."""
import zipfile
from pathlib import Path

import numpy as np
import torch

_M = {}


def _cpu_copy(src: Path) -> Path:
    dst = src.with_name(src.stem + "_cpu.jit")
    if dst.exists():
        return dst
    tmp = dst.with_suffix(".tmp")
    with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_STORED) as zo:
        for it in zi.infolist():
            data = zi.read(it.filename)
            if "/code/" in it.filename and it.filename.endswith(".py"):
                data = data.decode().replace('torch.device("cuda:0")', 'torch.device("cpu")').encode()
            zo.writestr(it, data)
    tmp.rename(dst)
    return dst


def utmos(wav16: np.ndarray, path) -> float:
    path = Path(path)
    if path not in _M:
        _M[path] = torch.jit.load(str(_cpu_copy(path)), map_location="cpu").eval()
    x = torch.tensor((np.clip(wav16, -1, 1) * 32767).astype(np.int16))[None]
    with torch.no_grad():
        return float(_M[path](x).item())
