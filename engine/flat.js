// Flat: a 2D motion-graphics engine. One large board, one camera that travels over it, and no cuts between scenes.
// A film is a single function of time, draw(T), with T in seconds from the start of the film. No three.js is loaded.
// See docs/api.md, "Flat films". films/alfabeti-line is the example.
export const W = 1920, H = 1080, out = document.getElementById('out'), ctx = out.getContext('2d');
export const INK = '#14151A', PAPER = '#FBFAF7', MUTE = '#8A8D96', HAIR = '#E3E2DD';
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, t0, d = 1) => clamp((t - t0) / d);                       // 0 to 1 over d seconds from t0
export const io = x => x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;        // slow, fast, slow: the camera and anything that travels
export const io3 = x => x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;        // the same, gentler
export const settle = x => 1 - (1 - x) ** 4;                                     // fast, then gentle: things arriving
export const over = x => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2;            // arrives with a small overshoot
export const ez = (t, t0, d = 0.6) => settle(prog(t, t0, d)), pop = (t, t0, d = 0.45) => t <= t0 ? 0 : over(prog(t, t0, d));
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };

export const loadJSON = async (rel, base) => (await fetch(new URL(rel, base))).json();

// ---------- time
// Absolute cue times. Q.<scene>[i] is the moment phrase i of that scene starts, counted from the start of the film.
export function timeline(order, cues) { const start = {}, Q = {}; let end = 0; for (const n of order) { start[n] = end; Q[n] = cues[n].q.map(q => q + end); end += cues[n].D; } return { Q, start, end }; }
// A value that moves between holds. keys: [[t, d, v], ...]: v is reached at time t after travelling for d seconds.
// when(keys, v) is the moment such a value first reaches v, for timing things to a line's arrival.
export const when = (keys, v) => { for (let t = 0; t < keys[keys.length - 1][0]; t += 0.02) if (slide(t, keys) >= v) return t; return keys[keys.length - 1][0]; };
export function slide(T, keys, e = io) { let v = keys[0][2]; for (let i = 1; i < keys.length; i++) { const [t, d, b] = keys[i]; if (T >= t - d) v = lerp(keys[i - 1][2], b, e(prog(T, t - d, d))); } return v; }

// ---------- camera
// keys: [{ t, d, x, y, z, lift }]. The camera reaches centre (x, y) at zoom z at time t, having travelled for d seconds. Between moves it holds.
// lift pulls the zoom back in the middle of a move, which makes a long move read as one gesture. Moves must not overlap.
export function camAt(T, keys) {
  let a = keys[0], b = keys[0], k = 1;
  for (let i = 1; i < keys.length; i++) { const s = keys[i]; if (T >= s.t - s.d) { a = keys[i - 1]; b = s; k = io(prog(T, s.t - s.d, s.d)); } }
  const z = Math.exp(lerp(Math.log(a.z || 1), Math.log(b.z || 1), k)) * (1 - (b.lift ?? 0.08) * Math.sin(Math.PI * k) ** 2);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z };
}
// The camera position that frames a rectangle of the board, with pad screen pixels to spare. Spread it into a key: { t, d, ...fit(x0, y0, x1, y1) }.
export const fit = (x0, y0, x1, y1, pad = 100) => { const z = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0)); return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z }; };
let CAM = { x: W / 2, y: H / 2, z: 1 };
export function world(c) { CAM = c; ctx.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z); }     // draw in board coordinates
export function screen() { ctx.setTransform(1, 0, 0, 1, 0, 0); }                                                   // draw in screen pixels
export const toScreen = (x, y, c = CAM) => [W / 2 + (x - c.x) * c.z, H / 2 + (y - c.y) * c.z];
export function clear(col = PAPER) { screen(); ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
// A faint dot grid fixed to the board. It gives the eye something to track while the camera travels.
export function dots(c, step = 120, col = HAIR, r = 2.5) {
  const x0 = Math.floor((c.x - W / 2 / c.z) / step) * step, x1 = c.x + W / 2 / c.z, y0 = Math.floor((c.y - H / 2 / c.z) / step) * step, y1 = c.y + H / 2 / c.z;
  ctx.fillStyle = col; ctx.beginPath(); for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); } ctx.fill();
}

// ---------- type
export function font(size, w = 700, fam = 'Inter', ls = -0.02) { ctx.font = `${w} ${size}px ${fam}, Inter, sans-serif`; ctx.letterSpacing = `${ls * size}px`; }
export const width = (s, size, w, fam, ls) => { font(size, w, fam, ls); return ctx.measureText(s).width; };
// Text that rises into place from behind its own baseline, one word after another (or by 'char' or 'line'), and leaves the same way at t1.
export function type(s, x, y, t, t0, o = {}) {
  const { size = 60, w = 700, col = INK, align = 'l', by = 'word', gap = 0.06, d = 0.55, t1, a = 1, fam = 'Inter', ls = -0.02, lh = 1.12 } = o;
  if (t <= t0 || a <= 0 || (t1 !== undefined && t >= t1 + 1.5)) return;
  ctx.save(); font(size, w, fam, ls); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; let n = 0;
  s.split('\n').forEach((line, li) => {
    const lw = ctx.measureText(line).width, x0 = align === 'c' ? x - lw / 2 : align === 'r' ? x - lw : x, yy = y + li * size * lh;
    const units = by === 'line' ? [line] : by === 'char' ? [...line] : line.match(/\S+\s*/g) || []; let at = 0;
    for (const u of units) {
      const uw = ctx.measureText(u).width; at += u.length; const ux = x0 + ctx.measureText(line.slice(0, at)).width - uw;      // measured this way, kerning against the text before it is kept
      const k = settle(prog(t, t0 + n * gap, d)), e = t1 === undefined ? 0 : io3(prog(t, t1 + n * gap * 0.4, 0.4)); n++;
      if (k <= 0 || e >= 1) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(ux - size * 0.15, yy - size * 1.02, uw + size * 0.3, size * 1.34); ctx.clip();
      ctx.globalAlpha = a * clamp(k * 2.5); ctx.fillText(u, ux, yy + size * 1.12 * (1 - k) - size * 1.4 * e); ctx.restore();
    }
  });
  ctx.restore();
}
// A number whose digits roll into place like a counter. It uses tabular figures, so nothing shifts sideways.
export function roll(s, x, y, t, t0, o = {}) {
  const { size = 200, w = 800, col = INK, align = 'l', d = 1.0, a = 1, t1, ls = -0.03 } = o; if (t <= t0 || a <= 0) return;
  const e = t1 === undefined ? 0 : io3(prog(t, t1, 0.4)); if (e >= 1) return;
  ctx.save(); font(size, w, 'InterNum', ls); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ch = [...s], ws = ch.map(c => ctx.measureText(c).width), tot = ws.reduce((p, c) => p + c, 0), h = size * 0.98; let cx = align === 'c' ? x - tot / 2 : align === 'r' ? x - tot : x;
  ch.forEach((c, i) => { const k = settle(prog(t, t0 + i * 0.07, d));
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(cx - size * 0.06, y - size * 0.84, ws[i] + size * 0.12, size * 0.98); ctx.clip(); ctx.globalAlpha = a * clamp(k * 4);
      if (c < '0' || c > '9') ctx.fillText(c, cx, y + h * (1 - k) - h * e);
      else { const p = +c + 20 - (1 - k) * (5 + 3 * (ch.length - i)), f = p - Math.floor(p), d0 = Math.floor(p) % 10;
        ctx.fillText(d0, cx, y - f * h - h * e); ctx.fillText((d0 + 1) % 10, cx, y + (1 - f) * h - h * e); }
      ctx.restore(); }
    cx += ws[i]; });
  ctx.restore();
}

// ---------- lines
// A path is a polyline sampled into points with running lengths. A point may carry a corner radius: [x, y, r].
export function path(pts) {
  const p = [];
  pts.forEach((c, i) => { const r = c[2] || 0, a = pts[i - 1], b = pts[i + 1]; if (!r || !a || !b) return p.push([c[0], c[1]]);
    const d1 = Math.hypot(c[0] - a[0], c[1] - a[1]), d2 = Math.hypot(b[0] - c[0], b[1] - c[1]), q = Math.min(r, d1 / 2, d2 / 2);
    const s = [c[0] + (a[0] - c[0]) * q / d1, c[1] + (a[1] - c[1]) * q / d1], e = [c[0] + (b[0] - c[0]) * q / d2, c[1] + (b[1] - c[1]) * q / d2];
    for (let j = 0; j <= 12; j++) { const u = j / 12; p.push([(1 - u) ** 2 * s[0] + 2 * u * (1 - u) * c[0] + u * u * e[0], (1 - u) ** 2 * s[1] + 2 * u * (1 - u) * c[1] + u * u * e[1]]); } });
  const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  return { p, L, len: L[L.length - 1] };
}
// Points of an S-shaped link that leaves (x0, y0) and arrives at (x1, y1) level, for use inside path().
export function ess(x0, y0, x1, y1, n = 36) { const xm = (x0 + x1) / 2, o = [];
  for (let j = 0; j <= n; j++) { const u = j / n, v = 1 - u; o.push([v ** 3 * x0 + 3 * v * v * u * xm + 3 * v * u * u * xm + u ** 3 * x1, v ** 3 * y0 + 3 * v * v * u * y0 + 3 * v * u * u * y1 + u ** 3 * y1]); } return o; }
export function at(P, s) { s = clamp(s, 0, P.len); let lo = 1, hi = P.L.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (P.L[m] < s) lo = m + 1; else hi = m; }
  const u = (s - P.L[lo - 1]) / Math.max(1e-6, P.L[lo] - P.L[lo - 1]), a = P.p[lo - 1], b = P.p[lo]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
// Distance along a path at which it first reaches board position x. For paths that run left to right.
export function along(P, x) { for (let i = 1; i < P.p.length; i++) if (P.p[i][0] >= x) { const a = P.p[i - 1], b = P.p[i]; return P.L[i - 1] + (P.L[i] - P.L[i - 1]) * clamp((x - a[0]) / Math.max(1e-6, b[0] - a[0])); } return P.len; }
// Stroke the part of a path between two distances along it. Animate s1 to draw the line on.
export function trace(P, s0, s1, o = {}) {
  const { col = INK, w = 10, a = 1, cap = 'round', dash } = o; s0 = clamp(s0, 0, P.len); s1 = clamp(s1, 0, P.len); if (s1 - s0 < 0.01 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...at(P, s0)); for (let i = 0; i < P.p.length; i++) if (P.L[i] > s0 && P.L[i] < s1) ctx.lineTo(P.p[i][0], P.p[i][1]); ctx.lineTo(...at(P, s1)); ctx.stroke(); ctx.restore();
}

// ---------- shapes
export function disc(x, y, r, col, a = 1) { if (r <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
export function ring(x, y, r, w, col, k = 1, a = 1, from = -Math.PI / 2) { if (r <= 0 || a <= 0 || k <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, from, from + Math.PI * 2 * clamp(k)); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
export function box(x, y, w, h, r, col, o = {}) { const a = o.a ?? 1; if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (o.line) { ctx.strokeStyle = col; ctx.lineWidth = o.line; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } ctx.restore(); }
export function rule(x0, y0, x1, y1, k, col = INK, w = 4, a = 1) { if (k <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); ctx.stroke(); ctx.restore(); }
// A stop on a line: a dot with a coloured rim that pops in and sends out one ripple.
export function stop(x, y, t, t0, col, r = 24, bg = PAPER) { const k = pop(t, t0); if (k <= 0) return; const u = prog(t, t0, 0.9); if (u < 1) ring(x, y, r + 80 * settle(u), 4, col, 1, 1 - u);
  disc(x, y, r * k, col); disc(x, y, (r - 10) * k, bg); }
// A colour that grows from a point on the screen until it covers the picture (k from 0 to 1), or shrinks back into it.
export function flood(sx, sy, k, col) { if (k <= 0) return; screen(); disc(sx, sy, k * k * (Math.hypot(Math.max(sx, W - sx), Math.max(sy, H - sy)) + 40), col); }

// ---------- player
// play(order, cues, draw, { cam, fonts }) registers the film with the render tools. cam(T) returns the camera for motion blur:
// while it moves, a frame is the average of several moments inside one sixtieth of a second, so travel looks smooth and not strobed.
// fonts: [{ family, url, weight, features }] are loaded before the first frame. InterNum (tabular figures) is always loaded.
export async function play(order, cues, draw, o = {}) {
  const { start } = timeline(order, cues), eng = new URL('./fonts/', import.meta.url).href;
  const faces = [...[['Bold', 700], ['ExtraBold', 800]].map(([n, w]) => ({ family: 'InterNum', url: `${eng}Inter-${n}.otf`, weight: w, features: '"tnum"' })), ...(o.fonts || [])];
  await Promise.all(faces.map(async f => document.fonts.add(await new FontFace(f.family, `url(${f.url})`, { weight: String(f.weight || 400), featureSettings: f.features || 'normal' }).load())));
  const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const actx = acc.getContext('2d'), sh = o.shutter ?? 1 / 60;
  const moved = T => { if (!o.cam) return 0; const a = o.cam(T - sh / 2), b = o.cam(T + sh / 2); return Math.hypot(b.x - a.x, b.y - a.y) * b.z + Math.abs(b.z / a.z - 1) * 1100; };
  window.frame = (i, t, raw = false) => { const T = start[order[i]] + t, px = raw ? 0 : moved(T), n = px < 1.5 ? 1 : clamp(Math.ceil(px / 2.5), 3, o.samples ?? 40);
    if (n === 1) draw(T); else { for (let j = 0; j < n; j++) { draw(T + ((j + 0.5) / n - 0.5) * sh); actx.globalAlpha = 1 / (j + 1); actx.drawImage(out, 0, 0); } screen(); ctx.globalAlpha = 1; ctx.drawImage(acc, 0, 0); }
    return raw ? 0 : out.toDataURL('image/jpeg', 0.93); };
  window.info = order.map(n => ({ n, D: cues[n].D })); window.motion = { motion: 'flat', transition: 'travel' }; window.ready = true;
}
