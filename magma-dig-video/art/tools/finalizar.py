#!/usr/bin/env python3
"""Copia os style frames de build/art/sf_*.png para art/frames/ (quantizados p/ < 1,5 MB) e monta a folha
de contato do teste de movimento. Uso: python3 art/tools/finalizar.py
Quantização: libimagequant (pip install imagequant) se disponível; senão PIL MEDIANCUT (cores menos fiéis)."""
import os, sys, subprocess, glob
from PIL import Image
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BUILD, FR = os.path.join(RAIZ, "build", "art"), os.path.join(RAIZ, "art", "frames")
sys.path.insert(0, os.environ.get("IMAGEQUANT_PATH", ""))
try:
    import imagequant
except ImportError:
    imagequant = None
NOMES = {"a_vila": "a-vila-noite", "b_toca": "b-toca-meta", "c_mina": "c-mina-terra-rasa", "d_mercado": "d-mercado-painel",
         "d_habilidades": "d2-habilidades-ramos", "e_ciencia": "e-ciencia-planeta", "e_kola": "e2-ciencia-kola",
         "f_lanterna": "f-objeto-lanterna", "f_cobre": "f2-objeto-pepita-cobre", "f_objetos": "f3-objeto-picareta-velha",
         "g_profundezas": "g-coracao-de-magma", "g_estratos": "g2-profundezas-estratos", "zeca_poses": "prancha-zeca-poses",
         "overlays": "prancha-overlays", "gameplay": "gameplay-visor", "legenda": "legenda-exemplo",
         "zeca_ator": "prancha-zeca-ator", "h_veios": "h-parede-veios-cobre", "h_braco": "h2-braco-forte-no-escuro", "h_fantasma": "h3-fantasma-de-ontem"}
os.makedirs(FR, exist_ok=True)
for k, nome in NOMES.items():
    src = os.path.join(BUILD, f"sf_{k}.png")
    if not os.path.exists(src): print("falta", src); continue
    im = Image.open(src).convert("RGBA")
    q = imagequant.quantize_pil_image(im, dithering_level=1.0, max_colors=256) if imagequant else im.convert("RGB").quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
    dst = os.path.join(FR, nome + ".png"); q.save(dst, optimize=True)
    print(f"{nome}.png  {os.path.getsize(dst)/1e6:.2f} MB")
mp4 = os.path.join(BUILD, "teste.mp4")
if os.path.exists(mp4):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", "select='not(mod(n\\,6))',scale=216:-1,tile=7x5:padding=4:color=0x14121F",
                    "-frames:v", "1", "-q:v", "3", os.path.join(FR, "teste-contato.jpg")], check=True)
    print("teste-contato.jpg", os.path.getsize(os.path.join(FR, "teste-contato.jpg")) / 1e6, "MB")
