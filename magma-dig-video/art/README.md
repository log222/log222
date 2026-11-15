# Kit de arte — MAGMA DIG (Reel 1080×1920)

Linguagem da referência (recorte 2.5D chapado, sem contorno, camadas com profundidade de campo, luz dramática, UI desenhada na cena, insertos blueprint) com o universo e a paleta do jogo. Tudo é **Canvas 2D, função pura de `t`** (sem `Date`, rAF, `Math.random`, CSS animado). Aleatório só com semente (`ART.rng`). Camadas estáticas são desenhadas uma vez e cacheadas (`ART.cache`).

## Carregar
```js
// numa cena do pipeline (scenes/planos/pNN.js), no setup (async):
if (!window.ART_LOAD) await new Promise(r => { const s = document.createElement("script"); s.src = MD.asset("art/kit/art.js"); s.onload = r; document.head.appendChild(s); });
await ART_LOAD(MD.asset("art/kit/"));      // carrega os módulos + fonte Nunito e espera fontes/imagens
const { g } = MD.canvas(el);
```
Exemplos: `art/exemplo/plano_exemplo.js` (convenção atual `MD.plano`, ver também `scenes/planos/p29.js`) e `art/exemplo/cena_mina.js` (API antiga `MD.scene`). Módulos (`art/kit/`): `core.js`, `zeca.js`, `mundo.js`, `cenas.js`, `cenas2.js`, `ui.js`, `gameplay.js`.
Fontes: Nunito (UI, `art/fonts/`, OFL) + Lilita One / Anton de `assets/fonts/` (o player já carrega `fonts.css`).

## Pré-visualizar / renderizar fora do pipeline
```
node art/tools/render.js <prancha> --stills 1.2 --out build/art/x.png      # prancha = art/boards/<nome>.js
node art/tools/render.js teste --video --from 0 --to 7 --out build/art/teste.mp4
python3 art/tools/finalizar.py      # build/art/sf_*.png -> art/frames/*.png (quantizado < 1,5 MB) + teste-contato.jpg
```
Abrir `art/preview/index.html?board=teste` num navegador toca em loop. Gameplay precisa dos quadros pré-extraídos:
`ffmpeg -i assets/game/preview.mp4 -vf fps=30 -q:v 3 build/art/gameplay/f_%04d.jpg`.

## API
**Palco e câmera** (`core.js`, `mundo.js`)
- `ART.palco(g, t, cam, cena, atores(gg,t), {frame, post, vinheta, legenda, legendaK, grao})` — fundo → atores (d=1) → frente → luz → pós (vinheta, faixa escura da legenda y≈1300–1500, grão).
- `ART.camera(t, {push:[z0,z1], dur, drift:[dx,dy], hits:[t...], hitAmp, cx, cy})` → empurrão/afastamento, pan, tremor de impacto. Parallax: cada camada tem profundidade `d` (0 = infinito, 1 = personagem, >1 = primeiro plano desfocado).
- `ART.withLayer(g, cam, d, fn)`, `ART.camadaEstatica(chave, d, pinta, {blur, res})`.
- Efeitos: `ART.beam` (feixe), `ART.glow`, `ART.dust` (poeira/vaga-lumes), `ART.burst` (partículas analíticas), `ART.vignette`, `ART.grain`, `ART.kf`/`ART.ease`/`ART.prog`.

**Zeca** (`zeca.js`)
- `ART.zeca.draw(g, pose)` → âncoras em px `{chao, cabeca, lanterna, olhos, mao, ponta (da picareta), topo, boca}`.
- `ART.zeca.pose(nome, t, extras, opts)`; nomes: `parado, cavando ({periodo, t0}; impacto em 66% do ciclo), andando, bola, sentado, dormindo, comemorando, espantado, preocupado, feliz`. `ART.zeca.mix(a, b, k)` mistura poses.
- Campos: `x, y` (pés), `s` (escala; altura ≈ 235·s px), `turn` (−1..1: 0 frente, 0,5 = 3/4, 1 = perfil; negativo espelha), `lean, sq, bob, headTilt/Dx/Dy`, braços `aF/eF/aB/eB`, pernas `lF/lB/liftF/liftB`, `eyes` (aberto, feliz, espanto, fechado, meio, preocupado, determinado), `mouth` (sorriso, neutro, triste, o, grito, aberto, esforco, dormindo), `brows`, `look:[x,y]`, `blink`, `tool:'picareta'`, `toolMat` (ferro/esmeralda/ouro), `lamp` 0..1, `cone` 0..1 (+`coneAng`, `coneLen`), `rim`/`rimA` (luz de recorte da cena), `sweat`, `zzz`.
- `ART.pata(g, x, y, ang, {s, dedos:'aberta'|'aponta'|'segura', objeto(g)})` — pata em close (x,y = palma; dedos apontam para −x local).
- `ART.zecaPix(g, i, x, y, tam)` — retrato pixel do `zeca.png` (0 normal, 1 feliz, 2 espantado, 3 dormindo; precisa `ART.gameplay.preload`).

**Cenários** (`ART.cenas.*(opções)` → cena para `ART.palco`)
- `vila({placa:'MAGMA DIG', sub:'A · TERRA RASA', lampiao, interiorMina})` — C1. `pos.chao`=1180, `pos.placa`.
- `mina({luz, lanternas, carrinho})` — C2. Perspectiva: `ART.proj(X,Y,Z)`, `ART.projEscala(Z)`; `ART.cubo(g, X0, Z0, {crack:0..3, seed, ores, crackGlow, escuro})`, `ART.estouro(g, t, {t0, front})`, `ART.oresVoando(g, t, {t0, de, ate, n, tipos})`, `ART.pepita(g, x, y, r, tipo)`.
- `toca({meta:{riscados, conta:'1.000 ÷ 6 = 167', contaProg, barra:0.04, seta, prog}, luminaria, janela})` — C4. `ART.giz(...)` desenha a parede da meta.
- `tocaDesfocada()` — fundo para os painéis (C5): `ART.painelHabilidades(g, t, {acesos, destaque, pulso, niveis})`, `ART.painelMercado(g, t, {preco, seta, setaSombra, tremor, press, brilhoAmanha, prog})`.
- `profundezas({desce:0..1})` — C8 estratos A–I; `ART.coracaoMagma(g, t, {pulso, x, y, s})`.
- Ciência (C6, paleta própria `ART.BP`): `ART.ciencia.crosta(g, t, {furo, regua, anos, rotulo, t12})`, `.planeta(g, t, {seta, nucleo, risco12, temperatura})`, `.nucleoSol(g, t)`, `.tatu(g, t, {prog, garras})`.
- Objetos (C7): `ART.holofote(g, t, {cor, chao})`, `ART.obj.lanterna(g, t, {on})`, `.picaretaVelha`, `.saquinho({virado, t0})`, `.calendario({preenchido, relogio})`, `.pepitaCobre`.

**Interface na cena** (`ART.ui.*`, x,y = centro salvo indicado)
`cronometro(g,x,y,{valor, max, escala, fantasma, icone:'sol', alerta})`, `crac(g,x,y,t,t0,{s, apagado})`, `contador(g,x,y,{valor, icone, pulso})`, `flutua(g,x,y,t,t0,{texto})`, `cartaoMeta(g,x,y,{saldo, meta, dia, total, rotuloExtra})` (SALDO × META · DIA X DE 30), `cartaoMinerio`, `linhaMercado`, `grafico7`, `seta({dir})`, `botao(g,x,y,w,h,{texto, sub, cor, press, icone})`, `etiqueta`, `feixe` (coluna de luz de item raro), `ramo` / `RAMOS` (7 ramos), `titulo`, `cartao({vidro})`, `pix(g, nome, x, y, tam)` (ícones pixel art do jogo), `moeda`, `legendaExemplo` (só para conferir contraste).

**Gameplay real** (`gameplay.js`, C3)
`await ART.gameplay.preload(de, ate)` no setup; `ART.gameplay.visor(g, t, {de, ate, dur, recorte, y, largura, zoom, foco, tapar:[[x,y,w,h]], cronometro:{valor}, retrato, rotulo})`. Recortes prontos em `ART.gameplay.RECORTES` (tiram a caixa de marketing e o 13,2 original); `tapar` borra regiões (ex.: o +91,1K do Mercado); o cronômetro desenhado entra por cima.

## Novo no acabamento (rodada 2) — tudo compatível com a API acima
**Zeca ator** (`zeca.js`)
- Corpo mais alto e pernas/pés legíveis (sentado de frente mostra a sola do pé); braço de trás aparece pela lateral.
- Campos novos de pose: `alvo:[x,y]` (px de tela: olhos e cabeça seguem o alvo), `camera: 0..1` (vira o rosto para a câmera),
  `segura` / `seguraB` (`'moeda' | 'pilha' | 'pepita' | 'giz' | fn(g,x,y)` na pata da frente / de trás), `bFrente: 1` (braço de trás na frente do corpo),
  `costas: 1` (vista de costas), `banho: {cor, k}` (luz colorida no rosto + reflexo nos olhos), `capacete: 0` (sem capacete), `blinkSeed`.
  Piscar é automático quando `blink` não é passado.
- Poses novas: `susto` (antecipação → pulo → tremor; tempo local a partir de `opts.t0`), `cansado` (ofegando), `contando` (moedas nas duas patas),
  `segurando` (`opts.objeto`), `apontando` (use com `alvo`), `riscando` (de costas, giz na parede), `deitado` (`opts.acordado`; combine com `ART.cobertor(g, x, y, w)`).
  `comemorando` e `andando` refeitos (menos duros). `espantado` agora = `susto` já no pulo.
- `ART.zeca.seq(t, [[t0, 'pose', extras, opts], ...], {base, blend: 0.25})` — encadeia ações num plano com transição suave.
- `ART.zeca.mix(a, b, k)` também interpola arrays (`look`, `alvo`).
- `ART.zeca.drawEscuro(g, pose, k, {cor})` — Zeca no breu, só os olhos brilham (plano 8). `ART.zeca.falha(t, k, seed)` — lanterna falhando (0..1).
- `ART.zeca.quadro('geral'|'inteiro'|'medio'|'close', x)` → `{x, y, s}` para o Zeca sozinho ocupar ~350–1250 px.
- Luz da lanterna em qualquer direção: `cone: 1, coneLivre: 1, coneAng: graus (0 = direita, -90 = cima), coneLen, coneAbre`.

**Enquadramento / câmera** (`core.js`)
- `ART.enquadrar(X, Y, zoom, {sx, sy})` — põe o ponto (X,Y) do plano do personagem em (sx,sy) da tela. `ART.camMais(base, ART.camera(...))` soma empurrão/tremor.
  Mina, plano médio: `ART.enquadrar(470, 1010, 1.85, {sy: 820})`; close do rosto: `ART.enquadrar(540, 930, 3.6, {sy: 800})`; parede: `ART.enquadrar(560, 820, 1.25)`.
- `ART.duplaExposicao(g, desenha(d), k, {dx, dy, escala, tint, modo})` (plano 42), `ART.aberturaOlho(g, k, {y})` (abertura do preto com linha de luz, plano 27).

**Peças novas**
- `ART.cubo(..., {veios: 0..1, t})` — "a parede diferente": veios de cobre incandescentes + brilho laranja (planos 45–48).
- `ART.obj.bracoForte(g, t, {t0, x, y, s, rim, breu})` — braço musculoso com picareta enorme golpeando no breu (plano 37).
- `ART.obj.ampulheta(g, t, {x, y, s, areia, brilho})`.
- `ART.coracaoMagma(...)` refeito: coração de rocha em placas com lava nas fendas, artérias de rocha, pulsando (`revela` 0..1).
- Gameplay: aba do capacete com lanterna no topo; recortes `minaAlta` (bem maior na tela), `minaLarga`, `mapa`, `mapaAlto`, `mercado`, `botaoRank` (com `img: 'shot_4'` e `await ART.gameplay.preloadShot('shot_4')`).
- Estouro do bloco com lascas grandes/médias/cascalho quicando no chão e poeira que fica; parede da mina sem repetição de textura.
- Easings extras: `inSine, outSine, inOutQuart, inExpo, inOutExpo, inOutBack, outBounce`; nome desconhecido cai em linear (e aceita função).

**Desempenho** (desenho + rasterização por quadro, 1080×1920, CPU, mediana — `node art/tools/bench.js <pranchas>`):
mina 310 → 40 ms · vila 126 → 47 · Toca 107 → 63 · Mercado 336 → 58 · ciência 72 → 23 · lanterna 151 → 43 · profundezas (estratos) 1953 → 23 · gameplay ≈ 40.
Como: brilho/feixe/cone/vinheta viram sprites cacheados (nada de `filter: blur` por quadro), camadas estáticas de mesma profundidade
são mescladas e recortadas na faixa útil (`camadaEstatica(..., {y0, y1})`), gradação de cor da cena vai junto com vinheta e faixa da legenda num só desenho
(`cena.tom`). Dica para quem compõe: evite `g.filter` e `shadowBlur` dentro do `render`; desenhe em `ART.cache` uma vez.

## Zonas
Legenda: faixa y≈1300–1500 (centro 1400) mantida escura e sem detalhe (`ART.LEGENDA`, `ART.faixaLegenda`). Nada essencial em y<250, y>1500, x>960.
