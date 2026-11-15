/* Player determinístico: window.renderFrame(t) desenha o quadro do tempo t (s).
 * Recebe a timeline em window.__TIMELINE__ (injetada pelo render.js).
 */
(function () {
  const MD = window.MD;
  const scenes = {};
  /** registra uma cena: MD.scene('nome', {setup(el, params, ctx) -> state (pode ser Promise), render(state, t, ctx)}) */
  MD.scene = (name, def) => { scenes[name] = def; };

  // ---- determinismo: relógios e aleatório "congelados" no tempo do quadro
  let FRAME_T = 0;
  const T0 = 1700000000000;
  Date.now = () => T0 + FRAME_T * 1000;
  performance.now = () => FRAME_T * 1000;
  let _r = MD.rng(1);
  Math.random = () => _r();
  window.requestAnimationFrame = () => { throw new Error("requestAnimationFrame proibido: use renderFrame(t)"); };

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("falha ao carregar " + src));
      document.head.appendChild(s);
    });
  }

  const beats = [];
  let TL, flashEl, stage;

  async function init() {
    TL = window.__TIMELINE__;
    if (!TL) throw new Error("sem __TIMELINE__");
    MD.W = TL.largura; MD.H = TL.altura;
    stage = document.getElementById("stage");
    flashEl = document.getElementById("flash");
    if (TL.debug_zona_segura) drawSafeZone(TL.estilo.zona_segura);
    const names = [...new Set(TL.beats.map(b => b.cena))];
    for (const n of names) await loadScript(`../scenes/${n}.js`);
    for (const n of names) if (!scenes[n]) throw new Error(`cena "${n}" não chamou MD.scene('${n}', ...)`);
    for (const n of names) if (scenes[n].css) { const st = document.createElement("style"); st.textContent = scenes[n].css; document.head.appendChild(st); }
    // fontes usadas pelas legendas precisam estar carregadas antes do 1º quadro
    await Promise.all([...new Set([TL.estilo.legenda.fonte, ...(TL.fontes_extra || [])])].map(f => document.fonts.load(`100px "${f}"`, "ÁÃÇÉÊÍÓÕÚ")));
    for (const b of TL.beats) {
      const el = MD.el("div", { class: "beat", "data-id": b.id }, stage);
      el.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;display:none";
      const ctx = makeCtx(b, el);
      const state = await scenes[b.cena].setup(el, b.params || {}, ctx);
      beats.push({ b, el, ctx, state, def: scenes[b.cena] });
    }
    await document.fonts.ready;
    MD.captions.init(TL);
    window.__MD_READY__ = true;
  }

  function makeCtx(b, el) {
    return { W: TL.largura, H: TL.altura, fps: TL.fps, el, params: b.params || {}, t: 0, tGlobal: 0, frame: 0,
      beat: { id: b.id, ini: b.ini, dur: b.dur, words: b.palavras || [], marks: b.marks || {}, index: b.index } };
  }

  function drawSafeZone(z) {
    const o = MD.el("div", {}, document.getElementById("overlay"));
    o.style.cssText = `position:absolute;left:${z.esquerda}px;top:${z.topo}px;right:${z.direita}px;bottom:${z.base}px;` +
      `outline:4px dashed rgba(0,255,255,.8);outline-offset:0;box-shadow:0 0 0 2000px rgba(255,0,80,.18)`;
  }

  const TR = {
    corte: () => ({}),
    fade: k => ({ inn: { o: k } }),
    preto: k => ({ cut: true, flash: { c: "#000", o: MD.pulse(k, 0, 1) } }),
    flash: k => ({ cut: true, flash: { c: "#fff", o: Math.pow(MD.pulse(k, 0, 1), 1.5) } }),
    slide: k => { const e = MD.ease.inOutCubic(k); return { inn: { y: (1 - e) * MD.H }, out: { y: -e * MD.H * 0.35 } }; },
    zoom: k => { const e = MD.ease.inOutCubic(k); return { inn: { s: MD.lerp(1.15, 1, e), o: e }, out: { s: MD.lerp(1, 1.3, e) } }; },
  };

  function applyLayer(el, tr, z) {
    tr = tr || {};
    el.style.display = "block";
    el.style.zIndex = z;
    el.style.opacity = tr.o === undefined ? 1 : tr.o;
    el.style.transform = `translate(${tr.x || 0}px, ${tr.y || 0}px) scale(${tr.s || 1})`;
  }

  window.renderFrame = function (t, frame = 0) {
    FRAME_T = t; _r = MD.rng(frame + 1);
    let flash = null;
    const active = [];
    for (let i = 0; i < beats.length; i++) {
      const B = beats[i], b = B.b;
      const dIn = i > 0 ? (b.transicao.dur || 0) : 0;
      const dOut = i < beats.length - 1 ? (beats[i + 1].b.transicao.dur || 0) : 0;
      const t0 = b.ini - dIn / 2, t1 = b.ini + b.dur + dOut / 2;
      if (t >= t0 && t < t1 || (i === beats.length - 1 && t >= t1)) active.push(i);
      else B.el.style.display = "none";
    }
    for (const i of active) {
      const B = beats[i], b = B.b;
      let layer = {}, z = 1 + i;
      // transição de ENTRADA (fronteira no início deste beat)
      if (i > 0 && b.transicao.dur > 0 && t < b.ini + b.transicao.dur / 2) {
        const d = b.transicao.dur, k = MD.clamp((t - (b.ini - d / 2)) / d);
        const r = (TR[b.transicao.tipo] || TR.fade)(k);
        if (r.cut && t < b.ini) { B.el.style.display = "none"; continue; }
        layer = r.inn || {}; if (r.flash) flash = r.flash;
      }
      // transição de SAÍDA (fronteira no fim deste beat)
      if (i < beats.length - 1) {
        const nb = beats[i + 1].b, d = nb.transicao.dur || 0, end = b.ini + b.dur;
        if (d > 0 && t >= end - d / 2) {
          const k = MD.clamp((t - (end - d / 2)) / d);
          const r = (TR[nb.transicao.tipo] || TR.fade)(k);
          if (r.cut && t >= end) { B.el.style.display = "none"; continue; }
          layer = Object.assign({}, layer, r.out || {}); if (r.flash) flash = r.flash;
        } else if (d === 0 && t >= end) { B.el.style.display = "none"; continue; }
      }
      applyLayer(B.el, layer, z);
      const lt = MD.clamp(t - b.ini, 0, b.dur);
      B.ctx.t = lt; B.ctx.tGlobal = t; B.ctx.frame = frame;
      B.def.render(B.state, lt, B.ctx);
    }
    flashEl.style.opacity = flash ? flash.o : 0;
    if (flash) flashEl.style.background = flash.c;
    MD.captions.render(t);
    return true;
  };

  window.__MD_INIT__ = init().catch(e => { window.__MD_ERROR__ = String(e && e.stack || e); });
})();
