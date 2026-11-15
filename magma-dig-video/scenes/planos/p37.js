/* p37 · "Porque braço forte não serve de nada no escuro." (C2) — frase-tese.
 * 1ª metade ("braço forte"): um braço enorme dobrado mostrando o muque, silhueta clássica de bíceps em contraluz; o bíceps
 *   infla e brilha na palavra FORTE.
 * 2ª metade ("não serve de nada no escuro"): a picareta aparece no punho, o golpe desce e erra (CRAC cinza, faísca fraca no vazio);
 *   em ESCURO a luz de recorte some e só sobram os olhos do Zeca. */
MD.plano("p37", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 2.8;
    const tB = GA.w(ctx, "braco", 0, D * 0.12), tF = GA.w(ctx, "forte", 0, D * 0.3), tN = GA.w(ctx, "nao", 0, D * 0.45), tE = GA.w(ctx, "escuro", 0, D * 0.85);
    const imp = tN + 0.42;
    // câmera: empurrão lento contínuo + tranco no golpe
    const cam = ART.camera(t, { push: [1, 1.06], dur: D, hits: [imp], hitAmp: 12, cx: 700, cy: 900 });
    g.fillStyle = "#07060C"; g.fillRect(0, 0, 1080, 1920);
    const rim = 1 - ART.prog(t, tE - 0.05, tE + 0.35, "inQuad");
    const sobe = ART.prog(t, 0, Math.max(0.2, tB), "outCubic");
    const pump = ART.clamp(ART.prog(t, tF - 0.08, tF + 0.12, "outBack") - ART.prog(t, tN, tN + 0.2) * 0.6);
    const pk = ART.prog(t, tN - 0.05, tN + 0.1);
    const giro = ART.kf(t, [[tN, 0], [tN + 0.22, -14, "outCubic"], [imp, 26, "inQuart"], [imp + 0.3, 22, "outCubic"]]);
    const pulso = ART.kf(t, [[tN, 0], [tN + 0.22, -10, "outCubic"], [imp, 140, "inQuart"], [imp + 0.3, 134, "outCubic"]]);
    const cor = ART.mix("#07060C", "#1E1830", 0.15 + 0.85 * rim);
    let R = null;
    ART.withLayer(g, cam, 1, gg => { R = ART.obj.muque(gg, t, { x: 1110, y: 1010 + (1 - sobe) * 300, s: 1.0, rim, pump, giro, picareta: pk, pulso, cor }); });
    // rastro do golpe: eco translúcido do braço um pouco atrás no arco
    if (t > tN + 0.22 && t < imp + 0.12) ART.withLayer(g, cam, 1, gg => { gg.save(); gg.globalAlpha = 0.22; ART.obj.muque(gg, t, { x: 1110, y: 1010, s: 1.0, rim: rim * 0.6, giro: giro - 14, picareta: pk, pulso: pulso - 30, cor }); gg.restore(); });
    // erra: faísca fraca no vazio + CRAC cinza
    if (R && R.ponta && t >= imp) {
      const [px, py] = R.ponta;
      const sp = ART.burst(t, { t0: imp, count: 8, x: px, y: py, speed: [150, 380], angle: [-160, -20], gravity: 900, life: [0.15, 0.35], seed: 5 });
      g.save(); g.globalCompositeOperation = "lighter"; for (const p of sp) { g.globalAlpha = p.alpha * 0.6 * rim + 0.1; g.strokeStyle = "#BDB6D6"; g.lineWidth = 3; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - 10, p.y + 6); g.stroke(); } g.restore();
      ART.ui.crac(g, Math.max(260, px + 60), py - 120, t, imp, { apagado: true, s: 1.1, dur: 1.3, rot: 8 });
    }
    // Zeca: só os olhos no breu (aparece quando o golpe começa)
    const zk = ART.prog(t, tN, tN + 0.3);
    if (zk > 0) ART.withLayer(g, cam, 1, gg => { gg.save(); gg.globalAlpha = zk; ART.zeca.drawEscuro(gg, ART.zeca.pose("parado", t, { x: 770, y: 1320, s: 0.8, turn: -0.4, alvo: [300, 1100], eyes: t > imp ? "espanto" : "aberto" }), 0.97); gg.restore(); });
    ART.post(g, ctx.frame, { vinheta: 0.65 });
  },
});
