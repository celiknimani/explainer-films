"""Shared helpers for the render tools: a static file server on the repo root and a headless Chrome page."""
import os, http.server, threading, functools
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CPU_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox']
GPU_ARGS = ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=default', '--no-sandbox']

class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(_Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]

def launch(p, gpu=False):
    kw = dict(args=GPU_ARGS if gpu else CPU_ARGS)
    exe = os.environ.get('CHROME') or next((c for c in ('/usr/bin/google-chrome', '/usr/bin/chromium') if os.path.exists(c)), None)
    if exe: kw['executable_path'] = exe          # otherwise Playwright's bundled Chromium is used
    return p.chromium.launch(**kw)

def open_film(browser, port, film, style='toon', verbose=True):
    pg = browser.new_page(viewport={'width': 1920, 'height': 1080})
    if verbose: pg.on('console', lambda m: print('console:', m.text[:400]) if m.type in ('error', 'warning') and 'ReadPixels' not in m.text and 'toNonIndexed' not in m.text else None)
    pg.on('pageerror', lambda e: print('PAGE ERROR', str(e)[:600], flush=True))
    pg.goto(f'http://127.0.0.1:{port}/engine/player.html?film={film}&style={style}')
    pg.wait_for_function('window.ready===true || window.filmError', timeout=120000)
    err = pg.evaluate('window.filmError || null')
    if err: raise SystemExit(f'Film failed to load: {err}')
    return pg
