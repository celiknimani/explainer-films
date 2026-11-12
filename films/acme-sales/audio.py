"""Music and sound effects for the sales template."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from synth import *
m = Mix("acme-sales"); m.music("upbeat"); m.transitions()
q = m.q("problem")
for i in range(16): m.ev("problem", 0.2 + i * 0.07, tick(0.18, 900 + 40 * i), 0.3 + 0.4 * (i % 2))
for t in (q[0] + 1.4, q[0] + 2.2, q[0] + 3.0): m.ev("problem", t, pop_())
for t in (q[1] + 0.4, q[1] + 1.8): m.ev("problem", t, pop_(700, 350, 0.5))
q = m.q("product"); m.ev("product", 0.3, whoosh(1.2, 0.3)); m.ev("product", 0.9, riser(1.6, 0.3)); m.ev("product", 2.5, thud(0.7)); m.ev("product", q[0] + 2.0, pop_())
q = m.q("features"); m.ev("features", q[0] + 1.25, tick(0.5, 1200))
for i, t in enumerate((q[0] + 0.5, q[1] + 0.6, q[2] + 0.6)): m.ev("features", t, pop_(480 + 80 * i, 900 + 80 * i))
m.ev("features", q[1] + 0.5, bell(midi(88), 0.8, 0.25)); m.ev("features", q[1] - 0.1, pop_(600, 800, 0.4))
for i in range(4): m.ev("features", q[2] + 0.9 + i * 0.45, tick(0.3, 1500 + 150 * i))
q = m.q("proof"); m.ev("proof", q[0] + 1.2, thud(0.7)); m.ev("proof", q[0] + 2.3, thud(0.7))
q = m.q("cta"); m.ev("cta", q[0] + 0.4, thud(0.8)); m.ev("cta", q[0] + 1.4, pop_()); m.ev("cta", q[0] + 1.5, bell(midi(84), 1.2, 0.2))
m.write()
