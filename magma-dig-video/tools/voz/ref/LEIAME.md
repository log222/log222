# Referência da voz definitiva da série (voz A / A2)

`qwen-design-narrador-jovem-s0.wav` (+ `.txt`, a transcrição) é uma voz SINTÉTICA, gerada pelo
Qwen3-TTS-12Hz-1.7B-VoiceDesign (Apache-2.0) só a partir da descrição `narrador-jovem` de
`../vozes_qwen.json`, com seed 0 e dtype float32 (antes da troca para bf16). Nenhuma pessoa real.
NÃO regere: a mesma descrição dá outro timbre. `motores.referencia_sintetica()` restaura daqui para
`.cache/voz-ref/` quando o cache não existe.

sha256 wav: 2b540956e1ba74bc0bd749da177721906fe9f7ae140907d2d6848c108e60f980
