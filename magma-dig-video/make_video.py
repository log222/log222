#!/usr/bin/env python3
"""story/parte-XX.json -> MP4 1080x1920 30 fps (narração TTS ou gravada, planos por palavra, legenda, sfx, trilha).

  .cache/venv/bin/python make_video.py story/parte-01.json -o out/parte-01.mp4 --contact-sheet
  ... --rascunho                 540x960, encode rápido
  ... --plano p05,p06            só esses planos (também aceita ids de fala; --beat é sinônimo)
  ... --trecho 3.5-8             só esse intervalo (s)
  ... --sem-trilha               sem música (efeitos e voz continuam)
  ... --voz pf_dora --velocidade 1.05
  ... --contact-sheet            out/<nome>-contact.png a partir do vídeo
  ... --so-contact-sheet         NÃO renderiza vídeo: só os quadros do contact sheet (rápido)
  ... --cs-cortes                contact sheet com 1 quadro no meio de cada plano
  ... --zona-segura              desenha a zona segura do Instagram por cima (revisão)
  ... --narracao-audio voz.m4a [--narracao-tempos tempos.json]   usa narração gravada (alinhada palavra a palavra)
"""
from __future__ import annotations

import argparse
import copy
import difflib
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from lib import align as AL  # noqa: E402
from lib import fsutil as FS  # noqa: E402
from lib import mix as MX  # noqa: E402
from lib import narration as N  # noqa: E402
from lib import sfx as X  # noqa: E402
from lib import tts_engine as T  # noqa: E402
from lib import voz_externa as VX  # noqa: E402

PUNCT_BREAK = re.compile(r"[.,!?;:…]$")
FUNC = {"a", "o", "as", "os", "e", "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas", "um", "uma",
        "que", "pra", "por", "com", "se", "seu", "sua", "ao", "mais", "mas", "ou"}
ASR_CACHE = ROOT / ".cache" / "asr_cache"


def deep_merge(a, b):
    out = copy.deepcopy(a)
    for k, v in (b or {}).items():
        out[k] = deep_merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else copy.deepcopy(v)
    return out


def nk(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^\w]", "", s.lower())


def resolve_pron(story, motor):
    """pronuncia: {"padrao": {...}, "<motor>": {...}} (seção do motor sobrescreve) ou dict plano (legado).
    Valores /IPA/ só valem no kokoro; em outro motor são ignorados com aviso."""
    pr = story.get("pronuncia", {})
    if story.get("pronuncia_arquivo"):
        pr = deep_merge(json.loads((ROOT / story["pronuncia_arquivo"]).read_text()), pr)
    if any(isinstance(v, dict) for v in pr.values()):
        out = dict(pr.get("padrao", {})); out.update(pr.get(motor, {}))
    else:
        out = dict(pr)
    if motor != "kokoro":
        for k in [k for k, v in out.items() if "/" in v]:
            print(f"  AVISO: pronúncia IPA '{k}' -> '{out[k]}' ignorada no motor {motor} (IPA só no kokoro)")
            out.pop(k)
    out.pop("_doc", None)
    return out


def die(msg):
    sys.exit(f"ERRO: {msg}")


def clean_words(text):
    return [w.replace("*", "") for w in T.tokenize(text)]


# ------------------------------------------------------- normalização do story
def legacy_beats_to_falas(story, tempo):
    """Formato antigo (beats = 1 fala com 1 plano) -> falas/planos."""
    falas = []
    for b in story["beats"]:
        f = {"id": b["id"], "texto": b.get("narracao", ""), "legenda": b.get("legenda"),
             "pausa_depois": float(b.get("respiro", tempo["respiro"])) + tempo["entrada_beat"],
             "duracao": b.get("duracao"), "duracao_min": b.get("duracao_min"), "final": b.get("final"),
             "planos": [{k: b[k] for k in ("cena", "params", "transicao", "sfx", "legenda_pos", "legenda_estilo",
                                          "sem_legenda") if k in b} | {"id": b["id"], "inicio": 0,
                                                                         "destaques": b.get("enfase", [])}]}
        falas.append(f)
    return falas


def resolve_inicio(pl, words, where):
    """inicio: índice da palavra (int) | "texto" | {"palavra": "x", "n": 0}."""
    ini = pl.get("inicio", 0)
    if isinstance(ini, int):
        if not 0 <= ini < max(1, len(words)):
            die(f"{where}: inicio {ini} fora da fala ({len(words)} palavras)")
        return ini
    if isinstance(ini, str):
        ini = {"palavra": ini}
    alvo, n = nk(ini["palavra"]), int(ini.get("n", 0))
    hits = [i for i, w in enumerate(words) if nk(w) == alvo]
    if len(hits) <= n:
        die(f"{where}: palavra de início '{ini['palavra']}' (ocorrência {n}) não está na fala")
    return hits[n]


def normalize(story, st, scenes_dir):
    tempo = st["tempo"]
    falas = copy.deepcopy(story["falas"]) if "falas" in story else legacy_beats_to_falas(story, tempo)
    if not falas:
        die("story sem falas/beats")
    ids, planos = set(), []
    for fi, f in enumerate(falas):
        f.setdefault("id", f"f{fi + 1:02d}")
        words = clean_words(f.get("texto", ""))
        f["_words"] = words
        if not words and not f.get("duracao"):
            die(f"fala {f['id']}: sem texto precisa de 'duracao'")
        pls = f.get("planos") or [{"id": f["id"], "cena": "auto"}]
        starts = []
        for pi, pl in enumerate(pls):
            where = f"fala {f['id']} plano #{pi} ({pl.get('id', '?')})"
            pl.setdefault("id", f"{f['id']}_{pi}")
            if pl["id"] in ids:
                die(f"{where}: id repetido")
            ids.add(pl["id"])
            if not re.fullmatch(r"[A-Za-z0-9_-]+", pl["id"]):
                die(f"{where}: id só com letras/números/_/-")
            pl.setdefault("cena", "auto")
            if not (scenes_dir / f"{pl['cena']}.js").exists():
                die(f"{where}: cena '{pl['cena']}' não existe em scenes/")
            pl["_ini_idx"] = resolve_inicio(pl, words, where) if words else 0
            if pi == 0 and pl["_ini_idx"] != 0:
                die(f"{where}: o 1º plano da fala tem que começar na palavra 0")
            if starts and pl["_ini_idx"] <= starts[-1]:
                die(f"{where}: planos fora de ordem/sobrepostos (inicio {pl['_ini_idx']})")
            starts.append(pl["_ini_idx"])
            for s in pl.get("sfx", []):
                if s.get("nome") not in X.LIB:
                    die(f"{where}: sfx '{s.get('nome')}' não existe. Use: {', '.join(X.NAMES)}")
            pl["_fala"] = fi
            pl["transicao"] = norm_transition(pl, len(planos), st)
            if pl["cena"] == "auto":
                pl.setdefault("params", {})
                pl["params"]["plano"] = pl["id"]
                pl["params"]["arquivo"] = (scenes_dir / "planos" / f"{pl['id']}.js").exists()
            planos.append(pl)
        f["planos"] = pls
    return falas, planos


def norm_transition(pl, i, st):
    """transicao: "corte" | "fade" | {"tipo", "dur", "sfx"}. Corte não herda sfx."""
    raw = pl.get("transicao", {})
    raw = {"tipo": raw} if isinstance(raw, str) else dict(raw)
    tr = deep_merge(st["transicao_padrao"], raw)
    if tr["tipo"] == "corte":
        tr["dur"] = 0
        tr["sfx"] = raw.get("sfx")
    if i == 0:
        tr = {"tipo": "corte", "dur": 0, "sfx": None}
    return tr


# ------------------------------------------------------------- narração
def asr_cached(audio):
    ASR_CACHE.mkdir(parents=True, exist_ok=True)
    h = hashlib.sha1(audio.tobytes()).hexdigest()[:20]
    p = ASR_CACHE / f"{h}.json"
    if p.exists():
        return [tuple(x) for x in json.loads(p.read_text())]
    w = AL.asr_words(audio)
    FS.write_text(p, json.dumps(w))
    return w


def fala_clips(falas, voice, speed, pron, rec_audio=None, rec_tempos=None, workdir=None, stats=None,
               motor="kokoro", atempo=1.0, regerar=(), voz_pasta=None):
    """Para cada fala: {audio(24k), palavras[(w, ini, fim)] relativos} ou None (fala muda)."""
    clips = [None] * len(falas)
    if rec_audio:
        full = N.load_any(rec_audio)
        idx = [i for i, f in enumerate(falas) if f["_words"]]
        if rec_tempos:
            data = json.loads(Path(rec_tempos).read_text())
            fr = data["frases"]
            if len(fr) != len(idx):
                die(f"tempos têm {len(fr)} frases mas o story tem {len(idx)} falas com texto")
            spans = [(f["ini"], f["fim"], [(p["w"], p["ini"], p["fim"]) for p in f["palavras"]]) for f in fr]
        elif AL.available():
            # alinhamento palavra a palavra do arquivo inteiro: ASR + interpolação por fonemas
            allw, alls, owner = [], [], []
            for i in idx:
                w = falas[i]["_words"]; allw += w; alls += T.apply_pronunciation(w, pron); owner += [i] * len(w)
            tt = AL.hybrid_times(full, allw, alls, asr=asr_cached(full), stats=stats)
            spans = []
            for i in idx:
                ks = [k for k, o in enumerate(owner) if o == i]
                spans.append((tt[ks[0]][0], tt[ks[-1]][1], [(allw[k], tt[k][0], tt[k][1]) for k in ks]))
        else:
            phrases = [{"texto": falas[i]["texto"].replace("*", ""), "grupo": falas[i]["id"]} for i in idx]
            d = N.realign(rec_audio, phrases, workdir / "alinhamento", pron=pron)
            spans = [(f["ini"], f["fim"], [(p["w"], p["ini"], p["fim"]) for p in f["palavras"]]) for f in d["frases"]]
        # fim de cada fala pelo ASR é impreciso (fim do último token): encaixa no início do 1º silêncio
        # >= 0,12 s depois do início da última palavra (limitado pelo começo da próxima fala)
        snapped = []
        VM = T.voiced_mask(full)            # limiar global (relativo à fala do arquivo inteiro)
        vm = lambda a0, a1: VM[int(a0 * 100): int(a1 * 100)]
        for q, (ini, fim, ws) in enumerate(spans):
            lim = spans[q + 1][0] if q + 1 < len(spans) else len(full) / T.SR
            w0 = ws[-1][1]
            m = vm(w0, lim) if lim - w0 > 0.1 else np.ones(1, bool)
            end, run = None, 0
            for k, v in enumerate(m):
                run = 0 if v else run + 1
                if run >= 12 and k * 0.01 > 0.1:
                    end = w0 + (k - run + 1) * 0.01; break
            if end is None:
                end = min(fim, lim)
            ws = ws[:-1] + [(ws[-1][0], ws[-1][1], max(ws[-1][1] + 0.05, end))]
            # início: 1º trecho vozeado (>= 30 ms) entre o fim da fala anterior e a 1ª palavra + 0,15 s
            lo = snapped[-1][1] + 0.02 if snapped else max(0.0, ini - 0.5)
            hi = max(ws[0][2], ws[0][1] + 0.3)
            if hi - lo > 0.1:
                m = vm(lo, hi)
                for k in range(len(m) - 3):
                    if m[k] and m[k + 1] and m[k + 2]:
                        ini = lo + k * 0.01; break
            ws = [(ws[0][0], min(ws[0][1], ini) if ini < ws[0][1] else ini, ws[0][2])] + ws[1:]
            snapped.append((ini, end, ws))
        spans = snapped
        al = {"versao": 1, "audio": str(rec_audio), "frases": []}
        for i, (ini, fim, ws) in zip(idx, spans):
            a0, a1 = max(0, ini - 0.04), fim + 0.06
            seg = full[int(a0 * T.SR): int(a1 * T.SR)]
            clips[i] = {"audio": seg, "palavras": [(w, x - a0, y - a0) for w, x, y in ws]}
            al["frases"].append({"i": len(al["frases"]), "grupo": falas[i]["id"], "texto": falas[i]["texto"].replace("*", ""),
                                 "ini": round(ini, 3), "fim": round(fim, 3),
                                 "palavras": [{"w": w, "ini": round(x, 3), "fim": round(y, 3)} for w, x, y in ws]})
        (workdir / "alinhamento").mkdir(exist_ok=True, parents=True)
        FS.write_text(workdir / "alinhamento" / "tempos.json", json.dumps(al, ensure_ascii=False, indent=1))
        print(f"  alinhamento da gravação -> {workdir / 'alinhamento' / 'tempos.json'} (edite e use --narracao-tempos se precisar)")
        return clips
    use_asr = AL.available()
    ext = {}
    com_texto = [f for f in falas if f["_words"]]
    if voz_pasta:
        ext = VX.ler_pasta(voz_pasta, com_texto)
    elif motor != "kokoro":
        # externo: gera em lote só o que falta no cache (por fala: velocidade/take podem variar)
        grupos = {}
        for f in com_texto:
            falado = " ".join(w for w in T.apply_pronunciation(f["_words"], pron) if w)
            grupos.setdefault(float(f.get("velocidade", speed)), []).append(
                {"id": f["id"], "falado": falado, "take": int(f.get("take", 0))})
        for vel, its in grupos.items():
            ext.update(VX.gerar(its, motor, voice, vel, atempo, regerar=set(regerar)))
    for i, f in enumerate(falas):
        words = f["_words"]
        if not words:
            continue
        spoken = T.apply_pronunciation(words, pron)
        if f["id"] in ext:
            a = ext[f["id"]]
        else:
            if f["id"] in regerar:
                N.synth_cached(" ".join(w for w in spoken if w), voice, float(f.get("velocidade", speed)), refresh=True)
            a = N.synth_cached(" ".join(w for w in spoken if w), voice, float(f.get("velocidade", speed)))
        if use_asr:
            wt = AL.hybrid_times(a, words, spoken, asr=asr_cached(a), stats=stats)
        else:
            wt = T.estimate_word_times(a, words, spoken)
        clips[i] = {"audio": a, "palavras": [(w, x, y) for w, (x, y) in zip(words, wt)]}
    return clips


def layout(falas, clips, tempo, meta, workdir):
    sr = T.SR
    parts, t, frases, out = [], 0.0, [], []

    def silence(s):
        nonlocal t
        n = int(round(max(0.0, s) * sr))
        if n:
            parts.append(np.zeros(n, np.float32)); t += n / sr

    for i, f in enumerate(falas):
        if i == 0:
            silence(tempo["inicio"])
        silence(float(f.get("pausa_antes", 0)))
        ini = t
        words = []
        c = clips[i]
        if c:
            off = t
            words = [{"w": w, "ini": off + x, "fim": off + y} for w, x, y in c["palavras"]]
            parts.append(c["audio"].astype(np.float32)); t += len(c["audio"]) / sr
            frases.append({"i": len(frases), "grupo": f["id"], "texto": f["texto"].replace("*", ""),
                           "ini": round(off, 3), "fim": round(t, 3),
                           "palavras": [{"w": w["w"], "ini": round(w["ini"], 3), "fim": round(w["fim"], 3)} for w in words]})
        else:
            silence(float(f["duracao"]))
        silence(float(f["pausa_depois"]) if f.get("pausa_depois") is not None else tempo["pausa_fala"])
        if f.get("duracao_min"):
            silence(ini + float(f["duracao_min"]) - t)
        if i == len(falas) - 1:
            silence(float(f["final"]) if f.get("final") is not None else tempo["final"])
        out.append({"ini": ini, "fim": t, "words": words})
    audio = np.concatenate(parts)
    FS.write_wav(workdir / "narracao.wav", audio, sr)
    data = dict(versao=1, audio="narracao.wav", sr=sr, duracao=round(len(audio) / sr, 3), frases=frases, **meta)
    FS.write_text(workdir / "tempos.json", json.dumps(data, ensure_ascii=False, indent=1))
    return out, audio


def plano_times(falas, planos, laid, total, tempo):
    """início/fim absoluto de cada plano: corte logo antes da palavra de início."""
    starts = []
    for pl in planos:
        lf = laid[pl["_fala"]]
        if lf["words"]:
            s = lf["words"][pl["_ini_idx"]]["ini"] - tempo["corte_antecipado"]
        else:
            s = lf["ini"]
        starts.append(max(0.0, s))
    starts[0] = 0.0
    for k in range(1, len(starts)):
        if starts[k] < starts[k - 1] + 0.1:
            print(f"  AVISO: plano {planos[k]['id']} começa colado no anterior ({starts[k] - starts[k - 1]:.2f}s)")
            starts[k] = starts[k - 1] + 0.1
    ends = starts[1:] + [total]
    return starts, ends


# --------------------------------------------------------------- legenda
def shown_words(f, lf):
    """Palavras EXIBIDAS da fala (legenda ou texto) com tempos absolutos."""
    spoken = lf["words"]
    text = f.get("legenda") or f.get("texto", "")
    shown = []
    for tk in T.tokenize(text):
        w, star = T.strip_markup(tk)
        shown.append({"w": w, "enfase": star})
    if not shown or not spoken:
        return []
    if len(shown) == len(spoken):
        for s, p in zip(shown, spoken):
            s["ini"], s["fim"] = p["ini"], p["fim"]
        return shown
    sm = difflib.SequenceMatcher(a=[nk(x["w"]) for x in shown], b=[nk(p["w"]) for p in spoken], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                shown[i1 + k]["ini"], shown[i1 + k]["fim"] = spoken[j1 + k]["ini"], spoken[j1 + k]["fim"]
        elif i2 > i1:
            if j2 > j1:
                t0, t1 = spoken[j1]["ini"], spoken[j2 - 1]["fim"]
            else:
                t0 = spoken[j1 - 1]["fim"] if j1 > 0 else spoken[0]["ini"]; t1 = t0 + 0.15
            L = [max(1, len(nk(x["w"]))) for x in shown[i1:i2]]
            e = np.concatenate([[0], np.cumsum(L)]) / sum(L)
            for k in range(i2 - i1):
                shown[i1 + k]["ini"] = t0 + (t1 - t0) * e[k]; shown[i1 + k]["fim"] = t0 + (t1 - t0) * e[k + 1]
    return shown


def build_captions(falas, planos, laid, pstart, pend, st):
    L = st["legenda"]
    rm = L.get("remover_pontuacao", "")
    maxu, maxc, alvo = L["max_palavras"], L["max_caracteres"], L.get("dur_alvo_bloco", 9)
    blocks = []
    for fi, (f, lf) in enumerate(zip(falas, laid)):
        sw = shown_words(f, lf)
        for k, pl in enumerate(planos):
            if pl["_fala"] != fi or pl.get("sem_legenda"):
                continue
            a, b = pstart[k], pend[k]
            ws = [w for w in sw if a - 1e-6 <= w["ini"] < b - 1e-6]
            if not ws:
                continue
            # destaques: frases (1+ palavras) viram uma unidade só, em amarelo
            dests = [[nk(x) for x in d.split()] for d in pl.get("destaques", [])]
            units, i = [], 0
            while i < len(ws):
                hit = None
                for d in sorted(dests, key=len, reverse=True):
                    if d and [nk(x["w"]) for x in ws[i:i + len(d)]] == d:
                        hit = d; break
                if hit:
                    units.append({"ws": ws[i:i + len(hit)], "enfase": True}); i += len(hit)
                else:
                    units.append({"ws": [ws[i]], "enfase": ws[i]["enfase"]}); i += 1
            cur = []

            def flush():
                if cur:
                    pal = [{"w": (w["w"].rstrip(rm) or w["w"]) if rm else w["w"], "ini": round(w["ini"], 3),
                            "fim": round(w["fim"], 3), "enfase": u["enfase"]} for u in cur for w in u["ws"]]
                    blocks.append({"plano": pl["id"], "palavras": pal, "pos": pl.get("legenda_pos"),
                                   "estilo": pl.get("legenda_estilo"), "_end": b, "_min": a})
                    cur.clear()

            for u in units:
                if cur:
                    prev = cur[-1]["ws"][-1]
                    chars = sum(len(w["w"]) + 1 for x in cur for w in x["ws"]) + sum(len(w["w"]) + 1 for w in u["ws"]) - 1
                    hard = ((L.get("quebrar_em_pontuacao", True) and PUNCT_BREAK.search(prev["w"])) or
                            u["ws"][0]["ini"] - prev["fim"] > 0.35)
                    if hard or len(cur) >= maxu or chars > maxc or \
                            (len(cur) >= 2 and u["ws"][0]["ini"] - cur[0]["ws"][0]["ini"] >= alvo):
                        # não deixa artigo/preposição pendurado no fim do bloco ("QUEM MARCA A")
                        carry = None
                        if not hard and len(cur) >= 2 and not cur[-1]["enfase"] and nk(cur[-1]["ws"][-1]["w"]) in FUNC:
                            carry = cur.pop()
                        flush()
                        if carry:
                            cur.append(carry)
                cur.append(u)
            flush()
    for i, bl in enumerate(blocks):
        bl["ini"] = round(max(bl.pop("_min"), bl["palavras"][0]["ini"] - 0.04), 3)
    for i, bl in enumerate(blocks):
        last = bl["palavras"][-1]["fim"]
        end = min(last + L["segurar_fim"], bl.pop("_end"))
        if i + 1 < len(blocks):
            nxt = blocks[i + 1]["ini"]
            if nxt - last < 0.7:
                end = nxt      # legenda contínua: segura até o próximo bloco
            end = min(end, nxt)
        bl["fim"] = round(max(end, bl["ini"] + 0.2), 3)
        if not bl["estilo"]:
            bl.pop("estilo")
        if not bl["pos"]:
            bl.pop("pos")
    return blocks


# ---------------------------------------------------------------- efeitos
def build_trilha(planos, laid, pstart, pend):
    """deixas de trilha por plano: "trilha": [{"db": -60, "rampa": 0.4, "modo": "normal"|"suspensa",
    "offset": s, "palavra": "x", "n": 0, "no_fim": true}] -> eventos absolutos para lib.music.automation."""
    ev = []
    for k, pl in enumerate(planos):
        fw = laid[pl["_fala"]]["words"]
        for c in pl.get("trilha", []):
            if c.get("no_fim"):
                base = pend[k]
            elif c.get("palavra"):
                hits = [w for w in fw if w["ini"] >= pstart[k] and nk(w["w"]) == nk(c["palavra"])] or \
                       [w for w in fw if nk(w["w"]) == nk(c["palavra"])]
                if not hits:
                    die(f"plano {pl['id']}: deixa de trilha referencia palavra '{c['palavra']}' ausente")
                base = hits[min(len(hits) - 1, int(c.get("n", 0)))]["ini"]
            else:
                base = pstart[k]
            ev.append({"t": round(base + float(c.get("offset", 0)), 3), "db": c.get("db"), "modo": c.get("modo"),
                       "rampa": float(c.get("rampa", 0.3)), "plano": pl["id"]})
            ev[-1] = {k2: v for k2, v in ev[-1].items() if v is not None}
    return ev


def build_sfx(falas, planos, laid, pstart, st):
    events, marks = [], [dict() for _ in planos]
    td = st["transicao_padrao"]
    for k, pl in enumerate(planos):
        a = pstart[k]
        fw = laid[pl["_fala"]]["words"]
        pw = [w for w in fw if w["ini"] >= a]
        for s in pl.get("sfx", []):
            base = a
            if s.get("palavra"):
                hits = [w for w in pw if nk(w["w"]) == nk(s["palavra"])] or [w for w in fw if nk(w["w"]) == nk(s["palavra"])]
                if not hits:
                    die(f"plano {pl['id']}: sfx '{s['nome']}' referencia palavra '{s['palavra']}' que não está na fala")
                base = hits[min(len(hits) - 1, int(s.get("n", 0)))]["ini"]
            t = base + float(s.get("offset", 0))
            events.append({"t": t, "nome": s["nome"], "vol": float(s.get("vol", 0)), "seed": int(s.get("seed", k)),
                           "kw": s.get("kw", {}), "plano": pl["id"]})
            marks[k].setdefault(s["nome"], []).append(round(t - a, 3))
        tr = pl["transicao"]
        if k > 0 and tr.get("sfx"):
            snd = X.make(tr["sfx"])
            events.append({"t": a - len(snd) / X.SR / 2 if tr["sfx"] == "whoosh" else a, "nome": tr["sfx"],
                           "vol": float(tr.get("sfx_vol", td.get("sfx_vol", -10))), "seed": k, "kw": {}, "plano": pl["id"]})
    return events, marks


# ----------------------------------------------------------------- render
def _print_warn(lines, seen):
    for line in lines:
        if line.startswith("AVISO") and line not in seen:
            seen.add(line); print("  " + line)


def run_render(tl_path, f0, f1, outdir, scale, workers, crf, preset, label):
    n = f1 - f0
    workers = max(1, min(workers, math.ceil(n / 15)))
    cuts = [f0 + round(n * k / workers) for k in range(workers + 1)]
    stats, seen = [], set()

    def job(k):
        seg = outdir / f"seg{k:02d}.mp4"
        cmd = ["node", str(ROOT / "render" / "render.js"), "--timeline", str(tl_path), "--from", str(cuts[k]),
               "--to", str(cuts[k + 1]), "--out", str(seg), "--scale", str(scale), "--crf", str(crf),
               "--preset", preset, "--threads", "1", "--label", f"{label}{k}"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(f"render falhou ({k}):\n{r.stderr[-3000:]}")
        _print_warn(r.stderr.splitlines(), seen)
        stats.append(json.loads(r.stdout.strip().splitlines()[-1]))
        return seg

    with ThreadPoolExecutor(workers) as ex:
        segs = list(ex.map(job, range(workers)))
    return segs, stats


def render_stills(tl_path, frames, outdir, scale):
    outdir.mkdir(parents=True, exist_ok=True)
    for p in outdir.glob("f*.png"):
        p.unlink()
    chunks = [frames[k * len(frames) // 4:(k + 1) * len(frames) // 4] for k in range(4)]  # contíguos: menos planos por worker
    seen = set()

    def job(ch):
        if not ch:
            return
        r = subprocess.run(["node", str(ROOT / "render" / "render.js"), "--timeline", str(tl_path), "--stills",
                            ",".join(map(str, ch)), "--outdir", str(outdir), "--scale", str(scale)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(r.stderr[-3000:])
        _print_warn(r.stderr.splitlines(), seen)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(job, chunks))
    return [outdir / f"f{f:06d}.png" for f in frames]


def contact_sheet(items, out_png, cols=6, thumb_w=270):
    """items: [(png, t, rótulo_extra)]"""
    from PIL import Image, ImageDraw, ImageFont
    ims = [(Image.open(p).convert("RGB"), t, lab) for p, t, lab in items]
    if not ims:
        return
    w0, h0 = ims[0][0].size
    tw, th = thumb_w, round(thumb_w * h0 / w0)
    rows = math.ceil(len(ims) / cols)
    pad, lab_h = 8, 34
    sheet = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + lab_h + pad) + pad), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "Anton-Regular.ttf"), 22)
    except Exception:
        font = ImageFont.load_default()
    for k, (im, t, lab) in enumerate(ims):
        r, c = divmod(k, cols)
        x, y = pad + c * (tw + pad), pad + r * (th + lab_h + pad)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab_h))
        d.text((x + 4, y + 5), f"{int(t // 60):d}:{t % 60:05.2f}  {lab}", fill=(255, 210, 31), font=font)
    tmp = Path(out_png).with_name(f'.{Path(out_png).stem}.tmp{os.getpid()}.png')
    sheet.save(tmp)
    os.replace(tmp, out_png)


def ffprobe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration",
                        "-of", "json", str(path)], capture_output=True, text=True)
    return json.loads(r.stdout)


def longest_silences(audio, sr, top=5):
    sil = T.silences(audio, sr, min_s=0.25, rel_db=-35)
    return sorted(((round(y - x, 2), round(x, 2)) for x, y in sil), reverse=True)[:top]


# ------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("story")
    ap.add_argument("-o", "--out")
    ap.add_argument("--rascunho", action="store_true", help="540x960 + encode rápido")
    ap.add_argument("--escala", type=float, help="escala de saída (1 = 1080x1920)")
    ap.add_argument("--plano", "--beat", dest="plano", help="ids de planos (ou falas) separados por vírgula")
    ap.add_argument("--trecho", help="intervalo em segundos, ex.: 3.5-8")
    ap.add_argument("--sem-trilha", action="store_true")
    ap.add_argument("--trilha", help="arquivo de música para usar no lugar da trilha sintetizada")
    ap.add_argument("--motor", help="motor de voz: kokoro (interno) | supertonic | qwen | qwen-design | chatterbox | ...")
    ap.add_argument("--voz", help="voz do motor (kokoro: pm_alex...; supertonic: M1..F5; qwen/chatterbox: vozes_qwen.json)")
    ap.add_argument("--regerar", help="ids de falas para regerar a voz ignorando o cache (mesmo take)")
    ap.add_argument("--voz-pasta", help="usa uma pasta já gerada por tools/voz/falar.py (casa falas pelo texto)")
    ap.add_argument("--velocidade", type=float)
    ap.add_argument("--narracao-audio", help="WAV/M4A gravado pelo usuário (substitui o TTS)")
    ap.add_argument("--narracao-tempos", help="JSON de tempos para o áudio gravado (senão: alinhamento automático)")
    ap.add_argument("--contact-sheet", action="store_true")
    ap.add_argument("--so-contact-sheet", action="store_true")
    ap.add_argument("--cs-quadros", type=int, default=24, help="nº de quadros no contact sheet")
    ap.add_argument("--cs-cortes", action="store_true", help="contact sheet: 1 quadro no meio de cada plano")
    ap.add_argument("--zona-segura", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--so-audio", action="store_true", help="para após gerar timeline e mix.wav")
    a = ap.parse_args()

    t_start = time.time()
    sp = Path(a.story)
    story = json.loads(sp.read_text())
    name = sp.stem
    # pasta de trabalho POR INVOCAÇÃO: a execução "completa" padrão usa build/<nome>/; qualquer -o, --plano ou
    # --trecho usa build/<nome>/runs/<tag>/ e saída própria. Se a pasta estiver travada por outra execução
    # simultânea, usa <tag>-<pid>. Nada é apagado fora da própria pasta.
    tag = ""
    if a.out:
        tag = Path(a.out).stem
    if a.plano:
        tag = (tag + "-" if tag else "") + "plano-" + "-".join(sorted(a.plano.split(",")))[:80]
    if a.trecho:
        tag = (tag + "-" if tag else "") + "trecho-" + a.trecho.replace(".", "_")
    out = Path(a.out) if a.out else ROOT / "out" / (f"{name}-{tag}.mp4" if tag else f"{name}.mp4")
    out.parent.mkdir(parents=True, exist_ok=True)
    work = ROOT / "build" / name / "runs" / tag if tag else ROOT / "build" / name
    lock = FS.lock_dir(work)
    if lock is None:
        work = work.with_name(work.name + f"-{os.getpid()}")
        lock = FS.lock_dir(work)
        out = out.with_name(f"{out.stem}-{os.getpid()}{out.suffix}")
        print(f"  (pasta em uso por outra execução; usando {work} e saída {out.name})")
    work.mkdir(parents=True, exist_ok=True)
    st = deep_merge(json.loads((ROOT / "config" / "estilo.json").read_text()), story.get("estilo"))
    for sec in list(st.values()):
        if isinstance(sec, dict):
            sec.pop("_doc", None)
    st.pop("_doc", None)
    V = st["video"]
    fps, W, H = V["fps"], V["largura"], V["altura"]
    motor = a.motor or story.get("motor", "kokoro")
    voice = a.voz or story.get("voz") or {"kokoro": "pm_alex", "supertonic": "M1"}.get(motor, "narrador-jovem")
    speed = a.velocidade or float(story.get("velocidade", 1.0))
    atempo = float(story.get("atempo", 1.0))
    pron = resolve_pron(story, motor)
    falas, planos = normalize(story, st, ROOT / "scenes")

    # 1) narração
    os.environ.setdefault("OMP_NUM_THREADS", "4")
    stats = {}
    clips = fala_clips(falas, voice, speed, pron, a.narracao_audio, a.narracao_tempos, work, stats, motor=motor,
                       atempo=atempo, regerar=(a.regerar or "").split(",") if a.regerar else (), voz_pasta=a.voz_pasta)
    meta = {"fonte": "gravado", "origem": a.narracao_audio} if a.narracao_audio else \
        {"fonte": "tts", "motor": motor, "voz": voice, "velocidade": speed, "atempo": atempo}
    print(f"[voz] motor={motor} voz={voice} velocidade={speed} atempo={atempo}" + (f" pasta={a.voz_pasta}" if a.voz_pasta else ""))
    laid, narr = layout(falas, clips, st["tempo"], meta, work)
    nframes = int(round(laid[-1]["fim"] * fps))
    total = nframes / fps
    pstart, pend = plano_times(falas, planos, laid, total, st["tempo"])

    # 2) legenda, efeitos, timeline
    caps = build_captions(falas, planos, laid, pstart, pend, st)
    events, marks = build_sfx(falas, planos, laid, pstart, st)
    trilha_ev = build_trilha(planos, laid, pstart, pend)
    beats = []
    for k, pl in enumerate(planos):
        a0 = pstart[k]
        fw = laid[pl["_fala"]]["words"]
        ws = [w for w in fw if a0 - 1e-6 <= w["ini"] < pend[k]]
        beats.append({"id": pl["id"], "index": k, "fala": falas[pl["_fala"]]["id"], "cena": pl["cena"],
                      "params": pl.get("params", {}), "roteiro": pl.get("roteiro", {}),
                      "ini": round(a0, 4), "dur": round(pend[k] - a0, 4), "transicao": pl["transicao"],
                      "palavras": [{"w": w["w"], "ini": round(w["ini"] - a0, 3), "fim": round(w["fim"] - a0, 3)} for w in ws],
                      "marks": marks[k]})
    tl = {"fps": fps, "largura": W, "altura": H, "duracao": total, "estilo": st, "captions": caps,
          "debug_zona_segura": bool(a.zona_segura), "fontes_extra": story.get("fontes", []), "beats": beats}
    tl_path = work / "timeline.json"
    FS.write_text(tl_path, json.dumps(tl, ensure_ascii=False, indent=1))
    FS.write_text(work / "sfx.json", json.dumps({"sfx": events, "trilha": trilha_ev}, ensure_ascii=False, indent=1))

    nw = sum(len(lf["words"]) for lf in laid)
    speech = sum(len(c["audio"]) for c in clips if c) / T.SR
    durs = np.array([b["dur"] for b in beats])
    nwb = np.array([len(c["palavras"]) for c in caps]) if caps else np.zeros(1)
    ndest = sum(any(w["enfase"] for w in c["palavras"]) for c in caps)
    print(f"[timeline] {len(falas)} falas, {len(planos)} planos, {total:.2f}s, {nframes} quadros, {nw} palavras = "
          f"{nw / total:.2f} pal/s NO TOTAL ({nw / max(speech, 1e-6):.2f} só fala), {len(events)} sfx, {len(trilha_ev)} deixas de trilha")
    print(f"   planos: média {durs.mean():.2f}s, mediana {np.median(durs):.2f}s, min {durs.min():.2f}s, max {durs.max():.2f}s")
    print(f"   legenda: {len(caps)} blocos, {nwb.mean():.2f} pal/bloco, 1 bloco a cada {total / max(1, len(caps)):.2f}s, "
          f"{100 * ndest / max(1, len(caps)):.0f}% com destaque")
    print(f"   maiores silêncios na narração (s, em): {longest_silences(narr, T.SR)}")
    if stats.get("palavras"):
        print(f"   alinhamento: {stats['ancoras']}/{stats['palavras']} palavras ancoradas pelo ASR "
              f"({100 * stats['ancoras'] / stats['palavras']:.0f}%), resto interpolado por fonemas")
    n_arq = sum(1 for p in planos if p.get("params", {}).get("arquivo"))
    if any(p["cena"] == "auto" for p in planos):
        print(f"   planos com arquivo próprio (scenes/planos/): {n_arq}/{sum(p['cena'] == 'auto' for p in planos)}")

    # 3) áudio
    trilha = not a.sem_trilha and story.get("trilha", True) is not False
    tfile = a.trilha or (story["trilha"] if isinstance(story.get("trilha"), str) else None)
    mixed, info = MX.mixdown(narr, events, total, st["audio"], trilha=trilha, trilha_arquivo=tfile,
                             trilha_eventos=trilha_ev)
    FS.write_wav(work / "mix.wav", mixed, MX.SR)
    print(f"[áudio] {info['lufs']} LUFS, pico {info['pico_dbtp']} dBTP, trilha={'sim' if trilha else 'não'}")
    if a.so_audio:
        return

    # 4) intervalo
    f0, f1 = 0, nframes
    if a.plano:
        ids = set(a.plano.split(","))
        sel = [k for k, b in enumerate(beats) if b["id"] in ids or b["fala"] in ids]
        if not sel:
            die(f"plano(s)/fala(s) {a.plano} não encontrados")
        f0 = int(pstart[sel[0]] * fps)
        f1 = int(round(pend[sel[-1]] * fps))
    if a.trecho:
        x, y = (float(v) for v in a.trecho.split("-"))
        f0, f1 = int(x * fps), min(nframes, int(round(y * fps)))
    scale = a.escala or (0.5 if a.rascunho else 1.0)

    # 5) quadros do contact sheet
    sel_ids = set(a.plano.split(",")) if a.plano else None
    if a.cs_cortes:
        cs = [(min(f1 - 1, int((pstart[k] + pend[k]) / 2 * fps)), b["id"]) for k, b in enumerate(beats)
              if (b["id"] in sel_ids or b["fala"] in sel_ids if sel_ids else
                  pend[k] * fps > f0 + 0.5 and pstart[k] * fps < f1 - 0.5)]
    elif sel_ids:   # só dentro dos planos pedidos (mesmo se não forem vizinhos)
        ks = [k for k, b in enumerate(beats) if b["id"] in sel_ids or b["fala"] in sel_ids]
        per = max(1, a.cs_quadros // len(ks))
        cs = []
        for k in ks:
            g0, g1 = int(math.ceil(pstart[k] * fps)), int(pend[k] * fps) - 1
            cs += [(g0 + round((g1 - g0) * (j + 0.5) / per), beats[k]["id"]) for j in range(per)]
    else:
        fr = sorted({min(f1 - 1, f0 + round((f1 - f0 - 1) * k / max(1, a.cs_quadros - 1))) for k in range(a.cs_quadros)})
        cs = [(f, next(b["id"] for k, b in enumerate(beats) if pstart[k] <= f / fps < pend[k] or k == len(beats) - 1)) for f in fr]
    cs_png = out.with_name(out.stem + "-contact.png")
    if a.so_contact_sheet:
        t0 = time.time()
        ims = render_stills(tl_path, [f for f, _ in cs], work / "stills", scale)
        contact_sheet([(p, f / fps, lab) for p, (f, lab) in zip(ims, cs)], cs_png)
        print(f"[contact sheet] {cs_png} ({len(ims)} quadros em {time.time() - t0:.1f}s); PNGs em {work / 'stills'}")
        return

    # 6) vídeo
    segdir = work / "segs"
    segdir.mkdir(exist_ok=True)
    for p in segdir.glob("*.mp4"):
        p.unlink()
    t0 = time.time()
    segs, rstats = run_render(tl_path, f0, f1, segdir, scale, a.workers,
                              crf=23 if a.rascunho else 17, preset="ultrafast" if a.rascunho else "veryfast", label="w")
    dt = time.time() - t0
    nf = f1 - f0
    print(f"[render] {nf} quadros em {dt:.1f}s = {nf / dt:.1f} quadros/s ({len(segs)} workers; "
          f"por worker: {', '.join(str(s['fps']) for s in rstats)} q/s) -> 100 s de vídeo ≈ {100 * fps / (nf / dt) / 60:.1f} min")
    lst = segdir / "lista.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in segs))
    a_ss, a_t = f0 / fps, nf / fps
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-ss", f"{a_ss:.4f}", "-t", f"{a_t:.4f}", "-i", str(work / "mix.wav"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", "-t", f"{a_t:.4f}", str(out)], check=True)
    pr = ffprobe(out)
    vs = next(s for s in pr["streams"] if s["codec_type"] == "video")
    au = [s for s in pr["streams"] if s["codec_type"] == "audio"]
    print(f"[ok] {out}  {vs['width']}x{vs['height']} {vs['r_frame_rate']} fps, {float(pr['format']['duration']):.2f}s, "
          f"áudio: {au[0]['codec_name'] + ' ' + au[0]['sample_rate'] + ' Hz' if au else 'NENHUM'}  (total {time.time() - t_start:.1f}s)")

    if a.contact_sheet:
        tmp = work / "cs_frames"
        tmp.mkdir(exist_ok=True)
        for q in tmp.glob("*.png"):
            q.unlink()
        sel = "+".join(f"eq(n\\,{f - f0})" for f, _ in cs)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-vf", f"select={sel}", "-fps_mode", "passthrough",
                        str(tmp / "c%04d.png")], check=True)
        got = sorted(tmp.glob("c*.png"))
        contact_sheet([(q, f / fps, lab) for q, (f, lab) in zip(got, sorted(set(cs)))], cs_png)
        print(f"[contact sheet] {cs_png}")


if __name__ == "__main__":
    main()
