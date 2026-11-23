// Building blocks for isometric scenes: slabs that sit on their base, a floor grid, and helpers to deal out and pull apart a stack.
import * as C from '../core.js';
import { tm } from './kit.js';
const { THREE, M, clamp, MOTION } = C;

// A box whose origin is the centre of its base, so position.y is the height it stands at.
export function slab(w, d, h, col, o = {}) { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return M(g, typeof col === 'string' ? tm(col) : col, o); }

// A square floor grid of n cells each way, drawn as thin quads just above the ground.
export function grid(n = 12, step = 2, col = '#D9CFB8', lw = 0.05) { const pos = [], idx = [], half = n * step / 2;
  const quad = (x0, z0, x1, z1) => { const i = pos.length / 3; pos.push(x0, 0.02, z0, x1, 0.02, z0, x1, 0.02, z1, x0, 0.02, z1); idx.push(i, i + 2, i + 1, i, i + 3, i + 2); };
  for (let i = 0; i <= n; i++) { const c = -half + i * step; quad(c - lw, -half, c + lw, half); quad(-half, c - lw, half, c + lw); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return new THREE.Mesh(g, C.basic(col, { fog: false })); }

// Exploded view. parts are listed bottom to top; base[i] is where part i rests when the stack is closed. One number, gap, opens and
// closes the whole stack. Height is always shown by lifting, never by scaling.
export function lift(parts, base, gap) { parts.forEach((p, i) => { p.position.y = base[i] + i * gap; }); }

// Height above its resting place for something that drops in at t0 from h. Add it to position.y. Stagger t0 by position, bottom first.
export const drop = (t, t0, d = 0.6, h = 8) => { const x = clamp((t - t0) / (d / MOTION.speed)); if (x <= 0) return 1e4; const e = 1 - (1 - x) ** 3; return h * (1 - e) - MOTION.overshoot * 1.2 * Math.sin(x * Math.PI) * (1 - x); };
