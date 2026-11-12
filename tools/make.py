"""Run the whole pipeline for a film: narration, render, audio, mix.
Usage: python3 tools/make.py <film> [--style toon] [--gpu] [--skip-narration]"""
import sys, os, subprocess, argparse
ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('--style', default='toon'); ap.add_argument('--gpu', action='store_true'); ap.add_argument('--skip-narration', action='store_true'); a = ap.parse_args()
T = os.path.dirname(os.path.abspath(__file__)); py = sys.executable; run = lambda *c: subprocess.run([py, *c], check=True)
if not a.skip_narration: run(os.path.join(T, 'narrate.py'), a.film)
run(os.path.join(T, 'render.py'), a.film, '--style', a.style, *(['--gpu'] if a.gpu else []))
audio = os.path.join(T, '..', 'films', a.film, 'audio.py')
if os.path.exists(audio): run(audio)
run(os.path.join(T, 'mix.py'), a.film)
