// ACME Invoices: sales template (problem, product, features, proof, call to action).
// ACME is a placeholder brand. Edit brand.json and script.json, then change the interface drawn in drawUI().
import * as C from '../../engine/core.js';
import { ctx, INK, RED, GRN, plate, label, call, header, footer, card, badge } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, play, loadJSON, ground } from '../../engine/stage.js';
import { m4, q4, at, rnd } from '../../engine/parts/kit.js';
import { laptop, phone, desk, mug, plant, rr } from '../../engine/parts/devices.js';
const { THREE, V, scene, clamp, sstep, ease, pop, lerp, proj, camKeys, toon, outline } = C;
const CUES = await loadJSON('./cues.json', import.meta.url), B = await loadJSON('./brand.json', import.meta.url);
const ORDER = ['problem', 'product', 'features', 'proof', 'cta'];

// ---------------------------------------------------------------- set
const SET = new THREE.Group(); scene.add(SET); const FR = frameOf(SET);
SET.add(desk()); const lap = laptop(); SET.add(lap.g); const ph = phone(); SET.add(ph.g); ph.g.position.set(2.75, 1.0, 0.7); ph.g.rotation.set(-0.16, -0.38, 0);
SET.add(at(mug(B.color), 3.9, 0, -1.3), at(plant(), -4.4, 0, -1.6));
ground.position.y = -3.3;   // the floor under the desk
const N = 16, SH = [];
while (SH.length < N) { const x = (rnd() - 0.5) * 9.6, z = -2.2 + rnd() * 4.8; if (Math.abs(x) < 2.1 && z < 1.6) continue; SH.push({ x, z, r: (rnd() - 0.5) * 2.4, y: 0.02 + SH.length * 0.013, ph: rnd() * 6 }); }
const sheets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.012, 1.05), toon('#FFFFFF'), N); sheets.frustumCulled = false; sheets.castShadow = true; outline(sheets, 2.5); SET.add(sheets);
const e3 = new THREE.Euler();
function sheetsAt(t, fly) {   // fly: 0 = scattered on the desk, 1 = sucked into the laptop screen
  SH.forEach((s, i) => { const drop = clamp((t - 0.15 - i * 0.07) / 0.5), k = clamp((fly - i * 0.045) / 0.3), kk = k * k * (3 - 2 * k), fall = (1 - drop) * (1 - drop) * 7;
    const p = V(lerp(s.x, 0, kk), lerp(s.y + fall + 0.05 * Math.sin(t * 2 + s.ph) * (fly > 0 ? 1 : 0), 1.25, kk) + Math.sin(kk * Math.PI) * 1.4, lerp(s.z, -1.1, kk)), sc = kk >= 1 ? 0 : 1 - kk;
    m4.compose(p, q4.setFromEuler(e3.set(kk * 1.4, s.r + kk * 3, (1 - drop) * 0.8)), V(sc, sc, sc)); sheets.setMatrixAt(i, m4); }); sheets.instanceMatrix.needsUpdate = true; }

// ---------------------------------------------------------------- the product interface, drawn on the laptop screen
const ROWS = [['Client A', '1,240', 'Draft'], ['Client B', '860', 'Overdue'], ['Client C', '2,410', 'Sent'], ['Client D', '530', 'Draft']];
const CHIP = { Draft: ['#E7E7EE', '#55566A'], Sent: ['#DCE9FB', '#2D5FA8'], Overdue: ['#FBDCD7', '#B23A2B'], Paid: ['#D8F0DF', '#2C7A46'] };
const K = 1.44, UI = { send: [885 * K, 142 * K], toast: [606 * K, 52 * K], paid: [660 * K, 548 * K] };   // canvas pixels that callouts point at
const F = (c, w, s) => { c.font = `${w} ${s}px Inter, sans-serif`; };
function drawUI(s) {   // s: { on, sent, remind, paid, press }. Drawn in a 1000 x 611 design space.
  const c = lap.scr.ctx; c.save(); c.scale(K, K); c.fillStyle = '#F7F7FB'; c.fillRect(0, 0, 1000, 612);
  c.fillStyle = '#20214F'; c.fillRect(0, 0, 160, 612); rr(c, 20, 22, 46, 46, 11, B.color); c.fillStyle = '#FFFFFF'; F(c, 800, 30); c.textAlign = 'center'; c.fillText(B.name[0], 43, 56); c.textAlign = 'left';
  ['Invoices', 'Clients', 'Reports'].forEach((n, i) => { if (i === 0) rr(c, 10, 96, 140, 46, 10, 'rgba(255,255,255,0.16)'); c.fillStyle = i ? '#A9AAD0' : '#FFFFFF'; F(c, 600, 21); c.fillText(n, 24, 127 + i * 56); });
  c.fillStyle = '#1D1E2C'; F(c, 800, 44); c.fillText('Invoices', 186, 72);
  ROWS.forEach((r, i) => { const y = 100 + i * 98; let st = r[2]; if (st === 'Draft' && s.sent > i * 0.3) st = 'Sent'; if (s.paid > (i + 1) / 5) st = 'Paid';
    rr(c, 186, y, 790, 84, 14, '#FFFFFF', '#E3E4EE'); c.fillStyle = '#1D1E2C'; F(c, 600, 30); c.fillText(r[0], 212, y + 53); c.fillText('€ ' + r[1], 420, y + 53);
    rr(c, 610, y + 18, 156, 48, 24, CHIP[st][0]); c.fillStyle = CHIP[st][1]; F(c, 700, 24); c.textAlign = 'center'; c.fillText(st, 688, y + 51); c.textAlign = 'left';
    if (i === 0) { const pr = s.press; rr(c, 820 + 4 * pr, y + 16 + 3 * pr, 130 - 8 * pr, 52 - 6 * pr, 12, st === 'Draft' ? B.color : '#C9CAE0'); c.fillStyle = '#FFFFFF'; F(c, 700, 25); c.textAlign = 'center'; c.fillText(st === 'Draft' ? 'Send' : 'Sent', 885, y + 51); c.textAlign = 'left'; } });
  rr(c, 186, 500, 790, 92, 14, '#FFFFFF', '#E3E4EE'); c.fillStyle = '#1D1E2C'; F(c, 700, 27); c.fillText('Paid this month', 212, 555);
  rr(c, 460, 532, 400, 30, 15, '#E7E7EE'); if (s.paid > 0.01) rr(c, 460, 532, 400 * (0.2 + 0.7 * s.paid), 30, 15, '#3E9A5B'); F(c, 800, 30); c.fillText(Math.round(20 + 70 * s.paid) + '%', 880, 558);
  if (s.remind > 0) { const k = s.remind, x = 600 + 420 * (1 - k); rr(c, x, 12, 380, 80, 16, '#1D1E2C'); c.fillStyle = B.accent; c.beginPath(); c.arc(x + 42, 52, 18, 0, 7); c.fill(); c.fillStyle = '#FFFFFF'; F(c, 700, 25); c.fillText('Reminder sent', x + 74, 47); F(c, 500, 19); c.fillStyle = '#C9CAE0'; c.fillText('Client B, invoice 1042', x + 74, 74); }
  if (s.on < 1) { c.fillStyle = `rgba(21,23,29,${1 - s.on})`; c.fillRect(0, 0, 1000, 612); } c.restore(); lap.scr.update();
  const p = ph.scr.ctx; p.fillStyle = '#111320'; p.fillRect(0, 0, 430, 880); p.fillStyle = '#FFFFFF'; F(p, 700, 84); p.textAlign = 'center'; p.fillText('9:41', 215, 200); p.textAlign = 'left';
  const note = (y, k, t1, t2, col) => { if (k <= 0) return; const x = 18 + 60 * (1 - k); rr(p, x, y, 394, 170, 30, `rgba(255,255,255,${0.96 * k})`); p.fillStyle = col; p.beginPath(); p.arc(x + 56, y + 58, 30, 0, 7); p.fill(); p.fillStyle = '#1D1E2C'; F(p, 800, 32); p.fillText(t1, x + 102, y + 70); F(p, 500, 26); p.fillStyle = '#55566A'; p.fillText(t2, x + 26, y + 132); };
  note(300, s.remind, 'Reminder sent', 'Client B, invoice 1042', B.accent); note(492, clamp(s.paid * 3), 'Payment in', 'Client A paid € 1,240', '#3E9A5B'); ph.scr.update();
}
function lockup(x, y, k, size = 64) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = `800 ${size}px Inter, sans-serif`; const tw = ctx.measureText(B.name).width, w = tw + size * 1.5 + 90, h = size * 2.5;
  plate(-w / 2, -h / 2, w, h, 1, '#FFFFFF', 30); ctx.beginPath(); ctx.roundRect(-w / 2 + 34, -size * 0.6, size * 1.2, size * 1.2, size * 0.28); ctx.fillStyle = B.color; ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.font = `800 ${size * 0.8}px Inter, sans-serif`; ctx.fillText(B.name[0], -w / 2 + 34 + size * 0.6, size * 0.28);
  ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = `800 ${size}px Inter, sans-serif`; ctx.fillText(B.name, -w / 2 + 56 + size * 1.2, size * 0.1); ctx.font = `500 ${size * 0.4}px Inter, sans-serif`; ctx.fillStyle = '#55566A'; ctx.fillText(B.tagline, -w / 2 + 58 + size * 1.2, size * 0.68); ctx.restore(); }
function stage(t, gt, o) { env(ENV.studio); aim(FR.rel(0, 0, 0), 9); lap.open(o.open); sheetsAt(o.st ?? 99, o.fly); ph.g.scale.setScalar(Math.max(1e-4, o.phone)); drawUI(o.ui); camKeys(t, o.cam, FR); finish(); }
const OFF = { on: 0, sent: 0, remind: 0, paid: 0, press: 0 }, HOME = { p: [1.0, 6.2, 9.8], l: [0, 0.7, 0], f: 35 }, MID = { p: [0, 3.6, 7.6], l: [0, 1.3, -0.5], f: 35 };

// ---------------------------------------------------------------- scenes
function sProblem(t, D, q) {
  stage(t, 0, { open: 0.06, st: t, fly: 0, phone: 0, ui: OFF, cam: [{ t: 0, p: [-1.0, 6.8, 10.6], l: [0, 0.7, 0], f: 35 }, { t: D, ...HOME }] });
  const bx = [...SH].sort((a, b) => a.x - b.x), pick = s => proj(V(s.x, 0.1, s.z)), near = [...SH].sort((a, b) => b.z - Math.abs(b.x) * 0.3 - (a.z - Math.abs(a.x) * 0.3))[0];
  const tag = (s, sh, dx, dy, t0, o = {}) => { const P = pick(sh); call(s, P, P.x + dx, P.y + dy, t, t0, { align: 'c', ...o }); };
  tag('Email', bx[0], -60, -150, q[0] + 1.3); tag('Spreadsheets', bx[N - 2], 80, -170, q[0] + 2.1); tag('Paper', bx[4], -120, 130, q[0] + 2.9);
  tag('Paid late', bx[N - 1], 110, 120, q[1] + 0.3, { bg: RED, fg: '#FFFFFF' }); tag('Lost', near, 60, 130, q[1] + 1.7, { bg: RED, fg: '#FFFFFF' });
  header('The problem', 'Invoices scattered across tools', t);
}
function sProduct(t, D, q) {
  stage(t, 0, { open: lerp(0.06, 1.85, sstep((t - 0.2) / 1.1)), fly: clamp((t - 0.9) / 1.5) * 1.0, phone: 0, ui: { ...OFF, on: sstep((t - 2.2) / 0.7) }, cam: [{ t: 0, ...HOME }, { t: 2.6, ...MID }, { t: D, p: [0.3, 3.5, 7.3], l: [0, 1.3, -0.5], f: 35 }] });
  lockup(960, 210, pop(t, q[0] + 1.9, 0.45)); header('The product', null, t);
}
function sFeatures(t, D, q) {
  const press = clamp(1 - Math.abs(t - (q[0] + 1.25)) / 0.15), ui = { on: 1, sent: clamp((t - q[0] - 1.3) / 0.9), remind: ease(t, q[1] + 0.5, 0.45), paid: sstep((t - q[2] - 0.5) / 2.2), press };
  stage(t, 0, { open: 1.85, fly: 2, phone: pop(t, q[1] - 0.1, 0.45), ui, cam: [{ t: 0, ...MID }, { t: 1.1, p: [-1.5, 2.5, 5.0], l: [-0.55, 1.3, -0.9], f: 35 }, { t: q[1] - 0.3, p: [-1.4, 2.5, 5.0], l: [-0.55, 1.3, -0.9], f: 35 },
    { t: q[1] + 0.9, p: [0.3, 2.6, 5.9], l: [0.75, 1.25, -0.6], f: 35 }, { t: q[2] - 0.2, p: [0.4, 2.6, 5.9], l: [0.75, 1.25, -0.6], f: 35 }, { t: q[2] + 1.0, p: [-1.5, 2.5, 5.2], l: [-0.55, 1.2, -0.9], f: 35 }, { t: D, p: [-1.4, 2.6, 5.4], l: [-0.55, 1.2, -0.9], f: 35 }] });
  const L = (n, s, P, y, t0) => { badge(n, 110, y, t, t0); call(s, P, 180, y, t, t0 + 0.25, { align: 'l', dot: B.accent }); };
  L('1', 'Send in one click', lap.point(...UI.send), 330, q[0] + 0.5); L('2', 'Automatic reminders', lap.point(...UI.toast), 450, q[1] + 0.6); L('3', 'See who has paid', lap.point(...UI.paid), 570, q[2] + 0.6);
  header('How it works', null, t);
}
const FULL = { on: 1, sent: 1, remind: 1, paid: 1, press: 0 };
function sProof(t, D, q) {
  stage(t, 0, { open: 1.85, fly: 2, phone: 1, ui: FULL, cam: [{ t: 0, p: [-1.4, 2.6, 5.4], l: [-0.55, 1.2, -0.9], f: 35 }, { t: 1.4, p: [0, 2.9, 7.8], l: [0.5, 2.25, 0], f: 35 }, { t: D, p: [0.4, 3.0, 8.1], l: [0.5, 2.25, 0], f: 35 }] });
  card(620, 270, '6 hours*', 'saved every week', t, q[0] + 0.9, B.color); card(1300, 270, '11 days*', 'faster payment', t, q[0] + 2.0, GRN);
  footer('* Placeholder figures. Replace them with your own measured results.', t, q[0] + 1.2); header('The result', null, t);
}
function sCta(t, D, q) {
  stage(t, 0, { open: 1.85, fly: 2, phone: 1, ui: FULL, cam: [{ t: 0, p: [0.4, 3.0, 8.1], l: [0.5, 2.25, 0], f: 35 }, { t: D, p: [0.2, 3.0, 8.6], l: [0.4, 2.5, 0], f: 35 }] });
  lockup(960, 250, pop(t, q[0] + 0.2, 0.5), 84); label('Start free at ' + B.url, 960, 440, t, q[0] + 1.3, { align: 'c', size: 44, bg: B.accent });
}
play(ORDER, CUES, { problem: sProblem, product: sProduct, features: sFeatures, proof: sProof, cta: sCta }, { motion: 'snappy', transition: 'push', wipe: { c1: B.color, c2: B.accent } });
