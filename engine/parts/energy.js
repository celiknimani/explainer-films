// Energy and landscape parts: smoke and steam puffs, cooling towers, stacks, pylons with wires, wind turbines, hills, trees and fields.
import * as C from '../core.js';
import { m4, q4, tm, at, cyl, rnd, sb, RED } from './kit.js';
const { THREE, V, sstep, pop, toon, basic, M, outline, tube, mergeGeometries } = C;

// ---------------------------------------------------------------- shared builders
export function Puffs(parent, n) {
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), toon('#FFFFFF'), n); mesh.frustumCulled = false; parent.add(mesh);
  const src = []; let total = 0; const col = new THREE.Color();
  return { mesh, src,
    add(pos, o = {}) { const s = { pos, n: o.n || 7, life: o.life || 5, rise: o.rise || 2.2, size: o.size || 1, drift: o.drift || [0.8, 0.2], color: o.color || '#FFFFFF', on: 1, i0: total }; total += s.n; src.push(s);
      if (!C.STYLE.fill) for (let j = 0; j < s.n; j++) mesh.setColorAt(s.i0 + j, col.set(s.color)); return s; },
    update(t) { for (const s of src) for (let j = 0; j < s.n; j++) { const ph = ((t / s.life + j / s.n) % 1 + 1) % 1, age = ph * s.life;
        const k = s.size * (0.45 + 1.3 * ph) * sstep((1 - ph) / 0.3) * sstep(ph / 0.08) * s.on;
        m4.compose(V(s.pos.x + s.drift[0] * age + 0.25 * s.size * Math.sin(j * 7.1 + age), s.pos.y + s.rise * age, s.pos.z + s.drift[1] * age + 0.25 * s.size * Math.cos(j * 3.3 + age)), q4.identity(), V(k, k * 0.85, k));
        mesh.setMatrixAt(s.i0 + j, m4); }
      for (let i = total; i < n; i++) mesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; } };
}
const towerMat = toon('#DCD6C8', { side: THREE.DoubleSide });
export function ctower(h, rb, px = 5) {
  const rth = rb * 0.56, yt = h * 0.74, a = yt / Math.sqrt((rb / rth) ** 2 - 1), pts = [];
  for (let i = 0; i <= 16; i++) { const y = h * i / 16; pts.push(new THREE.Vector2(rth * Math.sqrt(1 + ((y - yt) / a) ** 2), y)); }
  const g = new THREE.Group(), rt = pts[16].x; g.add(M(new THREE.LatheGeometry(pts, 28), towerMat, { ol: px }));
  const d = new THREE.Mesh(new THREE.CircleGeometry(rt * 0.96, 24), basic('#55545C')); d.rotation.x = -Math.PI / 2; d.position.y = h - h * 0.03; g.add(d);
  g.add(at(cyl(rb * 1.015, rb * 1.03, h * 0.06, '#8C8678', { ol: 0 }, 28), 0, h * 0.03, 0)); g.userData = { h, rt }; return g;
}
export function stack(h, r, bands = 3, col = '#D9D3C5', px = 4) {
  const g = new THREE.Group(); g.add(at(cyl(r * 0.7, r, h, col, { ol: px }, 14), 0, h / 2, 0));
  for (let i = 0; i < bands; i++) { const y = h - h * 0.05 - i * h * 0.1, rr = r * (0.7 + 0.3 * (1 - y / h)) * 1.04; g.add(at(cyl(rr, rr, h * 0.05, RED, { ol: 0 }, 14), 0, y, 0)); } return g;
}
export function pylonGeo(h = 10) {
  const p = [], L = (a, b, t = 0.16) => p.push(sb(V(...a), V(...b), t));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L([sx * 1.2, 0, sz * 1.2], [sx * 0.3, h * 0.72, sz * 0.3]);
  L([0, h * 0.72, 0], [0, h, 0], 0.34);
  for (const [y, w] of [[h * 0.72, 3.2], [h * 0.86, 2.6], [h * 0.98, 1.8]]) L([-w, y, 0], [w, y, 0], 0.2);
  for (let k = 0; k < 3; k++) { const y0 = h * 0.72 * k / 3, y1 = h * 0.72 * (k + 1) / 3, r0 = 1.2 - 0.9 * k / 3, r1 = 1.2 - 0.9 * (k + 1) / 3;
    L([-r0, y0, r0], [r1, y1, r1], 0.1); L([r0, y0, r0], [-r1, y1, r1], 0.1); L([-r0, y0, -r0], [r1, y1, -r1], 0.1); L([r0, y0, -r0], [-r1, y1, -r1], 0.1); }
  return mergeGeometries(p);
}
const PYG = pylonGeo(10), steel = toon('#6E7C86'), wireMat = basic('#3B3A45');
export function pylons(parent, pts, rotY = 0) {   // pts: [x,z]; wires between consecutive pylons
  pts.forEach(([x, z]) => { const m = M(PYG, steel, { ol: 2.5 }); m.position.set(x, 0, z); m.rotation.y = rotY; parent.add(m); });
  const dx = Math.cos(rotY), dz = -Math.sin(rotY);
  for (let i = 0; i < pts.length - 1; i++) for (const [y, w] of [[7.2, 3.2], [7.2, -3.2], [8.6, 2.6], [8.6, -2.6]]) {
    const a = V(pts[i][0] + dx * w, y, pts[i][1] + dz * w), b = V(pts[i + 1][0] + dx * w, y, pts[i + 1][1] + dz * w), mid = a.clone().lerp(b, 0.5); mid.y -= 1.3;
    parent.add(tube([a, mid, b], 0.06, wireMat, { ol: 0, seg: 10 })); }
}
const TW = toon('#F7F4EC');
const TG = mergeGeometries([new THREE.CylinderGeometry(0.13, 0.3, 8, 10).translate(0, 4, 0), new THREE.BoxGeometry(0.55, 0.5, 1.3).translate(0, 8.05, 0.1)]);
const RG = (() => { const parts = [new THREE.SphereGeometry(0.3, 10, 8)]; for (let k = 0; k < 3; k++) { const b = new THREE.CylinderGeometry(0.05, 0.22, 3.7, 6); b.scale(1, 1, 0.4); b.translate(0, 1.95, 0); b.rotateZ(k * 2 * Math.PI / 3); parts.push(b); } return mergeGeometries(parts); })();
export function turbine(parent, x, y, z, s = 1, px = 3) {
  const g = new THREE.Group(), rotor = M(RG, TW, { ol: px }); rotor.position.set(0, 8.05, 0.85); g.add(M(TG, TW, { ol: px }), rotor); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  return { g, rotor, s, ph: rnd() * 6 };
}
export const spin = (list, t, sp = 2.2) => list.forEach(w => { w.rotor.rotation.z = -(t * sp * (0.85 + 0.3 * (w.ph / 6)) + w.ph); });
export const popAll = (list, t, t0, gap = 0.12) => list.forEach((w, i) => w.g.scale.setScalar(Math.max(1e-4, w.s * pop(t, t0 + i * gap, 0.4))));
export function hillMesh(h, col, parent) { let g = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); g = g.toNonIndexed(); g.computeVertexNormals();
  const m = new THREE.Mesh(g, tm(col)); m.position.set(h.x, -0.02, h.z); m.scale.set(h.sx, h.sy, h.sz); m.receiveShadow = true; parent.add(m); return m; }
export const hy = (h, x, z) => h.sy * Math.sqrt(Math.max(0, 1 - ((x - h.x) / h.sx) ** 2 - ((z - h.z) / h.sz) ** 2));
export function farHills(parent, col, s0, r0 = 330, n = 11) { let s = s0; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * 0.3, d = r0 + r() * 260; hillMesh({ x: Math.cos(a) * d, z: Math.sin(a) * d, sx: 110 + r() * 120, sy: 26 + r() * 46, sz: 90 + r() * 90 }, col, parent); } }

// ================================================================ scenery dressing
export function dress(parent, n, s0, avoid, xr = 120, z0 = -80, z1 = 36) { let s = s0; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = ['#B9CB8A', '#C8C583', '#9DBE73', '#B2C77F'];
  for (let i = 0; i < 16; i++) { const w = 18 + r() * 26, d = 12 + r() * 18, x = (r() - 0.5) * 2 * xr, z = z0 + r() * (z1 - z0 + 30); const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), tm(cols[i % 4])); m.position.set(x, 0.02, z); m.rotation.y = (r() - 0.5) * 0.5; m.receiveShadow = true; parent.add(m); }
  const P = []; let guard = 0; while (P.length < n && guard++ < 4000) { const x = (r() - 0.5) * 2 * xr, z = z0 + r() * (z1 - z0); if (!avoid(x, z)) P.push([x, z, 0.8 + r() * 0.7]); }
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.5, 0), toon('#5E9A5A'), P.length), trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.28, 1.6, 6), toon('#7A5A3E'), P.length);
  P.forEach(([x, z, k], i) => { m4.compose(V(x, 2.7 * k, z), q4.setFromEuler(new THREE.Euler(0, i, 0)), V(k, k * 1.25, k)); crown.setMatrixAt(i, m4); m4.compose(V(x, 0.8 * k, z), q4.identity(), V(k, k, k)); trunk.setMatrixAt(i, m4); });
  crown.castShadow = trunk.castShadow = true; crown.frustumCulled = trunk.frustumCulled = false; outline(crown, 3); parent.add(crown, trunk); }
