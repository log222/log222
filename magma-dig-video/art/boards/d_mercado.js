/* C5 — painel do Mercado (cobre a 40, gráfico de 7 dias + barra de amanhã, seta) com a pata sobre VENDER. */
ART.boards.d_mercado = { dur: 3, render(g, t, f) {
  ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: f, legenda: false });
  ART.painelMercado(g, t, { seta: 1, setaSombra: 0.5, brilhoAmanha: 0.6 + 0.4 * Math.sin(t * 3) });
  ART.pata(g, 905 + Math.sin(t * 2) * 6, 985 + Math.sin(t * 2.6) * 8, -32, { s: 0.95, dedos: "aponta" });
  ART.post(g, f, { legenda: true, vinheta: 0.5 });
}};
