#!/usr/bin/env bash
# Normaliza para -16 LUFS (loudnorm em 2 passadas, pico -1,5 dBTP) e codifica AAC 48 kHz mono.
#   tools/voz/finalizar.sh entrada.wav saida.m4a
set -euo pipefail
in=$1; out=$2
j=$(ffmpeg -hide_banner -nostats -i "$in" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 \
    | sed -n '/^{/,/^}/p')
g() { echo "$j" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
    -ac 1 -c:a aac -b:a 160k -movflags +faststart "$out"
echo "$out"
