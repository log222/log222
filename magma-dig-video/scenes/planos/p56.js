/* p56 · C4 Toca · "ou segura até amanhã e aposta na seta?"
 * Plano médio: o Zeca sentado na cama, coberto, abraçado à pepita de cobre (luz laranja no rosto).
 * "segura": aperta a pepita contra o peito; "amanhã": os olhos vão para a seta de giz na parede;
 * "aposta": olha de volta para a pepita, em dúvida; "seta": volta à seta, que brilha de leve. Sem resolver. */
MD.plano("p56", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tSeg = GB.wt(ctx, "segura", 0.2), tAm = GB.wt(ctx, "amanha", 0.92), tAp = GB.wt(ctx, "aposta", 1.4), tSeta = GB.wt(ctx, "seta", 2.04);
    const cena = GB.toca({ prog: 0, tracos: 0 }, { lamp: 0.25 });   // só tracinhos + seta (o 1.000 ficaria cortado no topo)
    const cam = ART.camera(t, { push: [2.3, 2.45], dur, ease: "linear" });
    GB.mira(cam, 1, ART.map(t, 0, dur, 868, 880), 955, 540, 820);
    // seta de giz na parede (à direita dos tracinhos, acima da cama)
    const SX = 350, SY = 215, SH = 220;
    const brilhoSeta = GB.hit(t, tAm + 0.05, 0.6) * 0.6 + GB.hit(t, tSeta + 0.05, 0.8);
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
        GB.tracinhos(w, { riscados: 2 });
        GB.gizSeta(w, SX, SY, SH, 1, { lw: 12, cor: "rgba(170,240,160,.95)", glow: "rgba(120,230,120,.6)" });
        GB.gizTexto(w, "?", SX + 70, SY - SH + 40, { size: 110, cor: "rgba(244,240,230,.9)" });
        w.restore();
      }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { lamp: 0.25, janela: 0.9 });
        const [ax, ay, z] = GB.proj(c, 0.8, ...GB.gizMundo(SX, SY - SH / 2));
        if (brilhoSeta > 0.02) ART.glow(gg, ax, ay, 260 * z, "#7CFF8A", 0.4 * brilhoSeta);
      },
    });
    // Zeca sentado na cama, abraçado à pepita
    const [zx, zy, zf] = GB.proj(cam, 1, 960, 1112);
    const [ax, ay] = GB.proj(cam, 0.8, ...GB.gizMundo(SX, SY - SH * 0.6));
    const aperta = GB.hit(t, tSeg + 0.05, 0.6);
    const olhaSeta = (t >= tAm && t < tAp + 0.05) || t >= tSeta - 0.05;
    const olho = olhaSeta ? { alvo: [ax, ay] } : { alvo: [zx - 20 * zf, zy - 60 * zf] };
    const p = ART.zeca.pose("sentado", t, Object.assign({
      x: zx, y: zy, s: 1.3 * zf, turn: -0.35, lamp: 0, shadow: 0,
      aF: 62 - 14 * aperta, eF: 72 + 20 * aperta, aB: 54 - 10 * aperta, eB: 76 + 16 * aperta, bFrente: 1, segura: "pepita",
      banho: { cor: "#FF8A3C", k: 0.7 }, rim: "#9FB4FF", rimA: 0.6, sq: 1 - 0.04 * aperta,
      eyes: t > tSeg && t < tSeg + 0.45 ? "feliz" : t > tAp && t < tSeta - 0.05 ? "preocupado" : "aberto",
      mouth: t > tAp && t < tSeta ? "neutro" : t > tSeta ? "o" : "sorriso", brows: t > tAp ? "preocupado" : "nenhum",
      headTilt: (olhaSeta ? -6 : 10) + 4 * Math.sin(t * 1.7), blinkSeed: 0.4,
    }, olho));
    const A = ART.zeca.draw(g, p);
    // cobertor por cima das pernas
    ART.cobertor(g, zx + 30 * zf, zy + 6 * zf, 300 * zf);
    const m = A.mao || { x: zx, y: zy - 100 };
    const pul = 0.85 + 0.15 * Math.sin(t * 5);
    ART.glow(g, m.x, m.y, 330 * zf, "#FF8A3C", 0.3 * pul);
    ART.glow(g, m.x, m.y, 60 * zf, "#FFE0B0", 0.35 * pul);
    ART.faixaLegenda(g, 0.4);
  },
});
