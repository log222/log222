/* p204 · C4 Toca · "Vocês mandaram segurar."  (previamente: noite 2, o mesmo quadro do p56)
 * Plano médio: o Zeca sentado na cama, coberto, abraçado à pepita, a seta de giz com "?" na parede (2 tracinhos
 * riscados). Palavras amarelas SEGURA, de vários tamanhos, sobem do pé da cama como balões e somem no teto (sempre
 * pela esquerda, longe do rosto). No "segurar" ele aperta a pepita contra o peito e sorri; no fim os olhos pesam
 * (emenda com o p205, em que já dorme). Câmera parada com leve deriva lateral. */
MD.plano("p204", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tVo = GB.wt(ctx, "voces", 0.05), tSeg = GB.wt(ctx, "segurar", 0.9);
    const cena = GB2.toca({ lamp: 0.25, janela: 0.9, porta: false });
    const cam = ART.camera(t, { push: [2.3, 2.34], dur, ease: "linear" });
    GB.mira(cam, 1, ART.map(t, 0, dur, 862, 880), 955, 540, 820);
    const S = GB2.SETA;
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 2, seta: 1 }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { lamp: 0.25, janela: 0.9 });
        const [ax, ay, z] = GB.proj(c, 0.8, ...GB.gizMundo(S.x, S.y - S.h / 2));
        ART.glow(gg, ax, ay, 240 * z, "#7CFF8A", 0.12 + 0.05 * Math.sin(tt * 3));
      },
    });
    // Zeca sentado na cama, abraçado à pepita (pose do p56)
    const C = GB2.CAMA, [zx, zy, zf] = GB2.tela(cam, C.x, C.y);
    const aperta = GB.hit(t, tSeg + 0.05, 0.7);
    const pesa = clamp((t - (dur - 0.55)) / 0.4);
    const p = ART.zeca.pose("sentado", t, {
      x: zx, y: zy, s: C.s * zf, turn: -0.35, lamp: 0, shadow: 0,
      aF: 48 - 10 * aperta, eF: 92 + 14 * aperta, aB: 44 - 8 * aperta, eB: 92 + 10 * aperta, bFrente: 1, segura: "pepita",
      banho: { cor: "#FF8A3C", k: 0.7 }, rim: "#9FB4FF", rimA: 0.6, sq: 1 - 0.04 * aperta,
      eyes: t > tSeg && t < tSeg + 0.55 ? "feliz" : "aberto", blink: 0.6 * pesa + 0.3 * pesa * Math.sin(t * 9) ** 2, mouth: "sorriso", brows: "nenhum",
      alvo: pesa > 0.2 ? null : [zx - 340, zy - 420 + 120 * Math.sin(t * 1.3)], look: [0.1, 0.4],
      headTilt: 10 + 4 * Math.sin(t * 1.7) + 6 * pesa, headDy: 4 * pesa, blinkSeed: 0.4,
    });
    const A1 = ART.zeca.draw(g, p);
    ART.cobertor(g, zx + 30 * zf, zy + 6 * zf, 300 * zf);
    const m = A1.mao || { x: zx, y: zy - 100 }, pul = 0.85 + 0.15 * Math.sin(t * 5);
    ART.glow(g, m.x, m.y, 330 * zf, "#FF8A3C", 0.3 * pul);
    ART.glow(g, m.x, m.y, 60 * zf, "#FFE0B0", 0.35 * pul);
    ART.post(g, ctx.frame, { legendaK: 0.4 });
    // balões SEGURA: nascem no pé da cama (esquerda do quadro) e sobem até o teto
    const N = 8, r = ART.rng(204), FAIXAS = [300, 190, 390, 240, 350, 210, 330, 270];   // centro de cada balão, longe da borda e do rosto
    for (let i = 0; i < N; i++) {
      const t0 = tVo - 0.3 + (i / N) * (dur + 0.25), vida = 1.35 + 0.1 * (i % 3), k = (t - t0) / vida;
      const sc = 0.55 + r() * 0.6, x0 = FAIXAS[i], rot = (r() - 0.5) * 0.22, dx = (r() - 0.5) * 30;
      if (k <= 0 || k >= 1) continue;
      const y = ART.lerp(1230, 400, ART.ease.outSine(k)), x = x0 + dx * k + 14 * Math.sin(k * 7 + i);
      const a = clamp(k / 0.12) * (1 - clamp((k - 0.7) / 0.3));
      GB2.balao(g, "SEGURA", x, y, sc * (k < 0.1 ? ART.ease.outBack(k / 0.1) : 1) * (1 + 0.15 * GB.hit(t, tSeg, 0.4)), a, { rot });
    }
  },
});
