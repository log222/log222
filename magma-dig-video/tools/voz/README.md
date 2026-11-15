# tools/voz — vozes PT-BR abertas (alternativas ao Kokoro)

Venv próprio: `.cache/venv-voz` (não é o `.cache/venv` do pipeline).

## Instalar
```
tools/voz/instalar.sh          # tudo: Supertonic 3, Qwen3-TTS, Chatterbox pt-BR, UTMOS (~19 GB no disco)
tools/voz/instalar.sh --leve   # só Supertonic 3 (ONNX, sem torch)
```
Rede necessária: PyPI, GitHub releases, `huggingface.co` e `us.aws.cdn.hf.co` (os arquivos grandes do HF redirecionam para lá).

## Gerar
```
PY=.cache/venv-voz/bin/python
$PY tools/voz/falar.py --lista-vozes
$PY tools/voz/falar.py --motor supertonic --voz M1 --velocidade 1.0 frases.txt -o build/voz/saida/
$PY tools/voz/falar.py --motor qwen --voz narrador-jovem frases.txt -o build/voz/saida/ --atempo 1.08
$PY tools/voz/falar.py --motor chatterbox --voz narrador-jovem -t "Crac. Uma moeda." -o build/voz/teste/
```
Entrada: `.txt` (1 frase/linha), `.json` (lista de strings ou `{texto, grupo, pausa_depois}`) ou `-t` repetido.
Saída: `frases/NNN.wav` (48 kHz mono, 16 bits, sem silêncio nas pontas, teto -1 dBFS), `narracao.wav`
(frases + `--pausa`, padrão 0,35 s) e `tempos.json` no formato do `tts.py` (`frases[i].texto/falado/wav/ini/fim/palavras`)
com `sr: 48000`, `motor`, `licenca`, `duracao` por frase e `geracao_s`. Tempos de palavra são estimados (proporcionais às letras).
Cache por frase em `.cache/voz-cache` (motor+voz+velocidade+seed+texto); `--sem-cache` regera. `--seed N` (ou `"seed"` por frase no JSON) muda a tomada
(motores autorregressivos: Qwen, Chatterbox) — útil para regerar uma frase ruim.

Pronúncia: `tools/voz/pronuncia.json` — `padrao` vale para todos, seções por motor sobrescrevem (no `kokoro`, `/IPA/`).
Só o áudio muda; `texto` no JSON continua o original.

| motor | o que é | vozes | licença |
|---|---|---|---|
| `supertonic` | Supertonic 3 int8 (ONNX via sherpa-onnx), rápido | M1–M5, F1–F5 (prontas) | OpenRAIL-M (comercial ok, com restrições de uso) |
| `qwen` | Qwen3-TTS: timbre desenhado por texto (VoiceDesign 1.7B) uma vez, reaplicado a cada frase pelo Base 0.6B | chaves de `vozes_qwen.json` | Apache-2.0 |
| `qwen-design` | Qwen3-TTS VoiceDesign 1.7B direto em cada frase (timbre varia um pouco entre frases, lento) | idem | Apache-2.0 |
| `chatterbox` | Chatterbox Multilingual V3 pt-BR (fine-tune BR); referência = áudio SINTÉTICO do Qwen VoiceDesign | idem | MIT (saída com marca d'água Perth inaudível) |
| `kokoro` | linha de base do pipeline | pm_alex, pm_santa, pf_dora | Apache-2.0 |

Nenhuma voz de pessoa real é usada como referência: as referências do `chatterbox`/`qwen` são geradas pelo
Qwen3 VoiceDesign só a partir das descrições em `vozes_qwen.json` e ficam em `.cache/voz-ref/`.

Variáveis: `VOZ_THREADS` (padrão 4), `VOZ_ST3_PASSOS` (passos do Supertonic, padrão 16), `VOZ_CB_EXAG`/`VOZ_CB_CFG` (Chatterbox).

## Medir (sem ouvido — indicadores, não substituem ouvir)
```
$PY tools/voz/medir.py build/voz/saida/narracao.wav --texto-arquivo tools/voz/amostra_texto.txt -o build/voz/medidas.json
```
WER ida e volta (Whisper-small e Parakeet, de `.cache/asr`), palavras/s, pausas, clipping, F0 (desvio em semitons),
UTMOS22 (treinado em inglês) e DNSMOS.
