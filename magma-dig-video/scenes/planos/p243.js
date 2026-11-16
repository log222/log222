/* p243 · "Seis segundos." (C3) — imagem real do jogo (trailer 0–3 s, mina de pedra em 1ª pessoa), golpes rápidos com
 * corte no segundo golpe (aberto → mais perto). Cronômetro desenhado por cima: 7,0 → 6,0, chega em 6,0 na palavra SEIS
 * e fica. O 12,x original e os contadores do jogo ficam fora do recorte. */
MD.plano("p243", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    await ART.gameplay.preload(0.2, 2.6);
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 1.29, H = GA.ms(ctx, "picareta"); if (H.length < 2) H.push(...[0.05, D * 0.35].slice(H.length));
    const tS = ART.clamp(GA2.wFim(ctx, "segundos", 0, D), D * 0.6, D);   // 6,0 só no fim de SEGUNDOS (quase no corte)
    const cron = { valor: GA.cron(t, D, 0, 0, [[0, 7.0], [tS, 6.0], [D + 1, 6.0]]), max: 11, escala: 11 };
    const B = t >= H[1] - 0.02;
    const v = B ? ART.gameplay.cheio(g, t, { de: 1.3, ate: 2.5, dur: D, foco: [690, 320], zoom: [1.45, 1.55], cronometro: cron })
                : ART.gameplay.cheio(g, t, { de: 0.2, ate: 1.3, dur: D, foco: [620, 330], zoom: [1.05, 1.12], cronometro: cron });
    const p = v.map(640, 300);
    H.forEach((h, i) => ART.ui.crac(g, ART.clamp(p[0] + (i ? 50 : -60), 200, 880), ART.clamp(p[1] - 40, 520, 1100), t, h, { s: 1.05, rot: i ? 6 : -6, dur: 0.5 }));
    GA.hud(g, t, { y: 370, moedas: t >= H[1] ? 4 : 3, pulso: ART.pulse(t, H[1], 0.3) });   // pedra paga no 2º golpe
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
