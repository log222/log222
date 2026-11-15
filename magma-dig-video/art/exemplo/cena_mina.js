/* EXEMPLO de cena do pipeline usando o kit (copie para scenes/planos/pNN.js e troque o nome em MD.scene).
 * Carrega o kit uma vez (art/kit/art.js), monta a cena da mina e desenha tudo por t num canvas. */
(function () {
  const NOME = (document.currentScript && document.currentScript.dataset.nome) || "../art/exemplo/cena_mina";
  const carregarKit = async () => {
    if (!window.ART_LOAD) await new Promise((res, rej) => { const s = document.createElement("script"); s.src = MD.asset("art/kit/art.js"); s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return window.ART_LOAD(MD.asset("art/kit/"));
  };
  MD.scene(NOME, {
    async setup(el, p, ctx) {
      await carregarKit();
      const { g } = MD.canvas(el);
      return { g, cena: ART.cenas.mina({}) };
    },
    render(s, t, ctx) {
      const g = s.g, golpes = MD.marks(ctx, "picareta");             // sincroniza com o sfx do pipeline
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1080, 1920);
      const cam = ART.camera(t, { push: [1, 1.08], dur: ctx.beat.dur, hits: golpes });
      ART.palco(g, t, cam, s.cena, gg => {
        ART.cubo(gg, 0.15, 2.9, { crack: golpes.filter(h => t >= h).length, seed: 4 });
        ART.zeca.draw(gg, ART.zeca.pose("cavando", t, { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: 1, cone: 0.4 }, { periodo: 0.9, t0: (golpes[0] ?? 0.6) - 0.594 }));
      }, { frame: ctx.frame });
      for (const h of golpes) ART.ui.crac(g, 650, 900, t, h);
      ART.ui.cronometro(g, 790, 340, { valor: Math.max(0, 10 - t), icone: "sol", s: 0.9 });
    },
  });
})();
