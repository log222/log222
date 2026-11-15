# MAGMA DIG: bíblia visual (para quem vai desenhar e montar as cenas)

Fontes olhadas uma a uma: `assets/game/shot_1.jpg` a `shot_9.jpg`, `poster.jpg`, `icon.png`, `zeca.png`, `preview.mp4` (trailer de 25 s do site, visto em frames a 2 fps), e o texto das páginas `pt/index.html`, `pt/press.html` e `pt/support.html` de `loja.texaspoker.com.br/magmadig/`.
Legenda das marcações: **[visto]** = aparece nas imagens ou no texto do site; **[inferido]** = minha leitura, não confirmada.

---

## 1. Arquivos disponíveis em `assets/game/`

| Arquivo | Resolução | O que é | Observação de uso no vertical 1080×1920 |
|---|---|---|---|
| `preview.mp4` | 1280×590, 30 fps, 25,0 s, H.264 + AAC (com trilha) | Trailer oficial do site em PT: gameplay em 1ª pessoa + telas da Toca | Melhor material. Horizontal: na largura 1080 ocupa 498 px de altura (26% da tela). Para tela cheia precisa recortar ~326 px de largura e ampliar 3,3× (vai ficar mole). |
| `shot_1.jpg` … `shot_9.jpg` | 1280×588 cada | Screenshots da App Store em PT, com moldura laranja de ~7 px (#FFB548) e uma caixa de texto de marketing por cima | A caixa de texto e a moldura estão gravadas na imagem: para usar "limpo", recortar por baixo da caixa ou preferir frames do `preview.mp4`. |
| `poster.jpg` | 1280×588 | Idêntico byte a byte a `shot_2.jpg` (mesmo MD5) | Não é material novo. |
| `icon.png` | 1024×1024 | Ícone do app: Zeca em 3D low-poly | Única imagem do Zeca em corpo (3D). Quadrado: cabe inteiro no vertical. |
| `zeca.png` | 1056×264 (4 quadros de 264×264) | Retratos pixel art do Zeca: normal, feliz (olhos ^ ^), espantado (boca "o"), dormindo (olhos fechados + "Z") | Do kit de imprensa ("livres para uso em matérias e vídeos"). Ampliar só com vizinho-mais-próximo (nearest), nunca bilinear. |

Variantes que existem no mesmo host e não baixei (mesmo conteúdo em outro idioma): `img/en/preview.mp4`, `img/es/preview.mp4`, `img/en|es/shot_*.jpg`. Não há `shot_10.jpg` (404).

**O que falta** (não existe no site): o Zeca de corpo inteiro em cena, animações dele, a Toca vista como lugar (só existem menus), o chefe Coração de Magma, as outras minas além de 2 (cinza e vermelha), qualquer arte em formato vertical, logotipo/wordmark do título (o site escreve "MAGMA DIG" em texto puro).

---

## 2. Estilo de render

Três linguagens convivem **[visto]**:

1. **Mundo do jogo: 3D low-poly, sombreamento facetado, câmera em 1ª pessoa.** Chão de blocos cúbicos com textura de pedra poligonal (tipo Voronoi), árvores em blocos tipo voxel, cerca de madeira em volta da mina, céu com neblina. Só aparece o braço do minerador no canto inferior direito (manga marrom de couro com tiras, mão bege, tudo facetado) segurando a picareta.
2. **Interface (Toca, Mercado, Forja, Habilidades, Mapa, Ranking): flat UI escura** com cartões arredondados roxo-azulados, botões amarelos e verdes "gordinhos" (com sombra sólida embaixo), ícones pequenos em **pixel art**.
3. **Retratos de personagens: pixel art** (Zeca em `zeca.png`, os clientes da vila: Dona Coruja, Seu Castor, Raposa Ourives, Sapo Sábio, todos em quadrados de pixel art no shot_5).

O ícone do app é uma quarta variação: **3D low-poly "fofo"** com iluminação roxa (Zeca + cristais rosa + pepita amarela).

[inferido] O jogo parece feito em engine 3D (Unity/Godot) com assets low-poly; a mistura low-poly + pixel art é a assinatura visual.

---

## 3. O Zeca

### 3a. Versão pixel art (`zeca.png`) [visto]
- Enquadramento: busto, cabeça ocupa ~80% do quadro, fundo roxo escuro #34304A com textura de pontos.
- **Capacete** amarelo #FFD23F (sombra #C3954F/âmbar), aba larga, **lanterna redonda branca no centro da testa** com aro cinza. O capacete cobre toda a parte de cima da cabeça.
- **Rosto** bege-claro #D9B48A, focinho mais claro #EBCDA6 projetado para baixo, **nariz/boca marrom escuro** na ponta do focinho, **bochechas rosadas** #E89A8A.
- **Olhos**: grandes, brancos com pupila preta pequena (expressão "atenta").
- **Corpo**: listras horizontais marrons (#8A5B34 / #C9955A), que são a carapaça do tatu.
- Contorno preto de 1 "pixel" grande em tudo.
- 4 expressões: neutra-atenta, feliz (^ ^), espantada (olhos arregalados, boca "o"), dormindo (olhos fechados + balão "Z" azul-claro). A dormindo casa com a noite na Toca; a espantada com "o saque foi contado".
- O mesmo retrato aparece pequeno no **Mapa da Jornada** marcando a mina atual (shot_6).

### 3b. Versão 3D (`icon.png`) [visto]
- Corpo redondo como uma bola (carapaça laranja-amarronzada facetada), 4 patinhas curtas cilíndricas cor de pele, **capacete amarelo-dourado** com lanterna acesa (brilho branco), orelhinhas rosadas saindo de baixo do capacete.
- Rosto creme-rosado, **olhos pretos brilhantes grandes** com reflexo hexagonal branco, bochechas rosa, nariz marrom-escuro redondo, boca pequena aberta (curioso/espantado).
- Proporção: cabeça ~45% da altura do corpo, corpo largo, pernas ~15% da altura. "Fofo", não realista.
- Iluminação: fundo degradê roxo #271C45 → lilás #D273BF, luz de recorte rosa.

**Picareta** [visto]: cabo de madeira marrom, cabeça em duas pontas. Muda de forma e cor com o progresso: cinza-ferro nos primeiros dias (shot_1), **verde-esmeralda** mais tarde (shot_2/3/8). A Forja mostra a forma "Cubo" (shot_8: cabeça em bloco verde, Nível 10/12). O site fala em 7 formas.

**Divergência a notar:** no jogo em si o Zeca **não aparece de corpo** (é 1ª pessoa; só um braço humano-ish de luva/manga de couro). Para o vídeo, quem desenhar o Zeca em cena tem de partir do `icon.png` (3D) ou do `zeca.png` (pixel), e escolher um dos dois como "oficial".

---

## 4. Paleta (hex aproximado, amostrado das imagens)

| Uso | Hex | Onde |
|---|---|---|
| Amarelo capacete / ouro | #FFD23F | capacete do Zeca, botão VENDER TUDO (#FFD33E), destaques |
| Laranja-lanterna | #FFB548 | moldura das screenshots; `--lamp` no CSS do site (#FFB347) |
| Texto dourado claro | ≈ #FFD56B | texto das caixas de marketing nas screenshots |
| Fundo UI (mais escuro) | #14121F | fundo das telas da Toca |
| Cartão UI | #1E1B2E | caixas e painéis |
| Borda/botão secundário | #302B41 / #494369 | botões roxos (ENTREGAR, abas) |
| Verde ação | #66CB4B | botões ENCANTAR / COMPRAR |
| Verde porcentagem | ≈ #5FD35F | "+87%" no Mercado |
| Vermelho Força | #E63748 | ramo Força da árvore |
| Ciano Lascas | ≈ #7FD8F0 | contador de lascas, ícone diamante |
| Mina 1 (pedra) | #76756A, #4D4C4F, #BAAB87 | chão cinza-bege poligonal |
| Mina vermelha (rubi/magma) | #681407, #5D1206, #422C26 | chão vermelho-terra |
| Site (CSS oficial) | bg #14121C, painel #241F33, borda #3A3150, texto #F4EEDC, muted #A3A0AE, lamp #FFB347, gold #FFD23F | `style.css` |

---

## 5. Tipografia da interface [visto, fonte exata inferida]
- Sans-serif geométrica arredondada, **pesos bold/heavy**, sem serifa, números tabulares grandes no cronômetro ("11,8", "20,0"). Parece **Inter / SF Pro Rounded**-like; títulos de tela (MERCADO, FORJA, MAPA DA JORNADA, RANKING DOS JOGADORES) em amarelo #FFD23F, caixa-alta, peso extra-bold.
- Números com vírgula decimal e sufixos curtos em PT: **K, MI, BI, TRI** ("23,2MI", "10,4BI moedas", "4,1TRI").
- Textos de feedback no mundo 3D: **"CRAC!"** em amarelo pequeno flutuando sobre o bloco; nomes de poder em caixa-alta grande no centro com cor do poder: **"AVALANCHE!"** (cinza-azulado com contorno escuro), **"ECO DE CRISTAL!"** (roxo), **"TREMOR!"** (laranja); **"MINA LIMPA!"** em verde.

---

## 6. Tela de dia (mina) — o que tem na tela [visto]
- **Cronômetro** no canto superior direito: número grande branco ("11,8", "13,5", "20,0") com barra amarela embaixo que esvazia; botão de pausa ao lado. No trailer ele desce 0,5 s a cada 0,5 s real (é o relógio do dia).
- **Contadores** no canto superior esquerdo: pedra/minério (cinza), minério da mina (ex. gota vermelha de rubi, prata), **lascas** (ciano).
- **Mochila** (pixel art marrom) no canto inferior esquerdo com barra amarela de capacidade; os minérios quebrados voam até ela.
- **Mira** circular no centro; bloco alvo com **caixa branca em wireframe**.
- Botão **PULAR** no inferior direito.
- **Barra de 8 poderes** centralizada embaixo (ícones quadrados com borda colorida) quando os poderes estão desbloqueados.
- **Barra de vida do guardião** no topo central, roxa: "Colosso de Arenito · 32,7K"; ao morrer, toast "Colosso de Arenito caiu! Troféu ganho nesta mina." (preview, ~11,5 s).
- Blocos/minérios: chão em grade de cubos; minério aparece como **pepitas/losangos brilhantes** cravados na pedra (prata = lascas metálicas brancas, ouro = losangos amarelos, rubi = gotas vermelhas). Blocos especiais visíveis: **ampulheta** (bloco com ampulheta desenhada, shot_1), **blocos dourados** espalhados no chão (prováveis "sortudos" [inferido]), e no guardião um mosaico de **círculos dourados brilhantes com rachaduras** (shot_3).
- Buraco: ao quebrar, abre um poço retangular; mais tarde a mina inteira vira uma **cratera** grande (shot_2: escala do progresso, de "um bloco" para "a mina inteira").
- Efeitos: partículas de pedra, faíscas laranja (mina vermelha), minério voando em arco até a mochila. **Números de dano flutuantes não aparecem** nas imagens e frames que vi; o feedback por golpe visível é o "CRAC!". O kit de imprensa diz "cada golpe tem som, partícula, número e vibração", então o número pode existir mas não aparece neste material.

## 7. Telas da noite (Toca) [visto]
- **Mercado** (shot_4): aba VENDER/CLIENTES, lista de minérios (Pedra, Cobre, Ferro, Prata, Ouro, Ametista) com quantidade, **mini gráfico de barras de 7 dias** (barra amarela = hoje, barra vazada = tendência de amanhã), variação % em verde, botão de valor; botão gigante amarelo **VENDER TUDO +91,1K**. Linha "Em alta hoje: Ametista (+50%)". Painel direito: **rank atual (letra numa caixa: E)**, "Rank F: Bosque Esmeralda, custa 10,4BI moedas", botão **SUBIR DE RANK**, minas (ícones com "!" vermelho), botão MAPA, "Amanhã: Cânion Dourado (Ouro)".
- **Clientes** (shot_5): cartões com retrato pixel art, "Dona Coruja · amizade 4", bônus ("+8% → 10% no preço de venda"), pedido ("960/6,8K Prata → +634K moedas, +240 Lascas"), botão ENTREGAR.
- **Mapa da Jornada** (shot_6): trilha em S com 9 nós + Abismo: A Terra Rasa, B Pinheiral Nevado, C Rocha Profunda, D Cânion Dourado, E Caverna de Cristal, F Bosque Esmeralda, G Câmara de Magma, H Geleira de Diamante, I Núcleo, depois Abismo (cadeado). Trilha amarela para o que já abriu.
- **Ranking** (shot_7): lista "1º Lia_Minera · Prestígio 3 · Rank C", abas RANK/MOEDAS/SEMANA/MUNDO/AMIGOS/GAME CENTER, "Seu lugar: 214º de 1,83K".
- **Forja** (shot_8): picareta grande num quadro com luz laranja, "Cubo · Nível 10/12 · Dano 1,76MI · 6,2 golpes/s", abas FORMA / ENCANTAR / FUNDIR, encantamentos Eficiência, Fortuna, Garimpeiro, Ganância com botões verdes.
- **Árvore de habilidades** (shot_9): coluna "RAMOS" à esquerda (Mina 14/14, Força 12/12, Valor 13/13, Tempo 7/7, Poderes 0/16, Forja 0/5, Ajudantes 0/9, e a lista continua rolando), grade 3×3 de cartões de habilidade (Braço Forte, Ritmo, Olho no Veio, Crac Maior, Golpe Duplo, **Ombros de Tatu**, Batucada, Golpe Pesado, Força Bruta) com bolinhas de nível; cabeçalho "Força · 45 de 95"; botão verde COMPRAR 742K. Não é uma "árvore" com galhos desenhados, é uma lista de ramos + grade.

## 8. Trailer `preview.mp4` (25 s) — decupagem [visto]
| Tempo | Conteúdo | Texto na caixa do topo |
|---|---|---|
| 0–5 s | Mina 1 (pedra cinza), cava 1 bloco por vez, "CRAC!", cronômetro 13,2 → 10,5 | "Cave bloco a bloco em primeira pessoa" |
| 5–9 s | Mina vermelha, cratera gigante, poderes disparando: AVALANCHE!, ECO DE CRISTAL!, TREMOR!, MINA LIMPA!; contador sobe 11,3K → 85,4K em 3,5 s; cronômetro 20,2 | "8 poderes que disparam sozinhos" |
| 9–13,5 s | Guardião Colosso de Arenito (blocos com círculos dourados), barra de vida, ele cai | "Derrube guardiões gigantes" |
| 13,5–16,5 s | Mercado, VENDER TUDO +91,1K → +0 | "Venda na alta: o preço muda todo dia" |
| 16,5–19,5 s | Clientes da vila | "Clientes da vila fazem encomendas" |
| 19,5–22 s | Mapa da jornada | "9 minas, ranks de A a I" |
| 22–25 s | Ranking, fade para preto | "Dispute o ranking com o mundo" |

Cortes secos a cada 3–4,5 s (detector: 5; 9; 13,5; 16,5; 19,5; 22 s). Áudio: tem trilha musical tonal contínua com batida regular a cada ~0,65 s (~92 BPM) por baixo de tudo, inclusive nas telas de menu [medido: picos tonais estáveis e ataques regulares; que seja música e não só efeitos é inferência].

## 9. Fatos do jogo: o que o site diz × o que você levantou

| Ponto | App Store (seu levantamento) | Site/kit de imprensa (HTML de hoje) | Imagens | Leitura |
|---|---|---|---|---|
| Duração do dia | 15 s | **10 s** (index, press, EN) | Cronômetro mostra 13,2 / 11,8 / 13,5 / **20,0** / 20,2 | O dia começa mais longo que 10 s nas imagens porque o ramo **Tempo** (7/7 no shot_9) aumenta a duração [inferido]. As imagens não decidem entre 10 e 15 como valor *inicial*. |
| Minas | 5 | **9** (A–I) + Abismo | Mapa mostra 9 nomes A–I + Abismo | Imagens confirmam 9. |
| Versão | — | "Novidades da versão 1.3" | Mercado com tendência, clientes, guardiões, fundição, mapa, ranking: todos aparecem nas screenshots | As screenshots e o trailer são da 1.3. |
| Habilidades | 85+ | "mais de 80" (press) | Caixa de marketing do shot_9: "85+ habilidades"; cabeçalho "45 de 95" | Número exato incerto: 80+/85+/95 aparecem. |
| Pós-jogo | Brasas Eternas, Forja Eterna, Abismo infinito, museu 20 artefatos, 24 conquistas | "Reforja com **Prestígio**, Forja Eterna, museu com 20 artefatos e 24 conquistas", "Abismo sem fim" | Ranking mostra "Prestígio 1–3" | "Brasas Eternas" não aparece no site; o site usa "Prestígio". |
| Preço | R$ 19,90 compra única | "Pague uma vez", sem preço escrito | — | Preço não verificável no site. |
| Mercado | — | Preços que sobem e descem a cada dia, um minério em alta | Visto (shot_4) | Ok. |
| Rank | — | Ranks A a I comprados com moedas | "SUBIR DE RANK", "Rank F custa 10,4BI moedas" | Ok. |
| Poderes | 8 (Tremor, Gêiser, Zeca-Bola, Avalanche, Eco de Cristal, Dinamite, Marreta do Titã, Vendaval) | "8 poderes que disparam sozinhos" | 8 ícones na barra; nomes vistos na tela: Avalanche, Eco de Cristal, Tremor | Os outros 5 nomes não aparecem no material. |
| Ajudantes | 3 (morcegos, vaga-lumes, tatuzinhos) | "3 ajudantes" | Ramo "Ajudantes 0/9" | Nomes não visíveis. |
| Chefe final | Coração de Magma | "No fim, o Coração de Magma" | Não aparece | — |
| Plataforma/idiomas | iPhone, offline | iOS 17+, PT/EN/ES, ~7 h até o Coração de Magma, offline, sem coleta de dados | — | — |
| Frase | "Bom dia, minerador!" | Igual (fim da descrição longa) | — | Ok. |
| Ponto de vista | — | **"em primeira pessoa"** | Confirmado: só o braço aparece | Importante para o roteiro: o "Zeca" do vídeo terá de ser desenhado, o jogo não o mostra de corpo. |

**Qual versão parece a atual:** o HTML de hoje e todas as 9 screenshots + trailer descrevem a **1.3** com **9 minas** e **dias de 10 s**. O texto "15 s / 5 minas" que você viu na App Store parece descrever uma versão anterior que não foi atualizada na loja (ou a loja está atrás do site) [inferido; não acessei a App Store para conferir].
