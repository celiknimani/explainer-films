"""Use narration recorded or generated elsewhere (a voice actor, ElevenLabs, any language) in place of the built-in voice.
Put one audio file per scene in films/<film>/voice/<scene>.(mp3|wav|m4a), reading that scene's phrases from script.json in order.
Writes films/<film>/narr/<scene>.wav and cues.json, as narrate.py does, so the animation follows the new voice.
Phrase starts are found by speech recognition (faster-whisper, `pip install faster-whisper`) and then moved to the nearest
pause, so they land where the voice comes in. It also writes words.json: every recognised word with its time in the scene,
for setting offsets inside a phrase. Check the printed lines: each phrase should begin with the words shown.
Usage: python3 tools/voice.py <film> [--model large-v3-turbo]"""
import sys, os, re, json, glob, difflib, subprocess, argparse, unicodedata
import numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 24000
ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('--model', default='large-v3-turbo'); a = ap.parse_args()
d = os.path.join(ROOT, 'films', a.film); S = json.load(open(os.path.join(d, 'script.json'))); os.makedirs(os.path.join(d, 'narr'), exist_ok=True)
lead, tail, hold = S.get('lead', 0.5), S.get('tail', 2.6), S.get('hold', 0.8)
def load(path, sr): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
def key(w): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', w.lower()).encode('ascii', 'ignore').decode())     # compare words without accents or punctuation
def pauses(x, sr, thr=0.012, least=0.14):     # (start, end) of every silence at least `least` seconds long
    win = int(sr * 0.02); e = np.array([np.abs(x[i:i + win]).max() for i in range(0, len(x) - win, win)]) < thr; out = []; i = 0
    while i < len(e):
        if e[i]:
            j = i
            while j < len(e) and e[j]: j += 1
            if (j - i) * 0.02 >= least: out.append((i * 0.02, j * 0.02))
            i = j
        else: i += 1
    return out
from faster_whisper import WhisperModel
M = WhisperModel(a.model, device='cpu', compute_type='int8')
names = list(S['scenes']); cues = {}; words = {}
for sc in names:
    src = sorted(glob.glob(os.path.join(d, 'voice', sc + '.*')))
    if not src: sys.exit(f'no audio for scene "{sc}" in {a.film}/voice')
    x = load(src[0], SR); nz = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, nz[0] - 600):nz[-1] + 1500]       # trim silence at both ends
    seg, _ = M.transcribe(load(src[0], 16000)[int(max(0, nz[0] - 600) / SR * 16000):], language=S.get('lang', 'en')[:2], word_timestamps=True, beam_size=5)
    W = [(w.word.strip(), w.start) for s in seg for w in s.words]; hyp = [key(w) for w, _ in W]
    phrases = [p if isinstance(p, str) else p['say'] for p in S['scenes'][sc]]; ref = []; first = []
    for p in phrases: first.append(len(ref)); ref += [key(w) for w in p.split() if key(w)]
    blocks = difflib.SequenceMatcher(None, ref, hyp, autojunk=False).get_matching_blocks(); gaps = pauses(x, SR); q = []
    for n, f in enumerate(first):
        b = next((b for b in blocks if b.a + b.size > f), blocks[-1]); i = min(len(W) - 1, max(0, b.b - (b.a - f))) if n else 0      # the recognised word this phrase starts on
        if n and S['scenes'][sc][n - 1] and W[i - 1][0][-1] not in '.?!': i = next((j for j in (i + 1, i - 1, i + 2, i - 2) if 0 < j < len(W) and W[j - 1][0][-1] in '.?!'), i)     # numbers and merged words can put it one word out: prefer a sentence start
        t = W[i][1]; near = [g[1] for g in gaps if abs(g[1] - t) < 0.45]; t = min(near, key=lambda g: abs(g - t)) if near and n else (0 if not n else t)
        q.append(round(lead + t, 2)); print(f'{sc}[{n}] {q[-1]:6.2f}  heard: {" ".join(w for w, _ in W[i:i + 4])}   | script: {" ".join(phrases[n].split()[:4])}')
    sf.write(os.path.join(d, 'narr', f'{sc}.wav'), np.concatenate([np.zeros(int(lead * SR), np.float32), x]), SR)
    cues[sc] = {'q': q, 'D': round(lead + len(x) / SR + (tail if sc == names[-1] else hold), 1)}; words[sc] = [[w, round(lead + t, 2)] for w, t in W]
json.dump(cues, open(os.path.join(d, 'cues.json'), 'w'), indent=1); json.dump(words, open(os.path.join(d, 'words.json'), 'w'), ensure_ascii=False, indent=0)
print({n: c['D'] for n, c in cues.items()}, 'total %.1fs' % sum(c['D'] for c in cues.values()))
