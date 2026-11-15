/* p03 · GANCHO · "só dez segundos?" (C7)
 * Cronômetro gigante do jogo em 10,0 (na palavra "dez") despenca até 0,0 em menos de um segundo, no ritmo do tique-taque;
 * a barra amarela esvazia, fica vermelha no último segundo, treme no zero e a luz da lanterna morre: tela preta. */
MD.plano("p03", {
  async setup(ctx) { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.17;
    const tDez = GC.wt(ctx, "dez", 0.2), tSeg = GC.wt(ctx, "segundos", 0.52);
    const t0 = tDez + 0.02, t1 = Math.min(D - 0.2, Math.max(tSeg + 0.42, D - 0.32));   // zero perto do fim do plano, qualquer que seja a duração           // 10,0 -> 0,0
    const k = ART.prog(t, t0, t1);
    const v = 10 * (1 - Math.pow(k, 1.35));                                // acelera de leve
    const zero = t >= t1;
    const luz = zero ? ART.kf(t - t1, [[0, 0.3], [0.03, 0.7], [0.06, 0.04]]) : 0.3 + 0.7 * (v / 10);
    const apaga = ART.prog(t, t1 + 0.12, t1 + 0.17);                         // corte seco no preto
    // tique: o número dá um tranco a cada 0,25 s (tictac 240 bpm)
    const tt = t - GC.mark(ctx, "tictac", 0);
    const tick = tt >= 0 && !zero ? Math.pow(1 - ((tt % 0.25) / 0.25), 6) : 0;
    const z = ART.kf(t, [[0, 1.0], [t1, 1.13, "inQuad"], [D, 1.16]]);
    const sh = GC.shake(t, t1, 0.35, 26, 5);
    // fundo: rocha da mina no escuro, iluminada de cima pela lanterna que vai morrendo
    g.fillStyle = "#050409"; g.fillRect(0, 0, 1080, 1920);
    g.save(); GC.cam(g, 1 + (z - 1) * 0.4, 540, 800, sh.x * 0.4, sh.y * 0.4);
    const tex = ART.texVoronoi("p03pedra", { seed: 31, n: 26, cores: ["#57534F", "#4A4744", "#625D57"], junta: "#262422" });
    g.globalAlpha = 0.55 * luz; g.fillStyle = g.createPattern(tex, "repeat"); g.fillRect(-100, -100, 1280, 2120); g.globalAlpha = 1;
    g.fillStyle = ART.rg(g, 540, 640, 60, 1150, [[0, "rgba(5,4,9,0)"], [0.6, "rgba(5,4,9,.6)"], [1, "rgba(5,4,9,.97)"]]); g.fillRect(-100, -100, 1280, 2120);
    ART.beam(g, 540, -160, 90, 1500, 260, 1100, "#FFE2A0", 0.35 * luz);
    g.restore();
    // Zeca cavando sem parar embaixo do relógio; a lanterna dele morre junto com o tempo
    const CY = 520;
    g.save(); GC.cam(g, 1 + (z - 1) * 0.7, 540, CY, sh.x * 0.7, sh.y * 0.7);
    // UM golpe contínuo e lento ao longo do plano (sem trocar de pose quadro a quadro): impacto no meio da contagem
    const PER = Math.max(0.8, D * 0.85), tImp = (t0 + t1) / 2, cT0 = tImp - 0.66 * PER;
    // golpe próprio, sem levantar a picareta por trás da cabeça (o arco grande do kit lia como "virar de lado"):
    // sempre o mesmo lado (turn fixo), picareta sempre visível na frente
    const ph = ART.clamp((t - cT0) / PER);
    const aF = ART.kf(ph, [[0, 70], [0.5, 138, "outCubic"], [0.66, 72, "inQuart"], [1, 88, "inOutSine"]]);
    const eF = ART.kf(ph, [[0, 8], [0.5, -12], [0.66, 6, "inQuart"], [1, 8]]);
    const lean = ART.kf(ph, [[0, 3], [0.5, -6, "outCubic"], [0.66, 12, "inQuart"], [1, 6]]);
    const pz = ART.zeca.pose("cavando", t, { x: 650, y: 1285, s: 2.5, turn: -0.85, aF, eF, aB: aF - 14, eB: eF + 4, lean, headTilt: lean * 0.4, sq: 1 + 0.06 * ART.pulse(ph, 0.64, 0.1),
      lamp: luz, cone: 0.9 * luz, coneLen: 700, rim: "#FFB060", rimA: 0.4 * luz }, { periodo: PER, t0: cT0 });
    // bloco de pedra que ele acerta + faíscas em cada impacto (66% do ciclo)
    ART.rocha(g, 235, 1215, 105, 7);
    if (luz > 0.05) ART.zeca.draw(g, pz); else ART.zeca.drawEscuro(g, pz, 1);
    for (let n = 0; n < 1; n++) {
      const ti = tImp;
      const ps = ART.burst(t, { t0: ti, count: 18, x: 270, y: 1195, speed: [250, 650], angle: [-170, -40], gravity: 1600, life: [0.15, 0.35], seed: 40 + n });
      g.save(); g.globalCompositeOperation = "lighter";
      for (const q of ps) { g.globalAlpha = q.alpha * luz; ART.circ(g, q.x, q.y, 4); g.fillStyle = "#FFD27A"; g.fill(); }
      g.restore();
    }
    g.restore();
    // a cena escurece conforme o dia acaba
    g.fillStyle = `rgba(5,4,9,${0.55 * (1 - luz)})`; g.fillRect(0, 0, 1080, 1920);
    // cronômetro gigante
    g.save(); GC.cam(g, z * (1 + 0.04 * tick), 540, CY, sh.x, sh.y);
    if (!zero) ART.glow(g, 540, CY, 640, "#FFD23F", 0.2 * (v / 10));
    else ART.glow(g, 540, CY, 700, "#E63748", 0.45 * (1 - ART.prog(t, t1, t1 + 0.15)));
    ART.ui.cronometro(g, 530, CY, { valor: zero ? 0.002 : v, max: 10, s: 2.6, icone: "sol", alerta: 1.0 });
    g.restore();
    // poeira solta pelo tremor
    ART.dust(g, t, { count: 40, seed: 23, color: "#FFE6B0", alpha: 0.5 * luz, size: [2, 5], x: 60, w: 960, y: 200, h: 1000, speed: 40 });
    GC.post(g, ctx, { vinheta: 0.75, legendaK: 0.42 });
    if (apaga > 0) { g.fillStyle = `rgba(0,0,0,${apaga})`; g.fillRect(0, 0, 1080, 1920); }
  },
});
