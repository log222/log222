/* Cena "auto": UM ARQUIVO POR PLANO, sem arquivo compartilhado.
 * Se scenes/planos/<plano>.js existir (o make_video detecta e passa params.arquivo = true),
 * ele é carregado e desenha o plano. Senão, mostra o placeholder de animatic
 * (número do plano, cenário, ação/câmera/UI/sfx do roteiro).
 *
 * Contrato do arquivo do plano (ex.: scenes/planos/p05.js):
 *   MD.plano("p05", {
 *     kit: true,                       // carrega art/kit (window.ART) antes; padrão true
 *     async setup(ctx) { return dados },     // opcional, 1x
 *     render(g, t, ctx, dados) { ... },      // g = canvas 2D 1080x1920 limpo a cada quadro; t = tempo LOCAL do plano
 *   });
 * ctx: dur, words [{w, ini, fim}] (locais ao plano), marks {sfx: [t]}, plano (dados do roteiro), el (div do plano), frame, tGlobal.
 */
(function () {
  const REG = (MD._planos = MD._planos || {});
  MD.plano = (id, def) => { REG[id] = def; };
  const loading = {};

  const PAL = {
    C1: ["#1B1730", "#0E0C1A", "VILA"], C2: ["#4D4C4F", "#1A191E", "MINA"], C3: ["#2E3B22", "#10160B", "GAME"],
    C4: ["#3A2A1A", "#160F08", "TOCA"], C5: ["#262238", "#14121F", "PAINEL"], C6: ["#0D3346", "#071E2B", "TERRA"],
    C7: ["#1A1A1A", "#000000", "CLOSE"], C8: ["#5A1606", "#170402", "FUNDO"],
  };

  function warn(msg) { (window.__WARNINGS__ = window.__WARNINGS__ || []).push(msg); }

  function placeholder(st, ctx) {
    const r = ctx.plano || {};
    const key = (r.cenario || "").slice(0, 2);
    const [c0, c1] = PAL[key] || ["#333", "#111"];
    const el = st.el;
    el.style.background = `linear-gradient(180deg, ${c0}, ${c1})`;
    const grid = MD.el("div", {}, el);
    grid.style.cssText = "position:absolute;inset:-10%;opacity:.10;background-image:linear-gradient(#fff 2px,transparent 2px),linear-gradient(90deg,#fff 2px,transparent 2px);background-size:120px 120px";
    const box = MD.el("div", {}, el);
    box.style.cssText = "position:absolute;left:70px;width:820px;top:520px;height:700px;font-family:'Anton';color:#fff";
    const num = MD.el("div", {}, box, `PLANO ${String(r.id ?? st.id).replace(/^p/, "")}`);
    num.style.cssText = "font-size:120px;line-height:1;color:#EBBA40;-webkit-text-stroke:3px #161408;paint-order:stroke fill";
    const cen = MD.el("div", {}, box, (r.cenario || "") + (r.bloco ? `  ·  ${r.bloco}` : ""));
    cen.style.cssText = "font-size:40px;margin:10px 0 18px;opacity:.9";
    const txt = MD.el("div", {}, box);
    txt.style.cssText = "font-family:'Baloo 2';font-weight:800;font-size:29px;line-height:1.25;color:#e8e4d8";
    for (const [k, v] of [["AÇÃO", r.acao], ["CÂMERA", r.camera], ["UI", r.ui], ["SFX", r.sfx], ["GAMEPLAY", r.usa_gameplay]]) {
      if (!v || v === "nenhuma") continue;
      const d = MD.el("div", {}, txt); d.style.marginBottom = "8px";
      const b = MD.el("span", {}, d, k + ": "); b.style.color = "#EBBA40";
      MD.el("span", {}, d, String(v));
    }
    if (st.err) { const e = MD.el("div", {}, txt, "ERRO no arquivo do plano: " + st.err); e.style.color = "#ff5a5a"; }
    const bar = MD.el("div", {}, el);
    bar.style.cssText = "position:absolute;left:70px;top:1250px;height:10px;width:820px;background:rgba(255,255,255,.15)";
    const fill = MD.el("div", {}, bar);
    fill.style.cssText = "height:100%;width:0;background:#EBBA40";
    const tm = MD.el("div", {}, el);
    tm.style.cssText = "position:absolute;left:70px;top:1268px;font:28px 'Anton';color:rgba(255,255,255,.6)";
    Object.assign(st, { grid, fill, tm });
  }

  MD.scene("auto", {
    async setup(el, p, ctx) {
      const st = { el, id: p.plano, def: null, err: null, cv: null, g: null, data: null };
      if (p.arquivo) {
        try {
          loading[p.plano] = loading[p.plano] || MD.loadScript(`../scenes/planos/${p.plano}.js`);
          await loading[p.plano];
          const def = REG[p.plano];
          if (!def) throw new Error(`${p.plano}.js não chamou MD.plano("${p.plano}", ...)`);
          if (def.kit !== false) await MD.loadKit();
          if (def.setup) st.data = await def.setup(ctx);
          st.def = def;
        } catch (e) {
          st.err = String((e && e.message) || e);
          warn(`plano ${p.plano}: ${st.err} (usando placeholder)`);
        }
      }
      if (!st.def) placeholder(st, ctx);
      return st;
    },
    render(st, t, ctx) {
      if (st.def) {
        if (!st.cv) { const c = MD.canvas(st.el); st.cv = c.canvas; st.g = c.g; }
        const g = st.g;
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none";
        g.clearRect(0, 0, 1080, 1920);
        st.def.render(g, t, ctx, st.data);
        return;
      }
      const k = ctx.dur > 0 ? t / ctx.dur : 0;
      st.grid.style.transform = `scale(${1 + 0.06 * k}) translate(${-20 * k}px, 0)`;   // push-in lento (o animatic também se move)
      st.fill.style.width = `${(k * 100).toFixed(1)}%`;
      st.tm.textContent = `${t.toFixed(2)} / ${ctx.dur.toFixed(2)} s   ·   global ${ctx.tGlobal.toFixed(2)} s`;
    },
    release(st) {
      if (st.cv) { st.cv.width = 0; st.cv.remove(); st.cv = null; st.g = null; }
    },
  });
})();
