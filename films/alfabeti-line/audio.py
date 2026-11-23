"""Music and sound effects for the one-line alphabet film. Effects sit on the same cue offsets as the animation in film.js."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from synth import *
m = Mix("alfabeti-line", fps=30, kit="soft")
# Quiet under the early history, rising as the scripts multiply, fullest on the 36 letters, warm for the close.
m.music("warm", level=0.9, bpm=96, energy=dict(title=0.5, early=0.35, scripts=0.6, primer=0.75, congress=0.85, letters=1.0, today=0.7, outro=0.9))
def ticks(sc, t0, n, gap, f0=900, step=40, amp=0.22): [m.ev(sc, t0 + gap * i, tick(amp, f0 + step * (i % 12)), 0.35 + 0.3 * (i % 5) / 4) for i in range(n)]
def travel(sc, t_arrive, d, pan=0.5): m.ev(sc, t_arrive - d + 0.15, whoosh(d * 0.75, 0.22, 300, 3200), pan)       # the camera sets off
def land(sc, t, f=520): m.ev(sc, t, pop_(f, f * 1.8, 0.4)); m.ev(sc, t + 0.02, thud(0.35))                      # a stop appears on the line

q = m.q("title"); m.ev("title", q[0], thud(0.6)); ticks("title", q[0] + 0.1, 36, 0.034); m.ev("title", q[1] + 0.5, whoosh(1.0, 0.2)); m.ev("title", q[1] + 3.0, pop_())
q = m.q("early"); travel("early", q[0] + 0.3, 1.8); travel("early", q[1] + 1.1, 1.6); land("early", q[1] + 0.9); ticks("early", q[1] + 1.8, 28, 0.06, 1400, 0, 0.1)
travel("early", q[2] + 0.9, 1.6); land("early", q[2] + 0.7, 560); m.ev("early", q[2] + 1.3, pop_(480, 800, 0.3))
q = m.q("scripts"); travel("scripts", q[0] + 0.9, 2.0); land("scripts", q[0] + 0.8, 420); m.ev("scripts", q[0] + 1.0, whoosh(1.1, 0.25)); travel("scripts", q[1] + 0.9, 1.6)
for i, a in enumerate((q[1] + 0.2, q[1] + 2.9, q[1] + 4.6, q[2] + 0.2)): m.ev("scripts", a + 0.1, whoosh(0.9, 0.16)); m.ev("scripts", a + 0.75, pop_(480 + 70 * i, 880 + 70 * i))
q = m.q("primer"); travel("primer", q[0] + 0.9, 1.8); land("primer", q[0] + 1.0, 600); m.ev("primer", q[0] + 1.5, pop_(480, 800, 0.3)); travel("primer", q[1] + 0.8, 1.7)
for j in range(3): m.ev("primer", q[1] + 1.0 + j * 0.45, pop_(520 + 60 * j, 900 + 60 * j, 0.35))
travel("primer", q[2] + 0.8, 1.6); m.ev("primer", q[2] + 0.1, whoosh(1.0, 0.18))
for i in range(6): m.ev("primer", q[2] + 1.7 + i * 0.13, bell(midi(76 + 2 * i), 0.5, 0.12))
q = m.q("congress"); travel("congress", q[0] + 0.9, 2.0); m.ev("congress", q[0] + 0.7, thud(0.7)); ticks("congress", q[0] + 1.9, 50, 0.03, 700, 30, 0.16); m.ev("congress", q[0] + 3.7, pop_(700, 420, 0.35))
m.ev("congress", q[1] + 1.7, thud(0.65)); m.ev("congress", q[2] + 0.3, riser(0.9, 0.25)); m.ev("congress", q[2] + 1.3, bell(midi(84), 0.9, 0.18)); travel("congress", q[2] + 3.9, 1.7)
m.ev("congress", q[2] + 2.2, whoosh(1.4, 0.2)); m.ev("congress", q[3] + 1.5, pop_(700, 380, 0.35)); m.ev("congress", q[3] + 3.3, riser(0.9, 0.35)); m.ev("congress", q[3] + 4.1, thud(0.8))
q = m.q("letters"); ticks("letters", q[0] - 0.5, 36, 0.022, 1000, 35, 0.14)
for i, a in enumerate((q[0] + 2.0, q[0] + 3.3, q[1] + 0.5, q[2] + 0.3)): m.ev("letters", a, bell(midi(81 + 3 * i), 0.8, 0.2)); m.ev("letters", a + 0.05, pop_(500 + 60 * i, 900 + 60 * i))
m.ev("letters", q[2] + 1.3, whoosh(1.0, 0.3))
q = m.q("today"); m.ev("today", q[0] - 0.5, thud(0.6)); ticks("today", q[0] + 3.0, 12, 0.035, 1100, 50, 0.16); m.ev("today", q[0] + 3.5, pop_())
travel("today", q[1] + 0.8, 1.6); land("today", q[1] + 0.7); m.ev("today", q[1] + 1.8, pop_(480, 800, 0.3)); land("today", q[1] + 5.0, 600); travel("today", q[2] + 0.8, 1.6)
for j in range(3): land("today", q[2] + 1.5 + j * 0.7, 520 + 70 * j)
q = m.q("outro"); travel("outro", q[0] + 0.7, 1.7); land("outro", q[0] + 0.6); ticks("outro", q[0] + 1.2, 14, 0.07, 800, 45, 0.15); m.ev("outro", q[0] + 2.4, thud(0.7))
travel("outro", q[1] + 1.0, 1.7); m.ev("outro", q[1] + 0.2, whoosh(2.4, 0.18, 300, 2400)); m.ev("outro", q[1] + 2.7, thud(0.7)); m.ev("outro", q[1] + 2.75, pop_())
for i in range(36): m.ev("outro", q[1] + 3.3 + i * 0.045, bell(midi(72 + [0, 2, 4, 7, 9][i % 5] + 12 * (i // 15)), 0.35, 0.07), 0.2 + 0.6 * (i % 12) / 11)
m.ev("outro", q[1] + 5.3, bell(midi(91), 1.6, 0.22))
m.write()
