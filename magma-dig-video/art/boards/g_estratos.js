/* C8 — descida pelas camadas A–I (plano 18). */
ART.boards.g_estratos = { dur: 3, render(g, t, f) { ART.palco(g, t, { zoom: 1 }, ART.cenas.profundezas({ desce: 0.25 + t * 0.05 }), null, { frame: f }); } };
