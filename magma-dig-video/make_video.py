#!/usr/bin/env python3
"""story/parte-XX.json -> MP4 1080x1920 30 fps (narração TTS ou gravada, legenda, sfx, trilha).

  .cache/venv/bin/python make_video.py story/demo.json -o out/demo.mp4
  ... --rascunho                 540x960, encode rápido
  ... --beat gancho,b2           só esses beats (com transições vizinhas)
  ... --trecho 3.5-8             só esse intervalo (s)
  ... --sem-trilha               sem música (efeitos e voz continuam)
  ... --voz pf_dora --velocidade 1.05
  ... --contact-sheet            gera out/<nome>-contact.png a partir do vídeo
  ... --so-contact-sheet         NÃO renderiza vídeo: só os quadros do contact sheet (rápido)
  ... --zona-segura              desenha a zona segura do Instagram por cima (revisão)
  ... --narracao-audio voz.m4a [--narracao-tempos tempos.json]   usa narração gravada
"""
from __future__ import annotations

import argparse
import copy
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
from lib import mix as MX  # noqa: E402
from lib import narration as N  # noqa: E402
from lib import sfx as X  # noqa: E402
from lib import tts_engine as T  # noqa: E402

PUNCT_BREAK = re.compile(r"[.,!?;:…]$")


def deep_merge(a, b):
    out = copy.deepcopy(a)
    for k, v in (b or {}).items():
        out[k] = deep_merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else copy.deepcopy(v)
    return out


def nk(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^\w]", "", s.lower())


def die(msg):
    sys.exit(f"ERRO: {msg}")


# --------------------------------------------------------------- validação
def validate(story, scenes_dir):
    if not isinstance(story.get("beats"), list) or not story["beats"]:
        die("story precisa de 'beats' (lista não vazia)")
    ids = set()
    for i, b in enumerate(story["beats"]):
        where = f"beat #{i} ({b.get('id', '?')})"
        for k in ("id", "cena"):
            if not b.get(k):
                die(f"{where}: campo obrigatório '{k}'")
        if b["id"] in ids:
            die(f"{where}: id repetido")
        ids.add(b["id"])
        if not re.fullmatch(r"[A-Za-z0-9_-]+", b["id"]):
            die(f"{where}: id só com letras/números/_/-")
        if not (scenes_dir / f"{b['cena']}.js").exists():
            die(f"{where}: cena '{b['cena']}' não existe em scenes/")
        if not b.get("narracao", "").strip() and not b.get("duracao"):
            die(f"{where}: beat sem narração precisa de 'duracao' (s)")
        for s in b.get("sfx", []):
            if s.get("nome") not in X.LIB:
                die(f"{where}: sfx '{s.get('nome')}' não existe. Use: {', '.join(X.NAMES)}")


# ------------------------------------------------------------- narração
def narration_clips(story, beats, voice, speed, pron, rec_audio=None, rec_tempos=None, workdir=None):
    """Para cada beat devolve lista de clipes {audio(24k), texto, palavras[(w, ini, fim) relativos]}."""
    sents = [(bi, s) for bi, b in enumerate(beats) for s in T.split_sentences(b.get("narracao", ""))]
    clips = [[] for _ in beats]
    if rec_audio:
        phrases = [{"texto": s.replace("*", ""), "grupo": beats[bi]["id"]} for bi, s in sents]
        if rec_tempos:
            data = json.loads(Path(rec_tempos).read_text())
        else:
            data = N.realign(rec_audio, phrases, workdir / "alinhamento", pron=pron)
            print(f"  alinhamento automático -> {workdir / 'alinhamento' / 'tempos.json'} (revise/edite se precisar)")
        full = N.load_any(rec_audio)
        fr = data["frases"]
        if len(fr) != len(sents):
            die(f"tempos têm {len(fr)} frases mas o story tem {len(sents)}")
        for (bi, s), f in zip(sents, fr):
            if nk(f["texto"]) != nk(s.replace("*", "")):
                print(f"  AVISO: frase difere do story: {f['texto']!r} vs {s!r}")
            a0, a1 = max(0, f["ini"] - 0.03), f["fim"] + 0.05
            seg = full[int(a0 * T.SR): int(a1 * T.SR)]
            clips[bi].append({"audio": seg, "texto": s,
                              "palavras": [(p["w"], p["ini"] - a0, p["fim"] - a0) for p in f["palavras"]]})
        return clips
    for bi, s in sents:
        words = [w.replace("*", "") for w in T.tokenize(s)]
        spoken = T.apply_pronunciation(words, pron)
        a = N.synth_cached(" ".join(w for w in spoken if w), voice, speed)
        wt = T.estimate_word_times(a, words, spoken)
        clips[bi].append({"audio": a, "texto": s, "palavras": [(w, x, y) for w, (x, y) in zip(words, wt)]})
    return clips


def layout(beats, clips, tempo, voice_meta, workdir):
    """Posiciona beats e frases no tempo; escreve narracao.wav + tempos.json."""
    sr = T.SR
    parts, t, frases = [], 0.0, []

    def put(a):
        nonlocal t
        parts.append(a.astype(np.float32)); t += len(a) / sr

    def silence(s):
        if s > 0:
            put(np.zeros(int(round(s * sr)), np.float32))

    out = []
    for i, b in enumerate(beats):
        ini = t
        cl = clips[i]
        words = []
        if cl:
            silence(tempo["inicio"] if i == 0 else tempo["entrada_beat"])
            for j, c in enumerate(cl):
                if j:
                    silence(b.get("pausa_frase", tempo["pausa_frase"]))
                off = t
                frases.append({"i": len(frases), "grupo": b["id"], "texto": c["texto"].replace("*", ""),
                               "ini": round(off, 3), "fim": round(off + len(c["audio"]) / sr, 3),
                               "palavras": [{"w": w, "ini": round(off + x, 3), "fim": round(off + y, 3)} for w, x, y in c["palavras"]]})
                words += [{"w": w, "ini": off + x - ini, "fim": off + y - ini, "frase": j} for w, x, y in c["palavras"]]
                put(c["audio"])
            silence(b.get("respiro", tempo["respiro"]))
            dur = max(t - ini, float(b.get("duracao_min", 0)))
        else:
            dur = float(b["duracao"])
        if i == len(beats) - 1:
            dur += float(b.get("final", tempo["final"]))
        silence(ini + dur - t)
        out.append({"ini": ini, "dur": dur, "words": words})
    audio = np.concatenate(parts) if parts else np.zeros(1, np.float32)
    sf.write(workdir / "narracao.wav", audio, sr)
    data = dict(versao=1, audio="narracao.wav", sr=sr, duracao=round(len(audio) / sr, 3), frases=frases, **voice_meta)
    (workdir / "tempos.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    return out, audio


# --------------------------------------------------------------- legenda
def caption_words(b, spoken_words):
    """Palavras exibidas (legenda ou narração) com tempos locais e ênfase."""
    text = b.get("legenda") or b.get("narracao", "")
    toks = T.tokenize(text)
    emph_set = {nk(x) for x in b.get("enfase", [])}
    shown = []
    for tk in toks:
        w, star = T.strip_markup(tk)
        shown.append({"w": w, "enfase": star or nk(w) in emph_set})
    if not shown or not spoken_words:
        return []
    if len(shown) == len(spoken_words):
        for s, p in zip(shown, spoken_words):
            s["ini"], s["fim"] = p["ini"], p["fim"]
        return shown
    # contagens diferentes (ex.: "1.500" vs "mil e quinhentas"): alinha por palavras iguais;
    # cada trecho divergente da legenda ocupa o intervalo do trecho falado correspondente.
    import difflib
    sm = difflib.SequenceMatcher(a=[nk(x["w"]) for x in shown], b=[nk(p["w"]) for p in spoken_words], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                shown[i1 + k]["ini"], shown[i1 + k]["fim"] = spoken_words[j1 + k]["ini"], spoken_words[j1 + k]["fim"]
        elif i2 > i1:
            if j2 > j1:
                t0, t1 = spoken_words[j1]["ini"], spoken_words[j2 - 1]["fim"]
            else:  # palavra só na legenda: encaixa no fim da palavra falada anterior
                t0 = spoken_words[j1 - 1]["fim"] if j1 > 0 else spoken_words[0]["ini"]
                t1 = t0 + 0.15
            lens = [max(1, len(nk(x["w"]))) for x in shown[i1:i2]]
            edges = np.concatenate([[0], np.cumsum(lens)]) / sum(lens)
            for k in range(i2 - i1):
                shown[i1 + k]["ini"] = t0 + (t1 - t0) * edges[k]
                shown[i1 + k]["fim"] = t0 + (t1 - t0) * edges[k + 1]
    return shown


def build_captions(beats, laid, st):
    L = st["legenda"]
    rm = L.get("remover_pontuacao", ".,;:")
    blocks = []
    for b, lb in zip(beats, laid):
        if b.get("sem_legenda") or not lb["words"]:
            continue
        ws = caption_words(b, lb["words"])
        cur = []

        def flush():
            if cur:
                blocks.append({"beat": b["id"], "palavras": list(cur), "pos": b.get("legenda_pos"),
                               "estilo": b.get("legenda_estilo"), "_end": lb["ini"] + lb["dur"]})
                cur.clear()

        for k, w in enumerate(ws):
            disp = w["w"].rstrip(rm) or w["w"]
            nchar = sum(len(x["w"]) + 1 for x in cur) + len(disp)
            if cur and (len(cur) >= L["max_palavras"] or nchar > L["max_caracteres"] or
                        (L.get("quebrar_em_pontuacao", True) and PUNCT_BREAK.search(ws[k - 1]["w"])) or
                        w["ini"] - cur[-1]["fim"] > 0.35):
                flush()
            cur.append({"w": disp, "ini": round(lb["ini"] + w["ini"], 3), "fim": round(lb["ini"] + w["fim"], 3),
                        "enfase": w["enfase"]})
        flush()
    for i, bl in enumerate(blocks):
        bl["ini"] = round(max(0, bl["palavras"][0]["ini"] - 0.04), 3)
    for i, bl in enumerate(blocks):
        last = bl["palavras"][-1]["fim"]
        end = min(last + L["segurar_fim"], bl.pop("_end"))
        if i + 1 < len(blocks) and blocks[i + 1]["beat"] == bl["beat"] and blocks[i + 1]["ini"] - last < 0.7:
            end = blocks[i + 1]["ini"]
        if i + 1 < len(blocks):
            end = min(end, blocks[i + 1]["ini"])
        bl["fim"] = round(max(end, bl["ini"] + 0.2), 3)
        if not bl["estilo"]:
            bl.pop("estilo")
        if not bl["pos"]:
            bl.pop("pos")
    return blocks


# ---------------------------------------------------------------- efeitos
def build_sfx(beats, laid, st):
    events = []
    marks = [dict() for _ in beats]
    td = st["transicao_padrao"]
    for i, (b, lb) in enumerate(zip(beats, laid)):
        for s in b.get("sfx", []):
            base = 0.0
            if s.get("palavra"):
                hits = [w for w in lb["words"] if nk(w["w"]) == nk(s["palavra"])]
                if not hits:
                    die(f"beat {b['id']}: sfx '{s['nome']}' referencia palavra '{s['palavra']}' que não está na narração")
                base = hits[min(len(hits) - 1, s.get("n", 0))]["ini"]
            lt = base + float(s.get("offset", 0))
            events.append({"t": lb["ini"] + lt, "nome": s["nome"], "vol": float(s.get("vol", 0)),
                           "seed": int(s.get("seed", i)), "kw": s.get("kw", {})})
            marks[i].setdefault(s["nome"], []).append(round(lt, 3))
        if i > 0:
            tr = b["transicao"]
            if tr.get("sfx"):
                a = X.make(tr["sfx"])
                events.append({"t": lb["ini"] - len(a) / X.SR / 2 if tr["sfx"] == "whoosh" else lb["ini"],
                               "nome": tr["sfx"], "vol": float(tr.get("sfx_vol", td.get("sfx_vol", -10))), "seed": i, "kw": {}})
    return events, marks


def norm_transition(b, i, st):
    """transicao: "fade" | {"tipo": ..., "dur": s, "sfx": nome|None}. Corte não herda o sfx padrão."""
    raw = b.get("transicao", {})
    raw = {"tipo": raw} if isinstance(raw, str) else dict(raw)
    tr = deep_merge(st["transicao_padrao"], raw)
    if tr["tipo"] == "corte":
        tr["dur"] = 0
        tr["sfx"] = raw.get("sfx")
    if i == 0:
        tr = {"tipo": "corte", "dur": 0, "sfx": None}
    return tr


# ----------------------------------------------------------------- render
def run_render(tl_path, f0, f1, outdir, scale, workers, crf, preset, label):
    n = f1 - f0
    workers = max(1, min(workers, math.ceil(n / 15)))
    cuts = [f0 + round(n * k / workers) for k in range(workers + 1)]
    segs, stats = [], []

    def job(k):
        seg = outdir / f"seg{k:02d}.mp4"
        cmd = ["node", str(ROOT / "render" / "render.js"), "--timeline", str(tl_path), "--from", str(cuts[k]),
               "--to", str(cuts[k + 1]), "--out", str(seg), "--scale", str(scale), "--crf", str(crf),
               "--preset", preset, "--threads", "1", "--label", f"{label}{k}"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(f"render falhou ({k}):\n{r.stderr[-3000:]}")
        for line in r.stderr.splitlines():
            if line.startswith("AVISO"):
                print("  " + line)
        stats.append(json.loads(r.stdout.strip().splitlines()[-1]))
        return seg

    with ThreadPoolExecutor(workers) as ex:
        segs = list(ex.map(job, range(workers)))
    return segs, stats


def render_stills(tl_path, frames, outdir, scale):
    outdir.mkdir(parents=True, exist_ok=True)
    for p in outdir.glob("f*.png"):
        p.unlink()
    chunks = [frames[k::4] for k in range(4)]
    def job(ch):
        if not ch:
            return
        r = subprocess.run(["node", str(ROOT / "render" / "render.js"), "--timeline", str(tl_path), "--stills",
                            ",".join(map(str, ch)), "--outdir", str(outdir), "--scale", str(scale)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(r.stderr[-3000:])
        for line in r.stderr.splitlines():
            if line.startswith("AVISO"):
                print("  " + line)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(job, chunks))
    return [outdir / f"f{f:06d}.png" for f in frames]


def contact_sheet(images_with_t, out_png, cols=6, thumb_w=270):
    from PIL import Image, ImageDraw, ImageFont
    ims = [(Image.open(p).convert("RGB"), t) for p, t in images_with_t]
    if not ims:
        return
    w0, h0 = ims[0][0].size
    tw, th = thumb_w, round(thumb_w * h0 / w0)
    rows = math.ceil(len(ims) / cols)
    pad, lab = 8, 34
    sheet = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "Anton-Regular.ttf"), 24)
    except Exception:
        font = ImageFont.load_default()
    for k, (im, t) in enumerate(ims):
        r, c = divmod(k, cols)
        x, y = pad + c * (tw + pad), pad + r * (th + lab + pad)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
        d.text((x + 4, y + 4), f"{int(t // 60):d}:{t % 60:05.2f}", fill=(255, 210, 31), font=font)
    sheet.save(out_png)


def ffprobe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration",
                        "-of", "json", str(path)], capture_output=True, text=True)
    return json.loads(r.stdout)


# ------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("story")
    ap.add_argument("-o", "--out")
    ap.add_argument("--rascunho", action="store_true", help="540x960 + encode rápido")
    ap.add_argument("--escala", type=float, help="escala de saída (1 = 1080x1920)")
    ap.add_argument("--beat", help="ids de beats separados por vírgula")
    ap.add_argument("--trecho", help="intervalo em segundos, ex.: 3.5-8")
    ap.add_argument("--sem-trilha", action="store_true")
    ap.add_argument("--trilha", help="arquivo de música para usar no lugar da trilha sintetizada")
    ap.add_argument("--voz", choices=T.ALL_VOICES)
    ap.add_argument("--velocidade", type=float)
    ap.add_argument("--narracao-audio", help="WAV/M4A gravado pelo usuário (substitui o TTS)")
    ap.add_argument("--narracao-tempos", help="JSON de tempos para o áudio gravado (senão: alinhamento automático)")
    ap.add_argument("--contact-sheet", action="store_true")
    ap.add_argument("--so-contact-sheet", action="store_true")
    ap.add_argument("--cs-quadros", type=int, default=24, help="nº de quadros no contact sheet")
    ap.add_argument("--zona-segura", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--so-audio", action="store_true", help="para após gerar timeline e mix.wav")
    a = ap.parse_args()

    t_start = time.time()
    sp = Path(a.story)
    story = json.loads(sp.read_text())
    name = sp.stem
    out = Path(a.out) if a.out else ROOT / "out" / f"{name}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    work = ROOT / "build" / name
    work.mkdir(parents=True, exist_ok=True)
    validate(story, ROOT / "scenes")
    st = deep_merge(json.loads((ROOT / "config" / "estilo.json").read_text()), story.get("estilo"))
    st.pop("_doc", None)
    V = st["video"]
    fps, W, H = V["fps"], V["largura"], V["altura"]
    voice = a.voz or story.get("voz", "pm_alex")
    speed = a.velocidade or float(story.get("velocidade", 1.0))
    pron = dict(story.get("pronuncia", {}))
    if story.get("pronuncia_arquivo"):
        pron = {**json.loads((ROOT / story["pronuncia_arquivo"]).read_text()), **pron}
    beats = copy.deepcopy(story["beats"])
    for i, b in enumerate(beats):
        b["transicao"] = norm_transition(b, i, st)

    # 1) narração
    os.environ.setdefault("OMP_NUM_THREADS", "4")
    clips = narration_clips(story, beats, voice, speed, pron, a.narracao_audio, a.narracao_tempos, work)
    meta = {"fonte": "gravado", "origem": a.narracao_audio} if a.narracao_audio else {"fonte": "tts", "voz": voice, "velocidade": speed}
    laid, narr = layout(beats, clips, st["tempo"], meta, work)
    total = laid[-1]["ini"] + laid[-1]["dur"]
    nframes = int(round(total * fps))
    total = nframes / fps

    # 2) legenda, efeitos, timeline
    caps = build_captions(beats, laid, st)
    events, marks = build_sfx(beats, laid, st)
    tl = {"fps": fps, "largura": W, "altura": H, "duracao": total, "estilo": st, "captions": caps,
          "debug_zona_segura": bool(a.zona_segura), "fontes_extra": story.get("fontes", []),
          "beats": [{"id": b["id"], "index": i, "cena": b["cena"], "params": b.get("params", {}),
                     "ini": round(lb["ini"], 4), "dur": round(lb["dur"], 4), "transicao": b["transicao"],
                     "palavras": [{"w": w["w"], "ini": round(w["ini"], 3), "fim": round(w["fim"], 3)} for w in lb["words"]],
                     "marks": marks[i]} for i, (b, lb) in enumerate(zip(beats, laid))]}
    tl_path = work / "timeline.json"
    tl_path.write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    (work / "sfx.json").write_text(json.dumps(events, ensure_ascii=False, indent=1))
    nw = sum(len(lb["words"]) for lb in laid)
    speech = sum(len(c["audio"]) for cl in clips for c in cl) / T.SR
    print(f"[timeline] {len(beats)} beats, {total:.2f}s, {nframes} quadros, {nw} palavras "
          f"({nw / max(speech, 1e-6):.2f} pal/s de fala), {len(caps)} blocos de legenda, {len(events)} sfx")
    for b, lb in zip(beats, laid):
        print(f"   {b['id']:<14s} {lb['ini']:6.2f}s +{lb['dur']:5.2f}s  cena={b['cena']}  transição={b['transicao']['tipo']}")

    # 3) áudio
    trilha = not a.sem_trilha and story.get("trilha", True) is not False
    tfile = a.trilha or (story["trilha"] if isinstance(story.get("trilha"), str) else None)
    mixed, info = MX.mixdown(narr, events, total, st["audio"], trilha=trilha, trilha_arquivo=tfile)
    sf.write(work / "mix.wav", mixed, MX.SR)
    print(f"[áudio] {info['lufs']} LUFS, pico {info['pico_dbtp']} dBTP, trilha={'sim' if trilha else 'não'}")
    if a.so_audio:
        return

    # 4) intervalo
    f0, f1 = 0, nframes
    if a.beat:
        ids = a.beat.split(",")
        sel = [i for i, b in enumerate(beats) if b["id"] in ids]
        if not sel:
            die(f"beat(s) {a.beat} não encontrados")
        f0 = int(laid[sel[0]]["ini"] * fps)
        f1 = int(round((laid[sel[-1]]["ini"] + laid[sel[-1]]["dur"]) * fps))
    if a.trecho:
        x, y = (float(v) for v in a.trecho.split("-"))
        f0, f1 = int(x * fps), min(nframes, int(round(y * fps)))
    scale = a.escala or (0.5 if a.rascunho else 1.0)

    # 5) contact sheet só de stills
    cs_frames = sorted({min(f1 - 1, f0 + round((f1 - f0 - 1) * k / max(1, a.cs_quadros - 1))) for k in range(a.cs_quadros)})
    cs_png = out.with_name(out.stem + "-contact.png")
    if a.so_contact_sheet:
        t0 = time.time()
        ims = render_stills(tl_path, cs_frames, work / "stills", scale)
        contact_sheet([(p, f / fps) for p, f in zip(ims, cs_frames)], cs_png)
        print(f"[contact sheet] {cs_png} ({len(ims)} quadros em {time.time() - t0:.1f}s); PNGs em {work / 'stills'}")
        return

    # 6) vídeo
    segdir = work / "segs"
    segdir.mkdir(exist_ok=True)
    for p in segdir.glob("*.mp4"):
        p.unlink()
    t0 = time.time()
    segs, stats = run_render(tl_path, f0, f1, segdir, scale, a.workers,
                             crf=23 if a.rascunho else 17, preset="ultrafast" if a.rascunho else "veryfast", label="w")
    dt = time.time() - t0
    nf = f1 - f0
    print(f"[render] {nf} quadros em {dt:.1f}s = {nf / dt:.1f} quadros/s ({len(segs)} workers; "
          f"por worker: {', '.join(str(s['fps']) for s in stats)} q/s) -> 100 s de vídeo ≈ {100 * fps / (nf / dt) / 60:.1f} min")
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
        sel = "+".join(f"eq(n\\,{f - f0})" for f in cs_frames)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-vf", f"select={sel}", "-fps_mode", "passthrough",
                        str(tmp / "c%04d.png")], check=True)
        got = sorted(tmp.glob("c*.png"))
        items = [(q, f / fps) for q, f in zip(got, cs_frames)]
        contact_sheet(items, cs_png)
        print(f"[contact sheet] {cs_png}")


if __name__ == "__main__":
    main()
