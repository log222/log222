/* Cena PLACEHOLDER (não é arte final). Serve de exemplo da API de cena:
 * setup monta o DOM/canvas uma vez; render(state, t, ctx) posiciona tudo em função de t.
 *
 * params:
 *   rotulo      texto pequeno no topo (ex.: "PARTE 1")
 *   fundo       [corTopo, corBase] do gradiente
 *   bloco       true = mostra um bloco de pedra que reage aos sfx "picareta"/"quebrar"
 *   moeda_txt   texto do número flutuante disparado em cada sfx "moeda" (ex.: "+150")
 *   tremor      true = tremor de câmera em cada sfx "ronco"
 */
MD.scene("placeholder", {
  css: `
    .ph-label { position:absolute; left:60px; right:120px; top:290px; text-align:center; font-family:'Luckiest Guy';
      font-size:64px; color:#FFD21F; -webkit-text-stroke:10px #111; paint-order:stroke fill; letter-spacing:.04em; }
    .ph-cam { position:absolute; inset:0; transform-origin:50% 50%; }
  `,
  setup(el, p, ctx) {
    const [c0, c1] = p.fundo || ["#2a1a12", "#120806"];
    el.style.background = `linear-gradient(180deg, ${c0}, ${c1})`;
    const cam = MD.el("div", { class: "ph-cam" }, el);
    const { g } = MD.canvas(cam);               // camada de partículas
    const svg = MD.el("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920" }, cam);
    svg.style.cssText = "position:absolute;left:0;top:0";
    // brasas de fundo (posições fixas por semente)
    const r = MD.rng(7);
    const embers = [...Array(24)].map(() => ({ x: r() * 1080, y: 300 + r() * 1300, s: 4 + r() * 8, ph: r() * 10 }));
    // Zeca placeholder: corpo + capacete amarelo
    const zeca = MD.el("g", {}, svg);
    MD.el("ellipse", { cx: 0, cy: 0, rx: 150, ry: 120, fill: "#8a5a3c", stroke: "#111", "stroke-width": 10 }, zeca);
    MD.el("path", { d: "M-120,-40 A125,110 0 0 1 120,-40 L130,-20 L-130,-20 Z", fill: "#FFD21F", stroke: "#111", "stroke-width": 10 }, zeca);
    MD.el("circle", { cx: 0, cy: -95, r: 22, fill: "#fff6b0", stroke: "#111", "stroke-width": 8 }, zeca);
    MD.el("circle", { cx: -45, cy: 20, r: 12, fill: "#111" }, zeca);
    MD.el("circle", { cx: 45, cy: 20, r: 12, fill: "#111" }, zeca);
    // bloco
    const bloco = MD.el("g", {}, svg);
    MD.el("rect", { x: -150, y: -150, width: 300, height: 300, rx: 26, fill: "#5b5a66", stroke: "#111", "stroke-width": 12 }, bloco);
    const crack = MD.el("path", { d: "M-20,-150 L10,-60 L-30,0 L20,70 L-10,150", fill: "none", stroke: "#111", "stroke-width": 10, "stroke-linecap": "round" }, bloco);
    const label = p.rotulo ? MD.el("div", { class: "ph-label" }, el, p.rotulo) : null;
    return { cam, g, zeca, bloco, crack, embers, label, layer: el };
  },
  render(s, t, ctx) {
    const p = ctx.params;
    const hits = MD.marks(ctx, "picareta"), breaks = MD.marks(ctx, "quebrar"), coins = MD.marks(ctx, "moeda");
    // câmera: leve zoom contínuo + tremor nos roncos
    let sh = { x: 0, y: 0, rot: 0 };
    for (const m of MD.marks(ctx, "ronco")) { const k = MD.shake(t, { t0: m, dur: 1.2, amp: 26, seed: 3 }); sh.x += k.x; sh.y += k.y; sh.rot += k.rot; }
    for (const m of hits) { const k = MD.shake(t, { t0: m, dur: 0.25, amp: 14, freq: 30, seed: 5 }); sh.x += k.x; sh.y += k.y; }
    s.cam.style.transform = `translate(${sh.x}px, ${sh.y}px) rotate(${sh.rot}deg) scale(${1 + 0.02 * t})`;
    // Zeca entra e "respira"
    const zx = MD.map(t, 0, 0.5, -200, 330, "outBack"), zy = 980 + Math.sin(t * 4) * 6;
    s.zeca.setAttribute("transform", `translate(${zx},${zy})`);
    // bloco: pancada encolhe e rachadura aparece; quebra some
    const lastHit = hits.filter(m => m <= t).pop();
    const squash = lastHit !== undefined ? 1 - 0.08 * MD.pulse(t, lastHit, 0.15) : 1;
    const broken = breaks.find(m => m <= t);
    const bo = broken !== undefined ? MD.map(t, broken, broken + 0.12, 1, 0) : 1;
    s.bloco.setAttribute("transform", `translate(760,1000) scale(${squash})`);
    s.bloco.style.opacity = p.bloco === false ? 0 : bo;
    s.crack.style.opacity = hits.some(m => m <= t) ? 1 : 0;
    // partículas: lascas em cada pancada e na quebra (canvas)
    const g = s.g; g.clearRect(0, 0, 1080, 1920);
    for (const e of s.embers) { g.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + e.ph); g.fillStyle = "#ff7a1a"; g.fillRect(e.x, e.y - ((t * 40 + e.ph * 50) % 300), e.s, e.s); }
    g.globalAlpha = 1;
    hits.forEach((m, i) => MD.drawParticles(g, MD.particles(t, { t0: m, count: 14, x: 640, y: 960, angle: [-170, -100], speed: [300, 800], seed: 10 + i, size: [10, 22] }), "#9a99a6"));
    breaks.forEach((m, i) => MD.drawParticles(g, MD.particles(t, { t0: m, count: 46, x: 760, y: 1000, angle: [-180, 0], speed: [400, 1300], seed: 50 + i, size: [14, 40], life: [0.6, 1.3] }), p => (p.i % 3 ? "#5b5a66" : "#FFD21F")));
    // número flutuante em cada "moeda"
    coins.forEach((m, i) => MD.floatText(s.layer, "coin" + i, t, { t0: m, dur: 1.0, text: p.moeda_txt || "+1", x: 760, y: 820, rise: 220, size: 110 }));
  },
});
