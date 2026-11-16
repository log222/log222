# Pipeline de vídeo — MAGMA DIG (Reel 1080x1920, 30 fps)

```
roteiro/parte-XX.shots.json ──► tools/gerar_story.py ──► story/parte-XX.json  (falas + planos por palavra)
tools/voz/falar.py (Qwen narrador-jovem, venv-voz) ──► build/voz/completo/<voz>/ (1 WAV por FRASE + tempos.json)
story/parte-XX.json + --voz-pasta ──► make_video.py ─► frases casadas pelo texto ─► pausas por pontuação (lib/pausas.py)
                                     ├─► tempo de palavra (ASR Parakeet + fonemas)
                                     ├─► planos cortados em fronteira de palavra ─┐
                                     ├─► legenda em blocos (dados)                 ├─► build/<nome>/timeline.json
                                     ├─► sfx por dados (19 efeitos sintetizados)   ┘
                                     ├─► mix: voz + sfx + trilha (ducking, -14 LUFS, AAC 48k)
                                     └─► render/render.js ×4 (Playwright: renderFrame(t) → JPEG → x264) ─► out/<nome>.mp4
```

## Instalar do zero
```
./setup.sh            # .cache/venv + Kokoro + Piper + ASR (Whisper-small p/ verificação, Parakeet p/ alinhamento)
./setup.sh --sem-asr  # só o necessário para vídeo (tempo de palavra cai para o estimador por fonemas, ~2,5x pior)
```
Precisa de python3 ≥3.11, ffmpeg, node com `require('playwright')` + Chromium. Python sempre do venv: `PY=.cache/venv/bin/python`.

## Rodar
```
$PY tools/gerar_story.py roteiro/parte-01.shots.json -o story/parte-01.json     # (re)gera o story do roteiro
$PY make_video.py story/parte-01.json --voz-pasta build/voz/completo/qwen-narrador-jovem-v2 --motor qwen \
    --voz narrador-jovem -o out/parte-01-final.mp4 --contact-sheet --cs-cortes --cs-max 20 --workers 4 --pausas  # FINAL
$PY make_video.py story/parte-01.json -o out/parte-01.mp4 --contact-sheet --cs-cortes   # (sem --voz-pasta: Kokoro, só teste)
$PY make_video.py story/parte-01.json --so-contact-sheet --cs-cortes --zona-segura      # só stills (s), sem vídeo
$PY make_video.py story/parte-01.json --plano p12,p13 --rascunho                        # só esses planos, 540x960
$PY make_video.py story/parte-01.json --trecho 40-55 --rascunho                         # intervalo (s)
$PY make_video.py story/parte-01.json --so-audio          # só narração/timeline/mix + estatísticas de ritmo e legenda
$PY tools/verificar_narracao.py build/parte-01             # ASR de volta: palavras mal pronunciadas
$PY tools/medir_alinhamento.py story/parte-01.json          # erro do tempo de palavra onde há verdade conhecida
```
Codificação final: x264 ABR 5,6 Mbps (`video.bitrate`, teto `bitrate_max` 7 Mbps; ~115 MB para 2 min 37 s), `+faststart`;
`--qualidade-max` = crf 16 sem teto. Prévia leve: `ffmpeg -i final.mp4 -b:v 3.3M -maxrate 4.2M -bufsize 7M -c:a copy -movflags +faststart`.
Flags: `--sem-trilha`, `--trilha musica.mp3`, `--motor`, `--voz`, `--velocidade`, `--regerar f12`, `--voz-pasta DIR`,
`--narracao-audio/--narracao-tempos`, `--workers`.

**Execuções simultâneas:** a execução completa sem `-o`/`--plano`/`--trecho` usa `build/<nome>/` e `out/<nome>.mp4`.
Qualquer `-o`, `--plano` ou `--trecho` usa pasta própria `build/<nome>/runs/<tag>/` e saída própria
(`out/<nome>-plano-p05-contact.png` etc.). Se a pasta estiver em uso (trava de arquivo), a execução usa `<tag>-<pid>`
e acrescenta `-<pid>` ao nome da saída. Escritas de JSON/WAV/PNG são atômicas; caches de TTS/ASR/voz também.
`--plano` filtra em todos os modos (vídeo, `--so-contact-sheet`, `--cs-cortes`), inclusive planos não vizinhos.
Velocidade medida: Parte 1 inteira (107,8 s, 3233 quadros, placeholders) em 140 s de render = 23 q/s; 2 min 46 s no total.
Cenas pesadas de canvas vão ser mais lentas; meça com `--plano`.

## Formato `story/parte-XX.json`
Unidade de NARRAÇÃO = **fala** (1+ frases sintetizadas juntas, prosódia natural). Unidade VISUAL = **plano**,
que começa numa palavra da fala. Planos são contíguos: cada um vai do seu corte até o corte seguinte.
```jsonc
{
  "motor": "kokoro",          // kokoro (interno) | supertonic | qwen | qwen-design | chatterbox (CLI tools/voz)
  "voz": "pm_alex",           // kokoro: pm_alex/pm_santa/pf_dora; supertonic: M1..M5/F1..F5; qwen/chatterbox: vozes_qwen.json
  "velocidade": 1.0, "atempo": 1.0,
  "pronuncia": {              // só áudio. "padrao" vale para todos; a seção do motor sobrescreve; /IPA/ só no kokoro
    "padrao": {"MAGMA DIG": "Magma Díg"},             // só o nome do jogo; português comum na grafia normal
    "kokoro": {"MAGMA DIG": "MAGMA /dˈiɡ/"}},
  "trilha": true,                                      // true | false | "musica.mp3"
  "estilo": {"audio": {"sfx_db": -10}},                // overrides de config/estilo.json (merge profundo)
  "falas": [
    {
      "id": "f01",
      "texto": "E se o seu dia de trabalho durasse só dez segundos?",
      "legenda": "…",            // opcional: texto exibido se diferente do falado (*palavra* = destaque)
      "pausa_depois": 0.5,       // opcional: silêncio após a fala (padrão estilo.tempo.pausa_fala = 0,12 s)
      "pausa_antes": 0,          // opcional
      "duracao": 2.0,            // só fala SEM texto (plano mudo)
      "velocidade": 1.05,        // opcional, só esta fala
      "take": 1,                 // opcional: outra tomada desta fala (motores externos autorregressivos)
      "planos": [
        {"id": "p01", "inicio": 0, "cena": "auto"},                     // 1º plano da fala: inicio 0 obrigatório
        {"id": "p02", "inicio": 5, "destaques": ["TRABALHO"],            // índice da palavra (0 = "E")
         "sfx": [{"nome": "picareta", "offset": 0.05}]},
        {"id": "p03", "inicio": {"palavra": "só", "n": 0},               // ou texto da palavra + ocorrência
         "transicao": "corte", "legenda_pos": "alto",
         "sfx": [{"nome": "tictac", "palavra": "segundos", "offset": -0.2, "vol": -4, "kw": {"dur": 1, "bpm": 240}}],
         "trilha": [{"offset": 0.9, "db": -80, "rampa": 0.02}],          // automação da trilha (abaixo)
         "roteiro": {"cenario": "C7 …", "acao": "…", "camera": "…", "ui": "…"}}   // vai para ctx.plano
      ]
    }
  ]
}
```
- `cena`: `"auto"` (padrão) = arquivo próprio do plano (abaixo); ou o nome de um módulo em `scenes/` (ex.: `placeholder`).
- Corte = 40 ms antes da palavra de início (`estilo.tempo.corte_antecipado`). Planos < 0,1 s geram aviso.
- `transicao`: padrão `corte` (a referência quase só usa corte). Outros: `fade`, `flash`, `preto`, `slide`, `zoom`
  (`{"tipo": "fade", "dur": 0.15, "sfx": "whoosh"}`), centradas na fronteira.
- `sfx`: `offset` relativo ao início do plano, ou a uma `palavra` falada (procura no plano, depois na fala; `n` = ocorrência).
  Efeitos (`lib/sfx.py`): picareta, rachar, quebrar, moeda, ding, whoosh, ronco, tictac, sting, boom, pop, subida,
  clique, apagar, zumbido, giz, acorde (`kw.tipo`: claro|quente|recompensa|subindo|grave|dissonante), coracao, passos.
  `"kw": {"dur": "plano"}` faz o efeito durar até o corte (acompanha o plano esticado); `"no_fim": true` mede o
  `offset` a partir do fim do plano. vento (`kw.dur`, `kw.grilos`), folha, porta, pedrinhas, chiado (`kw.dur`). Qualquer efeito aceita `"kw": {"eco": true}`
  (ou `{"eco": {"atraso": 0.22, "repeticoes": 4, "decai": 0.45}}`) para eco de caverna. Ouça todos: `$PY -m lib.sfx build/sfx`.
- `trilha` (automação por dados): lista de deixas `{"db", "modo": "normal"|"suspensa", "rampa" (s), e o tempo:
  "offset" desde o corte, ou "palavra"+"offset", ou "no_fim": true}`. Cada deixa faz rampa do estado atual para o novo e
  vale até a próxima. `db: -80` = silêncio; `modo: "suspensa"` = acorde sus sustentado, sem bateria/arpejo, sem resolver.
  Parte 1: p03 corte seco no zero (0,9 s), volta em p04; p44 some (suspense até "Cobre."), p48 baixa (-10 dB),
  p49 volta; p55 suspensa até o fim.
- `destaques`: palavras/expressões do plano em amarelo; uma expressão de várias palavras ("CENTO E SESSENTA E SETE",
  "MAGMA DIG") vira um bloco de legenda inteiro.
- Formato antigo (`"beats": [...]`, 1 beat = 1 fala = 1 plano) continua aceito (`story/demo.json`).

### Ritmo e pausas por pontuação (config/estilo.json → tempo.pausas)
O pipeline nunca acelera a voz (o ritmo vem da pasta de voz; a voz definitiva já vem com `atempo` 0,87 do CLI de voz).
A voz é tratada FRASE a FRASE (qualquer motor): o silêncio nas pontas é aparado (`lib/pausas.py`) e substituído pelo
valor da pontuação (tabela atual, a da Parte 1 final):

| pontuação | alvo | modo |
|---|---|---|
| fim de frase (. ? !) | 0,55 s | exato |
| fim de frase depois de fragmento de até 2 palavras ("Crac.", "Dia um.") | 0,38 s | exato (`fim_frase_fragmento`, `fragmento_max_palavras`) |
| dois-pontos, reticências | 0,45 s | exato (ajusta o silêncio que o motor fez) |
| vírgula, ponto e vírgula | mínimo 0,28 s | só alonga silêncio existente (fade, no meio do trecho não vozeado) |

Se o motor não fez pausa nenhuma numa vírgula, não força e ela aparece como "sem pausa" no relatório (critério de voz).
O mesmo vale para narração gravada (`--narracao-audio`), onde os fins de frase também são normalizados.
Pausa intencional extra: `"pausa_depois"` na fala (o "Cobre." usa 0,6 s).
`--so-audio` (ou `--pausas`) imprime a tabela alvo × motor × real de cada vírgula/ponto e as palavras/s; salva
`build/<…>/pausas.json`. Parte 1 final (voz A2 `qwen-narrador-jovem-v2`): 157,07 s, 2,04 pal/s no total, 0 vírgulas sem pausa.

### Legenda (config/estilo.json → legenda, estilo medido da referência)
Anton caixa-alta branca, 72 px (maiúsculas ≈ 62 px), contorno 4 px #161408 + sombra suave, sem karaokê
(`destacar_ativa: false`), destaque #EBBA40 só por dados, fade-in 0,1 s, uma linha (encolhe se passar de 700 px),
centro y = 1400 (`legenda_pos`: `baixo` 1400 | `meio` 1250 | `alto` 390 | `centro` 960 | `{"centro_y": …}`).
Blocos: até 3 unidades e 22 caracteres; duração mínima de exibição `dur_min_bloco` 0,35 s (bloco mais curto se
junta ao vizinho, de preferência no mesmo plano e dentro do limite de caracteres; nunca dois blocos ao mesmo tempo); quebra em pontuação, em pausa > 0,35 s, no corte de plano, e após ~0,85 s
com ≥ 2 palavras; não termina bloco em artigo/preposição. Pontuação é mantida.
Zona do Instagram (medida): nada essencial em y < 250 nem y > 1500; os botões da direita cobrem x > 960 **só entre
y ≈ 1000 e 1500** (acima disso a borda direita é livre). Bloco em 1400 ocupa ~1369–1431 (+ sombra) → folga de ~65 px.
`--zona-segura` desenha essa zona; o aviso de legenda fora da zona usa a mesma regra.

## Um arquivo por plano: `scenes/planos/pNN.js`
O plano com `cena: "auto"` carrega `scenes/planos/<id>.js` se existir; se não, mostra o **placeholder de animatic**
(número, cenário, ação/câmera/UI/sfx do roteiro, barra de tempo do plano). Cada agente cria/edita só o seu arquivo.
O kit `art/kit` (window.ART) é carregado antes (uma vez), a menos que `kit: false`.
```js
// scenes/planos/p02.js
MD.plano("p02", {
  render(g, t, ctx) {                       // g: canvas 2D 1080x1920 já limpo; t: s desde o corte do plano
    g.fillStyle = ART.pal.noite1; g.fillRect(0, 0, 1080, 1920);
    ART.zeca.draw(g, ART.zeca.pose("cavando", t, { x: 540, y: 1150, s: 2.4 }));
    for (const m of MD.marks(ctx, "picareta")) { /* golpe sincronizado com o som em t = m */ }
  },
});
```
Opcional: `async setup(ctx)` (1x; o retorno chega como 4º argumento de `render`), `kit: false`.
`ctx`: `dur` (duração do plano), `words` [{w, ini, fim}] locais ao plano, `marks` {sfx: [t]}, `plano` (dados do roteiro:
cenario, acao, camera, ui…), `el` (div do plano, se quiser DOM), `frame`, `tGlobal`, `fps`.
Testar: `$PY make_video.py story/parte-01.json --plano p02 --so-contact-sheet --cs-cortes` (ou `--rascunho`).
Erro no arquivo → o plano cai no placeholder com a mensagem em vermelho e o render imprime `AVISO: plano pNN: …`.

## Regras de determinismo (todas as cenas e planos)
O render tira quadros fora de ordem em 4 processos: tudo é função pura de `t`. Proibido `Date`, `requestAnimationFrame`,
`setTimeout`, `Math.random` (trocado por gerador por quadro; use `MD.rng(seed)`/`ART.rng(seed)`), transições/animações CSS
(use `MD.seekCss(el, t)`).

## API de cena genérica (`scenes/<nome>.js`, para cenas reutilizáveis)
```js
MD.scene("nome", { css: "...", setup(el, params, ctx) { return state }, render(state, t, ctx) {}, release(state) {} });
```
Helpers `MD.*` (`player/helpers.js`): `clamp, lerp, prog, map, kf, pulse, ease.*, rng, hash, noise, shake, particles,
drawParticles, floatText, countUp, el, set, canvas, loadImage, asset, seekCss, wordIndex, wordTime, marks`.
O kit `ART.*` (art/kit) tem paleta, Zeca com poses, câmera, glow, poeira etc. (ver art/).

## Voz e tempo de palavra
- Motor plugável: `"motor"`/`"voz"` no story (ou `--motor/--voz`). `kokoro` roda dentro do pipeline; os outros chamam
  `tools/voz/falar.py` no venv `.cache/venv-voz`, em lote só para o que falta, com cache próprio em `.cache/tts-ext/<motor>/`
  por (motor, voz, velocidade, atempo, take, texto falado). Geração serializada por motor (duas execuções não geram a
  mesma fala duas vezes). `--regerar f12` regera a fala ignorando o cache (mesmo take); para outra tomada use `"take"`.
  `--voz-pasta DIR` usa uma pasta já gerada pelo CLI (`tempos.json` + `frases/NNN.wav`): casa FRASE a FRASE pelo
  texto (o roteiro completo do agente de voz, 1 frase por linha, bate 62/62 com as frases do story) e segue o mesmo
  caminho do TTS (pausas determinísticas); se a pasta for por fala, casa por fala. Use `--motor/--voz` iguais aos da
  pasta (pronúncia e rótulo). Ex.: `--voz-pasta build/voz/completo/qwen-narrador-jovem --motor qwen --voz narrador-jovem`. Depois disso tudo é igual: alinhamento
  por ASR, legenda, cortes.
- **Voz definitiva da série:** Qwen3-TTS `narrador-jovem` (A2), gerada pelo agente de voz com a receita de
  `tools/voz/README.md` §"Voz definitiva da série" e consumida por `--voz-pasta` (Parte 1:
  `build/voz/completo/qwen-narrador-jovem-v2`). Kokoro (`pm_alex`) é só para teste rápido. `tts.py` gera WAV por frase
  + `tempos.json` (mesmo formato).
- Tempo de palavra = **híbrido**: timestamps do Parakeet (ASR) como âncora onde a palavra reconhecida casa com o
  texto (94–95 % das palavras na Parte 1), interpolação por fonemas entre âncoras, inícios caídos em silêncio são
  empurrados para o começo da voz. Erro medido em emendas de frases (verdade conhecida): mediana 35–40 ms, p90 80–92 ms
  (o estimador puro dava 105/250 ms).

## Trocar a narração por uma gravação
1. Grave **um arquivo** (WAV/M4A/MP3) lendo as falas na ordem. Pausas livres (o vídeo recoloca as pausas do estilo).
2. `$PY make_video.py story/parte-01.json --narracao-audio voz.m4a`
   → ASR do arquivo inteiro, alinhamento palavra a palavra contra o texto do story, recorte por fala
   (início/fim encaixados na voz), salvo em `build/parte-01/alinhamento/tempos.json`.
3. Se algo sair errado, corrija `ini/fim` nesse JSON e rode com `--narracao-tempos build/parte-01/alinhamento/tempos.json`.
Sem o modelo ASR, cai no alinhamento antigo por pausas (exige ~0,3 s de pausa entre falas).
Teste feito: narração inteira de outra voz como "gravação": limites de fala com erro mediano ~0 ms (após descontar
os 30 ms de margem), máx. 200 ms em 1 de 23 falas; 95 % das palavras ancoradas.
