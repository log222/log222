/* p257 · C4 Toca · "Ele esperou a alta, não a seta."
 * Plano inteiro: o Zeca sentado na cama (mesmo lugar do p56/p204), coberto até a cintura, as quatro pepitas no colo
 * brilhando. No acorde as pepitas acendem; no "alta" ele dá um pulinho contido sentado (punhos fechados sobem e
 * descem, olhos felizes); no "não a seta" olha de lado para a seta riscada na parede e volta, satisfeito.
 * Push-in lento; segura a última pose com a respiração. Lanterna apagada. */
MD.plano("p257", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tAc = GB.mark(ctx, "acorde", 0.05), tAl = GB.wt(ctx, "alta", 0.75), tNa = GB.wt(ctx, "nao", 1.3), tSe = GB.wt(ctx, "seta", 1.75);
    const cena = GB2.toca({ lamp: 0.35, janela: 0.9 });
    const cam = ART.camera(t, { push: [1.78, 1.9], dur, ease: "linear" });
    GB.mira(cam, 1, ART.map(t, 0, dur, 880, 892), 1000, 540, 880);
    const S = GB2.SETA;
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 4, seta: 1, x: 1, brilhoX: GB.hit(t, tSe, 0.7) }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.35, janela: 0.9 }),
    });
    const C = GB2.CAMA, [zx, zy, zf] = GB2.tela(cam, C.x, C.y), sZ = C.s * zf;
    const [ax, ay] = GB.proj(cam, 0.8, ...GB.gizMundo(S.x + 20, S.y - S.h * 0.5));
    // pulinho contido no "alta"
    const u = clamp((t - tAl + 0.12) / 0.5), pulo = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0;
    const amassa = GB.hit(t, tAl + 0.38, 0.3);
    const olhaSeta = t >= tNa - 0.05 && t < tSe + 0.45;
    const feliz = t > tAl - 0.15;
    const resp = Math.sin(t * 2.1);
    const p = ART.zeca.pose("sentado", t, {
      x: zx, y: zy, s: sZ, turn: -0.3, lamp: 0, shadow: 0,
      aF: 5 + 75 * pulo, eF: 30 + 60 * pulo, aB: 5 + 70 * pulo, eB: 30 + 60 * pulo, bFrente: 1,
      bob: -24 + 22 * pulo + 1.5 * resp, sq: 1 + 0.015 * resp - 0.06 * amassa + 0.03 * pulo,
      eyes: olhaSeta ? "aberto" : feliz ? "feliz" : "aberto", mouth: pulo > 0.2 ? "aberto" : "sorriso", brows: "nenhum",
      alvo: olhaSeta ? [ax, ay] : null, look: [0.1, 0.7], camera: olhaSeta ? 0 : 0.35,
      headTilt: (olhaSeta ? -8 : 8) + 3 * Math.sin(t * 1.6) - 6 * pulo, blinkSeed: 0.15,
      banho: { cor: "#FF8A3C", k: 0.55 }, rim: "#9FB4FF", rimA: 0.55,
    });
    const pt = Object.assign({}, p), A0 = GB2.ancoras(pt);
    const [cx, cy] = GB2.colo(A0, sZ);
    ART.zeca.draw(g, p);
    ART.cobertor(g, zx + 30 * zf, zy + 6 * zf, 300 * zf);
    // as quatro pepitas no colo (sobem um pouco com o pulinho, sem sair do colo)
    const br = 0.75 + 0.25 * GB.hit(t, tAc + 0.05, 0.8);
    GB2.pepitas(g, t, cx, cy - 8 * sZ * pulo - 6 * sZ, 11 * sZ, { n: 4, brilho: br });
    ART.post(g, ctx.frame, { legendaK: 0.4 });
  },
});
