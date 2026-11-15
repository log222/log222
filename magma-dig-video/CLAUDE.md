# MAGMA DIG · série de Reels

Reel vertical 1080×1920, 30 fps, ~2 min, que conta em série a história do Zeca, o tatu minerador do MAGMA DIG
(jogo pago de iPhone do usuário, dev solo de Uberlândia). Vídeo promocional. Parte 1 pronta e aprovada.

**Leia `docs/PRODUCAO.md` antes de qualquer coisa.** Ele tem o passo a passo do episódio, os briefings, a tabela
canônica, a lista de verificação e as pendências com o usuário.

## Preferências do usuário
- Trabalho feito por subagentes Opus; a sessão principal só orquestra. Retome o mesmo agente (SendMessage).
- Relatórios em PT-BR, curtos.
- Zeca de corpo inteiro atuando, não só a cabeça.
- Voz gratuita: Qwen3-TTS `narrador-jovem` (Apache-2.0), com pausas reais em toda vírgula e na norma do português.
  Kokoro foi rejeitado.
- O gancho do repositório exige commit e push a cada parada: faça checkpoints frequentes no branch.

## Regras que não podem ser quebradas
- Ids de plano da Parte N = `N01…` (`scenes/planos/p201.js`). Nunca mexa nos `p01…p57` da Parte 1.
- Voz definida ANTES de animar; tudo nos planos em função de `ctx.dur`, `ctx.words` e `ctx.marks`. Movimento até o último quadro.
- Cronômetro nunca sobe num corte (tabela canônica por episódio). Contador com ícone de moeda; cada pedra paga 1 moeda na hora.
- Lanterna: na mina com cronômetro > 0, acesa com feixe; pisca perto de 1,0; apaga em 0,0. O feixe não cruza painel, texto nem rosto.
- Zona do Instagram: nada essencial em y < 250 nem y > 1500; botões da direita em x > 960 só entre y ≈ 1000 e 1500. Legenda em y = 1400, nunca sobre o rosto.
- Pausas: fim de frase 0,55 s, fragmento curto 0,38 s, dois-pontos 0,45 s, vírgula ≥ 0,28 s. Nunca acelerar a voz.
- Fatos do jogo da versão 1.3 (dias de 10 s, 9 minas A–I). Recurso mostrado tem que ser real. Nenhum personagem do jogo como vilão. Nada de prometer dinheiro real.
- Sem clonar voz de pessoa real; só licenças com uso comercial.
- Só `art/` é do diretor de arte; animadores só criam os seus `scenes/planos/pN##.js`.
- "Corrigido" só vale com quadro do render oficial (`make_video.py … --plano pN## --rascunho`).
- Um processo pesado por vez (voz OU render): 4 núcleos, 15 GB de RAM. Apague `build/*/runs/` antigos.

## Instalação (container efêmero: `.cache/` não sobrevive)
```
./setup.sh              # pipeline (~1,9 GB)
tools/voz/instalar.sh   # vozes (~16,5 GB, demorado)
```
