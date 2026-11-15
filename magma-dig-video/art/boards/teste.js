/* Teste de movimento (7 s): Zeca dá picaretadas, o bloco racha em 3 estágios e estoura no 4º golpe;
 * CRAC! a cada golpe, cronômetro do dia correndo, contador de saque, empurrão de câmera com parallax. */
ART.boards.teste = (() => {
  const Z = ART.zeca, UI = ART.ui;
  const PER = 0.9, T0 = 0.45, IMP = 0.66;                 // ciclo do golpe
  const HITS = [0, 1, 2, 3].map(i => T0 + PER * (i + IMP)); // instantes de impacto
  const BURST = HITS[3];
  const BX = 0.15, BZ = 2.9;                               // bloco
  const front = () => [ART.proj(BX, 1, BZ), ART.proj(BX + 1, 1, BZ), ART.proj(BX + 1, 0, BZ), ART.proj(BX, 0, BZ)];
  const zecaPose = t => {
    const base = { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: 1, cone: 0.38, coneAng: 14, coneLen: 600, rim: "#FFC88A", rimA: 0.5 };
    if (t < T0) return Z.pose("parado", t, { ...base, eyes: "determinado", brows: "bravo", tool: "picareta", aF: 40, eF: 10, aB: 26, eB: 14 });
    const dig = Z.pose("cavando", t, base, { periodo: PER, t0: T0 });
    if (t < BURST + 0.25) return dig;
    const cel = Z.pose("comemorando", t - BURST, { ...base, tool: "picareta", turn: 0.55 });
    return Z.mix(dig, cel, ART.prog(t, BURST + 0.25, BURST + 0.45, "inOutQuad"));
  };
  return {
    dur: 7,
    render(g, t, frame) {
      const cena = ART.cenas.mina({ luz: 1 });
      const cam = ART.camera(t, { push: [1.0, 1.16], dur: 7, drift: [50, -20], hits: [...HITS.slice(0, 3), BURST, BURST + 0.05], hitAmp: 13, cy: 1050 });
      const hitsDone = HITS.filter(h => t >= h).length;
      const stage = hitsDone === 0 ? 0 : Math.min(3, (hitsDone - 1) + ART.prog(t, HITS[hitsDone - 1], HITS[hitsDone - 1] + 0.08) * 1);
      const nOres = 7;
      let coins = 0, anchors = null;
      ART.palco(g, t, cam, cena, gg => {
        // bloco (some no estouro)
        if (t < BURST) {
          const sq = 1 - 0.035 * ART.pulse(t, HITS[Math.max(0, hitsDone - 1)], 0.16);
          gg.save(); const c = ART.proj(BX + 0.5, 0, BZ); gg.translate(c[0], c[1]); gg.scale(sq, 1 / sq * 0.995 + 0.005); gg.translate(-c[0], -c[1]);
          ART.cubo(gg, BX, BZ, { crack: stage, seed: 4, ores: [{ tipo: "cobre", u: 0.72, v: 0.32, r: 0.07, seed: 3 }, { tipo: "prata", u: 0.25, v: 0.7, r: 0.07 }], crackGlow: stage > 2.5 ? "#FFE2A0" : null });
          gg.restore();
        } else {
          // chão onde estava o bloco: buraquinho de sombra
          const q = [ART.proj(BX, 0, BZ + 1), ART.proj(BX + 1, 0, BZ + 1), ART.proj(BX + 1, 0, BZ), ART.proj(BX, 0, BZ)];
          gg.save(); gg.globalAlpha = ART.prog(t, BURST, BURST + 0.3); ART.poly(gg, q); gg.fillStyle = "rgba(10,8,14,.55)"; gg.fill(); gg.restore();
        }
        anchors = Z.draw(gg, zecaPose(t));
        // lascas pequenas a cada golpe
        for (let i = 0; i < 3; i++) {
          const ps = ART.burst(t, { t0: HITS[i], count: 10, x: 640, y: 1000, speed: [260, 700], angle: [-170, -40], gravity: 2200, life: [0.35, 0.7], seed: 30 + i, size: [8, 16] });
          for (const p of ps) { gg.save(); gg.globalAlpha = p.alpha; gg.translate(p.x, p.y); gg.rotate(p.rot / 57); gg.fillStyle = p.i % 2 ? "#BAAB87" : "#76756A"; gg.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7); gg.restore(); }
          ART.glow(gg, 640, 1000, 120, "#FFE6B0", 0.8 * Math.max(0, 1 - (t - HITS[i]) / 0.12) * (t >= HITS[i] ? 1 : 0));
        }
        ART.estouro(gg, t, { t0: BURST, front: front(), seed: 8 });
      }, { frame, post: false });
      // minérios voando até o contador (em coordenadas de tela, fora da câmera)
      const fr = front(), c0 = [(fr[0][0] + fr[2][0]) / 2, (fr[0][1] + fr[2][1]) / 2];
      coins = ART.oresVoando(g, t, { t0: BURST + 0.05, de: c0, ate: [250, 340], n: nOres, tipos: ["prata", "cobre", "prata", "ouro"], r: 26, dur: 1.0 });
      for (let i = 0; i < 3; i++) UI.crac(g, 650 + i * 18, 900 - i * 10, t, HITS[i], { s: 0.95, rot: -8 + i * 5 });
      UI.crac(g, 690, 860, t, BURST, { s: 1.35, rot: -4 });
      // pós (vinheta, faixa de legenda, grão) antes da UI
      ART.post(g, frame, {});
      // HUD: cronômetro + contador
      const v = Math.max(0, 10 - Math.max(0, t - 0.3));
      const intro = ART.prog(t, 0.05, 0.35, "outBack");
      g.save(); g.translate(790, 340); g.scale(intro, intro); UI.cronometro(g, 0, 0, { valor: v, icone: "sol", s: 0.9 }); g.restore();
      const lastArr = coins > 0 ? BURST + 0.05 + (coins - 1) * 0.07 + 1.0 : -9;
      g.save(); g.translate(260, 340); g.scale(intro, intro); UI.contador(g, 0, 0, { valor: hitsDone >= 3 ? 3 + coins : hitsDone, icone: "moeda", pulso: Math.max(ART.pulse(t, lastArr, 0.25), ...HITS.slice(0, 3).map(h => ART.pulse(t, h + 0.05, 0.25))) }); g.restore();
      for (let i = 0; i < 3; i++) UI.flutua(g, 400, 470, t, HITS[i] + 0.05, { texto: "+1", s: 0.7 });
    },
  };
})();
