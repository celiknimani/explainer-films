// Where Kosovo keeps its money: the financial system in 2025, from the central bank's annual reports. Figures: see SOURCES.md.
import * as C from '../../engine/core.js';
import * as S from './sets.js';
import { ctx, INK, PAPER, NAVY, RED, YEL, GRN, BLUE, font, text, plate, label, call, header, footer, card, hbar } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, play, loadJSON } from '../../engine/stage.js';
import { rr } from '../../engine/parts/devices.js';
const { V, clamp, sstep, ease, lerp, proj, camKeys } = C;
const CUES = await loadJSON('./cues.json', import.meta.url);
const ORDER = ['title', 'size', 'growth', 'banks', 'rates', 'health', 'pensions', 'others', 'payments', 'outro'];
const FR = Object.fromEntries(['SECT', 'GROW', 'BANK', 'PENS', 'OTH', 'PAY'].map(n => [n, frameOf(S[n])]));
const DAY = ENV.studio, EVE = { ...ENV.studio, top: '#E9A77C', mid: '#F6D2AE', hor: '#FBEBD2', ground: '#F1E0C2', si: 2.2 };
const GREY = '#5B5548', PLUM = '#C2578A';
const show = set => { for (const s of S.SETS) s.visible = s === set; };
const P = (set, x, y, z) => proj(V(set.position.x + x, y, set.position.z + z));
const fract = x => x - Math.floor(x);

// ---------------------------------------------------------------- figures (all in SOURCES.md)
const SEC = [{ n: 'Banks', v: '9.71', pct: 66.5, coins: 56 }, { n: 'Pension funds', v: '3.77', pct: 25.8, coins: 22 }, { n: 'Microfinance, non-bank', v: '0.75', pct: 5.1, coins: 4 }, { n: 'Insurers', v: '0.36', pct: 2.4, coins: 2 }];
const YEARS = [[2021, '8.93', 31], [2022, '9.89', 35], [2023, '11.1', 39], [2024, '12.75', 45], [2025, '14.60', 51]];
const RL = [5.8, 6.3, 6.3, 5.9, 6.8], RD = [1.3, 2.4, 3.1, 3.4, 3.5];

// ---------------------------------------------------------------- shared staging
// The four sector stacks. g[i] deals out stack i (0 to 1); ik[i] is the scale of its icon. Returns the top of each stack.
function sectors(g, ik) { let i0 = 0; const tops = SEC.map((s, i) => { const top = S.stack(S.sectCoins, i0, s.coins, S.SX[i], 0, g[i], 0.12); i0 += s.coins;
    S.ICONS[i].position.set(S.SX[i], top, 0); S.ICONS[i].scale.setScalar(Math.max(1e-4, ik[i])); return top; }); S.sectCoins.done(); return tops; }
const ONE = [1, 1, 1, 1];
// Coins flying along arcs in the bank street: deposits (houses to bank) and loans (bank to businesses). dep and loan are 0 to 1.
const DEP = [[[-15.5, 2, 1.5], [-2, 3, 3]], [[-11.5, 1.6, 6], [-1.5, 3, 3]]], LOAN = [[[2, 3, 3], [13, 2.4, 5]], [[1.5, 3, 3], [17.5, 4, -1.5]]];
function flows(gt, dep, loan) { const n = S.flyCoins.n / 2;
  for (let i = 0; i < n * 2; i++) { const lo = i >= n, j = lo ? i - n : i, on = (j + 0.5) / n <= (lo ? loan : dep), [a, b] = (lo ? LOAN : DEP)[j % 2], u = fract(gt * 0.33 + j / n + (lo ? 0.5 : 0)), s = Math.sin(Math.PI * u);
    S.flyCoins.put(i, lerp(a[0], b[0], u), lerp(a[1], b[1], u) + s * 4.5, lerp(a[2], b[2], u), on ? Math.min(1, s * 3) : 0, Math.PI / 2, gt * 3 + j); }
  S.flyCoins.done(); }
function bankStreet(gt, dep, loan, shield = 0) { show(S.BANK); env(DAY); aim(FR.BANK.rel(0, 0, 0), 34); flows(gt, dep, loan); S.bigShield.visible = shield > 0; S.bigShield.scale.setScalar(1.7 * Math.max(1e-3, shield)); }
// A white panel with a heading, one large figure, a bar and a caption.
function gauge(x, y, title, big, cap, frac, col, t, t0, mark) { const a = ease(t, t0, 0.45); if (a <= 0) return; const yy = y + 30 * (1 - a);
  plate(x, yy, 520, 232, a, '#FFFFFF'); text(title, x + 30, yy + 48, 27, NAVY, 700, a); text(big, x + 30, yy + 124, 68, col, 800, a);
  if (frac !== null) { hbar(x + 30, yy + 146, 460, 24, frac * ease(t, t0 + 0.25, 1.0), col, a); if (mark) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.fillRect(x + 30 + 460 * mark - 2, yy + 138, 4, 40); ctx.restore(); } }
  text(cap, x + 30, yy + 208, 22, GREY, 500, a); }

// ---------------------------------------------------------------- scenes
function sTitle(t, D, q, gt) {
  show(S.SECT); env(DAY); aim(FR.SECT.rel(0, 0, 0), 36); const g = SEC.map((s, i) => clamp((t - 0.3 - i * 0.55) / (0.9 + s.coins * 0.035)));
  sectors(g, SEC.map((s, i) => ease(t, 0.3 + i * 0.55 + 0.9 + s.coins * 0.035, 0.4)));
  camKeys(t, [{ t: 0, p: [-9, 6, 41], l: [0, 3.4, 0], f: 36 }, { t: D, p: [5, 7.5, 47], l: [0, 3.4, 0], f: 36 }], FR.SECT); finish();
  const a = ease(t, q[0] - 0.1, 0.6); plate(150, 752 + 40 * (1 - a), 1620, 150 + 76 * ease(t, q[1] - 0.3, 0.5), a);
  text('Where does Kosovo keep its money?', 960, 852 + 40 * (1 - a), 84, INK, 800, a, 'center');
  text('The financial system in 2025, from the central bank\'s annual reports', 960, 926, 36, NAVY, 600, ease(t, q[1], 0.6), 'center');
}

function sSize(t, D, q, gt) {
  show(S.SECT); env(DAY); aim(FR.SECT.rel(0, 0, 0), 36); const tops = sectors(ONE, ONE);
  camKeys(t, [{ t: 0, p: [0, 9.5, 47], l: [0, 6.6, 0], f: 36 }, { t: q[2] - 0.4, p: [0, 10.5, 45], l: [0, 6.6, 0], f: 36 }], FR.SECT); finish();   // the camera settles before the tags pinned to the stacks appear
  card(1420, 300, '€14.6 billion', 'total assets of the financial system', t, q[0] + 3.7, NAVY, 64); card(1420, 512, '132%', 'of a year\'s economic output (GDP)', t, q[1] + 0.8, RED, 64);
  [q[2] + 0.1, q[3] + 0.1, q[4] + 0.1, q[4] + 1.0].forEach((t0, i) => { const a = ease(t, t0, 0.45), s = SEC[i]; if (a <= 0) return; const B = P(S.SECT, S.SX[i], 0, 2.6), x = B.x, y = B.y + 34 + 30 * (1 - a);
    plate(x - 152, y, 304, 168, a, '#FFFFFF'); text(s.n, x, y + 38, 23, NAVY, 700, a, 'center'); text(`€${s.v} bn`, x, y + 90, 46, INK, 800, a, 'center');
    hbar(x - 128, y + 114, 150, 22, s.pct / 100 * ease(t, t0 + 0.2, 0.9), S.SCOL[i], a); text(`${s.pct}%`, x + 128, y + 134, 26, INK, 800, a, 'right'); });
  header('A €14.6 billion system', 'Assets by sector, December 2025', t);
}

function sGrowth(t, D, q, gt) {
  show(S.GROW); env(DAY); aim(FR.GROW.rel(0, 0, 0), 32); let i0 = 0;
  const T0 = [q[1], q[1] + 1.5, q[1] + 2.2, q[1] + 2.9, q[2] + 0.3], tops = YEARS.map(([y, v, n], i) => { const top = S.stack(S.growCoins, i0, n, S.GX[i], 0, (t - T0[i]) / 1.1, 0.12); i0 += n; return top; }); S.growCoins.done();
  camKeys(t, [{ t: 0, p: [-3, 8, 39], l: [0, 5.2, 0], f: 36 }, { t: q[1] - 0.3, p: [0, 8.4, 37.5], l: [0, 5.2, 0], f: 36 }], FR.GROW); finish();   // then holds: every label here is pinned to a stack
  YEARS.forEach(([y, v, n], i) => { const B = P(S.GROW, S.GX[i], 0, 2.4), Tp = P(S.GROW, S.GX[i], 0.12 + n * 0.2 + 0.2, 0), a = ease(t, q[1] - 0.3 + i * 0.1, 0.4);
    text(String(y), B.x, B.y + 62, 38, i === 4 ? RED : INK, 800, a, 'center', 8); label(`€${v} bn`, Tp.x, Tp.y - 46, t, T0[i] + 1.15, { align: 'c', size: 32, bg: i === 4 ? '#FFE9A6' : '#FFFFFF' }); });
  const k = sstep((t - q[2] - 1.3) / 0.9); if (k > 0) { const A = P(S.GROW, S.GX[0], 0.12 + 31 * 0.2 + 2.6, 0), B = P(S.GROW, S.GX[4], 0.12 + 51 * 0.2 + 2.6, 0), ex = lerp(A.x, B.x - 120, k), ey = lerp(A.y, B.y + 10, k), ang = Math.atan2(B.y + 10 - A.y, B.x - 120 - A.x);
    ctx.save(); ctx.lineCap = 'round'; for (const [c, w] of [[INK, 14], [RED, 8]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(ex, ey); ctx.stroke(); }
    ctx.translate(ex, ey); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-10, -22); ctx.lineTo(-10, 22); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    label('+63% in four years', (A.x + B.x) / 2 - 60, (A.y + B.y) / 2 - 78, t, q[2] + 1.9, { align: 'c', size: 38, bg: RED, fg: '#FFFFFF' }); }
  label('2025 alone: +14.8%', 960, 986, t, q[3] + 1.2, { align: 'c', size: 40, bg: '#FFE9A6' });
  header('Growing fast', 'Total assets of the financial system, end of each year', t);
}

// Ten small bank marks: seven in foreign groups, three domestic. hot = how strongly the three largest are picked out.
function bankRow(t, q) { const a = ease(t, q[0] + 1.5, 0.5); if (a <= 0) return; const X = 1196, Y = 196 + 30 * (1 - a), hot = ease(t, q[4] + 0.3, 0.5); plate(X, Y, 664, 222, a, '#FFFFFF');
  for (let i = 0; i < 10; i++) { const k = ease(t, q[0] + 1.7 + i * 0.07, 0.3); if (k <= 0) continue; const x = X + 62 + i * 60, y = Y + 86, big = i < 3 ? hot : 0, s = 1 + 0.22 * big, col = i < 7 ? NAVY : YEL;
    ctx.save(); ctx.globalAlpha = a * k * (i < 3 ? 1 : 1 - 0.55 * hot); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-22, -12); ctx.lineTo(0, -34); ctx.lineTo(22, -12); ctx.closePath(); ctx.fill(); ctx.stroke(); for (const dx of [-15, -3, 9]) { ctx.beginPath(); ctx.rect(dx, -8, 6, 24); ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.rect(-23, 18, 46, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  text('10 banks: 7 in foreign groups, 3 domestic', X + 30, Y + 158, 28, INK, 700, a * (1 - hot)); text('The 3 largest hold 53.7% of banking assets', X + 30, Y + 158, 28, RED, 800, a * hot);
  text('82.7% of banking assets are foreign-owned', X + 30, Y + 196, 22, GREY, 500, a); }
function sBanks(t, D, q, gt) {
  bankStreet(gt, ease(t, q[1] - 0.2, 1.2), ease(t, q[2] - 0.2, 1.2));
  camKeys(t, [{ t: 0, p: [0, 9, 38], l: [0, 5.6, 0], f: 36 }, { t: D, p: [0, 10, 35], l: [0, 5.4, 0], f: 36 }], FR.BANK); finish();
  bankRow(t, q);
  label('Deposits: €7.82 billion', 70, 440, t, q[1] + 1.4, { align: 'l', size: 38 }); label('up 13.0% in 2025', 70, 522, t, q[1] + 2.2, { align: 'l', size: 28, bg: PAPER });
  label('Loans: €6.67 billion', 1850, 500, t, q[2] + 1.0, { align: 'r', size: 38 }); label('up 14.7% in 2025', 1850, 582, t, q[2] + 1.8, { align: 'r', size: 28, bg: PAPER });
  const a = ease(t, q[3] + 0.2, 0.5); if (a > 0) { const X = 330, Y = 838 + 40 * (1 - a), Wb = 1200, kb = ease(t, q[3] + 0.5, 1.0), kh = ease(t, q[3] + 3.0, 1.0); plate(X, Y, 1260, 204, a, '#FFFFFF');
    text('Who borrows', X + 30, Y + 44, 26, NAVY, 700, a); ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(X + 30, Y + 62, Wb, 46, 23); ctx.fillStyle = '#E4DCCB'; ctx.fill(); ctx.save(); ctx.clip();
    ctx.fillStyle = NAVY; ctx.fillRect(X + 30, Y + 62, Wb * 0.569 * kb, 46); ctx.fillStyle = PLUM; ctx.fillRect(X + 30 + Wb * (1 - 0.419 * kh), Y + 62, Wb * 0.419 * kh, 46); ctx.restore(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    text('Businesses 56.9%', X + 30, Y + 150, 30, NAVY, 800, a * kb); text('Households 41.9%', X + 30 + Wb, Y + 150, 30, PLUM, 800, a * kh, 'right'); text('up from 36.3% five years earlier', X + 30 + Wb, Y + 182, 22, GREY, 500, a * ease(t, q[3] + 4.2, 0.5), 'right'); }
  header('Ten banks at the centre', 'Deposits come in, loans go out (December 2025)', t);
}

function sRates(t, D, q, gt) {
  bankStreet(gt, 1, 1);
  camKeys(t, [{ t: 0, p: [10, 7.5, 31], l: [10, 5.2, 0], f: 36 }, { t: D, p: [10.5, 8, 29], l: [10.5, 5.2, 0], f: 36 }], FR.BANK); finish();
  const a = ease(t, q[1] - 1.0, 0.5); if (a > 0) { const X = 1010 + 50 * (1 - a), Y = 200, Wd = 850, Hh = 700, x0 = X + 90, x1 = X + Wd - 150, y0 = Y + Hh - 96, y1 = Y + 130, xx = i => lerp(x0, x1, i / 4), yy = v => lerp(y0, y1, v / 8);
    const kl = clamp((t - q[1] - 0.3) / 2.6), kd = clamp((t - q[2] - 0.1) / 2.0), kg = ease(t, q[3] + 0.2, 0.7); plate(X, Y, Wd, Hh, a, '#FFFFFF'); text('Interest rates at banks', X + 36, Y + 62, 32, NAVY, 700, a);
    ctx.save(); ctx.globalAlpha = a; for (let v = 0; v <= 8; v += 2) { ctx.strokeStyle = '#E4DCCB'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yy(v)); ctx.lineTo(x1, yy(v)); ctx.stroke(); } ctx.restore();
    for (let v = 0; v <= 8; v += 2) text(v + '%', x0 - 16, yy(v) + 8, 22, GREY, 500, a, 'right'); for (let i = 0; i < 5; i++) text(String(2021 + i), xx(i), y0 + 44, 24, GREY, 600, a, 'center');
    if (kg > 0) { ctx.save(); ctx.globalAlpha = 0.28 * kg; ctx.fillStyle = YEL; ctx.beginPath(); RL.forEach((v, i) => i ? ctx.lineTo(xx(i), yy(v)) : ctx.moveTo(xx(0), yy(v))); for (let i = 4; i >= 0; i--) ctx.lineTo(xx(i), yy(RD[i])); ctx.closePath(); ctx.fill(); ctx.restore(); }
    const line = (arr, col, k) => { if (k <= 0) return; const n = k * 4; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineJoin = ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xx(0), yy(arr[0]));
      for (let i = 1; i <= 4; i++) { const f = clamp(n - (i - 1)); if (f <= 0) break; ctx.lineTo(lerp(xx(i - 1), xx(i), f), lerp(yy(arr[i - 1]), yy(arr[i]), f)); } ctx.stroke(); ctx.restore(); };
    line(RL, RED, kl); line(RD, GRN, kd);
    label('Loans 6.8%', x1 + 14, yy(6.8), t, q[1] + 2.9, { align: 'c', size: 30, bg: RED, fg: '#FFFFFF' }); label('Deposits 3.5%', x1 - 6, yy(3.5) + 4, t, q[2] + 2.1, { align: 'c', size: 30, bg: GRN, fg: '#FFFFFF' });
    text('The gap: 3.3 points', xx(1.55), yy(4.85), 34, INK, 800, kg, 'center'); text('up from 2.5 a year earlier', xx(1.55), yy(4.85) + 36, 24, GREY, 600, kg, 'center'); }
  card(470, 890, '€184.6 million', 'bank profits in 2025, the most since\nat least 2016', t, q[4] + 1.0, NAVY, 60);
  header('The price of money', 'Average rates in December of each year', t);
}

function sHealth(t, D, q, gt) {
  bankStreet(gt, 1, 1, ease(t, q[0] + 0.3, 0.6));
  camKeys(t, [{ t: 0, p: [0, 8.5, 37], l: [0, 7, 0], f: 36 }, { t: D, p: [0, 9.2, 35], l: [0, 7, 0], f: 36 }], FR.BANK); finish();
  gauge(64, 250, 'Loans not repaid on time', '2.1%', 'non-performing loans (1.9% in 2024)', 0.21, GRN, t, q[1] + 0.2);
  gauge(64, 520, 'Capital cushion', '17.2%', 'capital adequacy ratio', 0.688, NAVY, t, q[2] + 0.4);
  gauge(1336, 250, 'Liquid reserves', '292%', 'liquidity coverage ratio (minimum: 100%)', 0.973, BLUE, t, q[3] + 0.6, 1 / 3);
  gauge(1336, 520, 'Stress test', 'Resilient', 'central bank solvency test, severe scenario', null, GRN, t, q[4] + 2.2);
  header('Is it safe?', 'Soundness of the banking sector, December 2025', t);
}

function sPensions(t, D, q, gt) {
  show(S.PENS); env(DAY); aim(FR.PENS.rel(0, 0, 0), 32); S.GLOBE.spin.rotation.y = gt * 0.22; const go = ease(t, q[2] - 0.2, 1.0), n = S.pensCoins.n;
  for (let i = 0; i < n; i++) { const u = fract(gt * 0.3 + i / n), s = Math.sin(Math.PI * u); S.pensCoins.put(i, lerp(-8.6, 6.2, u), lerp(6.4, 6.6, u) + s * 4.2, 0.4, (i + 0.5) / n <= go ? Math.min(1, s * 3) : 0, Math.PI / 2, gt * 3 + i); } S.pensCoins.done();
  camKeys(t, [{ t: 0, p: [-2, 7.5, 37], l: [0, 5.4, 0], f: 36 }, { t: D, p: [2, 8.2, 35], l: [0, 5.4, 0], f: 36 }], FR.PENS); finish();
  call('The Trust holds 99.7% of pension assets', P(S.PENS, -9, 6.3, 1.5), 500, 270, t, q[1] + 1.2, { align: 'c', size: 30, dot: PLUM });
  call('80.1% is invested abroad', P(S.PENS, 9, 9.6, 1.5), 1400, 270, t, q[2] + 0.5, { align: 'c', size: 34, dot: BLUE });
  card(340, 912, '€3.8 billion', 'in pension savings', t, q[1] + 4.6, PLUM, 64); card(960, 912, '€308.9 million', 'earned on investments in 2025', t, q[3] + 2.0, GRN, 60); card(1580, 912, '€364.3 million', 'paid in by workers in 2025', t, q[4] + 0.8, NAVY, 60);
  header('Pensions: the second pillar', 'Retirement savings, almost all in the Kosovo Pension Savings Trust', t);
}

function sOthers(t, D, q, gt) {
  show(S.OTH); env(DAY); aim(FR.OTH.rel(0, 0, 0), 28); S.carShield.position.set(-8, 5.9, 1); S.carShield.scale.setScalar(1.1 * Math.max(1e-3, ease(t, 0.6, 0.6)));
  S.stack(S.othCoins, 0, 8, 13.2, 3.4, (t - q[2] - 0.2) / 1.2, 0); S.othCoins.done();
  camKeys(t, [{ t: 0, p: [-2, 6.5, 31], l: [0, 4.2, 0], f: 36 }, { t: D, p: [2, 7.2, 29], l: [0, 4.2, 0], f: 36 }], FR.OTH); finish();
  card(500, 900, '€179.0 million', 'insurance premiums in 2025,\nabout €113 per person', t, q[0] + 2.3, GRN, 60);
  label('Compulsory car insurance: 45.8% of premiums', 500, 232, t, q[1] + 0.6, { align: 'c', size: 30 }); label('Life insurance: 4.7%', 500, 312, t, q[1] + 3.6, { align: 'c', size: 30, bg: PAPER });
  card(1420, 900, '+23.3%', 'microfinance and non-bank loans,\nnow €552 million', t, q[2] + 1.6, RED, 64);
  const a = ease(t, q[3] + 0.3, 0.5); if (a > 0) { const X = 1130, Y = 196 + 30 * (1 - a); plate(X, Y, 600, 218, a, '#FFFFFF'); text('Average interest rate on loans', X + 30, Y + 46, 26, NAVY, 700, a);
    [['Microfinance', 18.3, RED], ['Banks', 6.8, NAVY]].forEach(([n, v, c], i) => { const y = Y + 78 + i * 66; text(n, X + 30, y + 30, 26, INK, 600, a); hbar(X + 200, y + 6, 236, 30, v / 20 * ease(t, q[3] + 0.6 + i * 0.5, 0.9), c, a); text(v + '%', X + 570, y + 32, 32, c, 800, a, 'right'); }); }
  header('The smaller players', 'Insurance, microfinance and non-bank lenders in 2025', t);
}

// The phone's banking app: a balance, then payments arriving one by one (k), drawn on the phone's own canvas.
function phoneUI(k, ok) { const c = S.ph.scr.ctx, F = (w, s) => { c.font = `${w} ${s}px Inter, sans-serif`; }; c.fillStyle = '#F7F4EC'; c.fillRect(0, 0, 430, 880); c.fillStyle = NAVY; c.fillRect(0, 0, 430, 250);
  c.fillStyle = '#FFFFFF'; F(600, 26); c.fillText('My account', 30, 76); F(800, 58); c.fillText('€ 1,284.50', 30, 160); F(500, 22); c.fillStyle = '#BFD3EA'; c.fillText('Available balance', 30, 204);
  [['Supermarket', '- 23.40'], ['Electricity bill', '- 61.00'], ['Salary', '+ 720.00'], ['Coffee', '- 1.50']].forEach(([n, v], i) => { const kk = clamp(k * 4 - i); if (kk <= 0) return; const y = 280 + i * 118 + 30 * (1 - kk); c.globalAlpha = kk;
    rr(c, 22, y, 386, 100, 20, '#FFFFFF', '#E3DCCB'); c.fillStyle = v[0] === '+' ? GRN : NAVY; c.beginPath(); c.arc(70, y + 50, 24, 0, 7); c.fill(); c.fillStyle = INK; F(600, 25); c.fillText(n, 110, y + 44); F(800, 27); c.fillStyle = v[0] === '+' ? GRN : INK; c.fillText('€ ' + v, 110, y + 80); c.globalAlpha = 1; });
  if (ok > 0) { c.globalAlpha = ok; rr(c, 40, 760, 350, 86, 43, GRN); c.fillStyle = '#FFFFFF'; F(800, 32); c.textAlign = 'center'; c.fillText('Paid', 215, 815); c.textAlign = 'left'; c.globalAlpha = 1; } S.ph.scr.update(); }
function sPayments(t, D, q, gt) {
  show(S.PAY); env(DAY); aim(FR.PAY.rel(0, 0, 0), 12); const tap = fract((t - q[2] + 0.4) / 2.6), near = t > q[2] - 0.4 ? Math.sin(Math.PI * clamp(tap / 0.75)) : 0, ok = t > q[2] - 0.4 && tap > 0.3 && tap < 0.8;
  S.theCard.position.set(lerp(6.9, 4.9, near), lerp(2.6, 1.9, near), lerp(2.2, 1.3, near)); S.theCard.rotation.set(-0.5, -0.5, 0.15 * (1 - near)); S.TERM.scr.material.color.set(ok ? '#5FCB6B' : '#CDEFD6');
  phoneUI(0.5 + 0.5 * ease(t, q[3] - 0.3, 1.6), ok ? 1 : 0);
  camKeys(t, [{ t: 0, p: [1.3, 4.4, 16.5], l: [1.6, 2.5, 0], f: 36 }, { t: D, p: [1.9, 4.8, 15.5], l: [1.6, 2.5, 0], f: 36 }], FR.PAY); finish();
  card(330, 340, '1.9 million', 'debit cards, up 33.7% in a year', t, q[1] + 1.4, NAVY, 64); card(330, 570, '+33.4%', 'card payments in shops', t, q[2] + 0.6, RED, 64); card(330, 800, '1 million+', 'accounts with online access', t, q[3] + 0.5, GRN, 64);
  label('Instant payments: being built', 1500, 250, t, q[4] + 0.3, { align: 'c', size: 32 }); label('Single Euro Payments Area: waiting on legislation', 1500, 334, t, q[4] + 2.6, { align: 'c', size: 27, bg: '#FFE3DC' });
  header('Paying goes digital', 'Cards and online banking in 2025', t); footer('The interbank payment system handled 21.9 million payments worth €27.1 billion in 2025.', t, q[3] + 2.2);
}

function sOutro(t, D, q, gt) {
  show(S.SECT); env(EVE); aim(FR.SECT.rel(0, 0, 0), 36); sectors(ONE, ONE);
  camKeys(t, [{ t: 0, p: [-9, 9, 45], l: [0, 10, 0], f: 36 }, { t: D, p: [8, 10.5, 49], l: [0, 10, 0], f: 36 }], FR.SECT); finish();
  const out = 1 - ease(t, q[4] - 0.4, 0.4);
  [['Household debt', '+19.5%', 'in one year, to 28.3% of GDP', RED, q[1] + 0.2], ['Property market', 'Diaspora', 'money supports demand for homes', PLUM, q[2] + 0.3], ['Inflation', '3.9% → 6.7%', '2025, and the forecast for 2026', NAVY, q[3] + 0.5]].forEach(([h, big, cap, col, t0], i) => {
    const a = ease(t, t0, 0.5) * out; if (a <= 0) return; const x = 70 + i * 610, y = 190 + 30 * (1 - ease(t, t0, 0.5)); plate(x, y, 560, 196, a, '#FFFFFF'); text(h, x + 30, y + 46, 27, NAVY, 700, a); text(big, x + 30, y + 116, 60, col, 800, a); text(cap, x + 30, y + 164, 24, GREY, 500, a); });
  const a = ease(t, q[4] + 0.3, 0.6); if (a > 0) { const y = 186 + 30 * (1 - a); plate(310, y, 1300, 236, a); text('Kosovo\'s financial system in 2025', 960, y + 70, 46, INK, 800, a, 'center');
    [['Small', q[4] + 3.2], ['Built around banks', q[4] + 4.0], ['Growing fast', q[4] + 5.2], ['Stable, for now', q[4] + 6.2]].forEach(([s, t0], i) => label(s, 960 + [-480, -215, 110, 405][i], y + 156, t, t0, { align: 'c', size: 32, bg: ['#FFFFFF', '#DCE9FB', '#FFE9A6', '#D8F0DF'][i] })); }
  header('What to watch', null, t); footer('Sources: Central Bank of the Republic of Kosovo, Annual Report 2025 and Financial Stability Report 2025.', t, q[4] + 2.0);
}

play(ORDER, CUES, { title: sTitle, size: sSize, growth: sGrowth, banks: sBanks, rates: sRates, health: sHealth, pensions: sPensions, others: sOthers, payments: sPayments, outro: sOutro },
  { motion: 'smooth', transition: 'blinds', wipe: { c1: '#27496D', c2: '#F4BE42' } });
