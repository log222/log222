/* C2 — Mina A (Terra Rasa): quadro do teste de movimento no 2º golpe. */
ART.boards.c_mina = { dur: 7, async setup() { await new Promise(r => { const s = document.createElement("script"); s.src = "../boards/teste.js"; s.onload = r; document.head.appendChild(s); }); },
  render(g, t, f) { ART.boards.teste.render(g, t, f); } };
