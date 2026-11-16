/* Parte 2 — bloco especial de ampulheta (C2/C3, planos 244–247). Um segundo por momento:
 * 0 p244 imagem real (shot_1) com push-in no bloco · 1 p245 o feixe acha o bloco (escuro -> claro) · 2 p246 golpe: estoura em areia dourada
 * 3 p246→247 a areia converge para o cronômetro · 4 close do bloco (conferência do desenho) */
ART.boards.p2_ampulheta = { dur: 5, async setup() { await ART.gameplay.preloadShot("shot_1"); }, render(g, t, f) {
  const seg = Math.min(4, Math.floor(t)), u = t - seg, P = ART.prog, Z = ART.zeca, BX = 0.15, BZ = 2.9;
  if (seg === 0) {
    ART.gameplay.cheio(g, u, Object.assign({}, ART.gameplay.PRESET.ampulheta, { dur: 1, cronometro: { valor: ART.lerp(6, 5.6, u), max: 11, escala: 11 } }));
    ART.post(g, f, { legenda: true, vinheta: 0.4 }); return;
  }
  const cam = ART.camMais(ART.enquadrar(seg === 4 ? 742 : 640, seg === 4 ? 1087 : 980, seg === 4 ? 3.0 : 2.1, { sy: seg === 4 ? 860 : 820 }), ART.camera(u, { push: [1, 1.04], dur: 1, hits: seg === 2 ? [0.15] : [], hitAmp: 24, hitDur: 0.4 }));
  const hit = 0.15;
  ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
    const vivo = !(seg === 2 && u >= hit) && seg !== 3;
    let res = null;
    if (vivo) res = ART.cubo(gg, BX, BZ, { especial: "ampulheta", t, brilho: seg === 1 ? P(u, 0.3, 0.8) : 0.8, escuro: seg === 1 ? 0.6 * (1 - P(u, 0, 0.6)) : 0, crack: seg === 2 ? 1.5 * P(u, 0.05, hit) : 0, seed: 9 });
    if (seg !== 4) Z.draw(gg, Z.pose(seg === 2 && u < 0.5 ? "cavando" : "parado", seg === 2 ? u + 0.42 : t, { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: 1, cone: 0.7, eyes: seg === 1 && u > 0.5 ? "espanto" : undefined, banho: { cor: "#FFD23F", k: 0.5 } }, { periodo: 0.9, t0: 0 }));
    const fr = [ART.proj(BX, 1, BZ), ART.proj(BX + 1, 1, BZ), ART.proj(BX + 1, 0, BZ), ART.proj(BX, 0, BZ)];
    if (seg === 2) ART.estouroAreia(gg, u, { t0: hit, front: fr, seed: 9 });
  }, { frame: f });
  if (seg === 3) { // em px de tela: centro do bloco pela câmera -> cronômetro
    const tela = (X, Y) => { const z = cam.zoom; return [540 + cam.sx + (X - 540 - cam.x) * z, 960 + cam.sy + (Y - 960 - cam.y) * z]; };
    const c = ART.proj(BX + 0.5, 0.5, BZ), cs = tela(c[0], c[1]), tam = (ART.proj(BX + 1, 0.5, BZ)[0] - ART.proj(BX, 0.5, BZ)[0]) * cam.zoom;
    ART.estouroAreia(g, u + 0.6, { t0: hit, centro: cs, tam, seed: 9, alvo: [790, 330], tAlvo: 0.7 });
  }
  if (seg === 2) ART.ui.crac(g, 600, 700, u, hit, { s: 1.6, cor: "#FFD23F" });
  if (seg !== 4) { g.save(); g.translate(790, 330); ART.ui.cronometro(g, 0, 0, { valor: seg === 1 ? ART.lerp(5.6, 5.2, u) : seg === 2 ? ART.lerp(5.2, 5.0, u) : 5.0, max: 11, escala: 11, icone: "sol", s: 0.9 }); g.restore(); }
}};
