/* MAGMA DIG — kit de arte: gameplay real (trailer) num quadro vertical, como "o que o Zeca vê".
 *
 * Quadros pré-extraídos (determinísticos): build/art/gameplay/f_NNNN.jpg (30 fps, f_0001 = 0,0 s)
 *   ffmpeg -i assets/game/preview.mp4 -vf fps=30 -q:v 3 build/art/gameplay/f_%04d.jpg
 * Uso:
 *   setup:  await ART.gameplay.preload(0.5, 1.5)          // trecho do trailer (s) que o plano vai usar
 *   render: ART.gameplay.visor(g, t, {de: 0.5, ate: 1.5, ...})
 */
(function () {
  const ART = window.ART;
  const GP = (ART.gameplay = {});
  GP.fps = 30;
  GP.dir = () => (ART.base || "../art/kit/") + "../../build/art/gameplay/";
  const key = n => "gp:" + n;
  GP.idx = tv => Math.max(1, Math.min(750, Math.round(tv * GP.fps) + 1));
  /** carrega os quadros do trecho [de, ate] do trailer */
  GP.preload = (de, ate) => {
    const ps = [];
    for (let n = GP.idx(de); n <= GP.idx(ate); n++) ps.push(ART.loadImg(key(n), GP.dir() + `f_${String(n).padStart(4, "0")}.jpg`));
    ps.push(ART.loadImg("zecaPix", (ART.base || "../art/kit/") + "../../assets/game/zeca.png"));
    return Promise.all(ps);
  };
  GP.frame = tv => ART.imgs[key(GP.idx(tv))];
  /** carrega um screenshot (assets/game/shot_N.jpg) para usar com visor({img:'shot_4'}) */
  GP.preloadShot = nome => ART.loadImg(nome, (ART.base || "../art/kit/") + `../../assets/game/${nome}.jpg`);

  /** recortes prontos (px do trailer 1280x590): tiram a caixa de texto de marketing e o cronômetro original */
  GP.RECORTES = {
    mina: [470, 108, 810, 482],       // 0–5 s: mina de pedra; mantém buraco + picareta; corta a caixa do topo e o 13,2
    minaLarga: [110, 108, 1170, 482],
    vermelha: [80, 108, 1120, 482],   // 5–9 s
    guardiao: [80, 70, 1120, 440],    // 9–13,5 s (caixa embaixo)
    menu: [90, 60, 1100, 500],        // 13,5–25 s: telas da Toca
    mapa: [60, 110, 860, 460],        // 19,5–22 s: Mapa da Jornada (trilha A→B)
    mercado: [90, 110, 820, 470],     // 13,5–14,5 s: lista do Mercado (use tapar para o VENDER TUDO)
    botaoRank: [765, 190, 420, 95],   // img: 'shot_4' — só o botão SUBIR DE RANK (esconde 10,4BI e o rank E)
  };

  /** retrato pixel art do Zeca (assets/game/zeca.png, 4 quadros: 0 normal, 1 feliz, 2 espantado, 3 dormindo) */
  ART.zecaPix = (g, i, x, y, size) => {
    const im = ART.imgs.zecaPix; if (!im) return;
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(im, i * 264, 0, 264, 264, x - size / 2, y - size / 2, size, size); g.restore();
  };

  /** desenha o trecho do trailer como visor vertical.
   *  o = {de, ate (s do trailer), recorte [x,y,w,h], y (centro do quadro), largura, zoom:[z0,z1], dur (do plano),
   *       tapar: [[x,y,w,h]...] regiões do trailer para borrar (ex.: valor do VENDER TUDO),
   *       cronometro: {valor, ...} desenhado no canto do quadro (cobre o original), rotulo: 'VISÃO DO ZECA' | null,
   *       retrato: 0..3 (zeca.png) | null, lanterna: 0..1 (vinheta de lanterna dentro do quadro), a}
   *  devolve {x0, y0, w, h, map(xTrailer,yTrailer) -> [x,y] na tela} */
  GP.visor = (g, t, o = {}) => {
    const de = o.de ?? 0, ate = o.ate ?? de + 1, dur = o.dur ?? ate - de;
    const tv = Math.min(ate, de + t * ((ate - de) / dur));
    const img = o.img ? ART.imgs[o.img] : GP.frame(tv);
    const [rx, ry, rw, rh] = o.recorte || GP.RECORTES.mina;
    const W = 1080, H = 1920;
    // 1) extensão desfocada em tela cheia (mesmo quadro)
    g.save();
    if (img) {
      const sm = GP._sm || (GP._sm = ART.canvas(60, 107)), sg = sm.getContext("2d"), sc = (H / rh) * 1.15 / 18;
      sg.clearRect(0, 0, 60, 107); sg.drawImage(img, rx, ry, rw, rh, 30 - (rw * sc) / 2, 53 - (rh * sc) / 2, rw * sc, rh * sc);
      g.drawImage(sm, 0, 0, W, H);
    }
    g.fillStyle = "rgba(20,14,36,.48)"; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(70,40,140,.25)"; g.fillRect(0, 0, W, H);
    g.restore();
    // 2) quadro nítido
    const w = o.largura || 1000, h = w * rh / rw, x0 = (W - w) / 2, cy = o.y ?? 800, y0 = cy - h / 2;
    const z = ART.lerp((o.zoom || [1, 1.06])[0], (o.zoom || [1, 1.06])[1], ART.prog(t, 0, dur, "inOutSine"));
    g.save(); g.globalAlpha *= o.a ?? 1;
    g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 60; g.shadowOffsetY = 24;
    ART.rr(g, x0, y0, w, h, 34); g.fillStyle = "#000"; g.fill(); g.shadowColor = "transparent";
    g.save(); ART.rr(g, x0, y0, w, h, 34); g.clip();
    const fx = o.foco ? o.foco[0] : rx + rw / 2, fy = o.foco ? o.foco[1] : ry + rh / 2; // ponto de zoom (px trailer)
    const sc = (w / rw) * z, ox = x0 + w / 2 - (fx - rx - rw / 2) * (z - 1) * (w / rw) - (rw * sc) / 2 + 0, oy = y0 + h / 2 - (fy - ry - rh / 2) * (z - 1) * (w / rw) - (rh * sc) / 2;
    const map = (X, Y) => [ox + (X - rx) * sc, oy + (Y - ry) * sc];
    if (img) g.drawImage(img, rx, ry, rw, rh, ox, oy, rw * sc, rh * sc);
    for (const [tx, ty, tw, th] of o.tapar || []) {
      const [a, b] = map(tx, ty), cw = tw * sc, ch = th * sc;
      g.save(); ART.rr(g, a, b, cw, ch, 14); g.clip(); g.filter = "blur(18px)"; if (img) g.drawImage(img, tx - 30, ty, tw + 60, th, a - 30 * sc, b, cw + 60 * sc, ch); g.filter = "none";
      g.fillStyle = "rgba(255,210,63,.35)"; g.fillRect(a, b, cw, ch); g.restore();
    }
    // luz de lanterna: centro claro, bordas escurecidas e um pouco quentes
    const lk = o.lanterna ?? 0.8;
    if (lk > 0) {
      g.fillStyle = ART.rg(g, x0 + w * 0.5, y0 + h * 0.48, h * 0.25, w * 0.75, [[0, "rgba(255,220,150,0)"], [0.6, `rgba(30,16,40,${0.25 * lk})`], [1, `rgba(12,8,20,${0.75 * lk})`]]);
      g.fillRect(x0, y0, w, h);
      g.fillStyle = `rgba(255,190,90,${0.08 * lk})`; g.fillRect(x0, y0, w, h);
    }
    g.restore();
    // moldura: borda fina amarela + cantos de visor
    ART.rr(g, x0, y0, w, h, 34); g.lineWidth = 4; g.strokeStyle = "rgba(255,210,63,.75)"; g.stroke();
    ART.rr(g, x0 - 10, y0 - 10, w + 20, h + 20, 42); g.lineWidth = 2; g.strokeStyle = "rgba(255,210,63,.2)"; g.stroke();
    g.restore();
    // aba do capacete do Zeca no topo (POV de dentro do capacete), com a lanterna acesa no meio
    if (o.aba !== false) {
      const aba = ART.cache("gp:aba", W, 420, gg => {
        gg.beginPath(); gg.moveTo(-40, 0); gg.lineTo(W + 40, 0); gg.lineTo(W + 40, 120); gg.quadraticCurveTo(W / 2, 330, -40, 120); gg.closePath();
        gg.fillStyle = ART.lg(gg, 0, 0, 0, 260, [[0, "#8A6410"], [0.6, "#E0A920"], [1, "#FFD23F"]]); gg.fill();
        gg.beginPath(); gg.moveTo(-40, 120); gg.quadraticCurveTo(W / 2, 330, W + 40, 120); gg.lineWidth = 16; gg.strokeStyle = "#FFE58A"; gg.stroke();
        gg.beginPath(); gg.moveTo(-40, 140); gg.quadraticCurveTo(W / 2, 350, W + 40, 140); gg.lineWidth = 10; gg.strokeStyle = "rgba(60,40,6,.5)"; gg.stroke();
        // nervura e suporte da lanterna
        gg.fillStyle = "rgba(90,60,8,.45)"; gg.fillRect(W / 2 - 30, 0, 60, 200);
        ART.rr(gg, W / 2 - 70, 150, 140, 70, 24); gg.fillStyle = "#4A4656"; gg.fill();
      });
      g.save(); g.filter = "none"; g.drawImage(ART.blurred(aba, 5, "gp:abaB"), 0, -60); g.restore();
      ART.glow(g, W / 2, 140, 380, "#FFE2A0", 0.4);
      ART.beam(g, W / 2, 150, 90, y0 - 140, 120, w * 0.9, "#FFE6B0", 0.16);
    }
    // 3) rótulo + retrato
    if (o.rotulo !== null) {
      const ly = y0 + h + 64, lx = x0 + 10;
      if (o.retrato != null) {
        ART.rr(g, lx, ly - 46, 92, 92, 20); g.fillStyle = "#34304A"; g.fill(); g.lineWidth = 3; g.strokeStyle = "rgba(255,210,63,.6)"; g.stroke();
        g.save(); ART.rr(g, lx, ly - 46, 92, 92, 20); g.clip(); ART.zecaPix(g, o.retrato, lx + 46, ly + 2, 100); g.restore();
      }
      const tx = lx + (o.retrato != null ? 118 : 0);
      ART.circ(g, tx + 12, ly, 10); g.fillStyle = "#FF4D5E"; g.fill(); ART.glow(g, tx + 12, ly, 30, "#FF4D5E", 0.5 + 0.3 * Math.sin(t * 6));
      g.font = '900 40px "Nunito"'; g.fillStyle = "#F4EEDC"; g.textBaseline = "middle"; g.textAlign = "left"; g.letterSpacing = "3px";
      g.fillText(o.rotulo || "VISÃO DO ZECA", tx + 36, ly + 2); g.letterSpacing = "0px";
      g.font = '800 30px "Nunito"'; g.fillStyle = "rgba(244,238,220,.55)"; g.textAlign = "right"; g.fillText(o.fonte || "gameplay real", x0 + w - 10, ly + 2);
    }
    // 4) cronômetro desenhado por cima (canto superior direito do quadro)
    if (o.cronometro) ART.ui.cronometro(g, x0 + w - 170, y0 + 2, Object.assign({ s: 0.85, icone: "sol" }, o.cronometro));
    return { x0, y0, w, h, map };
  };
})();
