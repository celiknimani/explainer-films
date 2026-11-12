"""Generate narration and cue times for a film from films/<film>/script.json.
Writes films/<film>/narr/<scene>.wav and films/<film>/cues.json ({scene: {q: [phrase start times], D: scene length}}).
The cue file is what keeps animation in sync with the voice: scenes read q[i] instead of hard-coded times.
Usage: python3 tools/narrate.py <film>"""
import sys, os, json, urllib.request
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.environ.get('KOKORO_DIR') or os.path.expanduser('~/.cache/explainer-films')
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
def model(name):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True); print('downloading', name, '...'); urllib.request.urlretrieve(BASE + name, path)
    return path
film = sys.argv[1]; d = os.path.join(ROOT, 'films', film); S = json.load(open(os.path.join(d, 'script.json')))
k = Kokoro(model('kokoro-v1.0.onnx'), model('voices-v1.0.bin')); os.makedirs(os.path.join(d, 'narr'), exist_ok=True)
lead, pause, short, tail = S.get('lead', 0.5), S.get('pause', 0.34), S.get('short_pause', 0.10), S.get('tail', 2.6)
names = list(S['scenes']); cues = {}
for sc in names:
    t = lead; out = [np.zeros(int(lead * 24000), np.float32)]; q = []
    for ch in S['scenes'][sc]:
        s, sr = k.create(ch, voice=S.get('voice', 'bm_george'), speed=S.get('speed', 1.04), lang=S.get('lang', 'en-gb'))
        nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 600):nz[-1] + 1500]
        gap = short if ch[-1] in ',:' else pause            # phrases ending in a comma or colon run on
        q.append(round(t, 2)); out += [s, np.zeros(int(gap * sr), np.float32)]; t += len(s) / sr + gap
    sf.write(os.path.join(d, 'narr', f'{sc}.wav'), np.concatenate(out), 24000)
    cues[sc] = {'q': q, 'D': round(t + (tail if sc == names[-1] else S.get('hold', 0.8)), 1)}
json.dump(cues, open(os.path.join(d, 'cues.json'), 'w'), indent=1)
print({n: c['D'] for n, c in cues.items()}, 'total %.1fs' % sum(c['D'] for c in cues.values()))
