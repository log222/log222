/* Parte 2 — aba CLIENTES e a Dona Coruja (C3/C5, planos 258–265). Um segundo por momento:
 * 0 p258 imagem real (shot_5) com valores tapados, push-in · 1 p259 cartão redesenhado, ela pisca · 2 p260 +160 acende
 * 3 p261 barras ENTREGAR 160 × VENDER 240 · 4 p262 amizade 0 -> 1, ela sorri · 5 p263 linha de bônus · 6 p265 pata sobre ENTREGAR
 * 7 retrato grande (conferência) */
ART.boards.p2_clientes = { dur: 8, async setup() { await ART.gameplay.preloadShot("shot_5"); }, render(g, t, f) {
  const seg = Math.min(7, Math.floor(t)), u = t - seg, P = ART.prog, U = ART.ui;
  if (seg === 0) { ART.gameplay.cheio(g, u, Object.assign({}, ART.gameplay.PRESET.clientes, { dur: 1 })); ART.post(g, f, { legenda: true, vinheta: 0.4 }); return; }
  ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: f, legenda: false });
  if (seg === 7) { U.titulo(g, 540, 330, "DONA CORUJA", { s: 0.8 }); U.coruja(g, 540, 800, 620, { t, sorriso: u > 0.5 ? 1 : 0.3 }); ART.post(g, f, { legenda: true, vinheta: 0.5 }); return; }
  U.titulo(g, 540, 330, "CLIENTES", { s: 0.9 });
  if (seg === 3) {
    U.barrasComparar(g, { k: P(u, 0, 0.9), itens: [{ rotulo: "ENTREGAR", valor: 160, cor: "#8E7BE0" }, { rotulo: "VENDER", valor: 240, cor: "#FFD23F" }], base: 1130 });
    ART.post(g, f, { legenda: true, vinheta: 0.5 }); return;
  }
  const o = { t, amizade: 0, recompensa: 160, pedido: { tem: 0, precisa: 4, tipo: "cobre", nome: "Cobre" }, sorriso: 0.3 };
  if (seg === 2) o.recompensaK = P(u, 0, 0.5);
  if (seg === 4) { o.amizade = P(u, 0.1, 0.7, "inOutCubic") + (u > 0.7 ? 0.0001 : 0); o.amizade = u >= 0.7 ? 1 : o.amizade; o.amizadePulso = ART.pulse(u, 0.65, 0.3); o.sorriso = 0.3 + 0.7 * P(u, 0.6, 0.8); }
  if (seg >= 5) { o.amizade = 1; o.sorriso = 1; o.bonus = seg === 5 ? P(u, 0, 0.4) : 1; o.brilhoBonus = seg === 5 ? Math.sin(Math.PI * P(u, 0, 1)) : 0; }
  if (seg === 6) o.botaoK = 1;
  const c = U.cartaoCliente(g, 540, 720, Object.assign(o, { s: 1 }));
  if (seg === 6) ART.pata(g, c.botao[0] + 40 + Math.sin(t * 2) * 6, c.botao[1] + 150 + Math.sin(t * 2.6) * 8, -50, { s: 0.85, dedos: "aponta" });
  ART.post(g, f, { legenda: true, vinheta: 0.5 });
}};
