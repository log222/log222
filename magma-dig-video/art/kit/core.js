/* MAGMA DIG — kit de arte: núcleo.
 * Tudo é função pura de (t, params). Nada de Date/rAF/Math.random/CSS animado.
 * Desenho em Canvas 2D; camadas estáticas são cacheadas em canvas fora da tela.
 */
(function () {
  const ART = (window.ART = window.ART || {});
  ART.W = 1080; ART.H = 1920;

  // ------------------------------------------------------------------ paleta
  ART.pal = {
    // interface do jogo
    uiBg: "#14121F", uiCard: "#1E1B2E", uiCard2: "#262238", uiBorda: "#302B41", uiBotao: "#494369",
    texto: "#F4EEDC", mudo: "#A3A0AE",
    ouro: "#FFD23F", ouroEsc: "#C3954F", lampada: "#FFB548", lamp2: "#FFD56B",
    verde: "#66CB4B", verdeTxt: "#5FD35F", vermelho: "#E63748", ciano: "#7FD8F0",
    // noite / mundo
    noite0: "#0E0C1A", noite1: "#1B1730", noite2: "#2A2347", noite3: "#3C3262", lilas: "#8E6FD0", rosaRim: "#D273BF",
    // pedra mina 1
    pedra0: "#4D4C4F", pedra1: "#76756A", pedra2: "#9A927E", pedra3: "#BAAB87",
    // Zeca
    casco: "#C27A45", cascoEsc: "#8A5B34", cascoClaro: "#DDA06A", faixa: "#9C6337",
    rosto: "#EBC7A0", focinho: "#F7DFC0", nariz: "#4A2A1E", bochecha: "#EE9A8C", pele: "#E7B48E", peleEsc: "#C98E6B",
    olho: "#231A26", capacete: "#FFD23F", capaceteEsc: "#D9A52A", capaceteSombra: "#B07D1E",
    // minérios
    cobre: "#E07B39", ferro: "#9C6B4E", prata: "#DDE6EE", ouroMin: "#FFCC33", ametista: "#9B5CF0",
    // ciência
    bp0: "#071E2B", bp1: "#0D3346", bpLinha: "#8FD3E8", bpRosa: "#F08AA8",
  };

  // ------------------------------------------------------------------ matemática
  ART.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  ART.lerp = (a, b, k) => a + (b - a) * k;
  ART.inv = (a, b, x) => (b === a ? 0 : (x - a) / (b - a));
  ART.smooth = k => { k = ART.clamp(k); return k * k * (3 - 2 * k); };
  const c1 = 1.70158, c3 = c1 + 1;
  ART.ease = {
    linear: k => k,
    inQuad: k => k * k, outQuad: k => 1 - (1 - k) * (1 - k),
    inOutQuad: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
    inCubic: k => k * k * k, outCubic: k => 1 - Math.pow(1 - k, 3),
    inOutCubic: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    inOutSine: k => -(Math.cos(Math.PI * k) - 1) / 2,
    outQuart: k => 1 - Math.pow(1 - k, 4), inQuart: k => k * k * k * k,
    outExpo: k => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
    inBack: k => c3 * k * k * k - c1 * k * k,
    outBack: k => 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2),
    outElastic: k => (k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
  };
  ART.prog = (t, t0, t1, e) => { const k = ART.clamp(ART.inv(t0, t1, t)); return e ? ART.ease[e](k) : k; };
  ART.map = (t, t0, t1, v0, v1, e) => ART.lerp(v0, v1, ART.prog(t, t0, t1, e));
  /** keyframes: ART.kf(t, [[t0, v0], [t1, v1, 'outBack'], ...]); valores número ou array */
  ART.kf = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const k = ART.prog(t, t0, t1, e || "inOutSine");
        return Array.isArray(v0) ? v0.map((x, j) => ART.lerp(x, v1[j], k)) : ART.lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  };
  ART.pulse = (t, t0, dur) => { const k = (t - t0) / dur; return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };
  ART.rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  ART.hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
  ART.noise = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return ART.lerp(ART.hash(i, seed), ART.hash(i + 1, seed), u) * 2 - 1; };
  ART.deg = d => (d * Math.PI) / 180;

  // ------------------------------------------------------------------ cor
  ART.hex = h => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  ART.rgba = (h, a = 1) => { const [r, g, b] = ART.hex(h); return `rgba(${r},${g},${b},${a})`; };
  ART.mix = (h1, h2, k) => { const a = ART.hex(h1), b = ART.hex(h2); return "#" + a.map((v, i) => Math.round(ART.lerp(v, b[i], k)).toString(16).padStart(2, "0")).join(""); };
  ART.shade = (h, k) => (k >= 0 ? ART.mix(h, "#ffffff", k) : ART.mix(h, "#000000", -k));

  // ------------------------------------------------------------------ canvas
  ART.canvas = (w = ART.W, h = ART.H) => { const c = document.createElement("canvas"); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  const CACHE = new Map();
  /** canvas cacheado: desenha uma vez por chave. fn(g, w, h) */
  ART.cache = (key, w, h, fn) => {
    let c = CACHE.get(key);
    if (!c) { c = ART.canvas(w, h); fn(c.getContext("2d"), w, h); CACHE.set(key, c); }
    return c;
  };
  ART.clearCache = () => CACHE.clear();
  /** versão desfocada de um canvas (cacheada se key) */
  ART.blurred = (src, px, key) => {
    const make = () => { const c = ART.canvas(src.width, src.height), g = c.getContext("2d"); g.filter = `blur(${px}px)`; g.drawImage(src, 0, 0); return c; };
    if (!key) return make();
    let c = CACHE.get(key); if (!c) { c = make(); CACHE.set(key, c); } return c;
  };

  // ------------------------------------------------------------------ formas
  ART.rr = (g, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  ART.ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); };
  ART.circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2); };
  ART.poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
  /** cápsula de (x1,y1) a (x2,y2) com raio r */
  ART.capsule = (g, x1, y1, x2, y2, r) => { const a = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.arc(x1, y1, r, a + Math.PI / 2, a - Math.PI / 2); g.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2); g.closePath(); };
  ART.lg = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  ART.rg = (g, x, y, r0, r1, stops, x1, y1) => { const gr = g.createRadialGradient(x, y, r0, x1 ?? x, y1 ?? y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };

  /** brilho radial aditivo */
  ART.glow = (g, x, y, r, color, a = 1, mode = "lighter") => {
    g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a;
    g.fillStyle = ART.rg(g, x, y, 0, r, [[0, ART.rgba(color, 1)], [0.25, ART.rgba(color, 0.45)], [0.6, ART.rgba(color, 0.12)], [1, ART.rgba(color, 0)]]);
    g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  };
  /** feixe de luz: origem (x,y), ângulo (graus, 90 = para baixo), comprimento, largura na origem e no fim */
  ART.beam = (g, x, y, ang, len, w0, w1, color, a = 0.5, mode = "lighter") => {
    g.save(); g.translate(x, y); g.rotate(ART.deg(ang - 90)); g.globalCompositeOperation = mode; g.globalAlpha = a;
    g.beginPath(); g.moveTo(-w0 / 2, 0); g.lineTo(w0 / 2, 0); g.lineTo(w1 / 2, len); g.lineTo(-w1 / 2, len); g.closePath();
    g.fillStyle = ART.lg(g, 0, 0, 0, len, [[0, ART.rgba(color, 0.9)], [0.5, ART.rgba(color, 0.35)], [1, ART.rgba(color, 0)]]);
    g.filter = `blur(${Math.max(2, w1 * 0.06)}px)`; g.fill(); g.restore();
  };
  ART.vignette = (g, k = 0.6, color = "#05040a", W = ART.W, H = ART.H) => {
    g.save(); g.fillStyle = ART.rg(g, W / 2, H * 0.46, Math.min(W, H) * 0.35, Math.hypot(W, H) * 0.62, [[0, ART.rgba(color, 0)], [0.55, ART.rgba(color, k * 0.35)], [1, ART.rgba(color, k)]]);
    g.fillRect(0, 0, W, H); g.restore();
  };

  // ------------------------------------------------------------------ grão de filme (determinístico por quadro)
  let GRAIN = null;
  ART.grain = (g, frame = 0, amt = 0.06, W = ART.W, H = ART.H) => {
    if (!GRAIN) {
      GRAIN = ART.canvas(256, 256); const gg = GRAIN.getContext("2d"), im = gg.createImageData(256, 256), r = ART.rng(99);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      gg.putImageData(im, 0, 0);
    }
    g.save(); g.globalCompositeOperation = "overlay"; g.globalAlpha = amt;
    const ox = Math.floor(ART.hash(frame, 3) * 256), oy = Math.floor(ART.hash(frame, 5) * 256);
    g.translate(-ox, -oy); g.fillStyle = g.createPattern(GRAIN, "repeat"); g.fillRect(ox, oy, W + 256, H + 256); g.restore();
  };

  // ------------------------------------------------------------------ partículas analíticas
  /** explosão em t0: lista [{x,y,size,alpha,rot,k,i,r}] (r = aleatório estável por partícula) */
  ART.burst = (t, o = {}) => {
    const { t0 = 0, count = 30, x = 540, y = 960, speed = [300, 900], angle = [-180, 0], gravity = 1800, life = [0.5, 1.1], size = [8, 22], seed = 1, drag = 0, spin = 360, spread = 0, w = 0, h = 0 } = o;
    const r = ART.rng(seed), out = [];
    for (let i = 0; i < count; i++) {
      const sp = ART.lerp(speed[0], speed[1], r()), an = ART.deg(ART.lerp(angle[0], angle[1], r()));
      const lf = ART.lerp(life[0], life[1], r()), sz = ART.lerp(size[0], size[1], r()), delay = r() * spread;
      const sr = (r() - 0.5) * 2 * spin, ox = (r() - 0.5) * (w || 20), oy = (r() - 0.5) * (h || 20), rr = r();
      const dt = t - t0 - delay;
      if (dt < 0 || dt > lf) continue;
      const vd = drag > 0 ? (1 - Math.exp(-drag * dt)) / drag : dt;
      out.push({ x: x + ox + Math.cos(an) * sp * vd, y: y + oy + Math.sin(an) * sp * vd + 0.5 * gravity * dt * dt, size: sz, alpha: 1 - Math.pow(dt / lf, 2), rot: sr * dt, k: dt / lf, i, r: rr, dt });
    }
    return out;
  };
  /** poeira em suspensão num retângulo (loop contínuo, sem estado) */
  ART.dust = (g, t, o = {}) => {
    const { x = 0, y = 0, w = ART.W, h = ART.H, count = 60, seed = 4, color = "#FFE6B0", size = [1.5, 4.5], speed = 14, alpha = 0.55, blurBig = true } = o;
    const r = ART.rng(seed);
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < count; i++) {
      const px = r(), py = r(), sz = ART.lerp(size[0], size[1], r()), ph = r() * 100, sp = 0.4 + r();
      const xx = x + ((px * w + ART.noise(t * 0.25 * sp + ph, i) * 40 + t * speed * 0.4 * sp) % w + w) % w;
      const yy = y + ((py * h - t * speed * sp + ART.noise(t * 0.3 + ph, i + 9) * 30) % h + h) % h;
      const tw = 0.55 + 0.45 * Math.sin(t * (1.3 + sp) + ph);
      g.globalAlpha = alpha * tw;
      g.fillStyle = ART.rg(g, xx, yy, 0, sz * 2.2, [[0, ART.rgba(color, 1)], [0.4, ART.rgba(color, 0.5)], [1, ART.rgba(color, 0)]]);
      g.fillRect(xx - sz * 2.2, yy - sz * 2.2, sz * 4.4, sz * 4.4);
    }
    g.restore();
  };

  // ------------------------------------------------------------------ câmera / parallax
  /** cam = {x, y, zoom, rot}: (x,y) deslocamento do olhar em px no plano de foco (profundidade 1).
   *  Camada de profundidade d (0 = infinito, 1 = plano de foco, >1 = mais perto) recebe
   *  deslocamento x*d e zoom 1+(zoom-1)*d. Use ART.withLayer(g, cam, d, fn). */
  ART.withLayer = (g, cam, d, fn, W = ART.W, H = ART.H) => {
    const z = 1 + ((cam.zoom || 1) - 1) * d, cx = cam.cx ?? W / 2, cy = cam.cy ?? H / 2;
    g.save();
    g.translate(cx + (cam.sx || 0), cy + (cam.sy || 0));
    if (cam.rot) g.rotate(ART.deg(cam.rot));
    g.scale(z, z);
    g.translate(-cx - (cam.x || 0) * d, -cy - (cam.y || 0) * d);
    fn(g); g.restore();
  };
  /** câmera padrão: empurrão lento + deriva + tremor de impactos.
   *  o = {push:[z0,z1], dur, drift:[dx,dy], hits:[t...], hitAmp, cx, cy, ease} */
  ART.camera = (t, o = {}) => {
    const { push = [1, 1.06], dur = 6, drift = [0, 0], hits = [], hitAmp = 14, hitDur = 0.28, cx, cy, ease = "inOutSine" } = o;
    const k = ART.prog(t, 0, dur, ease);
    const cam = { zoom: ART.lerp(push[0], push[1], k), x: drift[0] * k, y: drift[1] * k, sx: 0, sy: 0, rot: 0, cx, cy };
    for (const h of hits) {
      const q = (t - h) / hitDur; if (q < 0 || q > 1) continue;
      const env = Math.pow(1 - q, 2), s = (t - h) * 34;
      cam.sx += ART.noise(s, 11) * hitAmp * env; cam.sy += ART.noise(s, 17) * hitAmp * env; cam.rot += ART.noise(s, 23) * 0.5 * env;
    }
    return cam;
  };

  // ------------------------------------------------------------------ texto
  ART.font = (px, fam = "Nunito", w = 900) => `${w} ${px}px "${fam}"`;
  /** texto com contorno e sombra (para CRAC!, números, etiquetas) */
  ART.textFx = (g, s, x, y, o = {}) => {
    const { size = 80, fam = "Lilita One", weight = 400, fill = "#FFD23F", stroke = "#1A1020", sw = 10, shadow = "rgba(0,0,0,.55)", sdy = 8, sblur = 14, align = "center", base = "middle", spacing = 0 } = o;
    g.save(); g.font = `${weight} ${size}px "${fam}"`; g.textAlign = align; g.textBaseline = base; g.lineJoin = "round";
    if (spacing) g.letterSpacing = spacing + "px";
    if (shadow) { g.shadowColor = shadow; g.shadowBlur = sblur; g.shadowOffsetY = sdy; }
    if (sw) { g.strokeStyle = stroke; g.lineWidth = sw; g.strokeText(s, x, y); }
    g.shadowColor = "transparent";
    g.fillStyle = typeof fill === "function" ? fill(g) : fill; g.fillText(s, x, y);
    g.restore();
  };
  /** número pt-BR com sufixo curto do jogo: 91100 -> "91,1K" */
  ART.curto = v => {
    const u = [[1e12, "TRI"], [1e9, "BI"], [1e6, "MI"], [1e3, "K"]];
    for (const [d, s] of u) if (Math.abs(v) >= d) return (v / d).toFixed(1).replace(".", ",") + s;
    return String(Math.round(v));
  };
  ART.num = (v, dec = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // ------------------------------------------------------------------ fontes
  ART.fontes = ["Nunito", "Lilita One", "Anton", "Baloo 2"];
  ART.ready = async () => {
    await Promise.all(ART.fontes.map(f => document.fonts.load(`900 60px "${f}"`, "ÁÃÇÉ0123,!")));
    await document.fonts.ready;
    if (ART._imgs) await Promise.all(Object.values(ART._imgs));
  };
  ART.imgs = {};
  ART._imgs = {};
  /** carrega imagem uma vez; ART.imgs[key] fica disponível após ART.ready() */
  ART.loadImg = (key, src) => {
    if (!ART._imgs[key]) ART._imgs[key] = new Promise((res, rej) => { const i = new Image(); i.onload = () => { ART.imgs[key] = i; res(i); }; i.onerror = () => rej(new Error("img " + src)); i.src = src; });
    return ART._imgs[key];
  };
})();
