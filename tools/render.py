"""Render a film scene by scene: headless Chrome draws each frame, ffmpeg encodes one mp4 per scene.
Usage: python3 tools/render.py <film> [scene ...] [--style toon] [--fps 24] [--workers 2] [--gpu]
Scenes are written to films/<film>/out/<scene>.mp4, so one changed scene can be re-rendered on its own.
--gpu uses the machine's graphics card; without it frames are drawn on the CPU, which works anywhere but is slower."""
import sys, os, json, time, base64, subprocess, argparse
from multiprocessing import Process
from playwright.sync_api import sync_playwright
from _browser import serve, launch, open_film
from _timeline import timeline, film_dir

def work(a, TL, idxs, out):
    port = serve()
    with sync_playwright() as p:
        b = launch(p, a.gpu); pg = open_film(b, port, a.film, a.style, verbose=False)
        for i in idxs:
            n = TL[i]['n']; tmp = os.path.join(out, f'tmp_{n}.mp4'); t0 = time.time()
            ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', str(a.fps), '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(a.fps), tmp], stdin=subprocess.PIPE)
            for f in range(TL[i]['frames']):
                d = pg.evaluate(f'window.frame({i},{f / a.fps})'); ff.stdin.write(base64.b64decode(d[d.index(',') + 1:]))
                if f % 48 == 0: open(os.path.join(out, f'progress_{n}.txt'), 'w').write(f"{f}/{TL[i]['frames']} {time.time() - t0:.0f}s")
            ff.stdin.close()
            if ff.wait() == 0:      # only a finished encode gets the real name, so a stopped render never leaves a short file behind
                os.replace(tmp, os.path.join(out, f'{n}.mp4')); os.remove(os.path.join(out, f'progress_{n}.txt')); print('ok', n, f'{time.time() - t0:.0f}s', flush=True)
        b.close()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('scenes', nargs='*'); ap.add_argument('--style', default='toon'); ap.add_argument('--fps', type=int, default=24)
    ap.add_argument('--workers', type=int, default=2); ap.add_argument('--gpu', action='store_true'); a = ap.parse_args()
    TL, _ = timeline(a.film, a.fps); out = os.path.join(film_dir(a.film), 'out'); os.makedirs(out, exist_ok=True)
    json.dump(dict(fps=a.fps, style=a.style, scenes=TL), open(os.path.join(out, 'timeline.json'), 'w'))
    idx = sorted([i for i, t in enumerate(TL) if not a.scenes or t['n'] in a.scenes], key=lambda i: -TL[i]['frames'])
    groups = [[] for _ in range(max(1, a.workers))]
    for i in idx: min(groups, key=lambda g: sum(TL[j]['frames'] for j in g)).append(i)     # balance frames across workers
    ps = [Process(target=work, args=(a, TL, sorted(g), out)) for g in groups if g]; [p.start() for p in ps]; [p.join() for p in ps]
    missing = [TL[i]['n'] for i in idx if not os.path.exists(os.path.join(out, TL[i]['n'] + '.mp4'))]
    print('DONE' if not missing else f'FAILED scenes: {missing}', flush=True); sys.exit(1 if missing else 0)
