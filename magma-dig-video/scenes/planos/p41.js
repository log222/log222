/* p41 · "Um segundo. Sete." (C3) — golpes em sequência; o cronômetro desenhado cresce para o centro (zoom nele):
 * 1,8 → 1,0, chega a 1,0 na palavra UM e congela, em vermelho. Contador 7 na palavra SETE. */
MD.plano("p41", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(3.0, 4.6); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.23, tU = GA.w(ctx, "um", 0, 0.04), tS = GA.w(ctx, "sete", 0, D * 0.6);
    const tU2 = Math.max(tU, 0.35), val = t >= tU2 ? 1.0 : ART.lerp(1.8, 1.0, ART.clamp(t / tU2));
    ART.gameplay.cheio(g, t, { de: 3.0, ate: 4.5, dur: D, foco: [720, 350], zoom: [1.2, 1.35], tom: "rgba(80,10,20,.12)" });
    const z = ART.prog(t, 0, Math.min(0.5, D * 0.5), "inOutCubic");
    ART.ui.cronometro(g, ART.lerp(790, 540, z), ART.lerp(370, 640, z), { valor: val, escala: 11, fantasma: 10, icone: "sol", s: ART.lerp(0.9, 1.9, z), alerta: 1.0 });
    GA.hud(g, t, { y: 370, moedas: t >= tS ? 7 : 6, pulso: ART.pulse(t, tS, 0.3) });
    ART.post(g, ctx.frame, { vinheta: 0.55, legendaK: 0.32 });
  },
});
