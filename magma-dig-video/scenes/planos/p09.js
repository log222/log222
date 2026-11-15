/* p09 · C4 Toca · "De noite, vende, aprende e dorme."
 * Travelling lateral pela Toca, da esquerda para a direita, em três paradas ligadas por chicotes:
 *  1) mesa: o Zeca bate as moedas no balcão (no som da moeda) e conta, feliz ("vende");
 *  2) parede: olha o mural de cartões dos ramos, pata no queixo, um cartão acende ("aprende");
 *  3) cama: deitado, coberto, com os Z subindo ("dorme").
 * A parede ainda está sem a meta (ela só é riscada no p14). */
MD.plano("p09", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tMoeda = GB.mark(ctx, "moeda", 0.1), tVende = GB.wt(ctx, "vende", 0.58), tAp = GB.wt(ctx, "aprende", 1.14), tDorme = GB.wt(ctx, "dorme", 1.78);
    const W1 = tAp - 0.17, W2 = tDorme - 0.17, WD = 0.17; // chicotes
    const cena = GB.toca({ prog: 0, tracos: 0 }, { lamp: 1 });
    // câmera: três paradas (x do mundo, plano d=1)
    const io = ART.ease.inOutCubic;
    const k1 = io(clamp((t - W1) / WD)), k2 = io(clamp((t - W2) / WD));
    const xa = 300 + 30 * clamp(t / W1), xb = 540 + 30 * clamp((t - W1 - WD) / (W2 - W1 - WD)), xc = 840 + 26 * clamp((t - W2 - WD) / (dur - W2 - WD));
    const camX = t < W1 ? xa : t < W1 + WD ? ART.lerp(330, 540, k1) : t < W2 ? xb : t < W2 + WD ? ART.lerp(570, 840, k2) : xc;
    const seg = t < W1 + WD * 0.5 ? 0 : t < W2 + WD * 0.5 ? 1 : 2;
    const cam = ART.camera(t, { push: [1.95, 2.05], dur, ease: "linear" });
    const camY = t < W1 ? 1040 : t < W1 + WD ? ART.lerp(1040, 960, k1) : t < W2 ? 960 : ART.lerp(960, 1010, k2);
    GB.mira(cam, 1, camX, camY, 540, 860);
    // velocidade da câmera -> desfoque de chicote
    const vel = Math.abs(Math.sin(Math.PI * clamp((t - W1) / WD))) * (t > W1 && t < W1 + WD ? 1 : 0) + Math.abs(Math.sin(Math.PI * clamp((t - W2) / WD))) * (t > W2 && t < W2 + WD ? 1 : 0);
    // mural de cartões (ramos) na parede, sem a meta ainda
    const acende = GB.hit(t, tAp + 0.05, 0.6);
    GB.palco(g, t, cam, cena, (gg) => {
      if (seg === 0) {
        // moedas no balcão (mesa: tampo em y≈1010, x 110–440)
        const r = ART.rng(5);
        for (let i = 0; i < 7; i++) {
          const x0 = 300 + (r() - 0.5) * 120, dt = t - tMoeda - i * 0.025;
          if (dt < 0) continue;
          const b = Math.abs(Math.sin(dt * 18)) * Math.exp(-dt * 7) * 40;
          GB.moedaChao(gg, x0, 1002 - b, 15, { rot: (r() - 0.5) * 0.6 });
        }
        if (t > tMoeda) for (const p of ART.burst(t, { t0: tMoeda, count: 10, x: 320, y: 990, speed: [150, 380], angle: [-160, -20], gravity: 1600, life: [0.3, 0.5], size: [3, 6], seed: 4 })) { gg.globalAlpha = p.alpha; ART.circ(gg, p.x, p.y, p.size); gg.fillStyle = "#FFE38A"; gg.fill(); gg.globalAlpha = 1; }
        const bate = t < tMoeda + 0.02;
        const p = bate
          ? ART.zeca.pose("parado", t, { aF: ART.map(t, 0, tMoeda, 120, 60), eF: 20, bFrente: 1, segura: "pilha", eyes: "determinado", mouth: "sorriso" })
          : ART.zeca.pose("contando", t, { eyes: t > tVende ? "feliz" : "aberto", mouth: "aberto", sq: 1 + 0.06 * GB.hit(t, tMoeda, 0.25) });
        Object.assign(p, { x: 478, y: 1262, s: 1.4, turn: -0.5, lamp: 0, rim: "#FFB070", rimA: 0.7, alvo: [300, 1000], headTilt: 12 });
        ART.zeca.draw(gg, p);
      } else if (seg === 1) {
        const p = ART.zeca.pose("parado", t, {
          x: 650, y: 1262, s: 1.4, turn: -0.45, lamp: 0, rim: "#B58CFF", rimA: 0.6,
          aF: 64, eF: 120, bFrente: 1, alvo: [520, 790], eyes: "aberto", mouth: t > tAp + 0.15 ? "o" : "neutro", headTilt: -8,
          sq: 1 + 0.04 * acende, bob: 6 * acende,
        });
        ART.zeca.draw(gg, p);
      } else {
        const p = ART.zeca.pose("deitado", t, { x: 905, y: 1086, s: 1.3, turn: 0.4, lamp: 0, rim: "#9FB4FF", rimA: 0.6 });
        p.zzz = 0;
        const A = ART.zeca.draw(gg, p);
        const hz = A.cabeca ? gg.getTransform().inverse().transformPoint(A.cabeca) : { x: 820, y: 1040 }, kz = clamp((t - tDorme + 0.1) / 0.2);
        for (let i = 0; i < 3; i++) {
          const ph = ((t - tDorme) * 0.9 + i / 3) % 1; if (t < tDorme - 0.1 || ph < 0) continue;
          gg.save(); gg.globalAlpha = kz * Math.sin(Math.PI * ph);
          ART.textFx(gg, "Z", hz.x + 30 + ph * 90 + Math.sin(ph * 6 + i) * 10, hz.y - 60 - ph * 170, { size: 34 + ph * 40, fam: "Lilita One", fill: "#D6ECFF", stroke: "#252B4A", sw: 7, shadow: null });
          gg.restore();
        }
        ART.cobertor(gg, 905 - 70, 1086 + 22, 320);
      }
    }, {
      frame: ctx.frame,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => {
        // mural: 7 cartõezinhos de papel com os ícones dos ramos, presos com tachinhas
        const R = ART.ui.RAMOS;
        R.forEach((ra, i) => {
          const row = i < 4 ? 0 : 1, col = row ? i - 4 : i, cx = 430 + col * 92 + row * 46, cy = 725 + row * 112, ang = (ART.hash(i, 3) - 0.5) * 0.18;
          w.save(); w.translate(cx, cy); w.rotate(ang);
          w.shadowColor = "rgba(0,0,0,.45)"; w.shadowBlur = 10; w.shadowOffsetY = 5;
          ART.rr(w, -38, -44, 76, 92, 6); w.fillStyle = i === 3 && acende > 0.05 ? ART.mix("#EDE3CC", "#BFF6FF", acende) : "#EDE3CC"; w.fill();
          w.shadowColor = "transparent";
          w.fillStyle = ART.rgba(ra.cor, 0.85); w.fillRect(-38, -44, 76, 14);
          ART.ui.pix(w, ra.icone, 0, 6, 44);
          ART.circ(w, 0, -40, 6); w.fillStyle = "#E63748"; w.fill();
          w.restore();
          if (i === 3 && acende > 0.02) ART.glow(w, cx, cy, 110, "#7FE8F0", 0.6 * acende);
        });
      }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { janela: 0.8 }),
    });
    GB.chicote(g, vel, 90);
  },
});
