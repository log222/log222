/* Carregador do kit: inclui os módulos em ordem e as fontes.
 *   await ART_LOAD("../art/kit/")   // caminho da pasta kit relativo à página
 * Depois: await ART.ready()
 */
window.ART_LOAD = async function (base = "../art/kit/") {
  const files = ["core.js", "zeca.js", "mundo.js", "cenas.js", "cenas2.js", "ui.js", "gameplay.js"];
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "../fonts/fonts.css"; document.head.appendChild(css);
  for (const f of files) {
    if (window.ART && window.ART["_mod_" + f]) continue;
    await new Promise((res, rej) => { const s = document.createElement("script"); s.src = base + f; s.onload = res; s.onerror = () => rej(new Error("falha " + f)); document.head.appendChild(s); });
    window.ART["_mod_" + f] = true;
  }
  window.ART.base = base;
  await window.ART.ready();
  return window.ART;
};
