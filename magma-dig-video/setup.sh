#!/usr/bin/env bash
# Recria .cache/ do zero: venv Python + modelos TTS (Kokoro, Piper) + ASR (opcional, para avaliar vozes).
# Uso: ./setup.sh            (TTS + ASR)
#      ./setup.sh --sem-asr  (só o necessário para gerar vídeo, ~350 MB)
# Requer: python3 (3.11+), node 22 com `require('playwright')` disponível + Chromium, ffmpeg, curl.
set -euo pipefail
cd "$(dirname "$0")"
C=.cache
mkdir -p $C/models $C/asr build out
[ -x $C/venv/bin/python ] || python3 -m venv $C/venv
$C/venv/bin/pip install -q --upgrade pip
$C/venv/bin/pip install -q -r requirements.txt

GH=https://github.com
dl() { [ -s "$2" ] || { echo "baixando $(basename "$2")"; curl -fsSL -o "$2.part" "$1" && mv "$2.part" "$2"; }; }
dl $GH/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx $C/models/kokoro-v1.0.onnx
dl $GH/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin  $C/models/voices-v1.0.bin
if [ ! -d $C/models/vits-piper-pt_BR-faber-medium ]; then
  curl -fsSL $GH/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2 | tar xj -C $C/models
fi
if [ "${1:-}" != "--sem-asr" ]; then
  for m in sherpa-onnx-whisper-small sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8; do
    [ -d $C/asr/$m ] || { echo "baixando $m"; curl -fsSL $GH/k2-fsa/sherpa-onnx/releases/download/asr-models/$m.tar.bz2 | tar xj -C $C/asr; }
  done
  rm -f $C/asr/sherpa-onnx-whisper-small/small-{encoder,decoder}.onnx   # só usamos as versões int8
fi
# quadros do gameplay real (ART.gameplay; p02, p07, p17, p28, p39, p41, p49): build/ não é versionado
[ -s build/art/gameplay/f_0001.jpg ] || { mkdir -p build/art/gameplay; ffmpeg -v error -i assets/game/preview.mp4 -vf fps=30 -q:v 3 build/art/gameplay/f_%04d.jpg; }
node -e "require('playwright')" || { echo "ERRO: node não acha 'playwright' (npm i -g playwright ou instale no projeto)"; exit 1; }
ffmpeg -version >/dev/null
echo "ok. Teste: $C/venv/bin/python make_video.py story/demo.json -o out/demo.mp4 --contact-sheet"
