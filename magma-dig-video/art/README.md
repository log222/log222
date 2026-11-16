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

## Rodada de correção (v2) — o que mudou e quem precisa reconferir
- **`ART.pata`**: o antebraço visível agora termina esfumado a ~250 px de tela da palma (parâmetro novo `braco`, em px; ex.: `braco: 400`).
  Assinatura igual. **Reconferir:** p10, p13, p16, p32, p47, p52, p55 (a pata pode precisar entrar mais perto da borda).
- **Parede da meta (`ART.giz`)**: removido o ícone "◎" que ficava colado no 1.000. **Reconferir:** p14, p15, p31, p32, p52.
- **Lanterna (regra única)**: `lamp > 0` agora sempre vem com feixe (`cone` padrão 0,5 quando não é passado; `cone: 0` desliga);
  halo e lente bem mais fortes; de frente aparece uma estrela de luz. Na mina, com cronômetro acima de zero: lanterna acesa; perto de 1,0 pisca
  (`ART.zeca.falha`); em 0,0 apaga. **Reconferir:** todo plano com o Zeca e `lamp` (o feixe aparece onde antes não aparecia; passe `cone: 0` se não quiser).
- **Picareta/braço erguidos** (braço da frente com `aF > 125`) passam por trás da cabeça: não cobrem mais o rosto. Afeta `cavando`, `comemorando`, `riscando`.
  **Reconferir:** p03 (picareta sobre o rosto) e qualquer plano com `comemorando`.
- **`ART.aberturaOlho`**: a "pálpebra" some por inteiro no fim (antes parava num losango).
- **`ART.gameplay.cheio(g, t, {de, ate, dur, img, foco, zoom, topo, base, tapar, borrar, escurecer, cronometro, selo, tom})`**: imagem do jogo em tela
  cheia na faixa y≈300–1250, bordas esfumadas, cronômetro desenhado por cima, selo "IMAGEM REAL DO JOGO". O `visor` continua existindo; o selo padrão dele
  agora é "imagem real do jogo" (sem inglês).
- **`ART.obj.bracoForte`**: redesenhado como braço de verdade (deltoide, bíceps, cotovelo, punho) e mais claro (`cor`, `rim`).
- **v3 — lanterna corrigida de verdade**: a luz era desenhada nas âncoras (px de tela) ainda com a transformação da câmera ativa, e o feixe
  era só aditivo (sumia sobre a pedra cinza). Agora halo, lente e feixe são desenhados em coordenadas de tela e o feixe tem uma cunha quente em
  mistura normal + núcleo aditivo (lê sobre fundo claro). `coneAng` padrão 12° (para baixo/frente). **Reconferir:** qualquer plano com `lamp` dentro de
  `ART.enquadrar`/zoom (o feixe agora aparece onde antes não aparecia).
- **v3 — `ART.pata`**: o fim do braço esfuma para transparente (antes virava um retângulo escuro sobre fundo claro).
- Tabela canônica do cronômetro e do contador: ver mensagem do orquestrador (vale para todos os grupos).

## Zonas
Legenda: faixa y≈1300–1500 (centro 1400) mantida escura e sem detalhe (`ART.LEGENDA`, `ART.faixaLegenda`). Nada essencial em y<250, y>1500, x>960.

## Parte 2 ("A seta") — peças novas (tudo opcional; sem os parâmetros novos o desenho da Parte 1 é idêntico, conferido byte a byte)
Módulo novo `art/kit/parte2.js` (carregado pelo `ART_LOAD`). Pranchas: `art/boards/p2_mercado.js`, `p2_wallstreet.js`, `p2_ampulheta.js`, `p2_clientes.js`
(cada segundo da prancha = um momento do roteiro). Provas: `art/frames/p2-*-contato.png`.

**1. Mercado com queda e alta** (`ART.painelMercado`, `ART.ui.cartaoMinerio/grafico7/seta/linhaMercado`, `ART.ui.faixaAlta`)
```js
ART.painelMercado(g, t, { precoAntes: 40, preco: 20, rola: k, varPct: -50, barras: [.42,.5,.38,.55,.47,.66, hoje], corHoje: "#E63748", seta: 0 }); // p209–210 (rola 0 = "ONTEM 40")
ART.painelMercado(g, t, { preco: 40, setaGiro: k });                       // p206: seta verde gira 180° e cai vermelha
ART.painelMercado(g, t, { precoAntes: 40, preco: 20, rola: 1, varPct: -50, seta: 0, botaoPulso: 1 }); // p230–231: VENDER +20, "ONTEM 40" riscado no canto
ART.painelMercado(g, t, { ..., seta: 1, setaFantasma: k, antesFantasma: 0 });  // p235: seta tracejada + "?" piscando
ART.painelMercado(g, t, { faixa: { minerio: null, k, brilho }, linhas: [...], botao: false });             // p236 faixa vazia
ART.painelMercado(g, t, { faixa: { minerio: "ferro", nome: "Ferro", mk }, botao: false,
  linhas: [{ tipo: "ferro", nome: "Ferro", qtd: 0, valor: 0 }, { tipo: "cobre", nome: "Cobre", qtd: 1, valor: 20, a: .45, pulso }] }); // p237–238
ART.painelMercado(g, t, { faixa: { minerio: "cobre", nome: "Cobre" }, precoAntes: 20, preco: 60, rola: k, varPct: false, amanha: false }); // p253–254
ART.painelMercado(g, t, { faixa: { minerio: "cobre", nome: "Cobre" }, linhas: [{ tipo: "cobre", nome: "Cobre", qtd: 4, valor: 240, destaque: true }], botaoSub: "+240 moedas" }); // p255
```
- `rola` 0..1: 0–0,3 risco vermelho no preço antigo · 0,3–0,85 número rola (odômetro) até `preco` · 0,6–1 o antigo fica pequeno e riscado no canto ("ONTEM 40", some com `antesFantasma: 0`). Rótulo ONTEM → HOJE PAGA (`rotuloAntes`, `rotuloPreco`). Cor do novo: vermelho se cai, amarelo se sobe (`corPreco`). `varPct` aparece em 0,55–0,9 (`varK` força); `varPct: false` esconde.
- `barras` (7 valores 0..1; o último é HOJE), `amanha` (número ou `false`), `corHoje`, `cores` (cor por barra). `seta` padrão 0 quando há `faixa`/`linhas`.
- Layout com `faixa` ou `linhas`: título y 300, faixa y 412, cartão y 780 (escala 1,4), linhas a partir de y 520 (passo 150), botão y 1160. Sem eles: layout da Parte 1 (título 330, cartão 700, botão 1130). Devolve `{x0,y0,w,h,pos}`.
- `ART.ui.faixaAlta(g, x, y, {minerio, nome, pct: 50, k (acende), mk (entrada do minério), brilho (0..1 varredura), w: 900, s})` — sozinha também.
- `ART.ui.grafico7(..., {desliza: n, janela: 7})` barras entram pela direita (p216: `desliza` = 0 → nº de barras novas ao longo do plano); `{cores: ['#5FD35F','#E63748','#5FD35F'], amanha: false}` para sobe/desce/sobe (p217).
- `ART.ui.seta(g, x, y, {giro: 0..1, contorno: 0..1})`; `ART.ui.linhaMercado(..., {a, pulso})`; `ART.ui.precoRolando(g, xDireita, yBase, de, para, k, px, cor)`.
- `ART.ui.etiquetaPreco(g, x, y, {de: 40, para: 20, k, s, rot})` — p203: etiqueta racha (k 0–0,35), metades caem (0,35–0,75), a nova com 20 vermelho entra (0,5–0,85).

**2. Gráfico de linha blueprint** (`ART.ciencia.grafLinha`, `ART.ciencia.especulacao`) — paleta `ART.BP`; a queda é a única cor quente (coral `#FF6B5B`).
```js
const GL = ART.ciencia.grafLinha;
GL(g, t, { prog: k * GL.anoProg(1929), wallStreet: 1, regua: 1 });   // p223: ano na ponta corre 1921 → 1929
GL(g, t, { prog: lerp(GL.anoProg(1929), GL.PICO, k), x6: k2, wallStreet: 1 }); // p224: sobe até 381, ×6
GL(g, t, { prog: GL.PICO, x6: 1, emprestado: k, zoom: 1.15, foco: [540, 1180] }); // p225: 1 moeda cheia + 9 tracejadas
GL(g, t, { prog: lerp(GL.PICO, 1, k), queda: k2 });                     // p226: despenca até 41, −89%
GL(g, t, { prog: 1, queda: 1, pan: k, rotulo87: k2, prog87: k3 * 0.55 }); // p227: pan para o 2º gráfico
GL(g, t, { prog: 1, pan: 1, rotulo87: 1, prog87: k, segunda: k2 });      // p228: degrau (GL.DEGRAU87 ≈ 0,73), 1 DIA, SEGUNDA-FEIRA NEGRA
GL(g, t, { prog: 1, pan: 1, rotulo87: 1, prog87: 1, segunda: 1, queda87: k, apaga: k2 }); // p229: −22,6% e as linhas somem
ART.ciencia.especulacao(g, t, { pata: k, seta: k2 });   // p220 pata + moeda, seta AMANHÃ? · {carimbo: k} p221 · {zeca: k} p222 (vira o Zeca com a pepita)
```
Parâmetros de `grafLinha`: `prog, regua, wallStreet, x6, queda, contador (true), emprestado, prog87, rotulo87, segunda, queda87, pan, zoom, foco:[x,y], apaga, a, fundo`.
Devolve `{ponta, ponta87, ano}` (px de tela). Área útil y 340–1260 (eixo y 960, contador de anos y 1030–1110, moedas y 1172, EMPRESTADO y 1252); nada na faixa da legenda.
Para o dissolve da Toca (p219), desenhe a Toca e por cima `GL(g, t, {a: k, prog: ...})`.

**3. Bloco especial de ampulheta** (`ART.cubo`, `ART.estouroAreia`)
```js
ART.cubo(gg, GA.B.X, GA.B.Z, { especial: "ampulheta", t, brilho: 0.8, escuro: 0.6 * (1 - k) });  // p245 (o feixe acha o bloco: escuro -> 0)
ART.estouroAreia(gg, t, { t0: golpe, front: GA.frente(), seed: 9 });       // p246: lascas claras + areia dourada em espiral
ART.estouroAreia(g, t, { t0, centro: [x, y], tam, alvo: [790, 330], tAlvo: 0.7 }); // areia converge para o cronômetro (px de tela); -> fração que chegou
```
Bloco claro com ampulheta gravada (barras douradas, vidro prateado, areia dourada), como o do `shot_1`. Combina com `crack`. A areia dura ~1,9 s (1,6 s com `alvo`).
Imagem real (p244): `ART.gameplay.cheio(g, t, Object.assign({}, ART.gameplay.PRESET.ampulheta, { dur, cronometro: {valor, max: 11, escala: 11} }))` (setup: `await ART.gameplay.preloadShot('shot_1')`).

**4. Cliente Dona Coruja** (`ART.ui.cartaoCliente`, `ART.ui.coruja`, `ART.ui.coracao`, `ART.ui.barrasComparar`)
```js
const c = ART.ui.cartaoCliente(g, 540, 720, { t, amizade: 0, pedido: { tem: 0, precisa: 4, tipo: "cobre", nome: "Cobre" }, recompensa: 160 }); // p259
// p260 {recompensaK: k} · p262 {amizade: k (0 -> 1; coração enche), amizadePulso, sorriso: k} · p263 {bonus: k, brilhoBonus} · p265 {botaoK: 1} + ART.pata perto de c.botao
ART.ui.barrasComparar(g, { k, itens: [{ rotulo: "ENTREGAR", valor: 160, cor: "#8E7BE0" }, { rotulo: "VENDER", valor: 240, cor: "#FFD23F" }], base: 1130 }); // p261
ART.ui.coruja(g, 540, 800, 620, { t, sorriso: 1 });   // retrato sozinho (pisca sozinha com t; `pisca` força)
```
Cartão 940×500 (s=1) centrado em x,y; devolve `{retrato, botao, recompensa, amizade}` em px. ENTREGAR cinza como no jogo (`botaoK` 0) → amarelo (1).
Imagem real (p258): `ART.gameplay.cheio(g, t, Object.assign({}, ART.gameplay.PRESET.clientes, { dur }))` (setup: `preloadShot('shot_5')`): aba CLIENTES + cartões
com "amizade N", bônus "+X% → Y%" e pedidos/recompensas apagados por remendos na cor do cartão (e a caixa de marketing). Recortes `RECORTES.clientes`/`.ampulheta`
para o `visor`; `remendos: 'clientes' | [[x,y,w,h,cor]...]` vale em `cheio` e `visor`.
