"""Music and sound effects for the Kosovo finance film. Effects are placed relative to narration cues, like the animation."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from synth import *
m = Mix("kosovo-finance", kit="soft")
# The arrangement follows the story: sparse for the opening question, full for growth and payments, calmer for the safety check.
m.music("folk", level=0.95, bpm=102, energy=dict(title=0.35, size=0.65, growth=1.0, banks=0.7, rates=0.9, health=0.5, pensions=0.75, others=0.6, payments=1.0, outro=0.85))
m.transitions()
def coins(sc, t0, n, dur, f0=1500): [m.ev(sc, t0 + dur * i / n, tick(0.16, f0 + 60 * (i % 7)), 0.25 + 0.3 * (i % 3) / 2) for i in range(n)]
q = m.q("title"); coins("title", 0.4, 30, 4.2); m.ev("title", q[0], whoosh(0.8, 0.25)); m.ev("title", q[1] + 0.1, pop_())
q = m.q("size"); m.ev("size", q[0] + 3.8, thud(0.7)); m.ev("size", q[0] + 3.9, bell(midi(84), 1.0, 0.2)); m.ev("size", q[1] + 0.9, thud(0.6))
for t in (q[2] + 0.2, q[3] + 0.2, q[4] + 0.2, q[4] + 1.1): m.ev("size", t, pop_())
q = m.q("growth")
for i, t in enumerate((q[1], q[1] + 1.5, q[1] + 2.2, q[1] + 2.9, q[2] + 0.3)): coins("growth", t + 0.1, 9, 1.0, 1300 + 120 * i); m.ev("growth", t + 1.2, pop_(480 + 50 * i, 900 + 50 * i, 0.35))
m.ev("growth", q[2] + 1.3, riser(0.9, 0.3)); m.ev("growth", q[2] + 2.0, thud(0.7)); m.ev("growth", q[3] + 1.3, bell(midi(86), 1.0, 0.2))
q = m.q("banks")
for i in range(10): m.ev("banks", q[0] + 1.8 + i * 0.07, tick(0.2, 1100 + 50 * i))
coins("banks", q[1], 14, 3.2); coins("banks", q[2], 14, 2.4, 1200)
for t in (q[1] + 1.5, q[1] + 2.3, q[2] + 1.1, q[2] + 1.9): m.ev("banks", t, pop_())
m.ev("banks", q[3] + 0.3, whoosh(0.6, 0.3)); m.ev("banks", q[3] + 0.7, pop_(500, 900, 0.4)); m.ev("banks", q[3] + 3.1, pop_(600, 1000, 0.4)); m.ev("banks", q[4] + 0.4, thud(0.7))
q = m.q("rates"); m.ev("rates", q[1] - 0.9, whoosh(0.7, 0.3)); m.ev("rates", q[1] + 0.3, riser(2.5, 0.25)); m.ev("rates", q[1] + 3.0, pop_()); m.ev("rates", q[2] + 0.1, riser(1.9, 0.22)); m.ev("rates", q[2] + 2.2, pop_())
m.ev("rates", q[3] + 0.3, pop_(600, 800, 0.4)); m.ev("rates", q[4] + 1.1, thud(0.75)); m.ev("rates", q[4] + 1.2, bell(midi(84), 1.0, 0.2))
q = m.q("health"); m.ev("health", q[0] + 0.3, riser(0.6, 0.3)); m.ev("health", q[0] + 0.9, bell(midi(88), 0.9, 0.22))
for i, t in enumerate((q[1] + 0.3, q[2] + 0.5, q[3] + 0.7, q[4] + 2.3)): m.ev("health", t, pop_(480 + 60 * i, 900 + 60 * i)); m.ev("health", t - 0.25, whoosh(0.35, 0.25))
q = m.q("pensions"); m.ev("pensions", q[1] + 1.3, pop_()); m.ev("pensions", q[1] + 4.7, thud(0.7)); coins("pensions", q[2], 12, 2.4); m.ev("pensions", q[2] + 0.6, pop_()); m.ev("pensions", q[3] + 2.1, thud(0.7)); m.ev("pensions", q[4] + 0.9, thud(0.7))
q = m.q("others"); m.ev("others", 0.7, pop_(700, 1100, 0.35)); m.ev("others", q[0] + 2.4, thud(0.7)); m.ev("others", q[1] + 0.7, pop_()); m.ev("others", q[1] + 3.7, pop_(600, 800, 0.4))
coins("others", q[2], 8, 1.2, 1300); m.ev("others", q[2] + 1.7, thud(0.7)); m.ev("others", q[3] + 0.4, whoosh(0.5, 0.3)); m.ev("others", q[3] + 0.8, pop_()); m.ev("others", q[3] + 1.3, pop_(500, 700, 0.4))
q = m.q("payments")
for i, t in enumerate((q[1] + 1.5, q[2] + 0.7, q[3] + 0.6)): m.ev("payments", t, thud(0.65))
k = 0
while q[2] - 0.4 + 2.6 * k + 0.8 < m.q("payments")[-1] + 6: m.ev("payments", q[2] - 0.4 + 2.6 * k + 0.78, bell(midi(91), 0.5, 0.16)); k += 1
m.ev("payments", q[4] + 0.4, pop_()); m.ev("payments", q[4] + 2.7, pop_(700, 350, 0.5))
q = m.q("outro")
for t in (q[1] + 0.3, q[2] + 0.4, q[3] + 0.6): m.ev("outro", t, pop_()); m.ev("outro", t - 0.25, whoosh(0.35, 0.25))
m.ev("outro", q[4] + 0.3, whoosh(0.7, 0.3)); m.ev("outro", q[4] + 0.6, thud(0.7))
for i, t in enumerate((q[4] + 3.2, q[4] + 4.0, q[4] + 5.2, q[4] + 6.2)): m.ev("outro", t, pop_(500 + 60 * i, 900 + 60 * i, 0.4))
m.write()
