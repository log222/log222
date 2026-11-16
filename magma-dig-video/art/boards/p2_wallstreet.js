/* Parte 2 — inserto em linhas ciano: especulação e Wall Street (C6, planos 219–229). Um segundo por momento:
 * 0 p220 pata + moeda + seta · 1 p221 carimbo ESPECULAÇÃO · 2 p222 vira o Zeca com a pepita · 3 p223 1921 -> 1929 + WALL STREET
 * 4 p224 sobe até 381, ×6 · 5 p225 moedas emprestadas · 6 p226 despenca até 41, −89% · 7 p227 pan para 1987
 * 8 p228 degrau, SEGUNDA-FEIRA NEGRA · 9 p229 −22,6% e as linhas se apagam */
/* Correção: 10 eixo de anos aceso só no 1921/1929, textoEscala 1.4, −89% em posQueda [790,455] · 11 1987 com textoEscala 1.4 */
ART.boards.p2_wallstreet = { dur: 12, render(g, t, f) {
  const seg = Math.min(11, Math.floor(t)), u = t - seg, P = ART.prog, C = ART.ciencia, GL = C.grafLinha, pico = GL.PICO;
  if (seg <= 2) {
    C.especulacao(g, t, { pata: seg === 0 ? P(u, 0, 0.8) : 1, seta: seg === 0 ? P(u, 0.5, 1) : 1, setaPulso: seg === 1 ? 1 : 0, carimbo: seg === 1 ? P(u, 0, 0.8) : seg === 2 ? 1 - P(u, 0, 0.3) : 0, zeca: seg === 2 ? P(u, 0.1, 0.9) : 0 });
  } else {
    const o = { regua: 1, wallStreet: 1, contador: true };
    if (seg === 3) Object.assign(o, { prog: ART.lerp(0, GL.anoProg(1929), P(u, 0, 1)), regua: P(u, 0, 0.3), wallStreet: P(u, 0, 0.3), zoom: ART.lerp(1.25, 1, P(u, 0, 1, "inOutSine")), foco: [300, 900] });
    if (seg === 4) Object.assign(o, { prog: ART.lerp(GL.anoProg(1929), pico, P(u, 0, 0.6)), x6: P(u, 0.5, 0.9) });
    if (seg === 5) Object.assign(o, { prog: pico, x6: 1, emprestado: P(u, 0, 0.9), zoom: ART.lerp(1, 1.15, P(u, 0, 1)), foco: [540, 1180] });
    if (seg === 6) Object.assign(o, { prog: ART.lerp(pico, 1, P(u, 0, 0.75, "inCubic")), x6: 1 - P(u, 0, 0.2), emprestado: 1 - P(u, 0, 0.2), queda: P(u, 0.6, 0.95) });
    if (seg === 7) Object.assign(o, { prog: 1, queda: 1, pan: P(u, 0, 0.8), rotulo87: P(u, 0.4, 0.8), prog87: P(u, 0.5, 1) * 0.55 });
    if (seg === 8) Object.assign(o, { prog: 1, queda: 1, pan: 1, rotulo87: 1, prog87: ART.lerp(0.55, 1, P(u, 0, 0.7)), segunda: P(u, 0.4, 0.8) });
    if (seg === 10) Object.assign(o, { prog: 1, x6: 0, queda: 1, emprestado: 1, eixoAnos: { 1921: 1, 1929: P(u, 0, 0.5) }, textoEscala: 1.4, posQueda: [790, 455] });
    if (seg === 11) Object.assign(o, { prog: 1, queda: 1, pan: 1, rotulo87: 1, prog87: 1, segunda: 1, queda87: 1, textoEscala: 1.4 });
    if (seg === 9) Object.assign(o, { prog: 1, queda: 1, pan: 1, rotulo87: 1, prog87: 1, segunda: 1, queda87: P(u, 0, 0.4), apaga: P(u, 0.55, 1), zoom: ART.lerp(1, 1.1, P(u, 0, 0.5)), foco: [470, 815] });
    GL(g, t, o);
  }
  ART.post(g, f, { legenda: true, legendaK: 0.25, vinheta: 0.55 });
}};
