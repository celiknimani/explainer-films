// Product-demo parts: a laptop and a phone whose screens are 2D canvases you draw on every frame,
// plus a desk and a few props. Draw your interface with normal canvas calls, then call screen.update().
import * as C from '../core.js';
import { tm, at, box, cyl } from './kit.js';
const { THREE, M } = C;

export function screen(w, h, pxW, pxH) {       // w,h in world units; pxW,pxH canvas resolution
  const canvas = document.createElement('canvas'); canvas.width = pxW; canvas.height = pxH; const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  return { canvas, ctx, tex, mesh, w: pxW, h: pxH, update: () => { tex.needsUpdate = true; } };
}
export function laptop(o = {}) {
  const body = o.body || '#D9DCE2', g = new THREE.Group(), lid = new THREE.Group(), W0 = 3.4, D0 = 2.3;
  g.add(at(box(W0, 0.12, D0, body, { ol: 3 }), 0, 0.06, 0), at(box(W0 * 0.86, 0.02, D0 * 0.5, '#3A3D46', { ol: 0 }), 0, 0.125, -0.25), at(box(W0 * 0.3, 0.02, D0 * 0.22, '#C3C7CF', { ol: 0 }), 0, 0.125, 0.72));
  lid.position.set(0, 0.12, -D0 / 2); g.add(lid);
  lid.add(at(box(W0, D0, 0.08, body, { ol: 3 }), 0, D0 / 2, -0.04), at(box(W0 * 0.95, D0 * 0.92, 0.02, '#15171D', { ol: 0 }), 0, D0 / 2, 0.005));
  const scr = screen(W0 * 0.9, D0 * 0.86, 1440, 880); scr.mesh.position.set(0, D0 / 2, 0.02); lid.add(scr.mesh);
  const api = { g, lid, scr, open(a) { lid.rotation.x = Math.PI / 2 - a; },   // a = 0 closed, about 1.85 open
    // screen position of a canvas pixel, for callouts that point at the interface
    point(cx, cy) { g.updateMatrixWorld(true); return C.proj(lid.localToWorld(new THREE.Vector3((cx / scr.w - 0.5) * W0 * 0.9, D0 / 2 + (0.5 - cy / scr.h) * D0 * 0.86, 0.03))); } };
  api.open(1.85); return api;
}
export function phone(o = {}) {
  const g = new THREE.Group(); g.add(box(0.95, 1.9, 0.09, o.body || '#22252D', { ol: 3 }));
  const scr = screen(0.85, 1.74, 430, 880); scr.mesh.position.z = 0.05; g.add(scr.mesh); return { g, scr };
}
export function desk(w = 12, d = 6.5, col = '#E3C9A0') { const g = new THREE.Group(); g.add(at(box(w, 0.3, d, col, { ol: 4 }), 0, -0.15, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.3, 3, 0.3, '#B99A6B', { ol: 3 }), sx * (w / 2 - 0.5), -1.8, sz * (d / 2 - 0.5))); return g; }
export function mug(col = '#D9503F') { const g = new THREE.Group(); g.add(at(cyl(0.3, 0.26, 0.6, col, { ol: 3 }, 20), 0, 0.3, 0), at(cyl(0.25, 0.25, 0.02, '#4A2E1E', { ol: 0 }, 20), 0, 0.6, 0));
  const h = M(new THREE.TorusGeometry(0.17, 0.045, 8, 16), tm(col), { ol: 3 }); h.position.set(0.32, 0.3, 0); g.add(h); return g; }
export function plant() { const g = new THREE.Group(); g.add(at(cyl(0.34, 0.26, 0.5, '#F4F1EA', { ol: 3 }, 16), 0, 0.25, 0));
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, l = M(new THREE.ConeGeometry(0.16, 0.95, 5), tm(i % 2 ? '#5E9A5A' : '#74B06A'), { ol: 3 }); l.position.set(Math.cos(a) * 0.18, 0.92, Math.sin(a) * 0.18); l.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45); g.add(l); } return g; }
// rounded rectangle helper for screen drawing
export function rr(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
