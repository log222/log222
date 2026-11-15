# Fatos da Parte 1: fonte de cada afirmação

Legenda: **OK** = confirmado; **INFERIDO** = sustentado pelo material, mas não escrito em lugar nenhum; **A CONFIRMAR** = número da história que o dev precisa conferir no jogo (ou trocar); **FICÇÃO** = invenção narrativa, não é apresentada como recurso do jogo.

Fontes do jogo usadas: texto do site e do kit de imprensa (cópia salva de `loja.texaspoker.com.br/magmadig/pt/` e `/pt/press.html`, versão 1.3), as screenshots `assets/game/shot_1.jpg`…`shot_9.jpg`, o trailer `assets/game/preview.mp4` e a decupagem em `docs/JOGO-VISUAL.md`. O site não abriu desta sessão (rede bloqueada); usei a cópia salva no scratchpad desta tarefa.

## Ciência (mundo real)
| Frase | Status | Fonte |
|---|---|---|
| "O buraco mais fundo que a gente já cavou tem doze quilômetros." | OK | Poço Superprofundo de Kola (SG-3), Rússia: 12.262 m, ainda o ponto artificial mais fundo. https://en.wikipedia.org/wiki/Kola_Superdeep_Borehole |
| "Levou quase vinte anos." | OK | Perfuração começou em 24/05/1970; profundidade máxima atingida em 1989 (19 anos). Mesma fonte. |
| "O centro da Terra fica mais de quinhentas vezes mais fundo." | OK (conta) | Raio médio da Terra 6.371 km (valor recomendado pela IUGG): https://en.wikipedia.org/wiki/Earth_radius e https://www.universetoday.com/48919/distance-to-the-center-of-the-earth/ . 6.371 ÷ 12,262 ≈ 520. |
| "E lá no centro faz uns seis mil graus." | OK, com ressalva | ESRF/CEA (Dewaele et al., *Science*, 2013): cerca de 6.000 °C (±500) na fronteira do núcleo interno, perto do centro. https://www.esrf.fr/news/general/Earth-Center-Hotter e https://www.eurekalert.org/news-releases/620134 . O texto diz "uns" e "lá no centro" de propósito: é uma estimativa. |
| "Tipo a superfície do Sol." | OK, aproximado | Fotosfera do Sol ≈ 5.500 °C (NASA): https://www.nasa.gov/wp-content/uploads/2009/12/sun_lithograph.pdf . A própria ESRF e a imprensa fizeram essa comparação: https://www.smithsonianmag.com/smart-news/the-center-of-the-earth-is-as-hot-as-the-sun-43631207 |
| "Cavar, tatu já nasce sabendo." | OK (genérico) | Tatus usam patas e garras fortes para cavar tocas e buscar comida. Ex.: Wikipedia "Armadillo" e guias de fauna (Departamento de Conservação do Missouri). Sem número, de propósito: as fontes divergem sobre velocidade e tamanho das tocas. |

Fora do roteiro por falta de fonte firme: velocidade de escavação do tatu (fontes de baixa qualidade e números divergentes).

## Jogo
| Frase / elemento | Status | Evidência |
|---|---|---|
| Dias de dez segundos | OK | Site e kit de imprensa: "dias de 10 segundos". (A App Store ainda dizia 15 s: ver tabela de divergências em `docs/JOGO-VISUAL.md`.) |
| "quem marca a hora é a lanterna" / "Acendeu, é dia… Apagou, é noite" | INFERIDO / recurso narrativo | O capacete com lanterna é real (`zeca.png`, `icon.png`). Que o dia acaba "quando a lanterna apaga" vem da sua descrição do jogo, não do site. O relógio do dia na tela é o cronômetro (trailer). Se no jogo a lanterna não for o relógio, a frase continua funcionando como metáfora. |
| "Cada pedra que racha paga na hora" | OK | Site: "segure o dedo nos blocos e eles pagam na hora"; kit: "eles quebram, pagando na hora". |
| "De noite, vende, aprende e dorme" (Toca) | OK | Site: "à noite, na Toca, venda tudo no Mercado, compre habilidades, forje picaretas". Dormir: retrato dormindo do `zeca.png` e sua descrição. |
| Zeca, tatu de capacete amarelo | OK | Kit: "Você é o Zeca, um tatu minerador de capacete amarelo". |
| Toca | OK | Site/kit. |
| "picareta velha", "um bloco por vez" no começo | OK | Trailer 0–5 s (caixa: "Cave bloco a bloco"); picareta cinza-ferro nos primeiros dias (shot_1). "Velha" é adjetivo narrativo. |
| Subir de rank abre a próxima mina | OK | Site: "suba de rank para abrir a próxima das 9 minas"; botão SUBIR DE RANK (shot_4). |
| Coração de Magma no fim | OK | Kit: "No fim, o Coração de Magma". |
| Mina A, Terra Rasa | OK | Mapa da Jornada (shot_6): "A Terra Rasa". |
| Feedback "Crac" | OK | "CRAC!" sobre o bloco no trailer e nas screenshots. |
| Ramos: Mina, Força, Valor, Tempo, Poderes, Forja, Ajudantes | OK | Coluna RAMOS do shot_9 (a lista continua rolando; li só os sete visíveis). |
| Ramo Tempo aumenta a duração do dia | INFERIDO | O ramo existe (shot_9); o cronômetro passa de 10 s nas imagens (13,2 / 20,0), o que sugere que Tempo alonga o dia. **Confirmar.** |
| Mercado: preço muda todo dia e mostra a tendência de amanhã | OK | Kit: "preços que sobem e descem a cada dia"; shot_4: gráfico de 7 dias com barra vazada de amanhã; trailer: "Venda na alta: o preço muda todo dia". |
| Cobre existe e vende no Mercado | OK | Lista do Mercado (shot_4): Pedra, Cobre, Ferro, Prata, Ouro, Ametista; kit: minérios das minas. |
| Cobre aparece já na Terra Rasa | A CONFIRMAR | Plausível (é o primeiro minério da lista do kit), mas não está escrito qual minério sai da mina A. Se não for cobre, trocar pelo minério certo. |
| Botão VENDER, seta de tendência | OK (estilo) | shot_4 tem botões de valor e VENDER TUDO; a seta verde/vermelha é desenho nosso para a tendência que o jogo mostra como barra vazada. |

## Números da história (o dev decide)
| Número | Status | Observação |
|---|---|---|
| Meta: mil moedas em trinta dias | FICÇÃO + A CONFIRMAR | O prazo de 30 dias é invenção. A frase seguinte diz que mil é "o preço pra subir de rank": **troque mil pelo custo real do rank B** (e refaça as contas 167, 4%). Se o custo real for difícil de falar, troque a frase por "Pra subir de rank e abrir a próxima mina." e mantenha mil como meta pessoal do Zeca. |
| Dia 1 rende seis moedas (uma por pedra) | A CONFIRMAR | Quanto paga uma pedra no começo e quantos blocos dá para quebrar em 10 s com a picareta inicial. |
| Seis moedas bastam para o primeiro nível de Tempo | A CONFIRMAR | Custo do primeiro nível do ramo Tempo. |
| Primeiro nível de Tempo dá +1 s (onze segundos) | A CONFIRMAR | Quanto cada nível de Tempo acrescenta. |
| Dia 2: sete pedras e um cobre | FICÇÃO | Resultado do dia na história. |
| Cobre a quarenta moedas | A CONFIRMAR | Preço do cobre no começo; 40 ÷ 1.000 = 4%. |
| Contas: 30 × 10 s = 5 min; 1.000 ÷ 6 ≈ 167; 30 − 1 = 29; 30 − 2 = 28 | OK (aritmética) | "Trinta dias de luz" conta só o tempo de dia, sem as noites na Toca. |

## Post
| Afirmação | Status | Evidência |
|---|---|---|
| Está na App Store, iPhone | OK | Site: "Ver na App Store"; kit: iPhone, iOS 17 ou mais novo. |
| Paga uma vez, sem anúncio, funciona offline | OK | Site: "Pague uma vez: sem anúncios, sem compras no app, joga offline". |
| R$ 19,90 | OK segundo o orquestrador (App Store conferida hoje) | O site não mostra preço. Conferir no dia de postar. |
| Feito por um dev solo de Uberlândia | Informação do usuário | Kit: desenvolvedor Francisco Brazão Neto. A cidade vem da conversa. |
