"""Render single frames to a contact sheet so layouts can be checked before a full render.
Usage: python3 tools/still.py <film> [--style toon] [--gpu] [--out still.jpg] <scene>:<seconds> [...]
<scene> is a scene name or its index, e.g.  python3 tools/still.py kosovo-electricity coal:7 gap:19.5"""
import sys, time, base64, io, argparse
from playwright.sync_api import sync_playwright
from PIL import Image
from _browser import serve, launch, open_film

ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('jobs', nargs='+'); ap.add_argument('--style', default='toon'); ap.add_argument('--gpu', action='store_true'); ap.add_argument('--out', default=None); ap.add_argument('--full', action='store_true', help='keep full 1920x1080 frames'); ap.add_argument('--motion'); ap.add_argument('--transition')
a = ap.parse_args(); port = serve(); ims = []
with sync_playwright() as p:
    b = launch(p, a.gpu); pg = open_film(b, port, a.film, a.style, extra=''.join(f'&{k}={v}' for k, v in (('motion', a.motion), ('transition', a.transition)) if v)); print('motion:', pg.evaluate('window.motion || null')); info = pg.evaluate('window.info'); names = [s['n'] for s in info]
    for job in a.jobs:
        sc, t = job.split(':')
        if not sc.isdigit() and sc not in names: b.close(); raise SystemExit(f'No scene "{sc}" in {a.film}. Scenes: {", ".join(names)}')
        i = int(sc) if sc.isdigit() else names.index(sc); t0 = time.time()
        if float(t) > info[i]['D']: print(f'note: {names[i]} is only {info[i]["D"]}s long; {t}s is past its end and will show the transition')
        d = pg.evaluate(f'window.frame({i},{t})'); ims.append(Image.open(io.BytesIO(base64.b64decode(d.split(",")[1]))).convert('RGB')); print(names[i], t, '%.2fs' % (time.time() - t0))
    b.close()
n = len(ims); cols = 2 if n > 1 else 1; rows = (n + cols - 1) // cols; w = 1920 if a.full else (960 if n > 1 else 1280); h = w * 9 // 16
sheet = Image.new('RGB', (cols * w, rows * h))
for i, im in enumerate(ims): sheet.paste(im.resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
out = a.out or f'films/{a.film}/out/still.jpg'
import os; os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True); sheet.save(out, quality=88); print('wrote', out)
