/* Legenda de exemplo aplicada (só para julgar contraste): Anton, branco + 1 palavra amarela, centro y≈1400. */
ART.boards.legenda = { dur: 7, async setup() { await new Promise(r => { const s = document.createElement("script"); s.src = "../boards/teste.js"; s.onload = r; document.head.appendChild(s); }); },
  render(g, t, f) { ART.boards.teste.render(g, t, f); ART.ui.legendaExemplo(g, "SÓ DEZ *SEGUNDOS?*", { y: 1400 }); } };
