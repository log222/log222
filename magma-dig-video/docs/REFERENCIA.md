# Referência de formato: "Ether 2050 Parte 1" (@gabriel.cta)

Análise do **formato** (não do conteúdo) do Reel de referência, para o roteirista e o animador do vídeo do MAGMA DIG reproduzirem a estrutura. O vídeo foi baixado e assistido frame a frame (1 fps + um frame em cada corte + trechos a 3–15 fps), a narração foi transcrita localmente (whisper-medium) e corrigida pelas legendas. O MP4 e a transcrição ficam fora do repositório.

Marcação: **[medido]** = número tirado do arquivo; **[visto]** = observado nos frames; **[inferido]** = leitura minha.

---

## 1. Ficha técnica [medido]
- 720×1280 (9:16), 30 fps, H.264 ~1,0 Mbit/s; áudio AAC 48 kHz estéreo. Duração 131,6 s.
- Volume médio −17,1 dBFS, pico 0,0 dBFS.

## 2. O que aparece na tela

**Não é o criador na câmera, não é gameplay e não é imagem parada.** É **animação 2.5D estilo "vídeo explicativo"** do começo ao fim [visto]:
- Cenários com aparência de 3D simples (volumes chapados, sombras suaves, neblina, **profundidade de campo**: fundo desfocado em quase todo plano).
- Personagens em **recorte plano** (estilo "boneco de papel"/cut-out): cabeça redonda, olhos de ponto, sobrancelha grossa, corpo em blocos de cor sem textura, sem contorno. O protagonista é sempre o mesmo modelo em dezenas de planos e ângulos.
- [inferido] O nível de consistência do personagem e a geometria limpa indicam animação feita em ferramenta 2.5D/3D (cut-out em After Effects/Blender ou similar), não vídeo gerado por IA. Pode ter imagens de fundo geradas por IA, mas os elementos animados são rigs.
- **Nenhuma imagem é estática**: todo plano tem pelo menos um movimento (empurrão lento de câmera, personagem gesticulando, partículas, chuva, grama mexendo, letreiro se formando de partículas, cartões deslizando).

Quatro "mundos visuais" que se alternam [visto]:

| Mundo | Quando | Paleta [medido, hex aproximado] | Função |
|---|---|---|---|
| **Real/2050 (noite, chuva)**: quarto escuro com feixe de luz na janela, cadeira-cápsula, cidade de prédios com janelas amarelas, fila de desempregados "SEM VAGAS" | 0–31 s, 56 s, 129–131 s | azul-petróleo escuro #0C171D / #2A3A45, oliva sujo #35382C / #4B4A34, janelas amarelas | o que está em jogo, frio, opressor |
| **Dentro do jogo (dia)**: campo verde, rio, montanhas, castelo ao longe, slimes, mercado medieval | 2,7–4 s (teaser), 40–56 s, 61–109 s, 117–129 s | verde #62953E / #83B754, céu azul-claro #B5C4C2, sol estourado | recompensa, cor, alívio |
| **Raio-X / "ciência"**: corpo e cérebro em linhas ciano sobre azul-petróleo, músculos e cérebro rosa | 31–35 s, 47–50 s, 56–60 s, 110–115 s | #092732 / #114252, linhas #9BAFBF, rosa | explicação "de verdade" que dá credibilidade |
| **Objetos-símbolo**: cofre de itens em holofotes, celular com saldo caindo, contas na mesa com calculadora, caça-níquel, balança com etiqueta de preço | espalhados | cor do objeto sobre fundo escuro | números e dinheiro em close |

Interface de RPG desenhada por cima do mundo [visto]: cartões de classe translúcidos (vidro fosco) com nome em caixa-alta, painel de atributos com barras (DESTREZA, ESTAMINA, VIGOR, SORTE, PERCEPÇÃO, FORÇA, VELOCIDADE) e 5 bolinhas de pontos, barra de vida sobre o slime ("20/20" → "19/20" → "0/20"), número de dano flutuante ("−1", "512"), coluna de luz amarela no level up, feixe de luz azul + etiqueta "RARA" no drop, cartão de item "DANO 12 / +5%", botão azul "VENDER" com "R$ 600", "MISSÃO 1" em cartão. Valores em **R$** (dinheiro brasileiro) aparecem em telas de celular, balcão de loja, contas e etiqueta.

Enquadramento [visto]: sempre vertical nativo; protagonista centralizado no terço do meio; muitos **planos-detalhe** (mãos no celular, dedo na calculadora, mão no braço da cadeira, graveto, adaga) intercalados com planos gerais (cidade, campo). A metade inferior da tela fica relativamente limpa onde entra a legenda.

## 3. Planos e cortes [medido]
- **69 segmentos** detectados (detector de cena ffmpeg, limiar 0,12), conferidos visualmente: quase todos são trocas reais de plano; poucos são punch-ins dentro do mesmo cenário. Com limiar 0,25 o detector acha 37 cortes "fortes".
- **Duração média do plano: 1,9 s; mediana 1,7 s**; mínimo 0,37 s; máximo 7,2 s (sequência do cérebro/dopamina, que tem animação interna).
- Ritmo por trecho (segundos por corte): 0–15 s: 2,1 · 15–40 s: 1,7 · 40–60 s: 2,5 · 60–80 s: 1,8 · **80–110 s (combate): 1,5** · 110–132 s (dilema): 3,1. Acelera na ação e desacelera no dilema final.
- **Os 3 primeiros segundos têm 3 planos** (cortes em 1,93 s e 2,7 s).
- Transições: **corte seco** na grande maioria; alguns **dissolves curtos de ~0,1–0,2 s** (ex.: 38,3 s, mão → braço na cadeira); **push-in que "entra" no visor do capacete** como transição real → jogo (≈2,0–2,3 s); **corte para preto com uma linha de luz horizontal** abrindo ("o visor acendeu", 39,1 s); título do jogo **se formando de partículas** (40–42 s).
- Movimento dentro do plano [visto]: empurrões lentos de câmera, leve deriva lateral, parallax com fundo desfocado; personagens animados em pose-a-pose simples (braço, cabeça, expressões).

## 4. Legenda queimada [medido + visto]
- **Presente em ~96% do vídeo** (634 de 658 frames a 5 fps).
- **Caixa-alta**, sans **condensada bold** (parecida com Roboto Condensed Bold / Barlow Condensed Bold [inferido]), branca #FFFFFF com **palavra-chave em amarelo-mostarda ≈ #EBBA40**, **contorno fino escuro ≈ #161408 (~2–3 px a 720 de largura) + sombra suave**. Sem caixa de fundo.
- Altura das maiúsculas ≈ **38 px em 1280 (3% da altura)** → num 1080×1920, ≈ 57 px de altura de maiúscula (fonte ~75–80 px). Largura do bloco: mediana 336 px (47% da largura), máximo 466 px (65%). Centralizada.
- **Posição vertical (centro da linha), em % da altura**: **74%** em ~55% dos frames, **65%** em ~40%; quando a parte de baixo tem o assunto (rosto, mão), sobe para **17–21%** (ex.: "AGORA ELE TEM", "A GOSMA GRUDOU"). Uma linha só, nunca duas.
- **Blocos de 1 a 3 palavras, média ≈ 2,2–2,4 palavras**; ~165–180 blocos no vídeo → **um bloco novo a cada ~0,75–0,8 s**. A legenda troca em sincronia com a fala, não palavra a palavra.
- **Destaque de 1 palavra em amarelo em ~43% dos blocos**: o substantivo-chave ou número ("JOGO", "IMPOSSÍVEL", "CINQUENTA", "ZEROU", "ALUGUEL", "SORTE", "DANO", "RARA", "DOPAMINA", "PARTE"). Às vezes o bloco inteiro é amarelo quando é uma palavra só ("ASSASSINO.", "DEZENOVE.", "ESTOUROU.").
- Mantém a pontuação (vírgula, ponto, dois-pontos, interrogação).
- Animação: **fade-in rápido (~0,1 s, 1–3 frames)**, sem pulo/escala, sem karaokê; o bloco fica parado até o próximo.

## 5. Narração [medido + inferido]
- Voz única masculina, do próprio criador, em português brasileiro com **"tu"** (regional) [visto no texto: "E se tu pudesse"]. Voz ativa em ~78% dos quadros de 50 ms.
- **388 palavras em 131,5 s = 2,95 palavras/s** (≈177 palavras/min): rápido, sem respiro longo.
- **55 frases, média 7,1 palavras, mediana 6, máximo 20.** Muitas frases nominais curtíssimas: "Rara.", "Level dois.", "Dezenove.", "Escolha de classe."
- **Pausas**: 42 pausas de ≥ 0,2 s (energia 15 dB abaixo da mediana); a maior tem 0,55 s. Ou seja, **não há silêncio**: a próxima frase entra quase colada.
- Pessoa e tempo: abre em **2ª pessoa hipotética** ("E se tu pudesse…"), passa para **3ª pessoa no pretérito** contando o que o Gabi fez ("Ele sentou…", "O Gabi escolheu…"), usa **presente** para regras do mundo e ciência ("A cadeira lê esse sinal…", "o cérebro solta mais dopamina…"), e fecha com **pergunta direta** + pedido no imperativo.
- Tom [inferido]: contador de história sério e seguro, quase documental, sem gritaria nem gírias de youtuber; números falados por extenso como "fatos de jogo" ("Slime: vinte de vida. Graveto: um de dano.").

## 6. Estrutura com tempos [medido]

| Bloco | Tempo | Duração | O que acontece |
|---|---|---|---|
| **Gancho** | 0,0–4,3 s | 4,3 s | Pergunta hipotética em 2ª pessoa sobre um desejo universal. Palavra a palavra dos 3 primeiros segundos: "E se tu pudesse / sentar numa / cadeira e entrar / num jogo onde / dá pra fazer…" e fecha em "o impossível?" (~3,5 s). Visual: cadeira no escuro → push-in no visor → personagem andando sobre a água. |
| **Regras do mundo (premissa)** | 4,3–15,5 s | 11,2 s | Ano, o problema da sociedade, a regra-chave em uma frase: itens do jogo valem dinheiro de verdade. |
| **Protagonista + o que está em jogo** | 15,5–26,1 s | 10,6 s | Quem é (competente: "já zerou tudo"), o que ele arriscou (a economia inteira), prazo concreto (um mês, jogo + aluguel), com números na tela (R$ 2.400, R$ 1.800, saldo caindo para R$ 12,40). |
| **Como funciona (ciência 1)** | 26,2–60,4 s | 34,2 s | Entrada no jogo com explicação "científica" em raio-X: sinal elétrico, olfato e memória, a dor que não atravessa (planta um perigo futuro). Inclui o título do jogo no mundo ("BEM-VINDO / ETHER 2050", 40–42 s). |
| **Escolha arriscada** | 60,9–80,3 s | 19,4 s | Menu de classes (8 nomes em sequência rápida, ~0,7 s cada), escolha contra-intuitiva (assassino) e a aposta: **todos os 5 pontos em Sorte**, justificada numa frase-tese ("se item é salário, sorte é aumento"). |
| **Primeiro desafio** | 80,8–105,8 s | 25 s | Missão 1, começa sem arma (desvantagem), combate narrado golpe a golpe com números na tela, cortes a cada 1,5 s. Level up. |
| **Primeira recompensa** | 105,9–110,1 s | 4,2 s | Luz azul, "Rara.", nome do item, atributos. Plano mais "brilhante" do vídeo. |
| **Ciência 2 (por que vicia)** | 110,1–117,6 s | 7,5 s | Recompensa variável → dopamina → "mesmo truque da caça-níquel". |
| **Dilema** | 117,7–129,4 s | 11,7 s | Converte o item em dinheiro real ("um terço do aluguel"), mostra o que falta, e faz a pergunta binária: vende e garante, ou arrisca por algo maior (aparece um monstro grande na floresta). |
| **Chamada** | 129,5–131,5 s | 2,0 s | "Curte pra a parte 2." sobre o mesmo plano do visor do começo (fecha o círculo). |

Proporções: gancho 3%, premissa+stakes 16%, explicação 26%, escolha 15%, desafio 19%, recompensa+ciência 9%, dilema+CTA 10%.

## 7. Som [medido + inferido]
- **Tem trilha musical por baixo da voz o tempo todo** [medido]: nas pausas da fala o nível cai só até ~−38 dBFS (nunca abaixo de −35 dB por ≥0,25 s em todo o vídeo) e o espectro dessas pausas é **tonal** (picos em notas: 220/330/440/880 Hz = Lá; 196/294 Hz = Sol/Ré; 262/392 Hz = Dó/Sol). A tonalidade muda entre trechos [medido], ou seja, a trilha muda/evolui por cena [inferido].
- **Música ~22–23 dB abaixo da voz** (voz: média −15 dBFS nos trechos falados; cama: −38 dBFS nas pausas). Bem discreta.
- Efeitos sonoros (golpes, moedas, caça-níquel, "whoosh" de transição): **não consegui separar com medição**; se existem, estão baixos. [inferido: há pelo menos alguns, dado o tipo de animação, mas não confirmo.]

## 8. Elementos de série [visto]
- **Não há cartela "Parte 1" na tela** nem número de episódio no vídeo; a numeração vive na legenda do post e no texto do Reel. O único título na tela é o nome do jogo fictício como letreiro dentro do mundo (40–42 s), não no começo.
- Termina **sem resolver**: pergunta binária + "Curte pra a parte 2." (o pedido no vídeo é *curtir*; o "me segue" está só na legenda do post). O próximo episódio herda o dilema e o prazo (pela legenda dos episódios seguintes: contagem regressiva "Faltam 14 dias pro aluguel").
- Abertura e fechamento no mesmo cenário (cadeira/visor).

## 9. Por que prende — minha leitura [inferido, separado dos fatos acima]
1. **Dinheiro real com número na tela** transforma um RPG genérico em sobrevivência: cada item vira "fração do aluguel". O espectador faz conta junto.
2. **Prazo + dívida** cria contagem regressiva que atravessa episódios.
3. **Escolha contra-intuitiva justificada numa frase-tese** ("sorte é aumento") dá ao espectador algo para concordar ou discordar nos comentários.
4. **Insertos de "ciência" em raio-X** dão sensação de aprender algo verdadeiro (olfato/memória, dor, dopamina) e legitimam a ficção.
5. **Densidade sem respiro**: ~3 palavras/s, corte a cada 1,9 s, legenda nova a cada 0,8 s, nenhum silêncio > 0,55 s. Não sobra momento para rolar a tela.
6. **Gancho é uma pergunta de desejo** em 2ª pessoa; o vídeo só revela o protagonista aos 15 s.
7. **Final em dilema binário** é uma enquete implícita: puxa comentário ("vende!"/"caça!") e o pedido de parte 2.
8. Linguagem de RPG conhecida (classes, atributos, slime, drop, raro) que o público de SAO/Solo Leveling já decodifica sem explicação.

---

## 10. Receita (para o vídeo do MAGMA DIG)

**Roteirista**
1. **Duração-alvo 90–130 s**, ~3 palavras/s (≈270–390 palavras). Frases de 4–8 palavras; use frases nominais de 1–3 palavras nos momentos de impacto ("Rara.", "Level dois.").
2. **Gancho (0–4 s)**: uma pergunta "E se…" em 2ª pessoa sobre um desejo simples e universal; a última palavra do gancho é a mais forte e entra destacada.
3. **Regras do mundo (4–15 s)**: 3 frases curtas: onde/quando, o problema, a regra que liga o jogo à vida real (no MAGMA DIG: dias de poucos segundos, o que quebra paga na hora).
4. **Protagonista + aposta (15–26 s)**: quem é, o que arriscou, prazo concreto, com **números que o animador pode mostrar** (moedas, contas, dias).
5. **Como funciona (26–60 s)**: a mecânica contada como fato, com 1–3 insertos de "explicação" curtos (um dado curioso e verificável). Plante aqui um perigo que volta depois.
6. **Escolha arriscada (60–80 s)**: um menu de opções lido em sequência rápida, uma escolha contra-intuitiva e **uma frase-tese** que a justifica.
7. **Primeiro desafio (80–105 s)**: narrado golpe a golpe, com números ditos ("vinte de vida… dezenove"), começando em desvantagem.
8. **Recompensa (≈4 s)**: um único momento de brilho, nome do item e atributo.
9. **Por que vicia (≈7 s)**: um inserto de ciência ligando a recompensa ao cérebro (opcional, mas é marca do formato).
10. **Dilema (≈12 s)**: converta o ganho em fração da meta, diga o que falta e termine em **pergunta de duas opções**.
11. **Chamada (2 s)**: "Curte pra parte 2." (ou "Me segue pra parte 2."), sem resolver nada. Volte ao plano do início.
12. Narração em 3ª pessoa no pretérito para a história, presente para regras e ciência; sem silêncio maior que ~0,5 s.

**Animador**
1. 1080×1920, 30 fps. Nenhum plano estático: sempre um push-in lento, parallax ou personagem animado; fundo com desfoque de profundidade.
2. **Plano médio de 1,9 s** (corte a cada 1,5 s na ação; 3 s no dilema). **3 planos nos primeiros 3 s.** Total na casa de **60–70 planos** para 130 s.
3. Cortes secos como padrão; dissolves de 0,1–0,2 s só entre "mundos"; uma transição "entrar na tela" (push-in até a tela/visor preencher) no gancho; uma abertura do preto com linha de luz no momento de "ligar".
4. Alterne 3–4 mundos visuais com paletas distintas: o real (escuro, frio), o jogo (saturado, quente), o inserto de ciência (azul-petróleo com linhas ciano), e close de objeto-símbolo com número (moedas, contas).
5. Interface de jogo desenhada sobre a cena: cartões translúcidos, barras de atributo, barra de vida sobre o alvo, número flutuante de dano, coluna de luz no level up, feixe + etiqueta de raridade no drop, botão "VENDER" com preço.
6. **Legenda**: caixa-alta, sans condensada bold, branco + 1 palavra-chave amarela (≈#EBBA40) em ~40% dos blocos, contorno escuro fino + sombra, sem caixa de fundo; centralizada a **74%** da altura (alternativa 65%; sobe para ~20% quando o assunto está embaixo); maiúsculas ≈ 57 px de altura em 1080×1920; **1–3 palavras por bloco**, troca a cada ~0,8 s, fade-in de 0,1 s, uma linha, largura máxima ~65% da tela.
7. Som: voz à frente; trilha tonal contínua ~22 dB abaixo da voz, mudando de clima por bloco; efeitos discretos.
8. Último plano repete o cenário do primeiro, com a legenda da chamada em destaque amarelo na palavra "PARTE".
