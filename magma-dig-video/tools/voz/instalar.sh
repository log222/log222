#!/usr/bin/env bash
# Recria .cache/venv-voz e baixa os modelos de tools/voz (vozes PT-BR abertas).
#   tools/voz/instalar.sh            # tudo (~19 GB: torch ~6 GB + pesos ~12 GB)
#   tools/voz/instalar.sh --leve     # só Supertonic 3 + medição sem torch (~1,5 GB)
# Precisa de rede para: pypi.org, files.pythonhosted.org, github.com (+ release-assets.githubusercontent.com),
# huggingface.co e us.aws.cdn.hf.co (CDN dos arquivos grandes do HF).
set -euo pipefail
cd "$(dirname "$0")/../.."
ROOT=$PWD
VENV=.cache/venv-voz
PY=$VENV/bin/python
export HF_HOME=$ROOT/.cache/hf HF_HUB_DISABLE_XET=1
LEVE=0; [[ "${1:-}" == "--leve" ]] && LEVE=1

[[ -x $PY ]] || python3 -m venv $VENV
$PY -m pip install -q -U pip
$PY -m pip install --no-cache-dir -q numpy scipy soundfile librosa num2words sherpa-onnx onnxruntime \
    kokoro-onnx speechmos requests huggingface_hub

mkdir -p .cache/voz-modelos
ST3=sherpa-onnx-supertonic-3-tts-int8-2026-05-11
if [[ ! -d .cache/voz-modelos/$ST3 ]]; then
  curl -fsSL -o .cache/voz-modelos/$ST3.tar.bz2 \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/$ST3.tar.bz2
  tar xjf .cache/voz-modelos/$ST3.tar.bz2 -C .cache/voz-modelos && rm .cache/voz-modelos/$ST3.tar.bz2
fi
[[ $LEVE == 1 ]] && { echo "ok (leve): Supertonic 3"; exit 0; }

# torch: download.pytorch.org (wheel só-CPU) estava bloqueado; o do PyPI traz libs CUDA (~3 GB) mas roda em CPU.
$PY -m pip install --no-cache-dir -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu 2>/dev/null \
  || $PY -m pip install --no-cache-dir -q torch torchaudio
$PY -m pip install --no-cache-dir -q qwen-tts            # traz transformers==4.57.3
# Chatterbox: só as dependências (o pacote do PyPI é V2; o V3 pt-BR usa o código do Space oficial)
$PY -m pip install --no-cache-dir -q s3tokenizer "diffusers==0.29.0" resemble-perth conformer==0.3.2 omegaconf

$PY - <<'EOF'
from huggingface_hub import snapshot_download, hf_hub_download
for m in ["Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", "Qwen/Qwen3-TTS-12Hz-0.6B-Base"]:
    print(snapshot_download(m))
print(snapshot_download("ResembleAI/Chatterbox-Multilingual-pt-br",
                        allow_patterns=["t3_pt_br.safetensors", "s3gen_v3.pt", "*.json", "*.md"]))
print(snapshot_download("ResembleAI/chatterbox", allow_patterns=["ve.pt", "conds.pt", "grapheme_mtl_merged_expanded_v1.json"]))
print(snapshot_download("ResembleAI/Chatterbox-Multilingual-TTS-pt-br", repo_type="space",
                        local_dir=".cache/voz-modelos/cb-space"))
import os
os.makedirs(".cache/voz-modelos/utmos", exist_ok=True)
print(hf_hub_download("balacoon/utmos", "utmos.jit", local_dir=".cache/voz-modelos/utmos"))
EOF
# ASR para medir (Whisper-small + Parakeet): vem do setup.sh do pipeline (.cache/asr)
[[ -d .cache/asr ]] || echo "aviso: rode ./setup.sh para baixar o ASR (.cache/asr) usado por medir.py"
mkdir -p .cache/voz-ref && cp -n tools/voz/ref/*.wav tools/voz/ref/*.txt .cache/voz-ref/ 2>/dev/null || true   # voz definitiva (não regerar)
echo ok
