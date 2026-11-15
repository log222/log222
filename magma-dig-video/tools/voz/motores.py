"""Motores de TTS PT-BR para tools/voz/falar.py.

Cada motor expõe `synth(texto, voz, velocidade, seed) -> (np.float32 mono, sr)`.
Os modelos ficam em .cache/voz-modelos (GitHub releases) e .cache/hf (Hugging Face).
Ver README.md desta pasta para licenças.
"""
from __future__ import annotations

import functools
import json
import os
import re
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MODELOS = ROOT / ".cache" / "voz-modelos"
os.environ.setdefault("HF_HOME", str(ROOT / ".cache" / "hf"))
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
NTHREADS = int(os.environ.get("VOZ_THREADS", "4"))

# ---------------------------------------------------------------- Supertonic 3
ST3_DIR = MODELOS / "sherpa-onnx-supertonic-3-tts-int8-2026-05-11"
# 10 estilos prontos do modelo (M1–M5, F1–F5 do Supertone; no pacote sherpa-onnx = sid 0–9)
ST3_VOZES = {f"M{i}": i - 1 for i in range(1, 6)} | {f"F{i}": i + 4 for i in range(1, 6)}


@functools.lru_cache(maxsize=1)
def _st3():
    import sherpa_onnx
    d = ST3_DIR
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
            duration_predictor=str(d / "duration_predictor.int8.onnx"),
            text_encoder=str(d / "text_encoder.int8.onnx"),
            vector_estimator=str(d / "vector_estimator.int8.onnx"),
            vocoder=str(d / "vocoder.int8.onnx"), tts_json=str(d / "tts.json"),
            unicode_indexer=str(d / "unicode_indexer.bin"), voice_style=str(d / "voice.bin")),
        num_threads=NTHREADS))
    return sherpa_onnx.OfflineTts(cfg)


def synth_supertonic(texto, voz="M1", velocidade=1.0, seed=0, passos=16):
    import sherpa_onnx
    tts = _st3()
    g = sherpa_onnx.GenerationConfig()
    g.sid = ST3_VOZES[voz] if voz in ST3_VOZES else int(voz)
    g.num_steps = int(os.environ.get("VOZ_ST3_PASSOS", passos))
    g.speed = velocidade
    g.extra["lang"] = "pt"
    a = tts.generate(texto, g)
    return np.asarray(a.samples, dtype=np.float32), a.sample_rate


# ---------------------------------------------------------------- Kokoro (linha de base)
@functools.lru_cache(maxsize=1)
def _kokoro():
    from kokoro_onnx import Kokoro
    m = ROOT / ".cache" / "models"
    return Kokoro(str(m / "kokoro-v1.0.onnx"), str(m / "voices-v1.0.bin"))


def synth_kokoro(texto, voz="pm_alex", velocidade=1.0, seed=0):
    k = _kokoro()
    if "/" in texto:  # trechos /IPA/ do dicionário
        parts = re.split(r"(/[^/]+/)", texto)
        ph = " ".join(p[1:-1] if p.startswith("/") and p.endswith("/") and len(p) > 2
                      else k.tokenizer.phonemize(p, "pt-br") for p in parts if p.strip())
        ph = re.sub(r"\s+([,.!?;:])", r"\1", " ".join(ph.split()))
        a, sr = k.create(ph, voice=voz, speed=velocidade, is_phonemes=True)
    else:
        a, sr = k.create(texto, voice=voz, speed=velocidade, lang="pt-br")
    return np.asarray(a, dtype=np.float32), sr


# ---------------------------------------------------------------- Qwen3-TTS
# Vozes por descrição (VoiceDesign 1.7B). A chave é o nome curto usado em --voz;
# também dá para passar a descrição inteira em --voz.
QWEN_DESIGN = json.loads((HERE / "vozes_qwen.json").read_text()) if (HERE / "vozes_qwen.json").exists() else {}
QWEN_REPOS = {"design": "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
              "custom": "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
              "base": "Qwen/Qwen3-TTS-12Hz-0.6B-Base"}


@functools.lru_cache(maxsize=2)
def _qwen(kind):
    import torch
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(NTHREADS)
    # bf16 por padrão: o 1.7B em fp32 passa de 8 GB de RAM e foi morto por OOM nesta máquina
    dt = {"fp32": torch.float32, "bf16": torch.bfloat16}[os.environ.get("VOZ_QWEN_DTYPE", "bf16")]
    return Qwen3TTSModel.from_pretrained(QWEN_REPOS[kind], device_map="cpu", dtype=dt)


def _seed(seed):
    import random
    import torch
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def _max_tokens(texto):
    """Teto de tokens (12,5 por segundo de áudio): ~2x o tempo esperado a 11 caracteres/s.
    Sem isso, o modelo às vezes não para e gera até 2048 tokens (164 s) de silêncio/ruído."""
    return int(12.5 * (2.0 * len(texto) / 11.0 + 2.0))


def _qwen_desc(voz):
    return QWEN_DESIGN.get(voz, {}).get("descricao", voz) if isinstance(QWEN_DESIGN.get(voz), dict) \
        else QWEN_DESIGN.get(voz, voz)


def synth_qwen_design(texto, voz="narrador", velocidade=1.0, seed=0):
    """Voice design direto, frase a frase (timbre pode variar um pouco entre frases)."""
    _seed(seed)
    m = _qwen("design")
    wavs, sr = m.generate_voice_design(text=texto, language="Portuguese", instruct=_qwen_desc(voz),
                                         max_new_tokens=_max_tokens(texto))
    return np.asarray(wavs[0], dtype=np.float32), sr


REF_DIR = ROOT / ".cache" / "voz-ref"


def referencia_sintetica(voz, seed=0):
    """Gera (uma vez) uma referência SINTÉTICA com o Qwen3 VoiceDesign (Apache-2.0),
    a partir só de uma descrição em texto. Usada por motores que exigem áudio de
    referência (Chatterbox, Qwen Base). Nenhuma voz de pessoa real entra aqui."""
    import soundfile as sf
    REF_DIR.mkdir(parents=True, exist_ok=True)
    p = REF_DIR / f"qwen-design-{voz}-s{seed}.wav"
    t = p.with_suffix(".txt")
    if not p.exists():
        cfg = QWEN_DESIGN.get(voz, {})
        texto = cfg.get("texto_ref", "Olha só que coisa: hoje a gente vai descobrir um jogo diferente. "
                                     "Presta atenção, porque cada segundo conta!") if isinstance(cfg, dict) else \
            "Olha só que coisa: hoje a gente vai descobrir um jogo diferente. Presta atenção, porque cada segundo conta!"
        a, sr = synth_qwen_design(texto, voz, 1.0, seed)
        sf.write(p, a, sr)
        t.write_text(texto)
    return p, t.read_text()


def esticar(src, dst, tempo):
    """Rubber Band (ffmpeg) com preservação de formantes: muda o ritmo sem mudar o timbre."""
    import subprocess
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af",
                    f"rubberband=tempo={tempo}:formant=preserved:pitchq=quality:window=standard", str(dst)], check=True)


@functools.lru_cache(maxsize=8)
def _qwen_prompt(voz, seed, ref_tempo=1.0):
    ref, txt = referencia_sintetica(voz, seed)
    if abs(ref_tempo - 1.0) > 1e-3:  # MESMA referência, só mais lenta (o clone imita o ritmo dela)
        lento = ref.with_name(ref.stem + f"-tempo{ref_tempo:g}.wav")
        if not lento.exists():
            esticar(ref, lento, ref_tempo)
        ref = lento
    return _qwen("base").create_voice_clone_prompt(ref_audio=str(ref), ref_text=txt)


def synth_qwen(texto, voz="narrador", velocidade=1.0, seed=0, ref_seed=0):
    """Timbre desenhado uma vez (VoiceDesign) e reaplicado em todas as frases (Base 0.6B):
    consistente entre frases."""
    _seed(seed)
    m = _qwen("base")
    kw = {}
    if os.environ.get("VOZ_QWEN_TEMP"):
        kw["temperature"] = float(os.environ["VOZ_QWEN_TEMP"])
    rt = float(os.environ.get("VOZ_REF_TEMPO", "1") or 1)
    wavs, sr = m.generate_voice_clone(text=texto, language="Portuguese",
                                      voice_clone_prompt=_qwen_prompt(voz, ref_seed, rt),
                                      max_new_tokens=int(_max_tokens(texto) / min(rt, 1.0)), **kw)
    return np.asarray(wavs[0], dtype=np.float32), sr


def synth_qwen_custom(texto, voz="Ryan", velocidade=1.0, seed=0):
    _seed(seed)
    m = _qwen("custom")
    wavs, sr = m.generate_custom_voice(text=texto, language="Portuguese", speaker=voz, max_new_tokens=_max_tokens(texto))
    return np.asarray(wavs[0], dtype=np.float32), sr


# ---------------------------------------------------------------- Chatterbox pt-BR
@functools.lru_cache(maxsize=1)
def _chatterbox():
    import torch
    from chatterbox_ptbr import load
    torch.set_num_threads(NTHREADS)
    return load()


def synth_chatterbox(texto, voz="narrador", velocidade=1.0, seed=0, exaggeration=0.6, cfg=0.5):
    """Chatterbox Multilingual V3 pt-BR (MIT). Exige referência: usamos a referência
    SINTÉTICA do Qwen3 VoiceDesign para a descrição `voz` (nunca uma pessoa real)."""
    _seed(seed)
    m = _chatterbox()
    ref, _ = referencia_sintetica(voz)
    w = m.generate(texto, language_id="pt", audio_prompt_path=str(ref),
                   exaggeration=float(os.environ.get("VOZ_CB_EXAG", exaggeration)),
                   cfg_weight=float(os.environ.get("VOZ_CB_CFG", cfg)))
    return w.squeeze(0).cpu().numpy().astype(np.float32), m.sr


MOTORES = {
    "supertonic": synth_supertonic,
    "kokoro": synth_kokoro,
    "qwen": synth_qwen,
    "qwen-design": synth_qwen_design,
    "qwen-custom": synth_qwen_custom,
    "chatterbox": synth_chatterbox,
}

LICENCAS = {
    "supertonic": "OpenRAIL-M (modelo; uso comercial permitido com restrições de uso) — https://huggingface.co/Supertone/supertonic-3",
    "kokoro": "Apache-2.0 — https://huggingface.co/hexgrad/Kokoro-82M",
    "qwen": "Apache-2.0 — https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base",
    "qwen-design": "Apache-2.0 — https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
    "qwen-custom": "Apache-2.0 — https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
    "chatterbox": "MIT — https://huggingface.co/ResembleAI/Chatterbox-Multilingual-pt-br",
}
