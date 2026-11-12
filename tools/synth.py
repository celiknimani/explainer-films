"""Sound for films, synthesized with numpy: a looping music bed, sound effects placed on narration cues,
and the narration track assembled on the film timeline.

Typical films/<film>/audio.py:
    from synth import *
    m = Mix('my-film'); m.music('bright'); m.transitions()
    q = m.q('intro'); m.ev('intro', q[0] + 0.3, pop_())      # an effect 0.3 s after the first phrase starts
    m.write()
"""
import os, sys, json, subprocess
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _timeline import timeline, film_dir
sr = 44100; rng = np.random.default_rng(11)

# ---------------------------------------------------------------- instruments and effects (all return mono arrays)
def env(n, a=0.005, d=8): t = np.arange(n) / sr; return np.minimum(1, t / a) * np.exp(-t * d)
def pluck(f, dur, damp=0.996):                       # Karplus-Strong plucked string
    N = int(sr / f); b = rng.uniform(-1, 1, N); out = np.empty(int(dur * sr))
    for i in range(len(out)):
        out[i] = b[i % N]; b[i % N] = damp * 0.5 * (b[i % N] + b[(i + 1) % N])
    return out * np.linspace(1, 0.15, len(out))
def kick(amp=1.0): t = np.arange(int(0.35 * sr)) / sr; return amp * np.sin(2 * np.pi * (48 + 80 * np.exp(-t * 30)) * t) * np.exp(-t * 10)
def snap(amp=1.0): n = int(0.12 * sr); x = rng.normal(size=n) * env(n, 0.002, 45); return amp * np.diff(x, prepend=0) * 1.4
def shaker(amp=1.0): n = int(0.05 * sr); x = rng.normal(size=n) * env(n, 0.002, 80); return amp * np.diff(np.diff(x, prepend=0), prepend=0)
def bell(f, dur, amp):
    t = np.arange(int(dur * sr)) / sr
    return amp * np.minimum(1, t / 0.004) * np.exp(-t * 3.2) * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 5) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 9))
def pad(fs, dur, amp):
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.9)
    return amp * e * sum(np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.3 * t + i)) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for i, f in enumerate(fs)) / len(fs)
def noise(dur, lo, hi):
    n = int(dur * sr); X = np.fft.rfft(rng.normal(size=n)); f = np.fft.rfftfreq(n, 1 / sr); X[(f < lo) | (f > hi)] = 0; x = np.fft.irfft(X, n); return x / np.abs(x).max()
def pop_(f0=520, f1=980, amp=0.45): n = int(0.09 * sr); t = np.arange(n) / sr; return amp * np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / 0.09) / sr) * env(n, 0.003, 34)
def tick(amp=0.25, f=1800): n = int(0.03 * sr); t = np.arange(n) / sr; return amp * np.sin(2 * np.pi * f * t) * env(n, 0.001, 160)
def thud(amp=0.8): n = int(0.35 * sr); t = np.arange(n) / sr; return amp * (np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 10) + 0.3 * noise(0.35, 200, 1500) * np.exp(-t * 40))
def whoosh(dur=0.8, amp=0.45, lo=400, hi=5000): x = noise(dur, lo, hi); return amp * x * np.hanning(len(x)) ** 1.5
def riser(dur, amp=0.4):
    n = int(dur * sr); t = np.arange(n) / sr
    return amp * (np.linspace(0, 1, n) ** 1.5) * (np.sin(2 * np.pi * np.cumsum(180 * (2.6 ** (t / dur))) / sr) * 0.6 + 0.4 * noise(dur, 800, 6000))
def buzz(amp=0.4): n = int(0.28 * sr); t = np.arange(n) / sr; return amp * np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 * np.minimum(1, t / 0.01) * np.minimum(1, (0.28 - t) / 0.05)
midi = lambda k: 440 * 2 ** ((k - 69) / 12)

# ---------------------------------------------------------------- music presets: tempo, 8-bar chord loop, bell melody
MUSIC = {
    'bright': dict(bpm=100, chords=[[45, 57, 60, 64, 69], [41, 53, 57, 60, 65], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65], [50, 57, 62, 65, 69], [40, 56, 59, 64, 68]],
                   mel=[[76, None, 72, None], [77, None, None, 72], [79, 76, None, 72], [74, None, 71, None], [76, None, 81, None], [77, 81, None, 84], [81, None, 77, 74], [76, None, None, None]]),
    'upbeat': dict(bpm=116, chords=[[48, 55, 60, 64, 67], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65]] * 2,
                   mel=[[79, None, 76, 72], [74, None, 79, None], [76, 72, None, 81], [77, None, 76, None], [84, None, 79, 76], [83, None, 79, None], [81, 76, None, 72], [77, 76, 74, None]]),
    'calm': dict(bpm=84, drums=False, chords=[[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 55, 59, 62, 67], [45, 57, 61, 64, 69]] * 2,
                 mel=[[78, None, None, 74], [None, 74, None, None], [79, None, 74, None], [76, None, None, None], [81, None, 78, None], [None, 74, None, 78], [79, None, None, 74], [73, None, None, None]]),
}

class Mix:
    def __init__(self, film, fps=24):
        self.film = film; self.dir = film_dir(film); self.out = os.path.join(self.dir, 'out'); os.makedirs(self.out, exist_ok=True)
        self.tl, self.cues = timeline(film, fps); self.start = {x['n']: x['start'] for x in self.tl}; self.order = [x['n'] for x in self.tl]
        self.T = sum(x['frames'] for x in self.tl) / fps; self.n = int(self.T * sr); self.S = [np.zeros(self.n), np.zeros(self.n)]; self.mus = None
    def q(self, scene): return self.cues[scene]['q']
    def _add(self, buf, x, t, pan=0.5):
        i = int(t * sr)
        if 0 <= i < self.n: x = x[:self.n - i]; buf[0][i:i + len(x)] += x * (1 - pan); buf[1][i:i + len(x)] += x * pan
    def ev(self, scene, t, sound, pan=0.5): self._add(self.S, sound, self.start[scene] + t, pan)       # effect at t seconds into a scene
    def transitions(self, amp=0.45):
        for n in self.order[1:]: self._add(self.S, whoosh(0.9, amp), self.start[n] - 0.45)
    def music(self, preset='bright', level=0.8):
        P = MUSIC[preset] if isinstance(preset, str) else preset; beat = 60 / P['bpm']; bar = 4 * beat; B = [np.zeros(self.n), np.zeros(self.n)]; cache = {}
        def pk(k, d):
            if (k, d) not in cache: cache[(k, d)] = pluck(midi(k), d)
            return cache[(k, d)]
        b = 0; t = 0.0
        while t < self.T:
            ch = P['chords'][b % 8]; self._add(B, 0.42 * pad([midi(k) for k in ch[1:4]], bar + 0.8, 0.5), t)
            self._add(B, 0.55 * pk(ch[0], 2.0), t); self._add(B, 0.35 * pk(ch[0], 1.0), t + 2.5 * beat)
            for i, p in enumerate([1, 2, 3, 4, 3, 2, 4, 3]): self._add(B, (0.2 if i % 2 else 0.3) * pk(ch[p], 0.9), t + i * beat / 2, 0.3 + 0.4 * (i % 2))
            if b >= 2 and P.get('drums', True):
                for bt in (0, 2.5): self._add(B, kick(0.5), t + bt * beat)
                for bt in (1, 3): self._add(B, snap(0.13), t + bt * beat, 0.45)
                for i in range(8): self._add(B, shaker(0.4 if i % 2 else 0.2), t + i * beat / 2, 0.72)
            if (b >= 4 and (b // 8) % 2 == 0) or b >= 12:
                for i, nn in enumerate(P['mel'][b % 8]):
                    if nn: self._add(B, bell(midi(nn), 1.4, 0.11), t + i * beat, 0.58)
            t += bar; b += 1
        m = np.stack(B, 1)
        for d, g in [(0.031, 0.2), (0.057, 0.16), (0.101, 0.1)]: k = int(d * sr); m[k:] += g * m[:-k]          # a little room
        idx = np.arange(self.n); m *= (np.minimum(1, idx / (0.8 * sr)) * np.minimum(1, (self.n - idx) / (3.5 * sr)))[:, None]
        self.mus = m / np.abs(m).max() * level
    def write(self):
        if self.mus is not None: sf.write(os.path.join(self.out, 'music.wav'), self.mus, sr)
        sf.write(os.path.join(self.out, 'sfx.wav'), np.tanh(np.stack(self.S, 1) * 1.2) * 0.8, sr)
        wavs = [(n, os.path.join(self.dir, 'narr', n + '.wav')) for n in self.order]
        if all(os.path.exists(w) for _, w in wavs):
            ins = []; fl = []
            for i, (n, w) in enumerate(wavs): ins += ['-i', w]; fl.append(f'[{i}:a]aresample=44100,adelay={int(self.start[n] * 1000)}:all=1[a{i}]')
            fl.append(''.join(f'[a{i}]' for i in range(len(wavs))) + f'amix=inputs={len(wavs)}:normalize=0,highpass=f=70,loudnorm=I=-15:TP=-1.5,aresample=44100[v]')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-t', str(self.T), os.path.join(self.out, 'narr.wav')], check=True)
        else: print('no narration found (run tools/narrate.py first); writing music and effects only')
        print(f'audio written for {self.film}: {self.T:.1f}s')
