/* EXEMPLO na convenção "um arquivo por plano" (scenes/planos/pNN.js). O kit (window.ART) já vem carregado.
 * Zeca dá dois golpes casados com os sfx 'picareta' do plano, CRAC! em cada um, contador sobe na palavra "uma"/"duas",
 * câmera em plano médio com tremor de impacto. Ver scenes/planos/p29.js para a versão completa. */
MD.plano("pXX", {
  render(g, t, ctx) {
    const H = (ctx.marks.picareta || [0.3, 1.1]);                       // tempos dos golpes (s, locais)
    const w = n => (ctx.words.find(x => x.w.toLowerCase().startsWith(n)) || {}).ini ?? 99;
    const cam = ART.camMais(ART.enquadrar(470, 1010, 1.85, { sy: 820 }), ART.camera(t, { push: [1, 1.04], dur: ctx.dur, hits: H }));
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.cubo(gg, 0.15, 2.9, { crack: H.filter(h => t >= h).length, seed: 4 });
      // cada golpe: impacto exatamente em H[i] (o ciclo 'cavando' tem impacto em 66% do período)
      const i = Math.max(0, H.findIndex(h => t <= h + 0.25)), P = 0.8;
      ART.zeca.draw(gg, ART.zeca.pose("cavando", t, { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: 1 }, { periodo: P, t0: H[i] - 0.66 * P }));
    }, { frame: ctx.frame });
    H.forEach(h => ART.ui.crac(g, 620, 800, t, h));
    ART.ui.cronometro(g, 790, 330, { valor: 8 - t, icone: "sol", s: 0.9 });
    ART.ui.contador(g, 250, 330, { valor: (t >= w("uma") ? 1 : 0) + (t >= w("duas") ? 1 : 0) });
  },
});
