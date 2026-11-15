#!/usr/bin/env python3
"""roteiro/parte-XX.shots.json -> story/parte-XX.json (falas + planos por palavra + destaques + sfx).

  .cache/venv/bin/python tools/gerar_story.py roteiro/parte-01.shots.json -o story/parte-01.json [--velocidade 1.1]

Regras:
- Fala (unidade de TTS) = frases inteiras consecutivas do mesmo bloco do roteiro, até ~--max-palavras palavras.
  Planos começam na 1ª palavra do seu trecho de narração (cortes no meio da frase são normais).
- Pausas intencionais: PAUSAS[id_plano] = segundos de silêncio depois da fala que termina nesse plano
  (plano 47 "Cobre." segura ~1 s).
- sfx do roteiro (texto livre) -> 19 efeitos sintetizados por regras de palavra-chave (MAPA abaixo);
  o que não casa vai para "sfx_sem_mapa" no plano (e é listado no fim).
O story gerado é o ponto de partida: pode ser editado à mão depois (não rode de novo por cima sem querer).
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Ajustes de efeito À MÃO por plano (pedidos dos animadores, casando som com a palavra em que a imagem reage).
# "remover": nomes tirados do mapeamento automático ("*" = todos); "adicionar": eventos acrescentados.
SFX_AJUSTE = {
    3: {"remover": ["*"], "adicionar": [{"nome": "tictac", "offset": 0.0, "vol": -4, "kw": {"dur": 0.9, "bpm": 240}}]},
    9: {"remover": ["ronco", "folha"], "adicionar": [{"nome": "ronco", "palavra": "dorme", "offset": 0.05, "vol": -8},
                                                    {"nome": "folha", "palavra": "aprende", "offset": 0.0}]},
    26: {"remover": ["porta"], "adicionar": []},
    29: {"remover": ["moeda"], "adicionar": [{"nome": "moeda", "palavra": "Uma", "offset": 0.0, "vol": -2},
                                            {"nome": "moeda", "palavra": "Duas", "offset": 0.0, "vol": -2}]},
    # 4 golpes distribuídos do início do plano até 0,2 s antes de "Quatro" (acompanha a duração real)
    40: {"remover": ["picareta"], "adicionar": [{"nome": "picareta", "offset": 0.05, "ate_palavra": "Quatro",
                                                 "antes": 0.2, "frac": k / 3, "seed": k} for k in range(4)]},
    30: {"remover": ["*"], "adicionar": [{"nome": "apagar", "offset": 0.1},
                                         {"nome": "moeda", "palavra": "Seis", "offset": 0.0, "vol": -2}]},
    31: {"remover": ["acorde"], "adicionar": [{"nome": "acorde", "palavra": "sete", "offset": 0.1, "vol": -6, "kw": {"tipo": "grave"}}]},
    36: {"remover": [], "adicionar": [{"nome": "ding", "palavra": "Tempo", "offset": 0.03, "vol": -6}]},
    50: {"remover": ["tictac"], "adicionar": [{"nome": "tictac", "offset": 0.1, "vol": -6, "kw": {"dur": 1.2, "bpm": 350}},
                                             {"nome": "pop", "palavra": "amanhã", "offset": 0.0, "vol": -6}]},
    51: {"remover": ["moeda"], "adicionar": [{"nome": "moeda", "palavra": "quarenta", "offset": 0.12, "vol": -2}]},
    52: {"remover": [], "adicionar": [{"nome": "giz", "palavra": "Faltam", "offset": 0.02, "vol": -6}]},
    57: {"remover": ["*"], "adicionar": [{"nome": "clique", "palavra": "dois.", "offset": 0.45},
                                         {"nome": "apagar", "palavra": "dois.", "offset": 0.5}]},
}
# Automação da trilha por deixa do roteiro (texto do campo sfx). Deixa persiste até a próxima deixa;
# "baixa"/"corte seco" voltam ao normal no 1º plano de outro bloco; "some" dura até a próxima deixa
# (silêncio de suspense p44 -> "Cobre." -> p48 "trilha baixa"); "suspensa" vai até o fim.
TRILHA_DEIXAS = [
    ("corte seco no silêncio da trilha", {"offset": 0.9, "db": -80, "rampa": 0.02}),   # p03: zero do cronômetro
    ("trilha some", {"offset": 0.0, "db": -80, "rampa": 0.8}),
    ("trilha baixa", {"offset": 0.0, "db": -10, "rampa": 0.6, "modo": "normal"}),
    ("trilha suspensa", {"offset": 0.0, "db": 0, "rampa": 1.0, "modo": "suspensa"}),
]
RESTAURA = {"db": 0, "rampa": 0.6, "modo": "normal"}

# Pronúncia por motor (só o áudio). "padrao" vale para todos; a seção do motor sobrescreve.
# Escolhas testadas com ASR de volta (Whisper + Parakeet), ver relatório da fase 3.
PRONUNCIA = {
    # Só o nome do jogo (palavra inglesa); português comum fica na grafia normal (fase 4: grafias como
    # "úm", "Mína", "cóbre", "Crák" foram removidas: o ASR não percebe tonicidade errada).
    "padrao": {"MAGMA DIG": "Magma Díg"},
    "kokoro": {"MAGMA DIG": "MAGMA /dˈiɡ/"},
}

PAUSAS = {47: 0.6}          # plano -> pausa depois da fala (s)
SEPARAR_ANTES = {47, 57}     # planos que começam uma fala própria (isolar para a pausa / fechamento)


def nk(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^\w]", "", s.lower())


def words(t):
    return t.split()


def sfx_for(p):
    """Traduz a descrição livre de som do roteiro em eventos {nome, palavra?|offset, vol, kw}."""
    txt = p["sfx"].lower()
    nar = words(p["narracao"])
    ev, usado = [], []
    cracs = [w for w in nar if nk(w) == "crac"]

    def add(nome, uso, **kw):
        ev.append({"nome": nome, **kw}); usado.append(uso)

    if "crac" in txt:
        grave = "grave" in txt
        if cracs:
            for n in range(len(cracs)):
                add("picareta", "crac", palavra="Crac", n=n, offset=0.0, **({"kw": {"pitch": 0.75}} if grave else {}))
        else:
            k = 4 if "acelerado" in txt else max(1, txt.count("crac"))
            for i in range(k):
                add("picareta", "crac", offset=round(0.05 + i * (0.22 if k > 2 else 0.35), 2), seed=i,
                    **({"kw": {"pitch": 0.75}} if grave else {}))
    if "plim" in txt:
        if cracs and "duas vezes" in txt:
            for n in range(len(cracs)):
                add("moeda", "plim", palavra="Crac", n=n, offset=0.3, vol=-2)
        elif "terminando em plim" in txt:
            add("moeda", "plim", no_fim=True, offset=-0.35, vol=-2)
        else:
            add("moeda", "plim", offset=0.25 if not cracs else 0.35, vol=-2)
    if "moedas" in txt and "plim" not in txt:
        add("moeda", "moedas", offset=0.1, vol=-4, kw={"pitch": 1.1})
    if "clique a cada nome" in txt:
        for n, w in enumerate(nar):
            add("clique", "clique", palavra=w.strip(".,"), offset=0.0, vol=-6, seed=n)
    elif "clique" in txt or "interruptor" in txt:
        add("clique", "clique", offset=0.02)
    if "apagando" in txt or "apaga" in txt or "falhando" in txt:
        add("apagar", "apagar", offset=0.1 if "falhando" not in txt else 0.3)
    if "zumbido" in txt and "estabiliza" not in txt:
        add("zumbido", "zumbido", offset=0.05, vol=-10)
    if "estabiliza" in txt:
        add("zumbido", "zumbido", offset=0.0, vol=-8, kw={"dur": 1.0})
    if "tique-taque" in txt:
        add("tictac", "tique", offset=0.0, vol=-4, kw={"dur": "plano", "bpm": 240 if "acelerado" in txt or "rápido" in txt else 120})
    elif "tique" in txt:
        add("tictac", "tique", offset=0.0, vol=-4, kw={"dur": 0.6, "bpm": 200})
    if "whoosh" in txt or "golpe no vazio" in txt:
        add("whoosh", "whoosh", offset=0.0, vol=-6)
    if "giz" in txt or "risco de giz" in txt:
        add("giz", "giz", offset=0.05, vol=-4)
    for k, tipo in [("acorde claro", "claro"), ("acorde quente", "quente"), ("acorde de recompensa", "recompensa"),
                    ("acorde subindo", "subindo"), ("nota grave", "grave"), ("batida grave", "grave"),
                    ("nota dissonante", "dissonante")]:
        if k in txt:
            add("acorde", k, offset=0.05, vol=-6, kw={"tipo": tipo})
    if "batida pesada" in txt:
        add("boom", "batida pesada", offset=0.1, vol=-8)
    if "coração" in txt:
        add("coracao", "coração", offset=0.0, vol=-2)
    if "rumor" in txt or "broca" in txt or "ronco" in txt:
        add("ronco", "rumor", offset=0.0, vol=-8)
    if "passo" in txt or "passinh" in txt:
        add("passos", "passos", offset=0.0, vol=-6)
    if "areia" in txt or "rangendo" in txt:
        add("rachar", "areia/metal", offset=0.1, vol=-10)
    if "vento" in txt or "grilo" in txt:
        add("vento", "vento", offset=0.0, vol=-6, kw={"dur": "plano", "grilos": "grilo" in txt})
    if "folha" in txt or "página" in txt:
        add("folha", "folha", offset=0.3, vol=-6)
    if "porta" in txt:
        add("porta", "porta", offset=0.2, vol=-6)
    if "poeira" in txt or "pedrinha" in txt:
        add("pedrinhas", "poeira", offset=0.25, vol=-8)
    if "chiado" in txt:
        add("chiado", "chiado", offset=0.0, vol=-8, kw={"dur": "plano"})
    if "eco" in txt:
        for e in ev:
            if e["nome"] == "whoosh":
                e.setdefault("kw", {})["eco"] = True
    if "brilho" in txt or "faísca" in txt:
        add("ding", "brilho", offset=0.15 if "faísca" in txt else 0.0, vol=-8, kw={"pitch": 1.5})
    sem = [x.strip() for x in re.split(r"[+,]", p["sfx"]) if x.strip() and not any(
        u in x.lower() for u in ["crac", "plim", "moeda", "clique", "interruptor", "apag", "falhando", "zumbido",
                                 "estabiliza", "tique", "whoosh", "golpe", "giz", "acorde", "nota", "batida",
                                 "coração", "rumor", "broca", "ronco", "passo", "passinh", "areia", "rangendo", "brilho", "faísca",
                                 "vento", "grilo", "folha", "página", "porta", "poeira", "chiado", "eco", "trilha",
                                 "duas vezes", "sem resolver"])]
    return ev, sem


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shots")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--velocidade", type=float, default=1.0)
    ap.add_argument("--max-palavras", type=int, default=20)
    ap.add_argument("--motor", default="kokoro", help="kokoro (interno) | supertonic | qwen | chatterbox ...")
    ap.add_argument("--voz", default=None)
    a = ap.parse_args()
    d = json.loads(Path(a.shots).read_text())
    planos = d["planos"]

    # 1) unidades = frases completas (1+ planos)
    sent, units = [], []
    for p in planos:
        sent.append(p)
        if re.search(r"[.?!…]$", p["narracao"].strip()):
            units.append(sent); sent = []
    if sent:
        units.append(sent)
    # 2) agrupa frases do mesmo bloco em falas
    falas, cur = [], []
    for u in units:
        nw = sum(len(words(p["narracao"])) for p in cur)
        start_new = (not cur or cur[0]["bloco"] != u[0]["bloco"] or nw + sum(len(words(p["narracao"])) for p in u) > a.max_palavras
                     or u[0]["id"] in SEPARAR_ANTES or cur[-1]["id"] in PAUSAS or cur[-1]["id"] in SEPARAR_ANTES)
        if start_new and cur:
            falas.append(cur); cur = []
        cur += u
    if cur:
        falas.append(cur)

    out_falas, sem_mapa = [], []
    estado = {"trilha": None, "bloco": None}
    for fi, ps in enumerate(falas):
        texto = " ".join(p["narracao"].strip() for p in ps)
        f = {"id": f"f{fi + 1:02d}", "texto": texto, "planos": []}
        if ps[-1]["id"] in PAUSAS:
            f["pausa_depois"] = PAUSAS[ps[-1]["id"]]
        idx = 0
        for p in ps:
            ev, sem = sfx_for(p)
            if p["id"] in SFX_AJUSTE:
                aj = SFX_AJUSTE[p["id"]]
                ev = [] if "*" in aj["remover"] else [e for e in ev if e["nome"] not in aj["remover"]]
                ev += json.loads(json.dumps(aj["adicionar"]))
            pl = {"id": f"p{p['id']:02d}", "inicio": idx, "cena": "auto",
                  "destaques": p.get("destaques", []), "sfx": ev,
                  "roteiro": {k: p[k] for k in ("id", "bloco", "cenario", "acao", "camera", "ui", "sfx", "usa_gameplay", "narracao")}}
            # trilha
            cues = [dict(c) for k, c in TRILHA_DEIXAS if k in p["sfx"].lower()]
            if cues and estado["trilha"] and cues[-1].get("modo") == estado["trilha"].get("modo") == "suspensa":
                cues = []                               # já está suspensa: não reinicia
            if cues:
                pl["trilha"] = cues[-1:]
                estado["trilha"] = cues[-1]; estado["bloco"] = p["bloco"]
            elif (estado["trilha"] and estado["trilha"].get("modo") != "suspensa" and estado["trilha"].get("db") != -80
                  or estado["trilha"] and estado["trilha"].get("rampa") == 0.02) and p["bloco"] != estado["bloco"]:
                pl["trilha"] = [dict(RESTAURA)]
                estado["trilha"] = None
            if sem:
                pl["sfx_sem_mapa"] = sem
                sem_mapa.append((p["id"], sem))
            f["planos"].append(pl)
            idx += len(words(p["narracao"]))
        out_falas.append(f)
    story = {
        "titulo": d.get("titulo", ""),
        "_gerado_por": "tools/gerar_story.py a partir de " + a.shots,
        "motor": a.motor, "voz": a.voz or {"kokoro": "pm_alex", "supertonic": "M1"}.get(a.motor, "narrador-jovem"),
        "velocidade": a.velocidade, "trilha": True,
        "pronuncia": PRONUNCIA,
        "estilo": {"audio": {"sfx_db": -10.0}},
        "falas": out_falas,
    }
    Path(a.out).write_text(json.dumps(story, ensure_ascii=False, indent=1))
    nw = sum(len(words(f["texto"])) for f in out_falas)
    print(f"{len(out_falas)} falas, {len(planos)} planos, {nw} palavras -> {a.out}")
    for f in out_falas:
        print(f"  {f['id']} ({len(words(f['texto']))} pal, planos {[p['id'] for p in f['planos']]}): {f['texto']}")
    print("deixas de trilha:", [(pl["id"], pl["trilha"]) for f in out_falas for pl in f["planos"] if pl.get("trilha")])
    if sem_mapa:
        print("sfx do roteiro sem efeito correspondente (ignorados):")
        for i, s in sem_mapa:
            print(f"  plano {i}: {s}")


if __name__ == "__main__":
    main()
