// 2D overlay: text, pills, callouts, cards, bars and wipes drawn on the #out canvas on top of the 3D frame.
import { W, H, clamp, sstep, ease, pop, lerp } from './core.js';
export const out = document.getElementById('out'), ctx = out.getContext('2d');
export const INK = '#2B2A33', PAPER = '#F6EFE0', NAVY = '#27496D', RED = '#D9503F', YEL = '#FFC62E', GRN = '#3E9A5B', COAL = '#3A3941', BLUE = '#3F7FC4';
export const fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// =============================================================== 2D overlay helpers
export const font = (w, s) => { ctx.font = `${w} ${s}px Inter, sans-serif`; };
export function text(s, x, y, size, color = INK, w = 600, a = 1, align = 'left', halo = 0, haloCol = PAPER) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; font(w, size); ctx.textAlign = align;
  if (halo) { ctx.lineJoin = 'round'; ctx.lineWidth = halo; ctx.strokeStyle = haloCol; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
export function plate(x, y, w, h, a = 1, bg = PAPER, r = 20) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.roundRect(x + 6, y + 8, w, h, r); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
export function pill(s, x, y, o = {}) {
  const { a = 1, size = 34, align = 'l', bg = '#FFFFFF', fg = INK, scale = 1 } = o; if (a <= 0 || scale <= 0) return;
  const lines = s.split('\n'); font(600, size); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 44, h = lines.length * size * 1.28 + 26;
  const x0 = align === 'l' ? x : align === 'c' ? x - w / 2 : x - w;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x0 + w / 2, y); ctx.scale(scale, scale); ctx.translate(-w / 2, -h / 2);
  ctx.beginPath(); ctx.roundRect(5, 7, w, h, 18); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = fg; ctx.textAlign = 'left'; lines.forEach((l, i) => ctx.fillText(l, 22, 13 + size * 0.95 + i * size * 1.28)); ctx.restore();
}
export const label = (s, x, y, t, t0, o = {}) => { const k = pop(t, t0, 0.35); if (k > 0 && (o.t1 === undefined || t < o.t1)) pill(s, x, y, { ...o, scale: k }); };
export function call(s, P, lx, ly, t, t0, o = {}) {
  if (o.t1 !== undefined && t > o.t1) return; const a = ease(t, t0, 0.25); if (a <= 0 || !P.ok) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x + (lx - P.x) * a, P.y + (ly - P.y) * a); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
  const r = 11 * pop(t, t0, 0.3); ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, 7); ctx.fillStyle = o.dot || RED; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  const ring = clamp((t - t0) / 0.6); if (ring > 0 && ring < 1) { ctx.globalAlpha = 1 - ring; ctx.beginPath(); ctx.arc(P.x, P.y, 11 + 50 * ring, 0, 7); ctx.strokeStyle = o.dot || RED; ctx.lineWidth = 6; ctx.stroke(); }
  ctx.restore(); label(s, lx, ly, t, t0 + 0.12, o);
}
export function header(title, sub, t) {
  const a = ease(t, 0.3, 0.45); if (a <= 0) return; font(800, 52); const w = Math.max(ctx.measureText(title).width, sub ? (font(500, 27), ctx.measureText(sub).width) : 0) + 64, h = sub ? 128 : 92;
  ctx.save(); ctx.translate(-80 * (1 - a), 0); plate(46, 40, w, h, a);
  ctx.globalAlpha = a; font(800, 52); ctx.fillStyle = INK; ctx.fillText(title, 76, 100); if (sub) { font(500, 27); ctx.fillStyle = NAVY; ctx.fillText(sub, 78, 143); } ctx.restore();
}
export function footer(s, t, t0) { const a = ease(t, t0, 0.5); if (a <= 0) return; font(500, 24); const w = ctx.measureText(s).width + 36;
  ctx.save(); ctx.globalAlpha = a * 0.94; ctx.beginPath(); ctx.roundRect(46, 1012, w, 44, 12); ctx.fillStyle = PAPER; ctx.fill(); ctx.globalAlpha = a; ctx.fillStyle = '#5B5548'; ctx.fillText(s, 64, 1042); ctx.restore(); }
export function flash(a, c = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${c},${clamp(a)})`; ctx.fillRect(0, 0, W, H); } }
export function card(x, y, big, small, t, t0, col, size = 60) { const k = pop(t, t0, 0.4); if (k <= 0) return; const b = clamp((t - t0) / 0.35);
  ctx.save(); ctx.translate(x, y - 500 * (1 - b) * (1 - b)); ctx.rotate(-0.1 * (1 - b)); ctx.scale(k, k);
  ctx.beginPath(); ctx.roundRect(-240, -83, 500, 190, 26); ctx.fillStyle = 'rgba(30,28,39,0.28)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-250, -95, 500, 190, 26); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.textAlign = 'center'; font(800, size); ctx.fillStyle = col; ctx.fillText(big, 0, -8); font(500, 26); ctx.fillStyle = INK; small.split('\n').forEach((l, i) => ctx.fillText(l, 0, 38 + i * 32)); ctx.restore(); }
export function band(x0, x1, c) { ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x1, -10); ctx.lineTo(x1 - 300, H + 10); ctx.lineTo(x0 - 300, H + 10); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
export function wipe(t, D, first, last, o = {}) { const d = 0.4, X0 = -200, X1 = W + 700, NAVY = o.c1 || '#27496D', YEL = o.c2 || '#FFC62E';
  if (!first && t < d) { const e = lerp(X0, X1, sstep(t / d)); band(e, X1 + 400, NAVY); band(e - 80, e, YEL); band(e - 110, e - 80, INK); }
  if (!last && t > D - d) { const e = lerp(X0, X1, sstep((t - (D - d)) / d)); band(X0 - 400, e, NAVY); band(e, e + 80, YEL); band(e + 80, e + 110, INK); }
  if (last && t > D - 0.8) flash(clamp((t - (D - 0.8)) / 0.7), '246,239,224');
  if (first && t < 0.6) flash(1 - t / 0.6, o.open || '246,239,224'); }
export function hbar(x, y, w, h, frac, col, a = 1, bg = '#E4DCCB') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (frac > 0.001) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(x, y, w * clamp(frac), h); ctx.restore(); }
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
export function leader(x0, y0, P, a) { if (a <= 0 || !P.ok) return; ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; for (const [c, w] of [[INK, 7], ['#FFFFFF', 3]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(P.x, P.y); ctx.stroke(); } ctx.restore(); }
export function badge(n, x, y, t, t0) { const k = pop(t, t0, 0.4); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(4, 6, 44, 0, 7); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = YEL; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke(); font(800, 56); ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(n, 0, 20); ctx.restore(); }

