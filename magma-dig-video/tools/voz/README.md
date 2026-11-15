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
Entrada: `.txt` (1 frase/linha), `.json` (lista de strings ou `{texto, grupo, pausa_depois, seed, falado}`; `falado` troca só o que o motor lê) ou `-t` repetido.
Saída: `frases/NNN.wav` (48 kHz mono, 16 bits, sem silêncio nas pontas, teto -1 dBFS), `narracao.wav`
(frases + `--pausa`, padrão 0,32 s) e `tempos.json` no formato do `tts.py` (`frases[i].texto/falado/wav/ini/fim/palavras`)
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

Atenção: o cache não sabe da descrição/referência. Se mudar uma descrição em `vozes_qwen.json`, apague a referência em
`.cache/voz-ref/` e gere com `--sem-cache` (ou mude `--seed`).

## Pontuação (critério eliminatório do usuário)
```
$PY tools/voz/pontuacao.py build/voz/saida -o build/voz/pontuacao.json
```
Silêncio em cada vírgula (localizado pelos timestamps do Parakeet), pausa entre frases, pico de F0 no fim das perguntas
(PT-BR sobe na última tônica: "se-GUN-dos?") e afirmações que terminam subindo. Alvo: vírgula >= 120–150 ms, ponto >= 300 ms.
Quando o motor engole uma vírgula, regere a frase com outra `seed` ou com `"falado"` trocando a vírgula por reticências
(`--virgula "..."` faz isso no lote todo), e meça de novo.

## Amostra final
`tools/voz/finalizar.sh entrada.wav saida.m4a` normaliza para -16 LUFS e codifica AAC.
Frases da amostra e do roteiro, com as sementes e os ajustes usados nas finalistas: `amostra_qwen_*.json`,
`roteiro_parte01_frases.txt`, `roteiro_parte01_qwen_jovem.json`.

## Voz definitiva da série (voz A2 — escolhida pelo usuário)
- **Motor**: `qwen` = Qwen3-TTS-12Hz-0.6B-Base (Apache-2.0) clonando a referência sintética da voz A, bf16 em CPU.
- **Referência (não regerar!)**: `tools/voz/ref/qwen-design-narrador-jovem-s0.wav` + `.txt` (versionada, ~400 KB,
  sha256 no `ref/LEIAME.md`). `motores.referencia_sintetica()` restaura de lá para `.cache/voz-ref/` quando o cache
  some; só se ela não existir é que o VoiceDesign geraria outra (outro timbre). Teste feito: apagando a cópia do cache
  e gerando com `--sem-cache`, as frases saíram bit a bit idênticas às da amostra A.
- A descrição `narrador-jovem` em `vozes_qwen.json` ainda diz "fast speaking rate, short pauses": ela só serviu para
  criar a referência e NÃO deve ser mudada. O ritmo final vem do pós-tratamento abaixo, não da descrição.
- **Ritmo**: `--atempo 0.87` depois da síntese (ffmpeg atempo; altura e timbre preservados). Fala ~2,45–2,5 palavras/s.
  (Rubber Band piorou o UTMOS de 3,84 para 2,04; clonar de uma referência esticada mudou o timbre e engoliu vírgulas.)
- **Vírgulas**: onde o motor engole a vírgula, `"falado"` com reticências só no texto falado; depois
  `alongar_virgulas.py --min 0.22` e de novo `--min 0.24` (insere silêncio digital no meio do silêncio existente).
- **Pontos/frases**: uma frase por chamada, `--pausa 0.32` entre frases (o pipeline alonga para os alvos dele).
- **Sementes e grafias por frase**: Parte 1 em `tools/voz/roteiro_parte01_qwen_jovem_v2.json` (20 frases com
  semente própria, 6 com `falado`); amostra padrão em `amostra_qwen_jovem_v2.json`.
- **Episódio novo** (frases em `frases.json`, uma por item), um comando por etapa:
```
PY=.cache/venv-voz/bin/python; export HF_HOME=$PWD/.cache/hf; O=build/voz/parte-XX
$PY tools/voz/falar.py --motor qwen --voz narrador-jovem --atempo 0.87 frases.json -o $O
$PY tools/voz/revisar.py frases.json $O --atempo 0.87 --sementes 5,6,7 -o frases.json   # troca sementes de frases suspeitas
$PY tools/voz/falar.py --motor qwen --voz narrador-jovem --atempo 0.87 frases.json -o $O  # remonta (cache)
$PY tools/voz/alongar_virgulas.py $O --min 0.22 && $PY tools/voz/alongar_virgulas.py $O --min 0.24
$PY tools/voz/pontuacao.py $O                                                          # conferir
```
  Depois confira as frases que `revisar.py` lista como "continuam com problema" (ASR, F0) e, se preciso, ponha
  `"falado"` com reticências ou outra `seed` naquele item.
