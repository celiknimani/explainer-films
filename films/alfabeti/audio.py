"""Music and sound effects for the alphabet film. Effects are placed relative to narration cues, like the animation."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from synth import *
m = Mix("alfabeti", kit="wood")
# Light under the early history, building through the congress to the full alphabet, then easing for the close.
m.music("playful", bpm=108, energy=dict(title=0.5, early=0.35, scripts=0.6, primer=0.7, congress=0.9, letters=1.0, today=0.7, outro=0.9)); m.transitions()
def knocks(sc, t0, n, gap, f0=700): [m.ev(sc, t0 + gap * i, tick(0.3, f0 + 45 * (i % 9)), 0.3 + 0.4 * (i % 3) / 2) for i in range(n)]
q = m.q("title"); knocks("title", 0.55, 36, 0.05); m.ev("title", q[0] - 0.1, whoosh(0.5, 0.3)); m.ev("title", q[0] + 0.1, thud(0.7)); m.ev("title", q[1] + 0.1, pop_())
q = m.q("early"); knocks("early", 0.6, 3, 0.15, 500)
for i in range(3): m.ev("early", q[0] + 0.8 + i * 0.45, pop_(600 + 80 * i, 1000 + 80 * i, 0.3))
for a in (q[1] + 0.3, q[2] + 0.3): m.ev("early", a + 0.4, thud(0.7)); m.ev("early", a + 2.3 if a < q[2] else a + 1.3, pop_()); m.ev("early", a + 2.6 if a < q[2] else a + 1.6, pop_(480, 800, 0.35))
q = m.q("scripts")
for i, a in enumerate((q[1] + 0.2, q[1] + 2.9, q[1] + 4.6, q[2] + 0.2)): m.ev("scripts", a + 0.4, thud(0.65)); m.ev("scripts", a + 0.75, pop_(480 + 70 * i, 880 + 70 * i))
q = m.q("primer"); m.ev("primer", 0.9, thud(0.7)); m.ev("primer", q[0] + 1.65, pop_()); m.ev("primer", q[0] + 1.95, pop_(480, 800, 0.35))
for i in range(3): m.ev("primer", q[1] + 0.7 + i * 0.3, thud(0.5))
m.ev("primer", q[1] + 1.35, pop_()); knocks("primer", q[2] + 0.8, 6, 0.14, 600); m.ev("primer", q[2] + 1.65, pop_()); m.ev("primer", q[2] + 1.95, pop_(480, 800, 0.35))
q = m.q("congress"); m.ev("congress", 0.7, thud(0.8)); knocks("congress", q[0] + 1.85, 50, 0.035, 500); m.ev("congress", q[0] + 2.45, pop_()); m.ev("congress", q[0] + 3.05, pop_(480, 800, 0.35))
m.ev("congress", q[1] + 0.7, thud(0.7)); m.ev("congress", q[1] + 1.3, thud(0.7)); m.ev("congress", q[2] + 0.3, riser(0.6, 0.3)); m.ev("congress", q[2] + 0.6, bell(midi(84), 0.9, 0.2)); m.ev("congress", q[2] + 2.85, pop_())
m.ev("congress", q[3] + 0.6, whoosh(1.2, 0.3)); m.ev("congress", q[3] + 1.65, bell(midi(88), 1.2, 0.22)); m.ev("congress", q[3] + 2.05, pop_(700, 400, 0.4))
q = m.q("letters"); m.ev("letters", 1.1, pop_())
for i, a in enumerate((q[0] + 2.0, q[0] + 3.3, q[1] + 0.5, q[2] + 0.3)): m.ev("letters", a, bell(midi(81 + 3 * i), 0.8, 0.2)); m.ev("letters", a + 0.05, pop_(500 + 60 * i, 900 + 60 * i))
q = m.q("today")
for i in range(3): m.ev("today", q[i] + 0.7, thud(0.7)); m.ev("today", q[i] + 1.35, pop_()); m.ev("today", q[i] + 1.65, pop_(480, 800, 0.35))
q = m.q("outro"); m.ev("outro", q[0] + 0.2, whoosh(0.5, 0.3)); m.ev("outro", q[0] + 0.5, thud(0.75)); m.ev("outro", q[1] + 0.8, thud(0.7)); m.ev("outro", q[1] + 1.45, bell(midi(91), 1.4, 0.25)); m.ev("outro", q[1] + 1.5, pop_())
m.write()
