# Pipeline de vídeo — MAGMA DIG (Reel 1080x1920, 30 fps)

```
story/parte-XX.json ──► make_video.py ──► TTS (Kokoro) ─► narração + tempos por palavra
                                     ├─► legenda em blocos (dados)  ┐
                                     ├─► sfx por dados (sintetizados) ├─► build/<nome>/timeline.json
                                     ├─► mix: voz + sfx + trilha (ducking, -14 LUFS, AAC 48k)
                                     └─► render/render.js ×4 (Playwright: renderFrame(t) → JPEG → x264) ─► out/<nome>.mp4
```

## Instalar do zero
```
./setup.sh            # cria .cache/venv, baixa Kokoro + Piper (+ ASR Whisper/Parakeet p/ avaliar vozes)
./setup.sh --sem-asr  # só o necessário para vídeo
```
Precisa de python3 ≥3.11, ffmpeg, node com `require('playwright')` + Chromium. Sempre rode o Python do venv: `.cache/venv/bin/python`.

## Rodar
```
PY=.cache/venv/bin/python
$PY make_video.py story/parte-01.json -o out/parte-01.mp4 --contact-sheet   # final
$PY make_video.py story/parte-01.json --so-contact-sheet --zona-segura       # só 24 stills PNG (segundos), com guia da zona segura
$PY make_video.py story/parte-01.json --beat b03,b04 --rascunho              # só esses beats, 540x960
$PY make_video.py story/parte-01.json --trecho 12-20 --rascunho              # só esse intervalo (s)
$PY make_video.py story/parte-01.json --sem-trilha --voz pf_dora --velocidade 1.1
$PY make_video.py story/parte-01.json --trilha minha_musica.mp3             # música própria no lugar da sintetizada
$PY make_video.py story/parte-01.json --so-audio                            # só timeline + build/<nome>/mix.wav
```
Saídas intermediárias em `build/<nome>/`: `timeline.json` (tudo que o player recebe), `tempos.json` + `narracao.wav`
(narração montada, tempos absolutos), `sfx.json`, `mix.wav`, `stills/`. Velocidade medida: ~16 quadros/s em 1080p com 4 workers
(≈3 min para 100 s de vídeo); rascunho ~20 q/s.

## Formato `story/parte-XX.json`
```jsonc
{
  "titulo": "Parte 1 — ...",            // livre
  "voz": "pm_alex",                     // pm_alex | pm_santa | pf_dora | piper_faber
  "velocidade": 1.05,                   // 0.5–2.0 (Kokoro)
  "trilha": true,                       // true = sintetizada | false | "caminho/musica.mp3"
  "pronuncia": {"DIG": "/dˈiɡ/"},       // grafia -> grafia falada (só áudio). Valor entre /.../ = IPA direto (Kokoro)
  "pronuncia_arquivo": "story/pronuncia.json",  // opcional, mesmo formato
  "estilo": { "legenda": {"tamanho": 110} },    // overrides de config/estilo.json (merge profundo)
  "fontes": ["Bangers"],                // fontes extras que as cenas usam (pré-carregadas)
  "beats": [
    {
      "id": "gancho",                   // obrigatório, único, [A-Za-z0-9_-]
      "cena": "placeholder",            // obrigatório: scenes/<cena>.js
      "params": { },                    // livre, vai para a cena
      "narracao": "Texto falado. Pode ter várias frases.",   // vazio => exige "duracao"
      "legenda": "Texto exibido se diferente do falado, ex. *1.500*",  // opcional
      "enfase": ["Zeca", "1.500"],      // palavras com cor de ênfase (ou marque *palavra* no texto)
      "sfx": [
        {"nome": "picareta", "offset": 0.4},                 // s desde o início do beat
        {"nome": "moeda", "palavra": "moedas", "offset": -0.1, "vol": 2, "n": 0, "seed": 3, "kw": {}}
      ],                                // "palavra": relativo ao início dessa palavra falada (n = ocorrência)
      "transicao": {"tipo": "fade", "dur": 0.3, "sfx": "whoosh", "sfx_vol": -10},  // ENTRADA neste beat; ou "corte"
      "respiro": 0.35,                  // silêncio após a última frase (padrão estilo.tempo.respiro)
      "pausa_frase": 0.28,              // entre frases do beat
      "duracao_min": 3.0,               // estica o beat se a fala for curta
      "duracao": 2.0,                   // só p/ beat sem narração
      "final": 1.4,                     // só no último beat: cauda após o respiro
      "legenda_pos": "baixo",           // baixo | centro | alto | {"centro_x": 510, "centro_y": 900}
      "legenda_estilo": {"cor_ativa": "#ff3b1f"},   // override só deste beat
      "sem_legenda": false
    }
  ]
}
```
**A duração de cada beat vem do áudio**: `entrada_beat` (0,12 s; no 1º beat `inicio` 0,25 s) + frases + pausas + `respiro`.
Nunca chute duração em beat narrado; use `duracao_min` se a cena precisar de mais tempo.

Transições (`tipo`): `corte`, `fade`, `flash` (branco), `preto`, `slide` (de baixo), `zoom`. Ficam centradas na fronteira
(metade em cada beat). Padrão: `config/estilo.json → transicao_padrao` (fade 0,3 s + whoosh). `corte` não toca sfx a menos que
você ponha `"sfx"` explicitamente.

Efeitos (`lib/sfx.py`, sintetizados): `picareta`, `rachar`, `quebrar`, `moeda`, `ding`, `whoosh`, `ronco`, `tictac`,
`sting`, `boom`, `pop`, `subida`. `kw` passa parâmetros (ex.: `{"dur": 6}` em `tictac`/`ronco`, `{"pitch": 1.2}` em
`moeda`/`ding`/`picareta`). Ouça todos: `$PY -m lib.sfx build/sfx`.

### Legenda — regras de bloco
- Blocos de até `max_palavras` (4) e `max_caracteres` (13, conta espaços); quebra também após pontuação e em pausas > 0,35 s.
- Pontuação `.,;:` é removida na exibição; `! ? …` ficam.
- Palavra ativa = cor `cor_ativa` + escala `escala_ativa`; ênfase = `cor_enfase`.
- Tudo de estilo (fonte, tamanho, cores, contorno, sombra, posição, `entrada`: pop|fade|slide|nenhuma, `modo`: bloco|karaoke)
  fica em **`config/estilo.json → legenda`**. Fontes disponíveis: Lilita One, Luckiest Guy, Bangers, Anton, Baloo 2
  (`assets/fonts/`, todas com ã ç é õ í ú â ê).
- Zona segura (Instagram): nada importante em y<250, y>1500 (420 px de baixo), x>960 (120 px à direita). Legenda padrão:
  centro (510, 1300). O render avisa (`AVISO: legenda fora da zona segura`) se um bloco sair dela.
- Se `legenda` ≠ `narracao`, as palavras iguais herdam o tempo falado e trechos diferentes ("1.500" ↔ "mil e quinhentas")
  dividem o tempo do trecho falado correspondente.

## API de cena (`scenes/<nome>.js`)
```js
MD.scene("minha_cena", {
  css: `.x { ... }`,                       // opcional, injetado uma vez
  setup(el, params, ctx) {                  // 1x por beat. el = div 1080x1920. Pode ser async (await MD.loadImage(...))
    const { g } = MD.canvas(el);            // canvas 1080x1920 opcional
    const svg = MD.el("svg", {width:1080, height:1920}, el);
    return { g, svg };                      // "state" devolvido ao render
  },
  render(state, t, ctx) {                   // a cada quadro. t = tempo LOCAL do beat (0..ctx.beat.dur, travado nas transições)
    // posicione tudo como FUNÇÃO PURA de t
  },
});
```
`ctx`: `W, H, fps, params, t, tGlobal, frame, el, beat: {id, ini, dur, index, words: [{w, ini, fim}] (locais), marks: {sfx: [t...]}}`.

**Regras de determinismo** (o render tira quadros fora de ordem em 4 processos): não use `Date`, `requestAnimationFrame`,
`setTimeout`, `Math.random` (está trocado por um gerador por quadro — use `MD.rng(seed)`), nem `transition`/`animation` CSS
(desligadas). Se quiser `@keyframes`, use `MD.seekCss(el, t)`. Assets: `MD.asset('assets/img/zeca.png')`.

Helpers (`player/helpers.js`, namespace `MD`):
- tempo/matemática: `clamp, lerp, invLerp, prog(t,t0,t1,ease), map(t,t0,t1,v0,v1,ease), kf(t, [[t,v,ease],...]), pulse(t,t0,dur)`
- easing `MD.ease.*`: linear, in/out/inOut Quad|Cubic, outQuart, in/outExpo, in/outBack, outElastic, outBounce
- aleatório: `rng(seed)`, `hash(n,seed)`, `noise(x,seed)`
- câmera: `shake(t, {t0, dur, amp, freq, seed, rot}) → {x,y,rot}`
- partículas analíticas: `particles(t, {t0,count,x,y,speed,angle,gravity,life,size,seed,drag,spread})` + `drawParticles(g, lista, cor|fn, 'rect'|'circle')`
- texto: `floatText(parent, chave, t, {t0,dur,text,x,y,rise,size,color})` (o "+150"), `countUp(t,t0,dur,de,ate)` → "1.500"
- DOM: `el(tag, attrs, parent, texto)` (SVG automático), `set(el, {x,y,s,r,o})`, `canvas(parent)`, `loadImage(src)`, `seekCss(el,t)`
- sincronia com a fala: `wordIndex(ctx,t)`, `wordTime(ctx,'moedas')`, `marks(ctx,'picareta')` (tempos dos sfx do beat)

Exemplo completo: `scenes/placeholder.js`. Teste uma cena isolada com `--beat <id> --rascunho` ou `--so-contact-sheet`.

## Voz
`tts.py` (independente do vídeo): frases → `frases/NNN.wav` + `narracao.wav` + `tempos.json` (início/fim de frase e palavra).
```
$PY tts.py frases.txt -o build/tts --voz pm_alex --velocidade 1.05 --pausa 0.35 --pron story/pronuncia.json
```
Tempo de palavra é estimado (proporcional a fonemas sobre o trecho vozeado, preso aos limites reais da frase): mediana ~90–110 ms,
p90 ~200 ms vs. timestamps do ASR Parakeet. Avaliar vozes: `$PY tools/avaliar_vozes.py` (gera `build/amostras/`, WER via Whisper e Parakeet).

## Trocar a narração por uma gravação
1. Grave **um arquivo** (WAV/M4A/MP3) lendo as frases dos beats na ordem, com ~0,3 s de pausa entre frases.
2. `$PY make_video.py story/parte-01.json --narracao-audio voz.m4a`
   → alinha automaticamente (escolhe as pausas que melhor batem com as fronteiras esperadas) e salva
   `build/parte-01/alinhamento/tempos.json`. Confira; se errar, corrija `ini`/`fim` no JSON e rode com
   `--narracao-tempos build/parte-01/alinhamento/tempos.json`.
3. Cada frase gravada é recortada e reposicionada com as mesmas pausas/respiros do TTS (as pausas originais da gravação não são
   mantidas; ajuste `respiro`/`pausa_frase` se quiser mais ar). Também dá para usar `tts.py ... --alinhar voz.m4a` só para os tempos.
O JSON de tempos tem o mesmo formato de `tts.py` (`frases[].ini/fim/palavras`); número e ordem de frases devem casar com o story
(uma frase = trecho terminado em `.`, `!`, `?` ou `…`).
