/* Parte 2 — Mercado com queda e alta (C5). Cada segundo da prancha é um momento do roteiro:
 * 0 p206 seta gira · 1 p209–210 40 riscado rola até 20 · 2 p230–231 VENDER +20 com 40 fantasma · 3 p235 seta fantasma "?"
 * 4 p236–238 faixa EM ALTA (vazia -> FERRO) + linhas · 5 p253–254 faixa COBRE + 20 rola até 60 · 6 p255 linha COBRE ×4 + VENDER +240
 * 7 p216 gráfico deslizando · 8 p217 barras sobe/desce/sobe + seta · 9 p203 etiqueta 40 racha -> 20 */
/* Correção: 10 NORMAL 40 riscado -> 60 (+50%), textoEscala, Toca sem "1.000", botaoSub null antes da palavra · 11 preço "?" ·
 * 12 linhas legíveis (textoEscala + moeda) · 13 pepita sem cintilas (brilho 0) · 14 Toca sem picareta na mesa */
ART.boards.p2_mercado = { dur: 15, render(g, t, f) {
  const seg = Math.min(14, Math.floor(t)), u = t - seg, P = ART.prog, M = ART.painelMercado, U = ART.ui;
  if (seg === 13) { ART.holofote(g, t, { cor: "#FFB070", k: 0.35 }); ART.obj.pepitaCobre(g, t, { y: 900, r: 160, k: 0.3, brilho: 0 }); ART.post(g, f, { legenda: true, vinheta: 0.5 }); return; }
  if (seg === 14) { ART.palco(g, t, { zoom: 1 }, ART.cenas.toca({ picareta: false, meta: false }), null, { frame: f }); return; }
  if (seg >= 10) {
    ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada({ meta: false }), null, { frame: f, legenda: false });
    const fx = { minerio: "cobre", nome: "Cobre" };
    if (seg === 10) M(g, t, { faixa: fx, precoAntes: 40, preco: 60, rola: P(u, 0.3, 0.95), rotuloAntes: "NORMAL", varPct: 50, varK: P(u, 0.6, 0.9), amanha: false, textoEscala: 1.35, botaoSub: u < 0.5 ? null : "+60 moedas" });
    if (seg === 11) M(g, t, { faixa: fx, preco: 60, precoTexto: "?", varPct: false, amanha: false, textoEscala: 1.35, botaoSub: null });
    if (seg === 12) M(g, t, { faixa: fx, botao: false, linhas: [{ tipo: "ferro", nome: "Ferro", qtd: 0, valor: 30, textoEscala: 1.3, moeda: true, a: 0.5 }, { tipo: "cobre", nome: "Cobre", qtd: 4, valor: 240, textoEscala: 1.3, moeda: true, destaque: true }] });
    ART.post(g, f, { legenda: true, vinheta: 0.5 }); return;
  }
  if (seg === 9) {
    ART.holofote(g, t, { cor: "#FFB070", k: 1 - 0.5 * P(u, 0.4, 0.8) });
    ART.obj.pepitaCobre(g, t, { y: 980, r: 130, k: 1 - 0.5 * P(u, 0.4, 0.8) });
    U.etiquetaPreco(g, 600, 620, { de: 40, para: 20, k: P(u, 0.05, 0.95), s: 1.2 });
    ART.post(g, f, { legenda: true, vinheta: 0.5 }); return;
  }
  ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: f, legenda: false });
  const B40 = [0.42, 0.5, 0.38, 0.55, 0.47, 0.6, 0.66];
  if (seg === 0) M(g, t, { preco: 40, varPct: 12, seta: 1, setaGiro: P(u, 0.15, 0.75), tremor: P(u, 0, 0.15) * (1 - P(u, 0.75, 0.9)) });
  if (seg === 1) {
    const k = P(u, 0.05, 0.95), hoje = ART.lerp(0.66, 0.33, P(k, 0.3, 0.85, "inOutCubic"));
    M(g, t, { precoAntes: 40, preco: 20, rola: k, varPct: -50, barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.66, hoje], corHoje: k > 0.5 ? "#E63748" : undefined, seta: 0 });
  }
  if (seg === 2) M(g, t, { precoAntes: 40, preco: 20, rola: 1, varPct: -50, barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.66, 0.33], corHoje: "#E63748", seta: 0, botaoPulso: P(u, 0, 0.3) });
  if (seg === 3) M(g, t, { precoAntes: 40, preco: 20, rola: 1, antesFantasma: 0, varPct: -50, barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.66, 0.33], corHoje: "#E63748", seta: 1, setaFantasma: P(u, 0.1, 0.6) });
  if (seg === 4) M(g, t, { faixa: { minerio: u > 0.45 ? "ferro" : null, nome: "Ferro", k: P(u, 0, 0.25), mk: P(u, 0.45, 0.65), brilho: P(u, 0.1, 0.5) }, botao: false,
    linhas: [{ tipo: "ferro", nome: "Ferro", qtd: 0, valor: 0, a: P(u, 0.45, 0.65) * 0.6 + 0.4 }, { tipo: "cobre", nome: "Cobre", qtd: 1, valor: 20, a: 0.45 + 0.55 * P(u, 0.7, 0.8), pulso: P(u, 0.7, 0.8) * (0.6 + 0.4 * Math.sin(t * 9)) }] });
  if (seg === 5) {
    const k = P(u, 0.35, 0.95), hoje = ART.lerp(0.33, 0.98, P(k, 0.3, 0.85, "inOutCubic"));
    M(g, t, { faixa: { minerio: "cobre", nome: "Cobre", k: P(u, 0, 0.2), mk: P(u, 0.1, 0.3), brilho: P(u, 0.05, 0.45) }, precoAntes: 20, preco: 60, rola: k, varPct: false, antesFantasma: 0,
      barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.33, hoje], amanha: false });
  }
  if (seg === 6) M(g, t, { faixa: { minerio: "cobre", nome: "Cobre" }, linhas: [{ tipo: "cobre", nome: "Cobre", qtd: 4, valor: 240, destaque: true, pulso: 0.6 + 0.4 * Math.sin(t * 6) }], botaoSub: "+240 moedas", preco: 60, botaoPulso: 1 });
  if (seg === 7) {
    U.titulo(g, 540, 330, "MERCADO", { s: 0.9 });
    U.cartao(g, 90, 470, 900, 620, { vidro: true, r: 36, cor: "rgba(28,24,44,.72)" });
    const bs = [0.42, 0.5, 0.38, 0.55, 0.47, 0.6, 0.66, 0.4, 0.7, 0.52, 0.3, 0.62];
    U.grafico7(g, 150, 560, 780, 440, { barras: bs, desliza: u * 4.6, janela: 7 });
  }
  if (seg === 8) {
    U.titulo(g, 540, 330, "MERCADO", { s: 0.9 });
    U.cartao(g, 90, 470, 900, 620, { vidro: true, r: 36, cor: "rgba(28,24,44,.72)" });
    U.grafico7(g, 190, 640, 520, 380, { barras: [0.85, 0.35, 0.9], cores: ["#5FD35F", "#E63748", "#5FD35F"], amanha: false, prog: P(u, 0, 0.9) });
    const fase = Math.min(2, Math.floor(u * 3)), dir = fase === 1 ? "baixo" : "cima";
    U.seta(g, 840, 800, { s: 1.2, dir });
  }
  ART.post(g, f, { legenda: true, vinheta: 0.5 });
}};
