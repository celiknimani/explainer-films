"""Scene start times and frame counts, derived from films/<film>/cues.json. Shared by render, audio and mix."""
import os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def film_dir(film): return os.path.join(ROOT, 'films', film)
def timeline(film, fps=24):
    cues = json.load(open(os.path.join(film_dir(film), 'cues.json'))); cum = 0; tl = []
    for n, c in cues.items():
        f0 = round(cum * fps); cum += c['D']; f1 = round(cum * fps); tl.append(dict(n=n, start=f0 / fps, frames=f1 - f0))
    return tl, cues
