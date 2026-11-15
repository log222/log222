"""Carrega o Chatterbox Multilingual V3 pt-BR (ResembleAI, MIT) em CPU.

O pacote do PyPI (chatterbox-tts 0.1.7) ainda é V2; o fine-tune pt-BR roda com o
código do Space oficial ResembleAI/Chatterbox-Multilingual-TTS-pt-br, baixado por
tools/voz/instalar.sh para .cache/voz-modelos/cb-space (não editado)."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SPACE = ROOT / ".cache" / "voz-modelos" / "cb-space"


def load():
    import torch
    sys.path.insert(0, str(SPACE))
    _load = torch.load

    def _cpu_load(*a, **k):  # checkpoints salvos em CUDA
        k.setdefault("map_location", "cpu")
        return _load(*a, **k)
    torch.load = _cpu_load
    try:
        from chatterbox.src.chatterbox.tts import ChatterboxTTS
        return ChatterboxTTS.from_pretrained("cpu")
    finally:
        torch.load = _load
