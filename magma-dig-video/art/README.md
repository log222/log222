# Kit de arte — MAGMA DIG (Reel 1080×1920)

Linguagem da referência (recorte 2.5D chapado, sem contorno, camadas com profundidade de campo, luz dramática, UI desenhada na cena, insertos blueprint) com o universo e a paleta do jogo. Tudo é **Canvas 2D, função pura de `t`** (sem `Date`, rAF, `Math.random`, CSS animado). Aleatório só com semente (`ART.rng`). Camadas estáticas são desenhadas uma vez e cacheadas (`ART.cache`).

## Carregar
```js
// numa cena do pipeline (scenes/planos/pNN.js), no setup (async):
if (!window.ART_LOAD) await new Promise(r => { const s = document.createElement("script"); s.src = MD.asset("art/kit/art.js"); s.onload = r; document.head.appendChild(s); });
await ART_LOAD(MD.asset("art/kit/"));      // carrega os módulos + fonte Nunito e espera fontes/imagens
const { g } = MD.canvas(el);
```
Exemplo completo e testado no `render/render.js`: `art/exemplo/cena_mina.js`. Módulos (`art/kit/`): `core.js`, `zeca.js`, `mundo.js`, `cenas.js`, `cenas2.js`, `ui.js`, `gameplay.js`.
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

## Zonas
Legenda: faixa y≈1300–1500 (centro 1400) mantida escura e sem detalhe (`ART.LEGENDA`, `ART.faixaLegenda`). Nada essencial em y<250, y>1500, x>960.
