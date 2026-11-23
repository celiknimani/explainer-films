// Sets for the alphabet film: 36 letter blocks, books and scrolls, script signs, the congress house and its delegates.
import * as C from '../../engine/core.js';
import { tm, at, box, cyl, prism } from '../../engine/parts/kit.js';
import { slab, grid } from '../../engine/parts/iso.js';
import { phone } from '../../engine/parts/devices.js';
const { THREE, scene, M, toon } = C;
export const CREAM = '#F3EAD6', PAGE = '#FBF6E6', INKC = '#2B2A33';

// ---------------------------------------------------------------- text on models
// A flat panel with something drawn on it. draw(ctx, w, h) paints a transparent canvas of w by h pixels.
export function panel(w, h, draw, res = 110) { const cv = document.createElement('canvas'); cv.width = Math.round(w * res); cv.height = Math.round(h * res); draw(cv.getContext('2d'), cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); }
const words = (txt, col = INKC, k = 0.6, font = 'Inter, "DejaVu Sans", sans-serif') => (c, w, h) => { c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; const lines = txt.split('\n');
  let size = h * k / lines.length; c.font = `800 ${size}px ${font}`; const mw = Math.max(...lines.map(l => c.measureText(l).width)); if (mw > w * 0.9) { size *= w * 0.9 / mw; c.font = `800 ${size}px ${font}`; }
  lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15)); };
const face = (m, where, s, y0 = 0) => { if (where === 'top') { m.rotation.x = -Math.PI / 2; m.position.set(0, y0 + s[1] + 0.012, 0); } else if (where === 'z') m.position.set(0, y0 + s[1] / 2, s[2] / 2 + 0.012); else { m.rotation.y = Math.PI / 2; m.position.set(s[0] / 2 + 0.012, y0 + s[1] / 2, 0); } return m; };

// ---------------------------------------------------------------- models
// A toy letter block. The letter shows on the three faces the isometric camera sees. Returns { g, mat } so the film can tint and lift it.
export function block(ch, s = 1.5) { const g = new THREE.Group(), mat = toon(CREAM); g.add(at(M(new THREE.BoxGeometry(s, s, s), mat, { ol: 3 }), 0, s / 2, 0));
  const draw = words(ch, INKC, ch.length > 1 ? 0.56 : 0.72); for (const w of ['top', 'z', 'x']) g.add(face(panel(s * 0.9, s * 0.9, draw), w, [s, s, s])); return { g, mat }; }
export function plinth(col, s = 3.4, h = 0.5) { return slab(s, s, h, col); }
export function closedBook(w, d, h, col) { const g = new THREE.Group(); g.add(at(slab(w - 0.2, d - 0.16, h - 0.16, PAGE, { ol: 2 }), 0.06, 0.08, 0), slab(w, d, 0.08, col), at(slab(w, d, 0.08, col), 0, h - 0.08, 0), at(box(0.14, h, d, col), -w / 2 + 0.07, h / 2, 0)); return g; }
// An open book. left and right are drawn on the two pages.
export function openBook(w, d, col, left, right) { const g = new THREE.Group(); g.add(slab(w + 0.3, d + 0.2, 0.1, col));
  for (const [sx, draw] of [[-1, left], [1, right]]) { const pg = new THREE.Group(); pg.add(slab(w / 2, d, 0.26, PAGE, { ol: 2.5 })); if (draw) pg.add(face(panel(w / 2 * 0.9, d * 0.9, draw), 'top', [0, 0.26, 0])); pg.position.set(sx * w / 4, 0.1, 0); pg.rotation.z = -sx * 0.07; g.add(pg); }
  return g; }
export function scroll() { const g = new THREE.Group(); g.add(at(slab(2.2, 3.0, 0.08, '#EBD9A8', { ol: 2.5 }), 0, 0.1, 0));
  for (const z of [-1.5, 1.5]) { const r = cyl(0.2, 0.2, 2.5, '#D9C389', { ol: 2.5 }, 14); r.rotation.z = Math.PI / 2; g.add(at(r, 0, 0.2, z)); }
  for (let i = 0; i < 5; i++) g.add(at(box(i === 4 ? 1.0 : 1.6, 0.02, 0.09, '#7A6A4A', { ol: 0 }), i === 4 ? -0.3 : 0, 0.2, -0.9 + i * 0.42)); return g; }
export function peg(col) { const g = new THREE.Group(), mat = toon(col); g.add(at(M(new THREE.CylinderGeometry(0.2, 0.3, 0.8, 12), mat, { ol: 2.5 }), 0, 0.4, 0), at(M(new THREE.SphereGeometry(0.25, 14, 10), tm('#F3D7B8'), { ol: 2.5 }), 0, 1.02, 0)); return { g, mat }; }
export function house() { const g = new THREE.Group(), W = 8, D = 5, H = 3.8; g.add(slab(W, D, H, CREAM), at(prism(W + 0.6, 1.5, D + 0.6, '#C4573F'), 0, H, 0), at(box(0.9, 1.5, 0.06, '#7A5236', { ol: 0 }), 0, 0.75, D / 2 + 0.03));
  for (const y of [1.3, 2.8]) { for (const x of [-3, -1.5, 1.5, 3]) g.add(at(box(0.7, 0.9, 0.06, '#5B86B5', { ol: 0 }), x, y, D / 2 + 0.03)); for (const z of [-1.4, 0, 1.4]) g.add(at(box(0.06, 0.9, 0.7, '#4A719C', { ol: 0 }), W / 2 + 0.03, y, z)); }
  return g; }
// A standing sign with words on the two faces the camera sees.
export function tablet(txt, col, w = 3.2, h = 2.2, font) { const g = new THREE.Group(), d = 0.3; g.add(slab(w + 0.4, 0.9, 0.2, '#B9B2A2'), at(slab(w, d, h, col), 0, 0.2, 0));
  g.add(face(panel(w * 0.92, h * 0.9, words(txt, INKC, 0.62, font)), 'z', [w, h, d], 0.2)); return g; }
// A sign showing drawn shapes: stands in for the invented scripts, whose letters our fonts cannot draw.
export function shapesTablet(col) { const g = tablet('', col); g.add(face(panel(2.9, 2.0, (c, w, h) => { c.strokeStyle = INKC; c.lineWidth = h * 0.07; c.lineCap = c.lineJoin = 'round'; const y = h / 2, r = h * 0.2;
    c.beginPath(); c.arc(w * 0.2, y, r, 0, 7); c.moveTo(w * 0.2, y - r); c.lineTo(w * 0.2, y + r * 1.5); c.stroke(); c.beginPath(); c.moveTo(w * 0.38, y - r); c.lineTo(w * 0.46, y + r); c.lineTo(w * 0.54, y - r); c.lineTo(w * 0.62, y + r); c.stroke();
    c.beginPath(); c.moveTo(w * 0.74, y + r); c.bezierCurveTo(w * 0.74, y - r * 2, w * 0.92, y - r * 2, w * 0.86, y); c.bezierCurveTo(w * 0.82, y + r * 0.9, w * 0.94, y + r, w * 0.94, y + r); c.stroke(); }), 'z', [3.2, 2.2, 0.3], 0.2)); return g; }

// ---------------------------------------------------------------- sets, far apart so only one is in view
const mk = x => { const g = new THREE.Group(); g.position.x = x; g.visible = false; scene.add(g); g.add(grid(18, 2)); return g; };
export const GRID = mk(0), EARLY = mk(150), SCRIPTS = mk(300), PRIMER = mk(450), CONG = mk(600), TODAY = mk(750), SETS = [GRID, EARLY, SCRIPTS, PRIMER, CONG, TODAY];

// The alphabet: 36 blocks, six to a row.
export const LETTERS = 'A B C Ç D Dh E Ë F G Gj H I J K L Ll M N Nj O P Q R Rr S Sh T Th U V X Xh Y Z Zh'.split(' ');
export const VOWELS = new Set(['A', 'E', 'Ë', 'I', 'O', 'U', 'Y']), PAIRS = new Set(LETTERS.filter(l => l.length === 2)), MARKED = new Set(['Ç', 'Ë']);
export const blocks = LETTERS.map((ch, i) => { const b = block(ch); b.ch = ch; b.x = (i % 6 - 2.5) * 1.9; b.z = (Math.floor(i / 6) - 2.5) * 1.9; b.g.position.set(b.x, 0, b.z); GRID.add(b.g); return b; });
const AB = (c, w, h) => { words('A a', '#D9503F', 0.5)(c, w, h * 0.55); c.fillStyle = '#5BA7D9'; c.beginPath(); c.arc(w / 2, h * 0.72, h * 0.13, 0, 7); c.fill(); };
const LINES = (c, w, h) => { c.fillStyle = '#B9B2A2'; for (let i = 0; i < 6; i++) c.fillRect(w * 0.12, h * (0.14 + i * 0.13), w * (i === 5 ? 0.45 : 0.76), h * 0.045); };
export const abetare = openBook(4.2, 3.0, '#3E9A5B', AB, LINES); abetare.scale.setScalar(1.25); GRID.add(abetare);

// Early writing: three speakers, a scroll and the first printed book.
export const speakers = [[-4.1, -1.0], [-3.1, -3.1], [-1.0, -4.1]].map(([x, z], i) => { const p = peg(['#3F6FA8', '#D9503F', '#3E9A5B'][i]); p.g.scale.setScalar(1.6); p.x = x; p.z = z; EARLY.add(p.g); const b = at(slab(1.5, 0.3, 0.9, '#FFFFFF', { ol: 2.5 }), x + 0.6, 2.6, z); p.bubble = b; EARLY.add(b); return p; });
export const earlyA = new THREE.Group(), earlyB = new THREE.Group(); earlyA.add(plinth('#E2D5B8'), at(scroll(), 0, 0.5, 0)); earlyB.add(plinth('#E2D5B8'), at(closedBook(2.3, 3.0, 0.9, '#8A3B2E'), 0, 0.5, 0)); earlyA.scale.setScalar(1.25); earlyB.scale.setScalar(1.25); EARLY.add(earlyA, earlyB);

// Four ways of writing one language.
const AR = '"Noto Naskh Arabic", "DejaVu Sans", FreeSerif, serif';
export const scriptTiles = [['a b c', '#5BA7D9'], ['α β γ', '#F4BE42'], ['ا ب ج', '#3E9A5B', AR], [null, '#C2578A']].map(([txt, col, font]) => { const g = new THREE.Group(); g.add(plinth(col, 3.0), at(txt ? tablet(txt, PAGE, 2.6, 1.9, font) : shapesTablet(PAGE), 0, 0.5, 0)); SCRIPTS.add(g); return g; });

// The first primer, the ones that followed, and six alphabets.
export const evetar = new THREE.Group(); evetar.add(plinth('#E2D5B8'), at(openBook(2.6, 2.0, '#7A5236', LINES, LINES), 0, 0.5, 0)); PRIMER.add(evetar);
export const primers = ['#3F6FA8', '#D9503F', '#3E9A5B'].map(col => { const g = closedBook(1.7, 2.3, 0.5, col); PRIMER.add(g); return g; });
export const sixTabs = [1, 2, 3, 4, 5, 6].map(n => { const g = tablet(String(n), ['#5BA7D9', '#F4BE42', '#3E9A5B', '#C2578A', '#E88F5A', '#9AA7B5'][n - 1], 1.3, 1.5); PRIMER.add(g); return g; });

// The congress: the house, fifty delegates and the two alphabets on the table.
export const theHouse = house(); CONG.add(theHouse);
export const delegates = [...Array(50)].map((_, i) => { const p = peg('#3F6FA8'); p.x = 2.3 + (i % 10 - 4.5); p.z = 2.3 + (Math.floor(i / 10) - 2); p.g.position.set(p.x, 0, p.z); CONG.add(p.g); return p; });
export const tabIstanbul = tablet('Istanbul', '#E2D5B8', 3.4), tabLatin = tablet('Latin', '#F4BE42', 3.4); CONG.add(tabIstanbul, tabLatin);

// Since then: one spelling, one shared primer, and a place in Unicode.
export const todayA = new THREE.Group(), todayB = new THREE.Group(), todayC = new THREE.Group();
todayA.add(plinth('#E2D5B8'), at(closedBook(2.3, 3.0, 1.0, '#D9503F'), 0, 0.5, 0)); todayB.add(plinth('#E2D5B8'), at(openBook(2.8, 2.1, '#3E9A5B', AB, LINES), 0, 0.5, 0));
export const ph = phone(); ph.g.scale.setScalar(1.5); ph.g.rotation.order = 'YXZ'; ph.g.rotation.set(-0.3, Math.PI / 4, 0); ph.g.position.set(0, 1.9, 0); todayC.add(plinth('#E2D5B8'), ph.g); for (const g of [todayA, todayB, todayC]) g.scale.setScalar(1.2); TODAY.add(todayA, todayB, todayC);
{ const c = ph.scr.ctx; c.fillStyle = '#F7F4EC'; c.fillRect(0, 0, 430, 880); c.fillStyle = '#27496D'; c.fillRect(0, 0, 430, 150); c.fillStyle = '#FFFFFF'; c.font = '800 54px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('Shqip', 215, 98);
  c.fillStyle = INKC; c.font = '800 150px Inter, sans-serif'; ['Ë ë', 'Ç ç', 'Gj', 'Xh'].forEach((s, i) => c.fillText(s, 215, 310 + i * 170)); ph.scr.update(); }
