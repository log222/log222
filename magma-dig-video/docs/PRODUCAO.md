# Manual de produção: série MAGMA DIG (Reels)

Para quem vai orquestrar a Parte N. Escrito ao fim da Parte 1 (15/11/2026). Onde este manual e um arquivo divergirem,
**o arquivo manda** (o código e `config/estilo.json` são a verdade; os `.md` às vezes ficam para trás, ver §11).
**Parte 2 pronta (16/11/2026):** ambiente Windows, voz, mecanismos novos, tabela canônica e lições em §12. Os
caminhos `bin/python` abaixo são do container Linux; no PC do dono use `Scripts/python.exe` (§12.1).

---

## 1. Resumo de uma tela

- **O que é:** Reel vertical 1080×1920, 30 fps, ~2 min 10–20 s, que conta em série a história do Zeca, o tatu minerador
  do MAGMA DIG (jogo pago de iPhone do próprio usuário, dev solo de Uberlândia). Vídeo promocional.
- **Formato:** estrutura copiada (só a estrutura) do Reel "Ether 2050": gancho "E se…", regras do mundo, protagonista com
  meta e prazo em números, inserto de ciência, escolha contraintuitiva com frase-tese, ação golpe a golpe, recompensa,
  dilema binário, "Curte pra parte N+1". Receita completa: `docs/REFERENCIA.md` §10.
- **Já pronto, não refazer:** análise da referência, pipeline (voz, legenda, sfx, trilha, render), kit de arte
  (`art/kit`), busca de voz, tabela de pausas, estilo de legenda, 57 planos da Parte 1 que servem de modelo.
- **A fazer por episódio:** roteiro (arco em `roteiro/serie.md`), checar fatos, **tabela canônica** do episódio
  (relógio, contador, lanterna, cartão), **voz antes de animar**, peças novas do kit, planos novos, render, uma revisão
  independente, uma rodada de correção, render final, texto do post.
- **Como trabalhar:** a sessão principal só orquestra; o trabalho vai para subagentes Opus. Retome o MESMO agente
  com SendMessage (contexto preservado) em vez de abrir um novo: sai muito mais barato.
- **Ids da Parte N:** use `N01…N99` no `shots.json` (Parte 2: 201, 202…). O gerador cria `p201` e o plano carrega
  `scenes/planos/p201.js` (conferido: `gerar_story.py` gera `p201…` e o carregador `auto` busca o arquivo pelo id).
  **Nunca reutilize `p01…p57`**: são os arquivos da Parte 1 (a pasta de planos é uma só). Atenção: as tabelas feitas à
  mão no `tools/gerar_story.py` (`SFX_AJUSTE`, `PAUSAS`, `SEPARAR_ANTES`) são da Parte 1 e indexadas pelo id numérico;
  para a Parte 2 acrescente entradas com os ids 2xx (não colidem com as da Parte 1).
- **Máquina:** 4 núcleos, 15 GB de RAM. **Um processo pesado por vez** (voz OU render completo). Disco enche: apague
  `build/parte-0N/runs/*` antigos.
- **Gancho do repositório:** exige commit e push a cada parada; faça checkpoints frequentes no branch.
- **Relatórios para o usuário:** PT-BR, curtos.

---

## 2. Passo a passo do episódio N

`PY=.cache/venv/bin/python` (pipeline) · `PYV=.cache/venv-voz/bin/python` (vozes). Tudo roda de `magma-dig-video/`.

| # | Etapa | Quem | Em paralelo com | Saída |
|---|---|---|---|---|
| 0 | Instalar (`./setup.sh`, depois `tools/voz/instalar.sh`) | orquestrador (Bash em segundo plano) | 1 | `.cache/` |
| 1 | Roteiro + fatos + tabela canônica + post | roteirista | 0 | `roteiro/parte-0N.md`, `.shots.json`, fatos, post |
| 2 | Mostrar ao usuário o resumo do roteiro e as perguntas de fato | orquestrador | — | aprovação |
| 3 | Voz completa do roteiro + medições + amostra para o usuário | especialista de voz | 4 (só pranchas leves) | `build/voz/parte-0N/…`, `out/vozes/*.m4a` |
| 4 | Peças novas do kit (só o que o roteiro pede de novo) | diretor de arte | 3 | `art/kit/*`, `art/README.md` |
| 5 | Story + só áudio com a voz definitiva → durações reais | dono do pipeline | — | `story/parte-0N.json`, `build/parte-0N/timeline.json` |
| 6 | Fechar a tabela canônica com as durações reais e mandar no 1º briefing | orquestrador | — | tabela no briefing |
| 7 | Planos novos, divididos por cenário | 2–3 animadores | entre si | `scenes/planos/pN##.js` |
| 8 | Render completo + contact sheets (3 quadros por plano) | dono do pipeline | — | `out/parte-0N.mp4` |
| 9 | Revisão independente quadro a quadro | revisor (não edita nada) | — | lista de defeitos com evidência |
| 10 | Rodada de correção (retomar os mesmos animadores) | animadores, diretor de arte | entre si | planos corrigidos |
| 11 | Render final + conferência do revisor só nos itens corrigidos | pipeline + revisor | — | `out/parte-0N.mp4` final |

### Comandos por etapa

**0. Instalação** (ver §10 para tamanhos e rede)
```
./setup.sh                    # venv do pipeline + Kokoro + Piper + ASR (Whisper-small, Parakeet)
tools/voz/instalar.sh         # venv-voz + torch + Qwen3-TTS + Chatterbox + UTMOS (demorado, ~16,5 GB no disco)
$PY make_video.py story/demo.json -o out/demo.mp4 --contact-sheet     # teste rápido do pipeline
```

**1. Roteiro.** Formato do `roteiro/parte-0N.shots.json`: igual ao `roteiro/parte-01.shots.json`
(`{titulo, palavras, dur_estimada_total_s, ritmo_palavras_s, nota, cenarios, planos:[{id, bloco, narracao, destaques,
cenario, acao, camera, ui, sfx, usa_gameplay, dur_estimada_s, inicio_estimado_s}]}`). `narracao` de cada plano é o
trecho falado a partir do corte; os trechos concatenados formam o texto completo. `id` numérico `N01…`.

**3. Voz** (método da Parte 1; receita da voz definitiva A2: §5 "Voz definitiva" e `tools/voz/README.md` §"Voz definitiva da série")
```
# 1 frase por linha, idêntica às frases do story (o --voz-pasta casa frase a frase pelo texto)
# JSON aceita {texto, falado, seed}: "falado" muda só o que o motor lê (ex.: "Mágma Díg...")
$PYV tools/voz/falar.py --motor qwen --voz narrador-jovem tools/voz/roteiro_parte0N_qwen_jovem.json -o build/voz/parte-0N/qwen-narrador-jovem
$PYV tools/voz/pontuacao.py build/voz/parte-0N/qwen-narrador-jovem -o build/voz/parte-0N/pontuacao.json   # vírgula/ponto/entonação
$PYV tools/voz/medir.py build/voz/parte-0N/qwen-narrador-jovem/narracao.wav --texto-arquivo <frases.txt> -o build/voz/parte-0N/medidas.json
$PYV tools/voz/alongar_virgulas.py build/voz/parte-0N/qwen-narrador-jovem --min 0.28   # opcional; o pipeline já garante o mínimo onde houver silêncio
tools/voz/finalizar.sh build/voz/parte-0N/qwen-narrador-jovem/narracao.wav out/vozes/parte-0N-voz.m4a  # amostra para o usuário
```
Frase ruim: regere só ela com outra `seed` ou com `falado` (vírgula → "..."). Foi assim na Parte 1
(`build/voz-A-retomadas*/lista.json`). Geração do roteiro inteiro no Qwen em CPU: ~37 min (`geracao_s` 2193 em
`build/voz-A-final/tempos.json`). Não rode render nem outro modelo enquanto isso.

**5. Story e áudio**
```
$PY tools/gerar_story.py roteiro/parte-0N.shots.json -o story/parte-0N.json --motor qwen --voz narrador-jovem
$PY make_video.py story/parte-0N.json --so-audio --voz-pasta build/voz/parte-0N/qwen-narrador-jovem --motor qwen --voz narrador-jovem
$PY tools/verificar_narracao.py build/parte-0N        # ASR de volta: palavras mal pronunciadas
```
`--so-audio` imprime a tabela de pausas alvo × motor × real e as palavras/s, e grava `build/parte-0N/timeline.json`
(início/duração de cada plano). Atenção em `tools/gerar_story.py`: `SFX_AJUSTE`, `PAUSAS` e as pronúncias são tabelas
fixas no código, chaveadas pelo número do plano (hoje só com números da Parte 1). O dono do pipeline acrescenta as
entradas `N##` do novo episódio; com ids `N01…` não há colisão com a Parte 1. O story gerado pode ser editado à mão
depois; não rode o gerador de novo por cima sem querer.

**7. Testar um plano (obrigatório pelo caminho oficial)**
```
$PY make_video.py story/parte-0N.json --plano p205 --rascunho --voz-pasta <pasta> --motor qwen --voz narrador-jovem   # vídeo 540x960 desse plano
$PY make_video.py story/parte-0N.json --plano p205,p206 --so-contact-sheet --cs-por-plano 3 --zona-segura            # início/meio/fim + zona
```
Cada `--plano`/`--trecho`/`-o` usa pasta própria `build/parte-0N/runs/<tag>/`; execuções simultâneas não se pisam.
Com 2–3 animadores testando ao mesmo tempo, use `--workers 1` ou `2` (recomendação; 4 núcleos ao todo).

**8 e 11. Render**
```
$PY make_video.py story/parte-0N.json --voz-pasta <pasta> --motor qwen --voz narrador-jovem -o out/parte-0N.mp4 --contact-sheet --cs-por-plano 3 --cs-max 21
# saída final: x264 ABR 5,6 Mbps (teto 7), +faststart (~115 MB para 2 min 37 s). --qualidade-max = crf 16 sem teto.
```
Depois de cada render completo: `rm -rf build/parte-0N/runs/<execuções antigas>` (cada uma tem 250–370 MB).

---

## 3. Papéis e briefings

| Papel | Dono de | Não toca em |
|---|---|---|
| Orquestrador (sessão principal) | ordem, tabela canônica, briefings, commits, conversa com o usuário | arquivos de plano e de arte |
| Dono do pipeline | `make_video.py`, `lib/`, `player/`, `render/`, `tools/gerar_story.py`, `story/`, `config/estilo.json` | `art/`, `scenes/planos/` |
| Diretor de arte | `art/` (único que edita o kit) | planos |
| Animadores (2–3, por cenário) | só os seus `scenes/planos/pN##.js` + um helper próprio do episódio | `art/`, `_grupoA/B/C.js` existentes, planos dos outros |
| Roteirista | `roteiro/parte-0N*.{md,json}`, fatos, post | código |
| Especialista de voz | `tools/voz/` (entradas novas), `build/voz/` | pipeline e planos |
| Revisor | nada (só lê, renderiza contact sheets em `build/revisao/` e relata) | tudo |

Divisão dos animadores que funcionou na Parte 1 (arquivos `scenes/planos/_grupo*.js` dizem quem foi quem):
A = mina com o Zeca + gameplay real (C2, C3); B = vila, Toca, painéis (C1, C4, C5); C = ciência, closes de objeto,
profundezas (C6, C7, C8). Os helpers `_grupoA.js` (GA), `_grupoB.js` (GB), `_grupoC.js` (GC) são usados pelos planos
da Parte 1: **na Parte N, pode carregar e usar, mas não mudar o que existe**. Função nova vai em `_grupoA_ep0N.js`
(ou só acrescentada no fim, sem alterar as existentes).

### Regras que entram em TODO briefing de quem desenha (copie)
```
- Tabela canônica do episódio (cronômetro início→fim por plano, contador, lanterna, cartão): <colar §4.1 do episódio>.
- Zona do Instagram: nada essencial em y<250 nem y>1500; coluna de botões só ocupa x>960 entre y≈1000 e 1500.
  Legenda centrada em y=1400 (faixa ~1300–1500 escura e limpa). Legenda pode passar sobre a barriga do Zeca em close, nunca sobre o rosto.
- Lanterna: dentro da mina com cronômetro >0 = lente acesa COM feixe; perto de 1,0 pisca (ART.zeca.falha); em 0,0 apaga.
  O feixe não cruza painel, cronômetro, texto nem rosto.
- Contador sempre com ícone de moeda. Cada pedra paga 1 moeda na hora (nada de "pedra à venda" no Mercado).
- Nada em tempo absoluto: tudo de ctx.dur, ctx.words, ctx.marks (MD.wordTime, MD.marks). A voz pode mudar e o plano estica.
- Movimento até o último quadro (push-in, parallax, respiração, partículas). Nenhum plano congela, nem os de tela escura.
- Determinismo: sem Date, requestAnimationFrame, setTimeout, Math.random, CSS animado. Use MD.rng/ART.rng.
- Teste pelo caminho oficial: make_video.py … --plano pN## --rascunho, e OLHE o plano em movimento. Harness próprio não conta.
- "Corrigido" só com evidência: caminho do quadro do render oficial (contact sheet --cs-por-plano 3) que mostra a correção.
- Recurso do jogo mostrado = recurso real. Meta/prazo/motivação podem ser invenção. Nenhum personagem real do jogo como vilão. Nunca prometer dinheiro real.
```

### Modelos de briefing curtos

**Roteirista**
> Escreva a Parte N do MAGMA DIG. Leia `roteiro/serie.md` (arco e dispositivos fixos), `roteiro/parte-01.md` (modelo
> de formato e tabela plano a plano), `roteiro/fatos.md`, `docs/REFERENCIA.md` §10 e `docs/JOGO-VISUAL.md` §6–9.
> Entregue: `roteiro/parte-0N.md` (narração final, 3 ganchos com o escolhido, tabela plano a plano com cenários
> C1–C8 reaproveitados, checagem final), `roteiro/parte-0N.shots.json` (mesmo esquema da Parte 1, ids N01…),
> `roteiro/fatos-0N.md` (fonte de cada afirmação, OK/INFERIDO/A CONFIRMAR/FICÇÃO), `roteiro/post-0N.md`, e a tabela
> canônica (cronômetro/contador/lanterna/cartão por plano). Alvo 300–340 palavras, frases de 4–8 palavras, números
> ditos por extenso, legenda pode usar algarismos. Comece com a frase de "previamente" (resultado do dilema anterior).
> Use os fatos da versão 1.3 (dias de 10 s, 9 minas A–I). Não invente recurso do jogo; liste perguntas para o dev.
> Não edite nada fora de `roteiro/`.

**Especialista de voz**
> Gere a narração da Parte N com a voz definitiva (§5 de `docs/PRODUCAO.md`: motor, voz, parâmetros). Entrada: as
> frases de `story/parte-0N.json`, 1 por linha, texto idêntico. Meça com `pontuacao.py` e `medir.py`; regere frases
> ruins por `seed`/`falado`. Critério eliminatório do usuário: norma do português na fala (vírgula com pausa real,
> acentos, afirmação termina para baixo, pergunta sobe na última tônica). Pausas alvo: §4.4. Velocidade natural,
> nunca acelerar. Um modelo por vez (RAM). Entregue a pasta, as medições, as frases suspeitas e uma amostra `.m4a`
> em `out/vozes/` para o usuário ouvir. Não edite pipeline nem planos.

**Diretor de arte**
> Você é o único dono de `art/`. Leia `art/README.md`. O roteiro da Parte N pede estas peças novas: <lista>. Crie-as
> compatíveis com a API atual (nada que mude o desenho dos planos da Parte 1). Prancha de teste em `art/boards/`,
> `node art/tools/render.js <prancha> --stills …`. Documente cada peça nova no `art/README.md`. Depois de mudar o
> kit, rode `--so-contact-sheet --cs-cortes` da Parte 1 nos planos que usam a peça mexida e confirme que nada mudou.
> Regras de lanterna e zona: <colar>.

**Animador**
> Você faz os planos <lista pN##> (cenários <C?>). Um arquivo por plano: `scenes/planos/pN##.js` (API em
> `docs/PIPELINE.md` "Um arquivo por plano"; modelos da Parte 1 em §9 deste manual). Pode carregar os helpers
> `_grupoX.js` sem mudá-los. Regras: <colar o bloco "Regras que entram em TODO briefing">. Para cada plano, entregue
> o caminho do contact sheet de 3 quadros do caminho oficial.

**Dono do pipeline**
> Gere `story/parte-0N.json` do `shots.json` (ids N##), acrescente em `tools/gerar_story.py` os ajustes de sfx/pausa
> do episódio sem mexer nos da Parte 1, rode `--so-audio` com a pasta de voz definitiva, mande ao orquestrador a
> tabela de início/duração de cada plano e os avisos (plano < 0,1 s, palavra sem âncora). Depois, render completo e
> contact sheets. Apague execuções antigas de `build/parte-0N/runs/`.

**Revisor**
> Assista `out/parte-0N.mp4` quadro a quadro (e os contact sheets de 3 quadros por plano). Não edite nada. Use a
> lista de §7. Para cada defeito: plano, tempo, o que está errado, a regra quebrada e um JPG de evidência em
> `build/revisao/parte-0N/`. Na conferência final, confirme cada "corrigido" com quadro do render oficial.

---

## 4. Regras fixas da série

### 4.1 Relógio, contador, lanterna (tabela canônica)
- O cronômetro do dia **nunca sobe num corte**. Cada plano interpola de um valor inicial a um final definidos numa
  tabela por episódio (`GA.cron(t, ctx.dur, v0, v1)` ou âncoras `[[t, v], …]` em tempo local, ex.: na palavra).
  Só sobe dentro de um plano quando a história manda (p38: 10,0 → 11,0, o segundo comprado). Um dia novo recomeça.
- Contador: sempre com ícone de moeda; cada pedra paga uma moeda na hora.
- Lanterna: na mina com cronômetro > 0, acesa com feixe; perto de 1,0 pisca (`ART.zeca.falha`); em 0,0 apaga.
- Cartão fixo "SALDO × META · DIA X DE 30" no topo (y ≈ 365); a meta muda de unidade por arco (mil → K → MI → BI).

**Tabela da Parte 1 (reconstruída dos planos):**

| Plano | Fala | Cronômetro (início → fim) | Contador / cartão | Lanterna |
|---|---|---|---|---|
| p02 | "de trabalho durasse" | 10,0 fixo (sobre gameplay) | — | (gameplay) |
| p03 | "só dez segundos?" | 10,0 → 0,0 (curva que acelera) | — | acesa → apaga no zero |
| p06 | "Acendeu, é dia." | 10,0 (HUD entra) | — | acende, feixe na parede |
| p07 | "Cada pedra… paga na hora." | 9,5 → 8,5 (gameplay) | 0 → 1 na moeda | — |
| p08 | "Apagou, é noite." | 0,0 | — | pisca e apaga |
| p13 | "…nenhuma moeda." | — | contador 0 | — |
| p15 | "mil moedas em trinta dias." | — | cartão SALDO 0 · DIA 1 (estreia) | — |
| p26 | "Dia um. Mina A, Terra Rasa." | — | cartão SALDO 0 · DIA 1 | acesa, sem feixe (vila) |
| p27 | "A lanterna acendeu." | 10,0 | — | acende (abertura do olho) |
| p28 | "Picareta velha…" | 10,0 → 8,6 (gameplay) | — | — |
| p29 | "Crac. Uma moeda. Crac. Duas." | 8,6 → 7,2 | 1 → 2 (nos sons de moeda) | acesa |
| p30 | "Apagou. Seis moedas." | — (breu) | "?" apagado → 6 em "Seis" | falha e apaga |
| p32 | "Ele tinha vinte e nove." | — | cartão SALDO 6 · DIA 1 · RESTAM 29 | — |
| p36 | "…botou tudo em Tempo." | — | saldo 6 → 0; Tempo nível 0 → 1 | — |
| p38 | "Dia dois. Onze segundos de luz." | 10,0 → 11,0 (fantasma 10) | — | acende |
| p39 | "Crac. Uma. Crac. Duas." | 11,0 → 9,0 (gameplay) | 1 → 2 | — |
| p40 | "Cinco segundos. Quatro pedras." | 5,6 → 5,0 (em "segundos") → 4,2 | 2 → 3 → 4 (em "Quatro") | acesa |
| p41 | "Um segundo. Sete." | 1,8 → 1,0 (em "Um"), alerta | 6 → 7 (em "Sete") | — |
| p42 | "Ontem, a luz apagava aqui." | 1,0 | — | falha (dupla exposição) |
| p43 | "Mas hoje tinha mais um." | 1,0 (alerta, pulsando) | — | falha → firma em "hoje" |
| p44 | "E no segundo comprado," | 1,0 → 0,7 | — | pisca leve |
| p45 | "…parede diferente." | 0,7 → 0,4 | — | acesa + banho laranja |
| p46 | "Um brilho laranja." | 0,4 → 0,2 | — | acesa |
| p48 | "Sem esse segundo, ficava no escuro." | 0,2 → 0,0 (no apagar) | — | falha → apaga em 0 |
| p52 | "Quatro por cento… vinte e oito dias." | — | cartão SALDO 7 · DIA 2 · COBRE 4% · RESTAM 28 | — |

Dia 1: `max`/`escala` 10. Dia 2: `max: 11, escala: 11, fantasma: 10`. Pulos para baixo entre planos (p40 → p41) são
permitidos; para cima, nunca.

### 4.2 Zona do Instagram (medida e validada pelo revisor)
- Nada essencial em y < 250 nem em y > 1500.
- A coluna de botões da direita só ocupa x > 960 entre y ≈ 1000 e 1500 (fora dessa faixa, x > 960 pode ter conteúdo).
- Legenda centrada em y = 1400 (bloco ocupa ~1369–1431 + sombra). Posições: `baixo` 1400, `meio` 1250, `alto` 390,
  `centro` 960 (`legenda_pos` no plano). Sobre a barriga do Zeca em close: aprovado. Sobre o rosto: não.
- `config/estilo.json` `zona_segura` (`direita_y: [1000, 1500]`), o guia `--zona-segura` e `docs/PIPELINE.md` já usam
  esta regra. `art/README.md` (do diretor de arte) ainda cita a antiga (x > 960 na altura toda), que só é mais conservadora.

### 4.3 Legenda (já em `config/estilo.json`, não mexer)
Anton caixa-alta branca 72 px, contorno 4 px #161408 + sombra, sem karaokê, amarelo #EBBA40 só nos `destaques` por
dados (~40% dos blocos), fade-in 0,1 s, uma linha (≤ 700 px), até 3 palavras e 22 caracteres por bloco, mínimo 0,35 s.
Números falados por extenso viram um bloco ("CENTO E SESSENTA E SETE"); "MAGMA DIG" também.

### 4.4 Pausas e ritmo da narração (pedido do usuário)
Valores em `config/estilo.json` → `tempo.pausas` (vale para qualquer motor; o pipeline apara o silêncio do motor e
recoloca o da pontuação):

| Pontuação | Pausa |
|---|---|
| fim de frase (. ? !) | 0,55 s |
| fim de frase de 1–2 palavras ("Crac.", "Dia um.") | 0,38 s |
| dois-pontos | 0,45 s |
| reticências | 0,45 s |
| vírgula / ponto e vírgula | mínimo 0,28 s (só alonga silêncio que existe) |

Entre falas vale a mesma regra (a pausa depende da pontuação da última frase da fala); `pausa_fala` não é mais usado.

Velocidade natural (1,0, sem `atempo`), nunca acelerar para bater ritmo. Pausa intencional extra: `pausa_depois`
na fala ("Cobre." = 0,6 s). Vírgula "sem pausa" no relatório do `--so-audio` = o motor engoliu: regerar a frase.

### 4.5 Fatos do jogo
- Usar a versão 1.3 (site, kit de imprensa, screenshots, trailer): dias de 10 s, 9 minas com ranks A–I (+ Abismo),
  Mercado com tendência, clientes da vila, guardiões. A App Store ainda diz 15 s e 5 minas: ignorar.
- Recurso mostrado tem que ser real. Meta, prazo e motivação podem ser invenção narrativa (o jogo não tem prazo).
- Nenhum personagem real do jogo (Dona Coruja, Seu Castor, Raposa Ourives, Sapo Sábio…) vira vilão. Nunca prometer
  dinheiro real.
- Toda afirmação de ciência com fonte em `roteiro/fatos*.md`; número de jogo incerto = "A CONFIRMAR" e pergunta ao dev.
- Gameplay real: `assets/game/preview.mp4` (1280×590) e `shot_1…9.jpg`. Funciona em quadro cheio ampliado ~2×
  (`ART.gameplay.cheio`) com selo "IMAGEM REAL DO JOGO" e o cronômetro desenhado por cima (o trailer mostra 13,2, de
  save evoluído). Tapar valores que contradizem a história (+91,1K do Mercado, 10,4BI, rank E). Todo trecho útil é da
  mesma mina e do mesmo ângulo: use com moderação.

### 4.6 Licenças
- Sem clonar voz de pessoa real. As referências do Qwen/Chatterbox são sintéticas, geradas do texto em
  `tools/voz/vozes_qwen.json`.
- Só licenças com uso comercial: Qwen3-TTS Apache-2.0 (voz atual), Kokoro Apache-2.0, Supertonic OpenRAIL-M,
  Chatterbox MIT (com marca d'água Perth). Fontes: Anton, Lilita One, Baloo 2, Bangers, Nunito (OFL), Luckiest Guy
  (Apache-2.0). `zeca.png` e imagens do kit de imprensa: "livres para uso em matérias e vídeos".
- Efeitos e trilha são sintetizados pelo pipeline (`lib/sfx.py`, `lib/music.py`): sem licença de terceiros.

---

## 5. Decisões e preferências do usuário

| Tema | O que ele disse / decidiu |
|---|---|
| Forma de trabalho | Subagentes Opus fazem o trabalho; a sessão principal só orquestra. |
| Personagem | Zeca de corpo inteiro atuando, "não só a cabeça". |
| Parte 1 | "A história e o visual ficaram bons": história e visual aprovados. |
| Voz | Rejeitou o Kokoro ("muito estranho", "fala sem vírgula, sem acentos, siga a norma da língua portuguesa na fala"). Quer voz gratuita. Entre três finalistas (`out/vozes/voz-A/B/C-*.m4a`) escolheu a **A**: Qwen3-TTS, voz por descrição `narrador-jovem`, Apache-2.0. Depois pediu "mais pausas, fica muito comido as palavras". |
| Idioma | Português do Brasil. Relatórios e textos para ele em PT-BR, curtos. |
| Repositório | O gancho exige commit e push a cada parada; checkpoints frequentes no branch. |

### Voz definitiva
Já nos arquivos:
- Motor `qwen` (Qwen3-TTS): timbre desenhado uma vez pelo VoiceDesign 1.7B a partir da descrição `narrador-jovem` em
  `tools/voz/vozes_qwen.json`, reaplicado a cada frase pelo Base 0.6B. Referência sintética em
  `.cache/voz-ref/qwen-design-narrador-jovem-s0.wav` (+ `.txt`).
- Versão usada no render `out/parte-01-voz-A.mp4`: `build/voz-A-final/` (62 frases, 130,77 s de narração,
  `velocidade` 1,0, `atempo` 1,0, 4 frases retomadas com outra seed/`falado`); entrada em
  `tools/voz/roteiro_parte01_qwen_jovem.json`.
- Indício do método mais lento sem trocar o timbre: `tools/voz/motores.py` lê `VOZ_REF_TEMPO` (a MESMA referência,
  esticada pelo Rubber Band com formantes preservados; o clone imita o ritmo dela) e existe
  `.cache/voz-ref/qwen-design-narrador-jovem-s0-tempo0.85.wav`. `VOZ_QWEN_TEMP` muda a temperatura.
  `tools/voz/timbre.py` compara ritmo e similaridade de locutor contra a referência.

**Confirmado no render final da Parte 1 (voz A2):**
- Método final: Qwen3-TTS Base 0.6B clonando a referência sintética da voz A, uma frase por chamada, `--atempo 0.87`
  depois da síntese, `"falado"` com reticências onde o motor engolia a vírgula, `alongar_virgulas.py --min 0.22` e
  depois `--min 0.24`. Sem `VOZ_REF_TEMPO` (esticar a referência mudou o timbre). Receita e comandos:
  `tools/voz/README.md` §"Voz definitiva da série".
- Parâmetros exatos por frase (20 sementes próprias, 6 `falado`): `tools/voz/roteiro_parte01_qwen_jovem_v2.json`.
- Pasta da narração final: `build/voz/completo/qwen-narrador-jovem-v2/` (62 WAVs 48 kHz + `tempos.json`, `atempo` 0,87).
- Comando do render final (o pipeline não aplica `atempo` nenhum; pausas de §4.4):
  ```
  .cache/venv/bin/python make_video.py story/parte-01.json --voz-pasta build/voz/completo/qwen-narrador-jovem-v2 \
      --motor qwen --voz narrador-jovem -o out/parte-01-final.mp4 --contact-sheet --cs-cortes --cs-max 20 --workers 4 --pausas
  ```
  Execução em `build/parte-01/runs/parte-01-final/` (`pausas.json`, `timeline.json`, `render_tempos.json`).
- Resultado: **157,07 s**, 4712 quadros, **2,04 palavras/s no total** (2,21 só fala), 0 vírgulas sem pausa,
  -14 LUFS, 5,9 Mbps, 115 MB. Prévia leve `out/parte-01-final-previa.mp4` (3,5 Mbps, 69 MB).
- Referência guardada fora do `.cache`: `tools/voz/ref/qwen-design-narrador-jovem-s0.{wav,txt}` (sha256 em
  `tools/voz/ref/LEIAME.md`); `motores.referencia_sintetica()` restaura de lá. Não regerar.

---

## 6. Lições aprendidas (para o próximo episódio já nascer certo)

1. **Tabela canônica e zona no PRIMEIRO briefing.** Na Parte 1 a tabela de relógio/contador/lanterna e a zona correta
   do Instagram só vieram depois da primeira revisão e custaram uma rodada inteira.
2. **Teste pelo caminho oficial e em movimento.** O defeito da lanterna (luz desenhada em coordenadas de tela com a
   câmera ativa; feixe só aditivo, invisível em pedra clara) passou por um "corrigido" falso testado num harness com
   câmera neutra. Só vale `make_video.py … --plano pN## --rascunho`.
3. **Nada em tempo absoluto.** Tudo de `ctx.dur`, `ctx.words`, `ctx.marks`. Quando a narração ficou mais lenta,
   apareceram planos congelados no fim (os de tela escura: "Apagou", "Seis moedas", "no escuro"). Todo plano se mexe
   até o último quadro.
4. **Voz antes de animar.** A duração de cada plano vem do áudio; trocar de voz muda todos os tempos.
5. **Nenhum agente ouve.** Voz e som foram julgados por ASR, pausas medidas e F0. Mande amostras ao usuário cedo: é o
   único teste de ouvido.
6. **"Corrigido" exige evidência** em quadro do render oficial. O revisor independente pegou vários que não chegaram
   à tela.
7. **Gameplay real é pequeno** (1280×590): quadro cheio ampliado ~2× com selo e cronômetro por cima; tudo da mesma
   mina e ângulo. Peça ao usuário uma gravação de tela vertical do jogo: melhoraria muito.
8. **Máquina:** 4 núcleos, 15 GB. Dois modelos de voz ao mesmo tempo, ou voz + render, estouram a memória (houve
   oom-kill). Um pesado por vez. O disco enche: `.cache` passa de 19 GB e cada render completo deixa 250–370 MB em
   `build/parte-0N/runs/`.
9. **Erro de direção da Parte 1 (do orquestrador):** a primeira versão usava 0,12 s entre falas e ~3 palavras/s
   porque copiou o ritmo do reel de referência, que tem narrador humano. Voz sintética nesse ritmo soa "comida".
   Valem as pausas de §4.4.
10. **Retomar o mesmo agente** (SendMessage) em vez de abrir outro: preserva contexto e custa muito menos.
11. **Ordem real da Parte 1** (para comparar): análise da referência e do jogo → pipeline → roteiro → kit de arte → 57
    planos em três animadores por cenário → render completo → revisor quadro a quadro → rodadas de correção → voz
    definitiva → render final. A voz no fim foi o que mais custou retrabalho (lição 4).

---

## 7. Lista de verificação antes de publicar

Reconstruída das evidências do revisor em `build/revisao/` (`evidencias/`, `v2/ev/`, `v3/ev/`) e das regras acima.
Marque cada item olhando o render oficial e os contact sheets de 3 quadros por plano.

**Relógio, contador, lanterna**
- [ ] O cronômetro nunca sobe num corte (defeitos vistos: p28→p29, p41→p42).
- [ ] Cada valor bate com a tabela canônica e com a palavra falada (ex.: "4%" e não 2% em "quatro"; o 40 não aparece
      antes de "quarenta").
- [ ] Lanterna acesa com feixe em todo plano de dia na mina; pisca perto de 1,0; apaga em 0,0 (vistos: apagada de
      dia em p27/p40/p44/p46; acesa/apagada trocando entre p43 e p44).
- [ ] O feixe não cruza painel, cronômetro, texto ou rosto.
- [ ] Contador com ícone de moeda; nenhuma "pedra à venda" no Mercado.

**Movimento e tempo**
- [ ] Nenhum plano congelado, inclusive no fim e nos de tela escura (vistos: p08 parado 1–2 s, p48 fim parado, p30
      1 s de preto antes do 6).
- [ ] Olhos piscam; lâmpada que falha pisca de verdade (vistos: p08, p42).
- [ ] Pose não pula de um quadro para o outro (visto: p03); o Zeca não vira de lado sem motivo.
- [ ] Ação sincronizada com o som e a palavra (golpe no "picareta", moeda no "plim").
- [ ] Cortes entre planos do mesmo cenário não dão salto estranho (vistos: p23→p24 globo, p33→p34 mesmo painel).

**Enquadramento e desenho**
- [ ] Zona do Instagram (§4.2) em todos os planos (`--zona-segura` no contact sheet).
- [ ] Legenda em y≈1400, legível, nunca sobre o rosto; nada essencial atrás da legenda.
- [ ] Picareta e braço não cobrem o rosto; braço/pata com comprimento plausível e fim esfumado.
- [ ] Zeca grande o bastante para ler a atuação (visto: p04–p06 pequeno); rosto inteiro no quadro (visto: p29).
- [ ] Textos e rótulos inteiros, nada cortado na borda (vistos: p20, p31); números não atrás da cabeça (p14).
- [ ] Sem símbolo solto, mancha ou faixa preta na borda (vistos: "◎" após 1.000 em p15, faixa em p41, mancha branca
      no capacete em p44).
- [ ] Máscaras e transições abrem por inteiro (visto: abertura do olho em p27).
- [ ] Setas e ícones grandes o bastante para ler no celular (visto: p54).

**Som e voz**
- [ ] `tools/verificar_narracao.py` sem "suspeita forte" não resolvida; MAGMA DIG = "MÁG-ma DÍG".
- [ ] Tabela de pausas do `--so-audio` sem vírgula "sem pausa" importante.
- [ ] Efeito certo no momento certo (visto: clique × apagar em p57).
- [ ] Usuário ouviu a narração (amostra `.m4a`).

**Conteúdo**
- [ ] Todo recurso do jogo mostrado existe na versão 1.3; gameplay real com selo e valores tapados.
- [ ] Contas na tela batem com o que se ouve (ex.: 1.000 ÷ 6 = 167, 4%, restam 28).
- [ ] Nenhum personagem do jogo como vilão; nenhuma promessa de dinheiro real.
- [ ] Último plano repete o primeiro; "Curte pra parte N+1." com destaque em PARTE.
- [ ] Post (`roteiro/post-0N.md`): legenda, hashtags, comentário fixado, texto de capa; preço conferido na loja no dia.

---

## 8. Pendências com o usuário

Repetir na primeira conversa da próxima sessão (ainda SEM resposta):
1. O ramo **Tempo** realmente aumenta a duração do dia? (a Parte 1 inteira depende disso; `roteiro/fatos.md` = INFERIDO)
2. Quanto custa subir para o **rank B**? (a Parte 1 diz mil moedas; ver `roteiro/fatos.md`)
3. Faz sentido **6 moedas no dia 1** e **cobre a 40** na primeira mina? (e: o cobre sai da mina A? quanto custa e
   quanto rende o 1º nível de Tempo?)
4. Qual **Zeca é o oficial** para corpo inteiro: o ícone 3D (`icon.png`) ou a pixel art (`zeca.png`)? (o do vídeo é
   desenhado pelo kit, inspirado nos dois)
5. Pode mandar uma **gravação de tela vertical** do jogo (material novo de gameplay)?
6. ~~Qual lado ganhou o dilema da Parte 1 nos comentários (VENDE ou SEGURA)?~~ **Resolvida: ganhou SEGURA** (a Parte 2
   começa por ela).
7. Preço na App Store no dia de postar (o post da Parte 1 cita R$ 19,90, conferido pelo orquestrador).

Novas da Parte 2 (detalhe e fonte em `roteiro/fatos-02.md`):
8. O **bloco de ampulheta** dá segundos extras ao dia? Quantos (o vídeo diz +2 s)? Aparece na mina A?
9. O cobre pode **cair à metade** de um dia para o outro (40 → 20)? Qual a variação máxima?
10. Toda **alta do dia** é **+50%**? Pode ser o cobre na Terra Rasa? O ferro aparece lá?
11. **Dona Coruja**: quando aparece o primeiro cliente, pode pedir cobre no começo, e a encomenda paga mais ou menos que
    o Mercado (o vídeo diz 160 × 240)?
12. O **bônus de amizade** ("no preço de venda") vale para todas as vendas do Mercado ou só para as encomendas dela?
13. **Placar do dilema da Parte 2** nos comentários: **ENTREGA** (Dona Coruja, 160 + amiga) × **VENDE** (Mercado em
    alta, 240). A Parte 3 começa por ele.

---

## 9. Inventário

### 9.1 Cenários (códigos do roteiro) e peças do kit
| Código | Cenário | Kit (`art/kit`) | Planos da Parte 1 |
|---|---|---|---|
| C1 | Vila à noite, boca da mina, placa | `ART.cenas.vila({placa, sub, lampiao, interiorMina})` | p04, p11, p26 |
| C2 | Mina A (pedra cinza), Zeca em 3ª pessoa | `ART.cenas.mina`, `ART.cubo` (`crack`, `veios`), `ART.estouro`, `ART.oresVoando`, `GA.cava`, `GA.hud` | p05, p06, p08, p27, p29, p37, p40, p42, p44, p45, p46, p48 |
| C3 | Gameplay real (trailer/screenshots) | `ART.gameplay.cheio` / `visor`, `RECORTES` (`minaAlta`, `minaLarga`, `mapa`, `mapaAlto`, `mercado`, `botaoRank`) | p02, p07, p16, p17, p28, p39, p41, p49 |
| C4 | Toca: parede da meta, cama, mesa | `ART.cenas.toca`, `ART.giz`, `GB.toca`, `ART.cobertor` | p09, p14, p15, p31, p32, p52, p56 |
| C5 | Painéis da Toca (Habilidades, Mercado) | `ART.cenas.tocaDesfocada`, `ART.painelHabilidades`, `ART.painelMercado`, `ART.ui.ramo/RAMOS`, `grafico7`, `linhaMercado`, `botao`, `seta` | p33–p36, p50, p51, p53–p55 |
| C6 | Inserto de ciência (linhas ciano, azul-petróleo) | `ART.ciencia.crosta/planeta/nucleoSol/tatu`, paleta `ART.BP` | p12, p20–p25 |
| C7 | Close de objeto no escuro | `ART.obj.lanterna/picaretaVelha/saquinho/calendario/pepitaCobre/ampulheta/bracoForte`, `ART.holofote`, `GC.lampada` | p01, p03, p10, p13, p30, p38, p43, p47, p57 |
| C8 | Profundezas, estratos A–I, Coração de Magma | `ART.cenas.profundezas({desce})`, `ART.coracaoMagma` | p18, p19 |

Zeca (`ART.zeca`): poses `parado, cavando, andando, bola, sentado, dormindo, comemorando, espantado, susto, cansado,
preocupado, feliz, contando, segurando, apontando, riscando, deitado`; `seq` encadeia ações; `drawEscuro` (só olhos no
breu); `falha` (lanterna falhando); `quadro('geral'|'inteiro'|'medio'|'close')`; campos `alvo`, `camera`, `segura`,
`banho`, `costas`, `lamp`, `cone`, `coneAng`. Interface: `ART.ui.cronometro`, `contador`, `crac`, `flutua`,
`cartaoMeta`, `cartaoMinerio`, `moeda`, `pix`, `titulo`. Câmera: `ART.camera`, `ART.enquadrar` (mina plano médio
`(470, 1010, 1.85, {sy: 820})`; close do rosto `(540, 930, 3.6, {sy: 800})`), `ART.duplaExposicao`,
`ART.aberturaOlho`. Tudo documentado em `art/README.md`. Pranchas de teste em `art/boards/`.

Ainda NÃO existe no kit (o arco de `roteiro/serie.md` vai pedir): blocos especiais (ampulheta, sortudo, baú),
clientes da vila (Dona Coruja etc.), Forja e formas da picareta, poderes (Tremor, Avalanche…), guardião (Colosso de
Arenito com barra de vida), ajudantes, minas B–I como lugar, Mapa da Jornada desenhado, obsidiana, Coração de Magma
revelado. O trailer tem guardião (9–13,5 s), poderes (5–9 s), clientes (16,5–19,5 s), mapa (19,5–22 s):
`docs/JOGO-VISUAL.md` §8.

### 9.2 Planos da Parte 1 que servem de modelo
| Tipo | Planos | O que copiar |
|---|---|---|
| Gancho | p01 (lanterna acende em close), p02 (gameplay cheio + cronômetro desenhado), p03 (cronômetro gigante despenca 10 → 0, tela apaga) | 3 planos em ~4 s; p57 repete p01 |
| Cartela de dia / noite | p26 (placa da mina + cartão DIA), p27 (abertura do olho + HUD), p38 (cronômetro 11,0 com barra fantasma), p33 ("NOITE 1" + painel sobe) | troca de dia/noite e estreia do valor novo do cronômetro |
| Golpe na mina | p29 (2 golpes nos `marks` de picareta, CRAC, moeda voando ao contador), p40 (golpes acelerados com âncoras de cronômetro), p44 (câmera lenta), p45 (impacto + veios) | `GA.cava(t, marks)`, `GA.hud`, `GA.cron` |
| Parede da meta | p14 (riscando, por cima do ombro), p15 (1.000 + estreia do cartão), p31 (conta em giz), p32 (tracinho riscado + RESTAM), p52 (barra % + RESTAM) | `ART.giz`, `GB.cartao` |
| Painel de habilidades | p33 (abre), p34 (7 ramos acendem um por palavra), p35 (FORÇA pulsa), p36 (pata empurra moedas para TEMPO, nível 0 → 1) | cortes internos por palavra |
| Mercado | p49 (tela real borrada → título), p50 (gráfico de 7 dias + barra de amanhã), p51 (linha COBRE + VENDER), p53 (seta sobe), p54 (sombra vermelha), p55 (pata paira sobre VENDER) | dilema no painel |
| Inserto de ciência | p12 (tatu real em linhas), p20–p22 (poço de Kola, régua, anos), p23 (zoom-out até o planeta), p24 (núcleo), p25 (Terra × Sol) | etiquetas, contadores, zoom contínuo |
| Breu / tensão | p08 (apaga, só olhos), p30 (contador no escuro), p37 (braço forte no vazio), p42 (dupla exposição de ontem), p48 (veio some no escuro) | planos escuros que ainda se mexem |
| Recompensa | p46 (luz laranja no rosto), p47 (pepita girando no holofote + cartão) | segurar ~1 s com acorde |
| Final | p56 (Zeca na cama com a pepita, olhando a seta), p57 (mesma lanterna do p01 apaga) | dilema sem resolver + chamada |
| Vila / apresentação | p04 (placa MAGMA DIG balança), p11 (Zeca entra e olha a câmera), p09 (Toca: vende, aprende, dorme) | personagem de corpo inteiro atuando |
| Gameplay real | p16 (botão SUBIR DE RANK, `shot_4`), p17 (Mapa da Jornada A → B), p28, p39, p41 | `cheio` com `tapar`, `selo`, `cronometro` |

**Como reaproveitar:** copie o arquivo-modelo para `scenes/planos/pN##.js`, troque o id em `MD.plano("pN##", …)`,
troque as palavras âncora (`GA.w(ctx, "palavra")`, `MD.wordTime`) e os valores da tabela canônica. Não edite o
modelo da Parte 1. Os helpers são carregados no `setup` (`MD.loadScript("../scenes/planos/_grupoA.js")`).

### 9.2b Peças e helpers novos da Parte 2
Kit (`art/kit/parte2.js`, API em `art/README.md` "Parte 2"; sem os parâmetros novos o desenho da Parte 1 é idêntico):
- Mercado com queda e alta: `ART.painelMercado` com `precoAntes`/`rola`/`varPct`/`seta` para baixo/`setaGiro`/
  `setaFantasma`, `rotuloAntes` ("NORMAL"), faixa **EM ALTA HOJE** (`ART.ui.faixaAlta`), `ART.ui.precoRolando`,
  `ART.ui.etiquetaPreco` (etiqueta 40 que racha e vira 20).
- Inserto blueprint de Wall Street: `ART.ciencia.grafLinha` (linha, eixo de anos, régua, queda em coral) e
  `ART.ciencia.especulacao` (pata, seta AMANHÃ?, carimbo).
- Bloco especial de ampulheta: `ART.cubo({especial: "ampulheta"})` + `ART.estouroAreia`.
- Cliente: `ART.ui.cartaoCliente` (Dona Coruja, amizade, pedido tem/precisa, recompensa, bônus, ENTREGAR),
  `ART.ui.coruja`, `ART.ui.coracao`, `ART.ui.barrasComparar`; recortes `ART.gameplay.PRESET.ampulheta` e `.clientes`.
- Pranchas: `art/boards/p2_mercado.js`, `p2_wallstreet.js`, `p2_ampulheta.js`, `p2_clientes.js`.

Helpers dos planos da Parte 2 (podem ser carregados na Parte 3 sem mudar):
| Arquivo | Objeto | Planos |
|---|---|---|
| `scenes/planos/_grupoA_ep02.js` | `GA2` | mina do dia 4 e gameplay real: p207, p241–p250, p258 |
| `scenes/planos/_grupoB_ep02.js` | `GB2` | vila e Toca: p204, p205, p208, p212–p214, p218, p232–p234, p239, p240, p256, p257, p264, p266 |
| `scenes/planos/_grupoC5_ep02.js` | `GC5` | painéis Mercado e Clientes: p206, p209, p210, p216, p217, p230, p231, p235–p238, p252–p255, p259–p263, p265 |
| `scenes/planos/_grupoD_ep02.js` | `GD` | inserto Wall Street p219–p229 e closes de objeto p201–p203, p211, p215, p251, p267 |

### 9.3 Outros arquivos
| Caminho | O que é |
|---|---|
| `docs/PIPELINE.md` | pipeline, formato do story, API de plano, flags |
| `docs/REFERENCIA.md` | análise medida do reel de referência + receita |
| `docs/JOGO-VISUAL.md` | bíblia visual do jogo, trailer decupado, fatos site × App Store |
| `art/README.md` | API do kit |
| `tools/voz/README.md` | motores de voz, geração, medição, pontuação |
| `roteiro/serie.md` | arco das Partes 2–6 e recursos por parte |
| `roteiro/parte-01.md`, `.shots.json`, `fatos.md`, `post.md` | Parte 1 completa |
| `story/parte-01.json` | story gerado da Parte 1 |
| `out/vozes/` | amostras de voz que o usuário ouviu (base Kokoro, A, A2, B, C) |
| `build/revisao/` | evidências do revisor (v1, v2, v3) |

---

## 10. Instalação do zero e ambiente

**Container efêmero:** `.cache/`, `build/` e `out/*.mp4` não são versionados (`.gitignore`) e não sobrevivem.
A próxima sessão precisa rodar:
```
cd magma-dig-video
./setup.sh                 # pipeline
tools/voz/instalar.sh      # vozes (inclui torch e Qwen3-TTS)
```

| Script | O que instala | Tamanho no disco (medido nesta máquina) |
|---|---|---|
| `./setup.sh` | `.cache/venv` (requirements.txt), Kokoro (onnx 311 MB + vozes 27 MB), Piper pt-BR (79 MB), ASR Whisper-small int8 (359 MB) + Parakeet 0.6B int8 (641 MB) | ~1,85 GB (venv 0,43 + modelos 0,42 + ASR 1,0) |
| `./setup.sh --sem-asr` | sem o ASR (tempo de palavra pior, ~2,5×) | o script diz ~350 MB |
| `tools/voz/instalar.sh` | `.cache/venv-voz` com torch (vem do PyPI, traz libs CUDA, roda em CPU), qwen-tts, deps do Chatterbox; pesos Qwen3-TTS VoiceDesign 1.7B (4,3 GB) + Base 0.6B (2,4 GB), Chatterbox pt-BR (3,0 GB), Supertonic 3 (139 MB), UTMOS (394 MB) | ~16,5 GB (venv-voz 6,4 + HF 9,6 + voz-modelos 0,53); o script diz ~19 GB |
| `tools/voz/instalar.sh --leve` | só Supertonic 3 + medição sem torch | o script diz ~1,5 GB |

O volume baixado é da mesma ordem (os modelos do sherpa-onnx vêm em `.tar.bz2`, um pouco menores); não foi medido em
bytes de rede. A voz A não usa o Chatterbox: se faltar disco, `rm -rf .cache/hf/hub/models--ResembleAI--Chatterbox-Multilingual-pt-br`
libera 3 GB. Ao todo, `.cache` passou de 19 GB na Parte 1. O disco tinha 8 GB livres no fim da Parte 1.

Requisitos: python3 ≥ 3.11, ffmpeg (com rubberband para `VOZ_REF_TEMPO`/`--atempo`), node 22 com
`require('playwright')` + Chromium, curl.

**Ambiente de nuvem:** ambiente pessoal "log222 - MAGMA DIG video". Hosts liberados além dos gerenciadores de pacote:
`loja.texaspoker.com.br` (site do jogo), `scontent-phl2-1.cdninstagram.com` (só para baixar o reel de referência),
`huggingface.co`, `cas-bridge.xethub.hf.co`, `cdn-lfs.hf.co`, `cdn-lfs-us-1.hf.co`, `us.aws.cdn.hf.co` (modelos de
voz). GitHub releases e Google Fonts já funcionam. `download.pytorch.org` é bloqueado (o script cai para o torch do
PyPI sozinho). `instalar.sh` usa `HF_HUB_DISABLE_XET=1` e `HF_HOME=.cache/hf`.

**Máquina:** 4 núcleos, 15 GB de RAM. Um modelo pesado por vez; sem render completo enquanto a voz gera.
Render: ~160–180 ms por quadro por worker nos planos mais pesados (`render_tempos.json` de cada execução), 4 workers.

---

## 11. Onde os arquivos estão atrás deste manual

- `story/parte-01.json` ainda diz `motor: kokoro`, `voz: pm_alex` (gerado antes da escolha): o render final passa
  `--voz-pasta … --motor qwen --voz narrador-jovem` na linha de comando. Para a Parte 2, gere o story com
  `--motor qwen --voz narrador-jovem`. (`docs/PIPELINE.md` e `config/estilo.json` já estão atualizados.)
- `art/README.md` ainda usa x > 960 na altura toda (§4.2).
- `tools/voz/vozes_qwen.json` descreve o `narrador-jovem` com "fast speaking rate, short pauses": isso só criou a
  referência e NÃO deve ser mudado; o ritmo vem do `--atempo 0.87` (ver "Voz definitiva").
- `tools/voz/README.md` não documenta `VOZ_REF_TEMPO` nem `VOZ_QWEN_TEMP` (estão em `tools/voz/motores.py`).

---

## 12. Parte 2: o que mudou

Vídeo final: `out/parte-02-final.mp4` (153,77 s, 4613 quadros, 1080×1920, 30 fps, ~5,7 Mbps, -14 LUFS, ~113 MB;
cópia em `Videos Magma Dig/parte-02-final.mp4`, ao lado da Parte 1). Prévia leve: `out/parte-02-final-previa-celular.mp4`
(720×1280, 1,25 Mbps, < 30 MB). Story `story/parte-02.json`; voz `build/voz/parte-02/qwen-narrador-jovem/`
(entrada `tools/voz/roteiro_parte02_qwen_jovem.json`); amostra `out/vozes/parte-02-voz.m4a`.

### 12.1 Ambiente: PC do dono, Windows nativo
- Instalação: `powershell -ExecutionPolicy Bypass -File setup-windows.ps1` (sem WSL e sem administrador; tudo em
  `.cache/`, ~10 GB: venv 0,4, Kokoro 0,34, ASR 1,0, playwright + Chromium 0,56, venv-voz com torch CUDA 5,2, Qwen Base
  0.6B 2,4). Só o Base 0.6B: a referência da voz está versionada (`tools/voz/ref/`). Sem VoiceDesign, Chatterbox,
  Supertonic, UTMOS (o `medir.py` faz o ASR, mas não UTMOS/DNSMOS).
- `PY=.cache/venv/Scripts/python.exe`, `PYV=.cache/venv-voz/Scripts/python.exe`. Os scripts Python se relançam em
  UTF-8 sozinhos no Windows (JSON com acento). `node art/tools/render.js` direto precisa de
  `NODE_PATH=.cache/node/node_modules` e `PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright`.
- Voz na GPU (RTX 4070): `VOZ_QWEN_DTYPE=fp32` (entra na chave do cache: sem ela sai outra tomada). 65 frases em
  ~4,8 min (~4,4 s por frase). Na CPU: fp32 ~25 s por frase; bf16 inviável aqui (~10 min por frase).
- Render: ~3,3 min com `--workers 4` (188–202 s para 4613 quadros, ~24 q/s; 6 ou 8 workers não ganham nada).
  Comando completo com contact sheet: ~3,5 min. `--so-audio` com a voz pronta: segundos.
- Os `.sh` saem com CRLF no clone do Windows (`core.autocrlf=true`): use o `setup-windows.ps1`; a amostra `.m4a` sai com
  `ffmpeg -i narracao.wav -af loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000 -ac 1 -c:a aac -b:a 160k saida.m4a`.
- Passo que faltava no setup (agora nos dois scripts): extrair `build/art/gameplay/f_NNNN.jpg` do
  `assets/game/preview.mp4`; sem isso os planos de gameplay real caem no placeholder.

### 12.2 Voz da Parte 2 e comparação com a Parte 1
- Receita A2 sem mudança: Base 0.6B clonando `tools/voz/ref/qwen-design-narrador-jovem-s0.wav`, uma frase por chamada,
  `--atempo 0.87`, `revisar.py` (sementes 5,6,7 e depois 8,9,11), `falado` com reticências nas vírgulas engolidas
  (frases 32, 38, 53, 56), `alongar_virgulas.py --min 0.22` e `--min 0.24`. "Wall Street" fica na grafia normal
  (com "Uól Strít" o ASR piorou). Resultado: 0 de 20 vírgulas abaixo de 120 ms, perguntas sobem, WER 4–6% (números).
- Comparação com o vídeo final da Parte 1 (8 frases iguais, extraídas do mp4): o timbre é o mesmo (similaridade de
  locutor 0,87–0,93 em todas as configurações; a própria Parte 1 dá 0,89 contra a referência, por causa da trilha).
  Frase a frase, as tomadas daqui saem ~13–15% mais curtas, até na configuração exata da Parte 1 (CPU bf16): é o
  modelo nesta versão de torch/transformers, não o `atempo`. No episódio inteiro o ritmo bate: Parte 2 = 2,02
  palavras/s no total e 2,19 só fala; Parte 1 = 2,04 e 2,21. Escolha: GPU fp32 (melhor similaridade, 4× mais rápida).
  Detalhe em `build/voz/comparar-p1/`.

### 12.3 Mecanismos novos do pipeline
- `tools/gerar_story.py`: `TRILHA_AJUSTE` (deixas de trilha por plano, substituem as automáticas; sem ele a "trilha
  suspensa" do p204 ia até o fim), `LEGENDA` (legenda em algarismos por plano, a fala segue por extenso: 40, 20, 1929,
  6 VEZES, 90%, 87, 22%, 60, 240, 160, 26; o destaque vai no número), `LEGENDA_ANCORA` (vazio). Entradas 2xx em
  `SFX_AJUSTE`, `PAUSAS` (211, 257 = 0,6 s) e `SEPARAR_ANTES` (211, 267). A Parte 1 gerada sai idêntica.
- `make_video.py`: `legenda_ancora` por fala (`{"palavra exibida": "palavra falada"}`; existe, sem uso: no p223 deixava
  1,4 s de fala sem legenda); `--cs-transicoes` (em cada corte, último quadro do plano ao lado do 1º do seguinte);
  a linha de alinhamento lista as palavras sem âncora; extração do contact sheet em lotes (o ffmpeg 9 não aceita
  `select` com centenas de termos).
- `lib/sfx.py`: efeito `coruja` (pio "hu-huu" sintetizado), usado no p259 em "Coruja". `lib/mix.py`: a trilha
  sintetizada podia sair 1 amostra mais curta que o vídeo e quebrar o mix (corrigido; a Parte 1 não muda).
- `tools/voz/motores.py`: `VOZ_DEVICE` (padrão: cuda se houver). `falar.py`: dispositivo/dtype na chave do cache.

### 12.4 Tabela canônica da Parte 2 (como ficou no vídeo)
Dia 3 fora de cena (7 pedras). Dia 4: `max: 11, escala: 11`, sem fantasma. O cronômetro só sobe dentro do p247
(5,0 → 7,0, a ampulheta). Do p247 (7,0) ao p248 (2,0) é pulo para baixo, permitido. Contador de moedas com ícone de
moeda; o de cobre é outro contador com ícone de cobre. Lanterna na Toca: apagada. Cartão fixo no topo (y ≈ 365);
meta 1.000 em todos.

| Plano | Fala | Cronômetro | Contador / cartão / painel | Lanterna |
|---|---|---|---|---|
| p201 | E se esperar | — | — | acende (close) |
| p204–p205 | Vocês mandaram segurar. / O Zeca segurou o cobre. | — | — | apagada (Toca) |
| p206 | E a seta errou. | — | painel Cobre 40, seta verde gira e cai vermelha | — |
| p208 | Ele abriu o painel sorrindo. | — | SALDO 14 · DIA 3 · COBRE 4% · RESTAM 27 | apagada |
| p209–p210 | Ontem… quarenta. / Hoje, paga vinte. | — | ONTEM 40 → 40 riscado, 20, −50% | — |
| p212 | O sorriso foi junto com o preço. | — | SALDO 14 · DIA 3 · COBRE 2% · RESTAM 27 | apagada |
| p230–p231 | Vender agora era perder vinte. | — | VENDER +20, ONTEM 40 riscado | — |
| p237 | Hoje, era o ferro. | — | EM ALTA HOJE: FERRO +50%; ferro ×0, cobre ×1 · 20 | — |
| p240 | Dia quatro. | — | SALDO 14 · DIA 4 DE 30 | acesa, sem feixe (vila) |
| p241 | Onze segundos de luz. | 11,0 fixo | moedas 0 | acende com feixe |
| p242 | Pedra, pedra, pedra. | 10,8 → 8,0 | moedas 0 → 3 | acesa com feixe |
| p243 | Seis segundos. | 7,0 → 6,0 | moedas 3 → 4 | (gameplay) |
| p244 | E um bloco diferente, | 6,0 → 5,6 | moedas 4 | (gameplay) |
| p245 | com uma ampulheta. | 5,6 → 5,2 | moedas 4 | acesa com feixe |
| p246 | Crac. | 5,2 → 5,0 | moedas 4 | acesa com feixe |
| p247 | Dois segundos de presente. | 5,0 → 7,0 (+2 s) | — | — |
| p248 | Foi nesses dois que achou o veio. | 2,0 → 1,6 | moedas 6 | acesa com feixe |
| p249 | Cobre. Cobre. Cobre. | 1,6 → 0,4 | moedas 6; cobre 1 → 4 | pisca a partir de 1,0 |
| p250 | Apagou. | 0,4 → 0,0 | — | falha → apaga em 0,0 |
| p251 | Quatro pepitas na mochila. | — | cobre 4 | — |
| p252 | Noite quatro. Mercado. | — | SALDO 20 · DIA 4 · RESTAM 26; Cobre **NORMAL 40** | — |
| p253–p254 | Em alta hoje: cobre. / Sessenta moedas cada. | — | EM ALTA HOJE: COBRE +50%; **NORMAL 40 → 60** | — |
| p255 | Quatro pepitas, duzentos e quarenta. | — | cobre ×4; VENDER +240 | — |
| p256 | Quase um quarto da meta. | — | SALDO 20 · DIA 4 · COBRE 24% · RESTAM 26 | — |
| p259 | A Dona Coruja quer quatro cobres. | — | Dona Coruja · amizade 0 · pedido **4/4 Cobre** | — |
| p260–p262 | Paga cento e sessenta. … vira amigo. | — | +160; ENTREGAR 160 × VENDER 240; amizade 0 → 1 | — |
| p264 | Faltam vinte e seis dias. | — | RESTAM 26 | — |
| p266–p267 | ou vende tudo hoje na alta? / Curte pra parte três. | — | — | apagada; a lanterna apaga depois de "três" |

### 12.5 Lições desta rodada
1. **A conta na tela tem que fechar para quem vê.** "20 → 60" com "+50%" não fecha (50% de 20 é 30): o painel passou
   a mostrar "NORMAL 40 → 60". Antes de animar, confira cada número contra a fala e contra o plano anterior.
2. **Cartão SALDO × META é um helper único desde o primeiro briefing.** Na Parte 3, um só helper
   alimentado pela tabela canônica, usado por todos os animadores.
3. **Cortes entre planos de animadores diferentes precisam de parâmetros compartilhados** (enquadramento, câmera,
   recorte do gameplay, estado do painel no último/primeiro quadro). O p258 → p259 pulava de recorte e deixava letras
   na borda. `--cs-transicoes` mostra os pares de corte: use no teste.
4. **Número só entra na palavra**, inclusive em painel redesenhado sobre gameplay real (preço, contador, pedido):
   nada aparece antes de ser dito.
5. Legenda com número por extenso fica num bloco só (ex.: "EM 1929," desde o "Em"); se a cena precisa do número no
   fim da fala, resolve-se na cena (contador que gira e trava na palavra), não na legenda.
6. Caracteres especiais na legenda: a Anton tem ×, −, →, ·, mas o "×" é do tamanho de minúscula. Prefira palavras.
