# MAGMA DIG · série de Reels

Reel vertical 1080×1920, 30 fps, ~2 min, que conta em série a história do Zeca, o tatu minerador do MAGMA DIG
(jogo pago de iPhone do usuário, dev solo de Uberlândia). Vídeo promocional. Partes 1 e 2 prontas e aprovadas
(`out/parte-02-final.mp4`; o que mudou na Parte 2: `docs/PRODUCAO.md` §12).

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
- Um processo pesado por vez (voz OU render). Máquina atual: PC do dono (i7-13620H, 15,8 GB de RAM, poucos livres;
  RTX 4070 Laptop 8 GB). Apague `build/*/runs/` antigos.

## Instalação neste PC (Windows nativo, sem WSL, sem administrador; tudo em `.cache/`)
```
powershell -ExecutionPolicy Bypass -File setup-windows.ps1   # pipeline + voz (torch CUDA, Qwen Base 0.6B), ~10 GB
PY=.cache/venv/Scripts/python.exe        # pipeline
PYV=.cache/venv-voz/Scripts/python.exe   # vozes; gerar com VOZ_QWEN_DTYPE=fp32 (GPU, ~5 min o episódio)
```
`node art/tools/render.js` direto precisa de `NODE_PATH=.cache/node/node_modules` e
`PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright` (o `make_video.py` acha sozinho). Os `.sh` saem com CRLF no clone do
Windows: use o `setup-windows.ps1`. No container Linux antigo valia `./setup.sh` + `tools/voz/instalar.sh` (`bin/python`).
