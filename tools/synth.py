"""Sound for films, synthesized with numpy: a looping music bed, sound effects placed on narration cues,
and the narration track assembled on the film timeline.

Typical films/<film>/audio.py:
    from synth import *
    m = Mix('my-film'); m.music('warm'); m.transitions()      # or m.music() to let the film's name pick the mood
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
def keys(f, dur, amp):                             # soft electric piano
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.006) * np.exp(-t * 2.6) * np.minimum(1, (dur - t) / 0.03)
    return amp * e * (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4) + 0.15 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 7)) * (1 + 0.08 * np.sin(2 * np.pi * 5 * t))
def marimba(f, dur, amp):
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.002) * np.exp(-t * 9)
    return amp * e * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30) + 0.1 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t * 60))
def bass(f, dur, amp):
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.01) * np.exp(-t * 2.2) * np.minimum(1, (dur - t) / 0.04)
    return amp * e * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t))
def strings(fs, dur, amp):                         # slow ensemble pad: detuned voices, soft upper harmonics
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.7) * np.minimum(1, (dur - t) / 0.9); x = 0
    for i, f in enumerate(fs):
        for det in (0.9982, 1.0018):
            x = x + sum(np.sin(2 * np.pi * f * det * h * t + i + h) / h ** 1.5 for h in range(1, 6))
    return amp * e * x / (len(fs) * 2.6)
def flute(f, dur, amp):
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.06) * np.minimum(1, (dur - t) / 0.12); vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.25)
    return amp * e * (np.sin(2 * np.pi * np.cumsum(f * vib) / sr) + 0.18 * np.sin(2 * np.pi * np.cumsum(2 * f * vib) / sr) + 0.03 * rng.normal(size=len(t)))
def tom(f=95, amp=1.0): t = np.arange(int(0.3 * sr)) / sr; return amp * np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 40))) / sr) * np.exp(-t * 12)
def hat(amp=1.0): n = int(0.04 * sr); x = rng.normal(size=n) * env(n, 0.001, 110); return amp * np.diff(np.diff(np.diff(x, prepend=0), prepend=0), prepend=0) * 0.5
def clap(amp=1.0):
    n = int(0.16 * sr); x = noise(0.16, 900, 3500); t = np.arange(n) / sr
    return amp * x * (np.exp(-((t % 0.012) * 300)) * (t < 0.036) + np.exp(-(t - 0.036).clip(0) * 40) * (t >= 0.036))
def pad(fs, dur, amp):
    t = np.arange(int(dur * sr)) / sr; e = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.9)
    return amp * e * sum(np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.3 * t + i)) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for i, f in enumerate(fs)) / len(fs)
def noise(dur, lo, hi):
    n = int(dur * sr); X = np.fft.rfft(rng.normal(size=n)); f = np.fft.rfftfreq(n, 1 / sr); X[(f < lo) | (f > hi)] = 0; x = np.fft.irfft(X, n); return x / np.abs(x).max()
# Sound-effect kits change the character of pops and ticks. classic is the original; Mix(film, kit='auto') picks one per film.
KITS = {'classic': dict(pitch=1.0, wave='sine', decay=1.0), 'soft': dict(pitch=0.72, wave='sine', decay=0.6), 'wood': dict(pitch=0.9, wave='wood', decay=1.3), 'digital': dict(pitch=1.35, wave='square', decay=1.4)}
KIT = dict(KITS['classic'])
def _wave(ph):
    if KIT['wave'] == 'square': return np.tanh(3 * np.sin(ph)) * 0.7
    if KIT['wave'] == 'wood': return np.sin(ph) + 0.35 * np.sin(4 * ph)
    return np.sin(ph)
def pop_(f0=520, f1=980, amp=0.45): n = int(0.09 * sr); t = np.arange(n) / sr; return amp * _wave(2 * np.pi * np.cumsum((f0 + (f1 - f0) * t / 0.09) * KIT['pitch']) / sr) * env(n, 0.003, 34 * KIT['decay'])
def tick(amp=0.25, f=1800): n = int(0.03 * sr); t = np.arange(n) / sr; return amp * _wave(2 * np.pi * f * KIT['pitch'] * t) * env(n, 0.001, 160 * KIT['decay'])
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

# ---------------------------------------------------------------- generated music
# Each mood fixes a feel (tempo range, scale, instruments, rhythm). Within a mood the key, chord loop, arpeggio and
# melody come from a seed, by default the film's name, so every film gets its own tune and the same film always
# gets the same one. bright / upbeat / calm above are fixed tunes kept for the films already made with them.
SCALES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10], 'mixolydian': [0, 2, 4, 5, 7, 9, 10]}
LOOPS = {'major': [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 3], [5, 3, 0, 4]], 'minor': [[0, 5, 2, 6], [0, 3, 5, 4], [0, 6, 5, 6], [0, 5, 3, 4]],
         'dorian': [[0, 3, 0, 6], [0, 6, 3, 0], [0, 2, 3, 6]], 'mixolydian': [[0, 6, 3, 0], [0, 3, 6, 0], [0, 4, 6, 3]]}
MOODS = {
    'warm': dict(bpm=(84, 94), scale='major', chord='keys', padi='strings', lead='flute', drums='half', arp='broken'),
    'tense': dict(bpm=(100, 110), scale='minor', chord='marimba', padi='strings', lead='keys', drums='pulse', arp='ostinato'),
    'playful': dict(bpm=(112, 124), scale='major', chord='marimba', padi='pad', lead='flute', drums='shuffle', arp='updown'),
    'cinematic': dict(bpm=(68, 78), scale='minor', chord='keys', padi='strings', lead='bell', drums='toms', arp='broken'),
    'tech': dict(bpm=(118, 126), scale='dorian', chord='pluck', padi='pad', lead='keys', drums='four', arp='sixteenth'),
    'folk': dict(bpm=(90, 100), scale='mixolydian', chord='pluck', padi='pad', lead='flute', drums='hand', arp='updown'),
}
AUTO_MOODS = ['folk', 'playful', 'tech', 'warm']
def _seed(text):
    h = 2166136261
    for ch in str(text).encode(): h = ((h ^ ch) * 16777619) & 0xFFFFFFFF
    return h

class Mix:
    def __init__(self, film, fps=24, kit='classic'):
        KIT.update(KITS[sorted(KITS)[_seed(film) % len(KITS)] if kit == 'auto' else kit]); self.kit = dict(KIT)
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
    def music(self, preset='auto', level=0.8, seed=None):
        """preset: a fixed tune (bright, upbeat, calm), a generated mood (warm, tense, playful, cinematic, tech, folk),
        'auto' to let the film's name pick a mood, or your own dict. seed: any number or text for a different tune in the same mood."""
        if preset == 'auto': preset = AUTO_MOODS[_seed(self.film) % len(AUTO_MOODS)]      # tense and cinematic are only used when asked for
        if isinstance(preset, str) and preset in MOODS: return self.compose(preset, level, self.film if seed is None else seed)
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
    def compose(self, mood, level=0.8, seed=0):
        M = MOODS[mood]; r = np.random.default_rng(_seed(f'{mood}/{seed}')); sc = SCALES[M['scale']]; root = int(r.integers(45, 53))
        bpm = int(r.integers(M['bpm'][0], M['bpm'][1] + 1)); beat = 60 / bpm; bar = 4 * beat; B = [np.zeros(self.n), np.zeros(self.n)]
        loops = LOOPS[M['scale']]; la = loops[int(r.integers(len(loops)))]; lb = loops[int(r.integers(len(loops)))]; prog = la + lb
        deg = lambda d, octv=0: root + 12 * octv + 12 * (d // 7) + sc[d % 7]            # scale degree to midi note
        swing = 0.16 * beat if M['drums'] == 'shuffle' else 0
        cache = {}
        def tone(kind, k, d, amp):
            key = (kind, k, round(d, 3))
            if key not in cache: cache[key] = {'pluck': lambda: pluck(midi(k), d), 'keys': lambda: keys(midi(k), d, 1), 'marimba': lambda: marimba(midi(k), d, 1),
                                               'bell': lambda: bell(midi(k), d, 1), 'flute': lambda: flute(midi(k), d, 1)}[kind]()
            return amp * cache[key]
        arps = {'broken': ([0, 1, 2, 1], 1), 'updown': ([0, 1, 2, 3, 2, 1, 2, 1], 0.5), 'ostinato': ([0, 0, 2, 0, 1, 0, 2, 0], 0.5), 'sixteenth': ([0, 2, 1, 2, 3, 2, 1, 2] * 2, 0.25)}
        pat, step = arps[M['arp']]; rot = int(r.integers(len(pat))); pat = pat[rot:] + pat[:rot]
        # melody: an 8-bar phrase built from rhythm motifs; chord tones on the beat, steps in between; second pass varies the ending
        motifs = [[0, 2, 3], [0, 1.5, 2, 3.5], [0, 1, 2], [0.5, 2, 2.5], [0, 3], [1, 2, 3, 3.5]]
        def phrase(rr):
            out = []; cur = 7 + int(rr.integers(0, 4))
            for bi in range(8):
                if rr.random() < 0.18 and bi not in (0, 4): continue                 # a bar of rest lets the tune breathe
                d0 = prog[bi]
                for on in motifs[int(rr.integers(len(motifs)))]:
                    if float(on).is_integer(): cur = min((d0 + j + 7 * o for j in (0, 2, 4) for o in (1, 2)), key=lambda c: abs(c - cur) + 0.5 * rr.random())
                    else: cur += int(rr.choice([-1, 1]))
                    cur = int(np.clip(cur, 6, 15)); out.append((bi, on, cur))
            return out
        A = phrase(r); A2 = [n for n in A if n[0] < 6] + [n for n in phrase(r) if n[0] >= 6]
        b = 0; t = 0.0
        while t < self.T:
            d0 = prog[b % 8]; tri = [deg(d0 + j, 1) for j in (0, 2, 4, 7)]; sec = b // 8; quiet = b < 2 or (b % 16 in (14, 15) and self.T - t > 8 * bar)
            if M['padi'] == 'strings': self._add(B, strings([midi(k) for k in tri[:3]], bar + 1.0, 0.36), t)
            else: self._add(B, 0.42 * pad([midi(k) for k in tri[:3]], bar + 0.8, 0.5), t)
            for bt in ((0, 2.5) if M['drums'] != 'pulse' else (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5)): self._add(B, bass(midi(deg(d0, -1)), beat * (0.9 if M['drums'] != 'pulse' else 0.45), 0.5 if bt == 0 else 0.3), t + bt * beat)
            for i in range(int(round(4 / step))):
                tt = t + i * step * beat + (swing if (step == 0.5 and i % 2) else 0)
                self._add(B, tone(M['chord'], tri[pat[i % len(pat)]], max(0.5, step * beat * 1.8), 0.26 if i % 2 == 0 else 0.17), tt, 0.3 + 0.4 * (i % 2))
            if not quiet:
                D = M['drums']
                if D == 'four':
                    for bt in range(4): self._add(B, kick(0.5), t + bt * beat)
                    for bt in (1, 3): self._add(B, clap(0.32), t + bt * beat, 0.45)
                    for i in range(8): self._add(B, hat(0.05 if i % 2 else 0.025), t + i * beat / 2, 0.7)
                elif D == 'half':
                    self._add(B, kick(0.5), t); self._add(B, snap(0.035), t + 2 * beat, 0.45); self._add(B, kick(0.3), t + 2.5 * beat)
                    for i in range(4): self._add(B, shaker(0.035), t + (i + 0.5) * beat, 0.7)
                elif D == 'shuffle':
                    for bt in (0, 2): self._add(B, kick(0.5), t + bt * beat)
                    for bt in (1, 3): self._add(B, snap(0.035), t + bt * beat, 0.45)
                    for i in range(8): self._add(B, shaker(0.045 if i % 2 else 0.024), t + i * beat / 2 + (swing if i % 2 else 0), 0.72)
                elif D == 'hand':
                    for bt, f, a in ((0, 82, 0.5), (0.75, 150, 0.28), (1.5, 150, 0.32), (2, 82, 0.42), (3, 150, 0.3), (3.5, 190, 0.22)): self._add(B, tom(f, a), t + bt * beat, 0.4 if f < 100 else 0.62)
                elif D == 'toms':
                    self._add(B, tom(62, 0.6), t)
                    if b % 2: self._add(B, tom(62, 0.35), t + 2.5 * beat); self._add(B, tom(84, 0.3), t + 3 * beat, 0.6)
                elif D == 'pulse':
                    for i in range(8): self._add(B, hat(0.035 if i % 2 else 0.018), t + i * beat / 2, 0.7)
            if b >= 4 and sec % 4 != 3:
                for bi, on, d in (A if sec % 2 == 0 else A2):
                    if bi == b % 8: self._add(B, tone(M['lead'], deg(d, 1), 1.3 if M['lead'] in ('bell', 'keys') else beat * 1.1, {'flute': 0.12, 'bell': 0.11, 'keys': 0.14}[M['lead']]), t + on * beat, 0.58)
            t += bar; b += 1
        m = np.stack(B, 1)
        for d, g in [(0.031, 0.2), (0.057, 0.16), (0.101, 0.1)]: k = int(d * sr); m[k:] += g * m[:-k]
        idx = np.arange(self.n); m *= (np.minimum(1, idx / (0.8 * sr)) * np.minimum(1, (self.n - idx) / (3.5 * sr)))[:, None]
        # Loudness is set by average level, not peak, so every mood sits at the same volume under the narration
        # (the target keeps the bed roughly 11 dB below the voice once mix.py has ducked it).
        m *= 0.022 * (level / 0.8) / np.sqrt((m ** 2).mean()); self.mus = np.tanh(m / 0.8) * 0.8; self.tune = dict(mood=mood, bpm=bpm, key=['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root % 12] + ' ' + M['scale'], loop=prog)
        print('music:', self.tune)
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

if __name__ == '__main__':      # default soundtrack for films without their own audio.py:  python3 tools/synth.py <film> [preset]
    m = Mix(sys.argv[1], kit='auto'); m.music(sys.argv[2] if len(sys.argv) > 2 else 'auto'); m.transitions(); m.write()
