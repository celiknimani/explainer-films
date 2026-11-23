"""Music and sound effects for the isometric demo. Effects are placed relative to narration cues, like the animation."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from synth import *
m = Mix("iso-stack", kit="digital"); m.music("tech", energy=dict(stack=0.5, down=0.8, up=1.0)); m.transitions()
q = m.q("stack")
for i in range(4): m.ev("stack", 0.3 + i * 0.28 + 0.45, thud(0.55 + 0.05 * i))
m.ev("stack", q[1] + 0.2, riser(1.1, 0.3)); m.ev("stack", q[1] + 1.4, thud(0.6))
for i in range(4): m.ev("stack", q[1] + 1.75 + i * 0.15, pop_(480 + 60 * i, 900 + 60 * i, 0.35))
q = m.q("down"); m.ev("down", q[0] + 0.1, whoosh(0.5, 0.3))
for i, a in enumerate((q[0] + 0.9, q[1] + 1.0, q[2] + 0.9, q[3] + 0.9)): m.ev("down", a, bell(midi(88 - 3 * i), 0.7, 0.2)); m.ev("down", a + 0.05, pop_())
q = m.q("up")
for i in range(3): m.ev("up", 1.1 + 0.65 * i, bell(midi(82 + 3 * i), 0.6, 0.2))
m.ev("up", 0.2, bell(midi(79), 0.6, 0.2)); m.ev("up", 0.7, pop_()); m.ev("up", 3.2, bell(midi(96), 1.2, 0.25))
for i in range(4): m.ev("up", 3.2 + i * 0.12 + 0.35, pop_(600 + 80 * i, 1000 + 80 * i, 0.35))
m.ev("up", q[1] + 0.1, riser(1.1, 0.3)); m.ev("up", q[1] + 1.3, thud(0.7)); m.ev("up", q[1] + 1.7, pop_())
m.write()
