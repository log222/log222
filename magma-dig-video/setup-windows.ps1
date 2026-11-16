# Instalação no Windows nativo (sem WSL, sem administrador): tudo fica em .cache\ do projeto.
# Equivale a ./setup.sh + a parte Qwen de tools/voz/instalar.sh (só o Base 0.6B, que clona a referência versionada).
#   powershell -ExecutionPolicy Bypass -File setup-windows.ps1            # pipeline + voz
#   powershell -ExecutionPolicy Bypass -File setup-windows.ps1 -SemVoz    # só o pipeline
# Requer no PATH: python 3.11+, node 22+, npm, ffmpeg (com rubberband), curl e tar (vêm no Windows 10/11).
param([switch]$SemVoz, [string]$Cuda = "cu128")
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$C = Join-Path $PSScriptRoot ".cache"
New-Item -ItemType Directory -Force "$C\models", "$C\asr", "$C\node", "build", "out" | Out-Null
$GH = "https://github.com"
function Baixar($url, $dst) {
  if (-not (Test-Path $dst) -or (Get-Item $dst).Length -eq 0) {
    Write-Host "baixando $(Split-Path $dst -Leaf)"; curl.exe -fsSL -o "$dst.part" $url; if ($LASTEXITCODE) { throw "falhou: $url" }
    Move-Item -Force "$dst.part" $dst
  }
}

# 1) pipeline: .cache\venv
$PY = "$C\venv\Scripts\python.exe"
if (-not (Test-Path $PY)) { python -m venv "$C\venv" }
& $PY -m pip install -q --upgrade pip
& $PY -m pip install -q -r requirements.txt
Baixar "$GH/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx" "$C\models\kokoro-v1.0.onnx"
Baixar "$GH/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin" "$C\models\voices-v1.0.bin"
foreach ($m in "sherpa-onnx-whisper-small", "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8") {
  if (-not (Test-Path "$C\asr\$m")) {
    Baixar "$GH/k2-fsa/sherpa-onnx/releases/download/asr-models/$m.tar.bz2" "$C\asr\$m.tar.bz2"
    tar -xjf "$C\asr\$m.tar.bz2" -C "$C\asr"; Remove-Item "$C\asr\$m.tar.bz2"
  }
}
Remove-Item -ErrorAction SilentlyContinue "$C\asr\sherpa-onnx-whisper-small\small-encoder.onnx", "$C\asr\sherpa-onnx-whisper-small\small-decoder.onnx"
# quadros do gameplay real usados por ART.gameplay (p02, p07, p17, p28, p39, p41, p49); build/ não é versionado
if (-not (Test-Path "build\art\gameplay\f_0001.jpg")) {
  New-Item -ItemType Directory -Force "build\art\gameplay" | Out-Null
  ffmpeg -v error -i assets/game/preview.mp4 -vf fps=30 -q:v 3 build/art/gameplay/f_%04d.jpg
}

# 2) playwright + Chromium locais (make_video.py acha sozinho; para node direto: $env:NODE_PATH e PLAYWRIGHT_BROWSERS_PATH)
$env:PLAYWRIGHT_BROWSERS_PATH = "$C\ms-playwright"
Push-Location "$C\node"
if (-not (Test-Path package.json)) { Set-Content -Encoding ascii package.json '{"private":true}' }
npm i --no-audit --no-fund playwright@1.56.1; npx playwright install chromium
Pop-Location
if ($SemVoz) { Write-Host "ok (pipeline)"; exit 0 }

# 3) voz: .cache\venv-voz com torch CUDA + qwen-tts + Base 0.6B (HF_HOME=.cache\hf)
$PYV = "$C\venv-voz\Scripts\python.exe"
if (-not (Test-Path $PYV)) { python -m venv "$C\venv-voz" }
& $PYV -m pip install -q -U pip
& $PYV -m pip install --no-cache-dir -q torch torchaudio --index-url "https://download.pytorch.org/whl/$Cuda"
& $PYV -m pip install --no-cache-dir -q qwen-tts numpy scipy soundfile librosa num2words sherpa-onnx onnxruntime huggingface_hub
$env:HF_HOME = "$C\hf"; $env:HF_HUB_DISABLE_XET = "1"
& $PYV -c "from huggingface_hub import snapshot_download as s; print(s('Qwen/Qwen3-TTS-12Hz-0.6B-Base')); print(s('ResembleAI/chatterbox', allow_patterns=['ve.pt'])); print(s('ResembleAI/Chatterbox-Multilingual-TTS-pt-br', repo_type='space', local_dir=r'$C\voz-modelos\cb-space', allow_patterns=['chatterbox/src/chatterbox/*.py', 'chatterbox/src/chatterbox/models/*.py', 'chatterbox/src/chatterbox/models/voice_encoder/*']))"   # ve.pt + código do encoder: só para tools/voz/timbre.py
New-Item -ItemType Directory -Force "$C\voz-ref" | Out-Null
Get-ChildItem tools\voz\ref\*.wav, tools\voz\ref\*.txt | ForEach-Object { if (-not (Test-Path "$C\voz-ref\$($_.Name)")) { Copy-Item $_ "$C\voz-ref\" } }
& $PYV -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"
Write-Host "ok"
