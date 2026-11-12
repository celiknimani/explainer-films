// How Kosovo keeps the lights on: explainer film (map, lignite plants, winter demand, imports, renewables, plan).
import * as C from '../../engine/core.js';
import * as S from './sets.js';
import { ctx, INK, PAPER, NAVY, RED, YEL, GRN, COAL, BLUE, fmt, font, text, plate, pill, label, call, header, footer, flash, card, hbar, leader, badge } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, play, loadJSON, SUNLOW } from '../../engine/stage.js';
const { THREE, V, clamp, sstep, ease, pop, lerp, proj, camKeys } = C;
const { MAP, PLANT, TOWN, RES, mp, mini, pl, rs } = S;
const CUES = await loadJSON('./cues.json', import.meta.url);
const ORDER = ['title', 'coal', 'old', 'gap', 'imports', 'res', 'plan', 'hurdles', 'outro'];
const E = { day: ENV.day, map: ENV.studio, dusk: ENV.dusk, duskmap: ENV.night };
const FR = { MAP: frameOf(MAP), PLANT: frameOf(PLANT), TOWN: frameOf(TOWN), RES: frameOf(RES) };
function show(set) { for (const s of S.SETS) s.visible = s === set; C.clouds.position.copy(set.position); C.clouds.position.y = 35; C.clouds.scale.setScalar(0.55); S.slab.scale.y = 1; S.mapTop.position.y = 0; }
const P = (set, x, y, z) => proj(V(set.position.x + x, y, set.position.z + z));
function mapState(gt, o = {}) { mini.plant.visible = S.mapPuffs.mesh.visible = !!o.plant; if (o.plant) S.mapPuffs.update(gt);
  mini.wind.forEach(w => w.g.visible = !!o.wind); mini.zat.forEach(w => w.g.visible = !!o.zat); S.spin(mini.wind, gt, 3); S.spin(mini.zat, gt, 3);
  mini.hydro.visible = !!o.hydro; mini.solar.visible = !!o.solar; mini.lines.visible = !!o.lines; mini.gate.visible = !!o.gate;
  S.pulses.visible = !!o.pulses; if (o.pulses) S.pulsesUpdate(gt, ...o.pulses);
  S.lights.visible = o.lights !== undefined; if (o.lights !== undefined) S.lightsUpdate(o.lt, o.lights); }
const GREY = new THREE.Color('#8E8A86');
function plantRun(gt, on = {}, refurb = false) { for (const n in pl.units) { const u = pl.units[n], k = on[n] ?? 1; u.src.forEach(s => s.on = k); u.lamp.material.color.set(k > 0.5 ? '#5FCB6B' : '#E0483A'); if (!C.STYLE.fill) u.mat.color.copy(u.col).lerp(GREY, (1 - k) * 0.6); }
  pl.bStack.on = Math.max(on.B1 ?? 1, on.B2 ?? 1); S.plPuffs.update(gt); S.lumpsUpdate(gt); S.exc.userData.wheel.rotation.z = -gt * 1.3; S.crane.visible = S.scaffold.visible = refurb; S.crane.userData.jib.rotation.y = 0.7 + 0.5 * Math.sin(gt * 0.45); }

// =============================================================== scenes
function sTitle(t, D, q, gt) {
  show(MAP); env(E.duskmap); aim(V(0, 0, 0), 62); const k = Math.max(0.02, pop(t, 0.3, 0.7)); S.slab.scale.y = k; S.mapTop.position.y = (S.MY - S.TY) * (k - 1);
  mapState(gt, { lights: q[0] + 0.3, lt: t });
  camKeys(t, [{ t: 0, p: [-30, 118, 88], l: [-27, 0, 4], f: 34 }, { t: D, p: [-26, 98, 76], l: [-23, 0, 3], f: 34 }]); finish();
  let a = ease(t, q[0], 0.5); text('How Kosovo', 90, 420 + 30 * (1 - a), 104, '#FFFFFF', 800, a, 'left', 14, '#1E2444'); a = ease(t, q[0] + 0.45, 0.5); text('keeps the', 90, 530 + 30 * (1 - a), 104, '#FFFFFF', 800, a, 'left', 14, '#1E2444');
  a = ease(t, q[0] + 0.9, 0.5); text('lights on', 90, 640 + 30 * (1 - a), 104, YEL, 800, a, 'left', 14, '#1E2444');
  a = ease(t, q[1], 0.5); text('The electricity system in 2025, by the numbers', 94, 720 + 20 * (1 - a), 36, '#E9E4F5', 600, a, 'left', 8, '#1E2444');
}

function sCoal(t, D, q, gt) {
  const cut = q[1] - 0.25;
  if (t < cut) { show(MAP); env(E.map); aim(V(0, 0, 0), 62); mapState(gt, { plant: true }); const ob = mini.plantPos;
    camKeys(t, [{ t: 0, p: [0, 104, 72], l: [0, 0, 3], f: 34 }, { t: 1.0, p: [0, 104, 72], l: [0, 0, 3], f: 34 }, { t: cut, p: [ob.x + 5, 30, ob.z + 32], l: [ob.x + 2.5, 2.5, ob.z], f: 30 }]); finish();
    call('Obiliq', proj(ob.clone().add(V(0, 1.4, 0))), 1180, 330, t, q[0] + 1.5, { size: 40 });
    call('Prishtina', proj(mp(21.166, 42.663, 0.3)), 1300, 640, t, q[0] + 2.7, { size: 34, dot: NAVY });
  } else { const u = t - cut; show(PLANT); env(E.day); aim(FR.PLANT.rel(6, 0, 0), 84); plantRun(gt);
    camKeys(t, [{ t: cut, p: [-10, 10, 70], l: [-4, 8, 0], f: 44 }, { t: q[2] - 0.7, p: [-4, 9.5, 64], l: [-2, 8, 0], f: 44 }, { t: q[2] + 1.0, p: [38, 11, 50], l: [60, 3, 8], f: 36 }, { t: q[3] - 0.6, p: [42, 10, 44], l: [61, 3, 8], f: 36 },
      { t: q[3] + 1.0, p: [0, 15, 70], l: [2, 1, 0], f: 44 }, { t: D, p: [4, 16, 74], l: [2, 1, 0], f: 44 }], FR.PLANT); finish(); flash(1 - u / 0.25);
    call('Kosovo B: 2 units, built 1983-84', P(PLANT, -23.9, 8.4, 1.8), 330, 300, t, cut + 0.7, { t1: q[2] - 0.5, align: 'l' });
    call('Kosovo A: 3 working units, built 1970-75', P(PLANT, 20.5, 6.6, 1.4), 1000, 420, t, cut + 1.6, { t1: q[2] - 0.5, align: 'l' });
    if (t > q[2] && t < q[3] - 0.4) call('Open-pit lignite mine next to the plants\n6.9 million tonnes dug in 2025', P(PLANT, 70, 1.5, 9), 300, 330, t, q[2] + 1.3, { align: 'l' });
    card(420, 830, '4,687 GWh', 'generated from lignite in 2025', t, q[3] + 0.9, COAL); card(960, 830, '88.5%', 'of domestic generation', t, q[3] + 2.0, RED); card(1500, 830, '960 MW', 'of lignite capacity,\nunchanged since 2018', t, q[3] + 3.1, NAVY); }
  header('Coal does the heavy lifting', 'Two lignite plants at Obiliq, run by the public utility KEK', t);
}

const UN = ['B1', 'B2', 'A3', 'A4', 'A5'], PCT = { B1: 84.6, B2: 55.6, A3: 64.1, A4: 59.5, A5: 61.8 }, YR = { B1: 1983, B2: 1984, A3: 1970, A4: 1971, A5: 1975 }, NS = 26;
const OFFS = UN.map((n, ui) => { const pairs = [...Array(NS / 2).keys()].sort((a, b) => Math.sin(a * 12.9898 + ui * 78.233 + 1) * 43758.5 % 1 - Math.sin(b * 12.9898 + ui * 78.233 + 1) * 43758.5 % 1);
  const order = pairs.flatMap(p => [p * 2, p * 2 + 1]); return new Set(order.slice(0, Math.round((1 - PCT[n] / 100) * NS))); });
function sOld(t, D, q, gt) {
  show(PLANT); env(E.day); aim(FR.PLANT.rel(6, 0, 0), 84);
  const run0 = q[2] + 0.3, run1 = q[3] + 2.3, yk = clamp((t - run0) / (run1 - run0)), slot = Math.min(NS - 1, Math.floor(yk * NS)), on = {}, cum = {};
  UN.forEach((n, ui) => { on[n] = yk > 0 && yk < 1 && OFFS[ui].has(slot) ? 0 : 1; let c = 0; for (let s = 0; s <= slot; s++) if (!OFFS[ui].has(s)) c++; cum[n] = yk <= 0 ? 0 : yk >= 1 ? PCT[n] / 100 : c / (slot + 1); });
  plantRun(gt, on);
  camKeys(t, [{ t: 0, p: [-5, 15, 68], l: [-2, 0.5, 0], f: 44 }, { t: D, p: [1, 17, 73], l: [-2, 0, 0], f: 44 }], FR.PLANT); finish();
  const CX = [330, 560, 1130, 1360, 1590];
  UN.forEach((n, i) => { const a = ease(t, q[0] + 0.5 + i * 0.12, 0.4); if (a <= 0) return; const x = CX[i], y = 730 + 40 * (1 - a), u = pl.units[n], hot = n === 'B2' && t > run1 + 0.2;
    leader(x, y + 4, proj(FR.PLANT.rel(u.top.x, u.top.y - 0.5, u.top.z)), a * 0.9); plate(x - 105, y, 210, 262, a, hot ? '#FFE3DC' : PAPER);
    text(n, x, y + 54, 46, INK, 800, a, 'center'); const ya = pop(t, q[1] + 0.3 + i * 0.3, 0.35);
    if (ya > 0) text(`built ${YR[n]}`, x, y + 92, 25, NAVY, 600, clamp(ya), 'center');
    hbar(x - 82, y + 112, 164, 26, cum[n], hot ? RED : GRN, a);
    if (yk > 0) { text(`${(cum[n] * 100).toFixed(yk >= 1 ? 1 : 0)}%`, x, y + 196, 46, hot ? RED : INK, 800, a, 'center'); text(yk >= 1 ? 'of hours in 2025' : 'share so far', x, y + 232, 22, '#5B5548', 500, a, 'center'); }
    else text('hours run in 2025', x, y + 176, 22, '#5B5548', 500, a, 'center'); });
  call('A1 and A2: out of service', P(PLANT, 8.8, 6.2, -1), 760, 300, t, q[1] + 3.2, { size: 30, dot: NAVY, t1: q[2] });
  if (yk > 0 && yk < 1) { const a = ease(t, run0, 0.3); plate(660, 596, 600, 84, a); text('2025', 690, 650, 34, INK, 800, a); hbar(790, 624, 440, 26, yk, NAVY, a); ['Jan', 'Dec'].forEach((m, i) => text(m, 790 + i * 440, 618, 18, '#5B5548', 600, a, 'center')); }
  card(1090, 270, '5,298 GWh', 'total generation in 2025', t, q[4] + 0.3, COAL); card(1620, 270, '-12.6%', 'compared with 6,059 GWh in 2024', t, q[4] + 1.5, RED);
  header('Old machines, frequent outages', 'Share of the year each unit was running (ERO, 2025)', t);
}

function sGap(t, D, q, gt) {
  show(TOWN); env(E.dusk); aim(FR.TOWN.rel(0, 0, 0), 76, SUNLOW); S.wins.update(t, q[1] - 0.3); S.snow.update(gt);
  camKeys(t, [{ t: 0, p: [6, 8, 62], l: [10, 6.5, 0], f: 36 }, { t: D, p: [12, 10, 52], l: [13, 7, 0], f: 36 }], FR.TOWN); finish();
  label('Demand in 2025: 6,944 GWh, up about 5%', 76, 250, t, q[0] + 0.7, { align: 'l' });
  label('Electric heating pushes winter evenings to the peak', 76, 336, t, q[1] + 1.4, { align: 'l', size: 30 });
  const a = ease(t, q[2] - 0.7, 0.5); if (a > 0) { const X = 1306 + 60 * (1 - a), Y0 = 985, HH = 600, yv = mw => Y0 - mw / 1800 * HH; plate(X, 176, 566, 850, a);
    text('Load on the grid', X + 36, 232, 30, NAVY, 700, a); const val = 1624 * (0.5 * sstep((t - q[2]) / 1.2) + 0.5 * sstep((t - q[2] - 0.8) / 3.0)), short = t > q[3] + 0.9;
    text(`${fmt(Math.round(val))} MW`, X + 36, 302, 64, short ? RED : INK, 800, a);
    ctx.save(); ctx.globalAlpha = a; const bx = X + 96, bw = 120; ctx.fillStyle = '#E4DCCB'; ctx.fillRect(bx, yv(1800), bw, HH);
    const cap = 1261; ctx.fillStyle = YEL; ctx.fillRect(bx, yv(Math.min(val, short ? cap : val)), bw, Y0 - yv(Math.min(val, short ? cap : val)));
    if (short && val > cap) { ctx.fillStyle = RED; ctx.fillRect(bx, yv(val), bw, yv(cap) - yv(val)); }
    ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.strokeRect(bx, yv(1800), bw, HH); font(500, 22); ctx.fillStyle = '#5B5548'; ctx.textAlign = 'right';
    for (let m = 0; m <= 1800; m += 300) { ctx.fillText(fmt(m), bx - 14, yv(m) + 8); ctx.fillRect(bx - 8, yv(m) - 1, 8, 2); } ctx.restore();
    const pk = pop(t, q[2] + 4.0, 0.35); if (pk > 0) { text('Record peak', bx + bw + 22, yv(1624) - 24, 30, INK, 800, clamp(pk)); text('31 December 2025', bx + bw + 22, yv(1624) + 6, 24, '#5B5548', 500, clamp(pk)); }
    const ca = ease(t, q[3] + 0.3, 0.5); if (ca > 0) { ctx.save(); ctx.globalAlpha = ca; ctx.setLineDash([14, 9]); ctx.lineWidth = 5; ctx.strokeStyle = NAVY; ctx.beginPath(); ctx.moveTo(bx - 30, yv(cap)); ctx.lineTo(bx - 30 + (bw + 300) * ca, yv(cap)); ctx.stroke(); ctx.restore();
      text('All working plants', bx + bw + 22, yv(cap) + 40, 28, NAVY, 800, ca); text('about 1,261 MW', bx + bw + 22, yv(cap) + 72, 26, NAVY, 600, ca); }
    const sa = pop(t, q[3] + 1.6, 0.4); if (sa > 0) pill('at least 363 MW short', bx + bw + 14, yv(1420), { bg: RED, fg: '#FFFFFF', size: 25, scale: sa }); }
  header('Demand keeps climbing', 'A winter evening in Kosovo', t);
}

function sImports(t, D, q, gt) {
  show(MAP); env(E.map); aim(V(0, 0, 0), 62); mapState(gt, { plant: true, lines: true, pulses: [1, 0.95], wind: true, hydro: true, solar: true });
  camKeys(t, [{ t: 0, p: [22, 98, 62], l: [20, 0, 2], f: 34 }, { t: D, p: [23, 90, 56], l: [20.5, 0, 2], f: 34 }]); finish();
  [['SERBIA', 21.72, 43.02], ['MONTENEGRO', 19.92, 42.93], ['ALBANIA', 19.98, 42.2], ['NORTH MACEDONIA', 21.5, 41.82]].forEach(([n, lo, la], i) => { const p = proj(mp(lo, la, -1.2)); text(n, p.x, p.y, 26, '#7A6F5A', 800, ease(t, q[0] + 0.3 + i * 0.15, 0.4), 'center', 7); });
  const X = 1190; let a = ease(t, q[1] - 0.2, 0.45); plate(X, 190, 660, 250, a); text('Imports in 2025', X + 36, 248, 30, NAVY, 700, a);
  text(`${fmt(Math.round(1964 * sstep((t - q[1]) / 2.6)))} GWh`, X + 36, 340, 88, INK, 800, a);
  label('+42% on 2024', X + 36, 396, t, q[2] + 0.3, { bg: RED, fg: '#FFFFFF', size: 28, align: 'l' }); label('Exports: 377 GWh', X + 300, 396, t, q[2] + 1.6, { bg: BLUE, fg: '#FFFFFF', size: 28, align: 'l' });
  a = ease(t, q[3] - 0.1, 0.45); if (a > 0) { plate(X, 474, 660, 214, a); text('Demand: 6,944 GWh', X + 36, 530, 30, NAVY, 700, a); const k = sstep((t - q[3] - 0.3) / 1.4), bx = X + 36, bw = 588;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#8FA36B'; ctx.fillRect(bx, 552, bw, 50); ctx.fillStyle = YEL; ctx.fillRect(bx + bw * (1 - 0.23 * k), 552, bw * 0.23 * k, 50); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.strokeRect(bx, 552, bw, 50); ctx.restore();
    text('Made in Kosovo', bx + 14, 587, 26, '#FFFFFF', 700, a); text('23%', bx + bw - 14, 587, 26, INK, 800, a * k, 'right'); text('Net imports: 1,588 GWh, about 23% of demand', bx, 652, 26, INK, 600, a * k); }
  card(X + 250, 800, '€247.8 million', 'import bill, Jan-Nov 2025 (Customs)', t, q[4] + 0.8, RED, 56);
  label('Average price per MWh: imports €121.56, exports €105.31', X + 660, 960, t, q[4] + 2.6, { size: 25, align: 'r' });
  header('The rest crosses the border', 'Yellow: power flowing in. Blue: power flowing out', t);
}

function resRun(t, gt, zatT0, extraT0, fieldT0, battT0) { S.spin(rs.wind, gt); S.spin(rs.zat, gt); S.spin(rs.extra, gt); S.resPuffs.update(gt);
  rs.wind.forEach(w => w.g.scale.setScalar(w.s)); S.popAll(rs.zat, t, zatT0, 0.17); S.popAll(rs.extra, t, extraT0, 0.09); S.panelsUpdate(t, fieldT0);
  S.batts.forEach((b, i) => b.g.scale.setScalar(Math.max(1e-4, pop(t, battT0 + i * 0.12, 0.4)))); }
function sRes(t, D, q, gt) {
  show(RES); env(E.day); aim(FR.RES.rel(4, 0, -12), 86); resRun(t, gt, q[5] + 1.0, 1e9, [-99, null, null, null, null], 1e9);
  const wide = { p: [6, 19, 74], l: [6, 6, -10], f: 38 };
  camKeys(t, [{ t: 0, ...wide }, { t: q[1] - 0.2, p: [5, 18, 70], l: [5, 6, -10], f: 38 }, { t: q[1] + 1.2, p: [-18, 14, 30], l: [-31, 11, -18], f: 38 }, { t: q[2] - 0.5, p: [-16, 14, 28], l: [-30, 11, -18], f: 38 },
    { t: q[2] + 1.0, p: [14, 11, 8], l: [9, 5, -26], f: 40 }, { t: q[3] - 0.5, p: [15, 11.5, 6], l: [9, 5, -26], f: 40 }, { t: q[3] + 1.0, p: [40, 10, 28], l: [28, 1, 4], f: 36 }, { t: q[4] - 0.5, p: [41, 10.5, 27], l: [28, 1, 4], f: 36 },
    { t: q[4] + 1.2, ...wide }, { t: q[5] - 0.2, p: [8, 20, 76], l: [8, 6, -10], f: 38 }, { t: q[5] + 1.4, p: [34, 16, 30], l: [48, 9, -30], f: 38 }, { t: D, p: [31, 17, 34], l: [48, 9, -30], f: 38 }], FR.RES); finish();
  const hub = rs.wind[3].g.position;
  call('Wind: 137.2 MW', P(RES, hub.x, hub.y + 8, hub.z + 0.9), 1180, 300, t, q[1] + 1.4, { t1: q[2] - 0.4, size: 44 });
  call('Hydro: 128.5 MW', P(RES, 9, 4.5, -23.2), 1240, 330, t, q[2] + 1.2, { t1: q[3] - 0.4, size: 44, dot: BLUE });
  call('Solar: 35.5 MW', P(RES, 28, 1.3, 4), 1240, 300, t, q[3] + 1.2, { t1: q[4] - 0.4, size: 44, dot: YEL });
  if (t > q[4] + 0.6 && t < q[5] + 0.2) { const a = ease(t, q[4] + 0.9, 0.45) * (1 - clamp((t - q[5] + 0.3) / 0.4)); plate(430, 760, 1060, 210, a); text('Renewables made 611.5 GWh in 2025', 470, 822, 38, INK, 800, a);
    const k = sstep((t - q[4] - 1.3) / 1.5); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = COAL; ctx.fillRect(470, 846, 980, 46); ctx.fillStyle = GRN; ctx.fillRect(470, 846, 980 * 0.115 * k, 46); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.strokeRect(470, 846, 980, 46); ctx.restore();
    text('11.5%', 470 + 980 * 0.115 + 16, 880, 28, '#FFFFFF', 800, a * k); text('lignite 88.5%', 1436, 880, 26, '#FFFFFF', 600, a, 'right'); text('Share of what Kosovo generated itself', 470, 938, 26, '#5B5548', 500, a); }
  const zh = rs.zat[8].g.position; call('Zatriq wind farm: +70 MW in 2026', P(RES, zh.x, zh.y + 6.6, zh.z), 330, 320, t, q[5] + 2.2, { size: 40, align: 'l' });
  label('Wind capacity is now about 207 MW', 330, 420, t, q[5] + 4.0, { size: 30, bg: GRN, fg: '#FFFFFF', align: 'l' });
  header('Renewables: growing, still small', 'Operating capacity at the end of 2025 (ERO)', t);
}

function sPlan(t, D, q, gt) {
  show(RES); env(E.day); aim(FR.RES.rel(4, 0, -16), 104); resRun(t, gt, -99, q[2] + 0.4, [-99, q[2] + 1.9, q[2] + 2.4, q[2] + 2.9, q[2] + 3.4], q[3] + 0.6);
  camKeys(t, [{ t: 0, p: [4, 30, 96], l: [4, 9, -12], f: 38 }, { t: D, p: [10, 35, 104], l: [6, 8, -12], f: 38 }], FR.RES); finish();
  card(360, 300, '35%', 'of electricity from\nrenewables by 2031', t, q[1] + 0.2, GRN); card(960, 300, '600 + 600 MW', 'of new wind and solar', t, q[2] + 0.3, NAVY, 56); card(1560, 300, '170 MW', 'of battery storage\n(340 MWh project in tender)', t, q[3] + 0.9, RED);
  const a = ease(t, q[4] - 0.2, 0.45); if (a > 0) { const k = sstep((t - q[4] - 0.4) / 3.2), val = lerp(330, 1600, k); plate(250, 800, 1420, 196, a);
    text('Renewable capacity', 290, 858, 34, INK, 800, a); text(`${fmt(Math.round(val / 10) * 10)} MW`, 1630, 858, 44, GRN, 800, a, 'right');
    hbar(290, 884, 1340, 40, val / 1600, GRN, a); text('330 MW in 2025', 290, 966, 26, '#5B5548', 600, a); text('1,600 MW target for 2031: about five times more', 1630, 966, 26, '#5B5548', 600, a * k, 'right'); }
  label('First solar auction: 100 MW won at €48.88 per MWh', 960, 730, t, q[5] + 1.6, { align: 'c', size: 32, bg: YEL });
  header('The plan: Energy Strategy 2022-2031', 'Targets for the year 2031', t);
}

function sHurdles(t, D, q, gt) {
  const cut = q[2] - 0.25;
  if (t < cut) { show(PLANT); env(E.day); aim(FR.PLANT.rel(6, 0, 0), 84); plantRun(gt, {}, t > q[1] - 0.4);
    camKeys(t, [{ t: 0, p: [0, 14, 74], l: [2, 6, 0], f: 44 }, { t: q[1] - 0.5, p: [2, 13, 70], l: [2, 6, 0], f: 44 }, { t: q[1] + 1.2, p: [34, 13, 46], l: [18, 6, 0], f: 36 }, { t: cut, p: [38, 14, 50], l: [18, 6, 0], f: 36 }], FR.PLANT); finish();
    badge('1', 120, 300, t, q[1] + 0.1); label('Old coal units get repaired and kept running', 190, 300, t, q[1] + 0.4, { align: 'l' });
    label('€390 million planned for coal plant rehabilitation', 190, 390, t, q[1] + 2.6, { align: 'l', size: 30 });
    label('Coal phase-out: by 2050 at the latest', 190, 474, t, q[1] + 5.2, { align: 'l', size: 30, bg: RED, fg: '#FFFFFF' });
  } else { const u = t - cut, gp = mini.gatePos; show(MAP); env(E.map); aim(V(0, 0, 0), 62); mapState(gt, { plant: true, lines: true, gate: true, pulses: [0, 1.4, 'MK'], wind: true, zat: true, hydro: true, solar: true });
    camKeys(t, [{ t: cut, p: [26, 70, 84], l: [20, 0, 12], f: 34 }, { t: cut + 3.0, p: [gp.x + 9, 10, gp.z + 19], l: [gp.x + 1.5, 4.2, gp.z - 4], f: 36 }, { t: q[3] - 0.4, p: [gp.x + 10, 10.5, gp.z + 20], l: [gp.x + 1.5, 4.2, gp.z - 4], f: 36 },
      { t: q[3] + 1.0, p: [30, 96, 70], l: [26, 0, 4], f: 34 }, { t: D, p: [32, 90, 64], l: [27, 0, 4], f: 34 }]); finish(); flash(1 - u / 0.25);
    if (t < q[3] - 0.2) { badge('2', 120, 300, t, q[2] + 0.1); label('Kosovo has no carbon tax or emissions trading', 190, 300, t, q[2] + 0.4, { align: 'l' });
      call('EU carbon border levy on electricity\nsince 1 January 2026: about €74 per MWh', proj(V(gp.x, S.TY + 3.7, gp.z)), 1080, 330, t, q[2] + 4.2, { align: 'l', size: 32, dot: BLUE }); }
    else { badge('3', 120, 300, t, q[3] + 0.1); label('The climate plan is not adopted', 190, 300, t, q[3] + 0.4, { align: 'l' });
      const b = clamp((t - q[3] - 0.3) / 0.5), e = 1 - Math.pow(1 - b, 3); if (b > 0) { const sk = t > q[3] + 2.0 ? 5 * Math.exp(-(t - q[3] - 2.0) * 9) * Math.sin((t - q[3] - 2.0) * 60) : 0;
        ctx.save(); ctx.translate(1440 + sk, 600 + 700 * (1 - e)); ctx.rotate(0.04 - 0.1 * (1 - e)); ctx.beginPath(); ctx.rect(-222, -292, 460, 600); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill(); ctx.beginPath(); ctx.rect(-230, -300, 460, 600); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = NAVY; ctx.fillRect(-230, -300, 460, 26); font(800, 34); ctx.fillStyle = INK; ctx.textAlign = 'left'; ['National Energy', 'and Climate Plan', '2025-2030'].forEach((l, i) => ctx.fillText(l, -190, -200 + i * 44));
        ctx.fillStyle = '#D9D4C8'; for (let i = 0; i < 9; i++) ctx.fillRect(-190, -40 + i * 34, i % 3 === 2 ? 250 : 380, 14);
        const sp = pop(t, q[3] + 1.9, 0.3); if (sp > 0) { ctx.translate(20, 90); ctx.rotate(-0.28); ctx.scale(sp, sp); ctx.lineWidth = 9; ctx.strokeStyle = RED; ctx.strokeRect(-170, -62, 340, 124); font(800, 92); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText('DRAFT', 0, 33); } ctx.restore(); }
      label('Still a draft in mid-2026, with no coal exit date', 190, 390, t, q[3] + 3.4, { align: 'l', size: 30 }); } }
  header('Three things stand in the way', null, t);
}

function sOutro(t, D, q, gt) {
  show(MAP); env(E.map); aim(V(0, 0, 0), 62); mapState(gt, { plant: true, lines: true, pulses: [1, 0.9], wind: true, zat: true, hydro: true, solar: true });
  camKeys(t, [{ t: 0, p: [-15, 84, 86], l: [0, 0, 13], f: 34 }, { t: D, p: [15, 78, 82], l: [0, 0, 13], f: 34 }]); finish();
  card(360, 800, '88%', 'of generation from lignite', t, q[0] + 0.3, COAL); card(960, 800, '23%', 'of demand met by net imports', t, q[1] + 0.2, RED); card(1560, 800, '330 to 1,600 MW', 'renewables: 2025 to the 2031 target', t, q[2] + 0.8, GRN, 52);
  header("Kosovo's electricity in one picture", null, t);
  footer('Sources: ERO Annual Report 2025 | GAP Institute, June 2026 | Energy Strategy 2022-2031 | Kosovo Customs | Terawatt Times (CBAM)', t, q[2] + 3.4);
}

play(ORDER, CUES, { title: sTitle, coal: sCoal, old: sOld, gap: sGap, imports: sImports, res: sRes, plan: sPlan, hurdles: sHurdles, outro: sOutro }, { wipe: { open: '34,44,85' } });
