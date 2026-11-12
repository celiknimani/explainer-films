// 3D sets for the Kosovo film: map, power plants, winter town and renewables landscape.
import * as C from '../../engine/core.js';
const { THREE, V, scene, clamp, sstep, lerp, pop, toon, basic, M, outline, segMatrix, tube, mergeGeometries } = C;
export const GEO = await (await fetch(new URL('./geo.json', import.meta.url))).json();
import { m4, q4, one, tm, at, box, cyl, rnd, sb, hideInst, RED } from '../../engine/parts/kit.js';
import { Puffs, ctower, stack, pylons, turbine, spin, popAll, hillMesh, hy, farHills, dress } from '../../engine/parts/energy.js';
export { m4, q4, hideInst, spin, popAll, Puffs };

export const MAP = new THREE.Group(), PLANT = new THREE.Group(), TOWN = new THREE.Group(), RES = new THREE.Group();
PLANT.position.set(1500, 0, 1500); TOWN.position.set(-1500, 0, 1500); RES.position.set(1500, 0, -1500); scene.add(MAP, PLANT, TOWN, RES);
export const SETS = [MAP, PLANT, TOWN, RES];

// ================================================================ MAP (1 unit = 3 km)
const cl = Math.cos(42.57 * Math.PI / 180);
export const LL = (lon, lat) => [(lon - 20.9) * cl * 111.32 / 3, -(lat - 42.57) * 110.57 / 3];
export const TY = 1.0, MY = 2.3;
export const mp = (lon, lat, dy = 0) => { const [x, z] = LL(lon, lat); return V(x, MY + dy, z); };
MAP.add(M(new THREE.CylinderGeometry(46, 46, TY, 72), tm('#EFE4C8'), { ol: 5, pos: [0, TY / 2, 0] }));
{ const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), basic('#BFAF8C'), GEO.segs.length);
  GEO.segs.forEach((s, i) => { segMatrix(V(s[0], TY + 0.03, s[1]), V(s[2], TY + 0.03, s[3]), 0.05, m4, 0.3); im.setMatrixAt(i, m4); }); im.frustumCulled = false; MAP.add(im); }
export const slab = (() => { const g = new THREE.ExtrudeGeometry(new THREE.Shape(GEO.k.map(([x, z]) => new THREE.Vector2(x, -z))), { depth: MY - TY, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, [toon('#A9CF86'), toon('#6C9859')]); m.position.y = TY; m.castShadow = m.receiveShadow = true; outline(m, 5); MAP.add(m); return m; })();
export const mapTop = new THREE.Group(); MAP.add(mapTop);     // everything standing on the slab
for (const [lo, la, h] of [[20.1, 42.6, 2.4], [20.2, 42.76, 2.0], [20.07, 42.48, 1.8], [20.9, 42.1, 2.2], [20.72, 42.0, 2.5], [21.05, 42.17, 1.8], [20.62, 41.95, 1.7], [20.82, 43.16, 1.8], [21.52, 42.76, 1.2], [21.6, 42.38, 1.1], [20.45, 42.9, 1.3]]) {
  const p = mp(lo, la); mapTop.add(at(M(new THREE.ConeGeometry(h * 0.95, h, 6), tm('#7FA868'), { ol: 3 }), p.x, MY + h / 2, p.z));
  if (h > 1.6) mapTop.add(at(M(new THREE.ConeGeometry(h * 0.38, h * 0.4, 6), tm('#FFFFFF'), { ol: 0 }), p.x, MY + h * 0.81, p.z)); }
export const CITIES = { Prishtina: [21.166, 42.663, 1], Prizren: [20.74, 42.215, .6], Peja: [20.29, 42.66, .5], Mitrovica: [20.87, 42.89, .5], Gjilan: [21.47, 42.46, .5], Ferizaj: [21.155, 42.37, .5], Gjakova: [20.43, 42.38, .5] };
for (const k in CITIES) { const [lo, la, w] = CITIES[k], p = mp(lo, la), r = w === 1 ? 0.95 : 0.6; mapTop.add(at(cyl(r, r, 0.16, '#FBF6EA', { ol: 3 }), p.x, MY + 0.08, p.z));
  if (w === 1) mapTop.add(at(cyl(0.42, 0.42, 0.2, RED, { ol: 0 }), p.x, MY + 0.12, p.z)); }
function inside(x, z) { let c = false; const k = GEO.k; for (let i = 0, j = k.length - 1; i < k.length; j = i++) { const [xi, zi] = k[i], [xj, zj] = k[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
export const LIGHTS = []; { const cs = Object.values(CITIES), g = () => (rnd() + rnd() + rnd() - 1.5) * 2; const [px, pz] = LL(21.166, 42.663);
  while (LIGHTS.length < 170) { let x, z; if (rnd() < 0.62) { const c = cs[Math.floor(rnd() * cs.length)], [cx, cz] = LL(c[0], c[1]), sg = c[2] === 1 ? 3.2 : 2.0; x = cx + g() * sg; z = cz + g() * sg; } else { x = (rnd() - 0.5) * 50; z = (rnd() - 0.5) * 54; }
    if (inside(x, z) && inside(x + 0.6, z) && inside(x - 0.6, z) && inside(x, z + 0.6) && inside(x, z - 0.6)) LIGHTS.push({ x, z, t0: Math.hypot(x - px, z - pz) / 34 * 1.9 + rnd() * 0.35, r: 0.2 + rnd() * 0.14 }); } }
export const lights = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), basic('#FFD45E'), LIGHTS.length); lights.frustumCulled = false; mapTop.add(lights);
export function lightsUpdate(t, t0) { LIGHTS.forEach((l, i) => { const k = l.r * pop(t, t0 + l.t0, 0.35) * (1 + 0.12 * Math.sin(t * 5 + i)); m4.compose(V(l.x, MY + 0.14, l.z), q4.identity(), V(k, k, k)); lights.setMatrixAt(i, m4); }); lights.instanceMatrix.needsUpdate = true; }
export const mapPuffs = Puffs(mapTop, 24);
export const mini = {};
{ const p = mp(21.07, 42.69), g = new THREE.Group(); g.position.copy(p); mapTop.add(g); mini.plant = g; mini.plantPos = p;
  g.add(at(box(3.6, 0.14, 2.6, '#CFC8B8', { ol: 3 }), 0, 0.07, 0), at(ctower(2.0, 0.85, 3), -1.0, 0, 0.2), at(ctower(2.0, 0.85, 3), 0.9, 0, 0.5), at(stack(3.3, 0.24, 2, '#D9D3C5', 3), 0, 0, -0.75), at(box(1.5, 0.8, 0.8, '#B8C4CC', { ol: 3 }), 0.1, 0.5, -0.1));
  mini.ps = [mapPuffs.add(V(p.x - 1.0, MY + 2.1, p.z + 0.2), { n: 5, life: 3.4, rise: 0.75, size: 0.5, drift: [0.35, 0.05] }), mapPuffs.add(V(p.x + 0.9, MY + 2.1, p.z + 0.5), { n: 5, life: 3.4, rise: 0.75, size: 0.5, drift: [0.35, 0.05] }),
    mapPuffs.add(V(p.x, MY + 3.4, p.z - 0.75), { n: 5, life: 3.0, rise: 0.8, size: 0.3, drift: [0.45, 0.05], color: '#9A979C' })]; }
mini.wind = []; mini.zat = [];
for (const [lo, la, n, key] of [[20.97, 42.98, 3, 'wind'], [21.62, 42.6, 2, 'wind'], [20.62, 42.46, 3, 'zat']]) { const p = mp(lo, la); for (let i = 0; i < n; i++) mini[key].push(turbine(mapTop, p.x + (i - (n - 1) / 2) * 1.5, MY, p.z + (i % 2) * 0.7, 0.42, 2.5)); }
mini.hydro = new THREE.Group(); mapTop.add(mini.hydro);
for (const [lo, la, s] of [[20.66, 42.94, 1], [20.3, 42.55, 0.6]]) { const p = mp(lo, la); const lake = at(cyl(1.5 * s, 1.5 * s, 0.1, '#4FA7CC', { ol: 2.5 }), p.x - 0.5 * s, MY + 0.05, p.z); lake.scale.z = 0.62; mini.hydro.add(lake, at(box(0.3, 0.75, 1.5 * s, '#E9E4D8', { ol: 2.5 }), p.x + 1.0 * s, MY + 0.37, p.z)); }
mini.solar = new THREE.Group(); mapTop.add(mini.solar);
for (const [lo, la] of [[20.45, 42.45], [21.5, 42.54]]) { const p = mp(lo, la); for (let i = 0; i < 3; i++) { const b = box(1.25, 0.08, 0.8, '#2F5D9B', { ol: 2.5 }); b.position.set(p.x + (i - 1) * 1.4, MY + 0.42, p.z); b.rotation.x = 0.55; mini.solar.add(b); } }
export const LINES = {}; mini.lines = new THREE.Group(); mapTop.add(mini.lines);
for (const [k, pts] of Object.entries({ AL: [[21.07, 42.69], [20.75, 42.45], [20.35, 42.25], [19.95, 42.02]], MK: [[21.07, 42.69], [21.16, 42.36], [21.3, 42.12], [21.45, 41.9]], ME: [[21.07, 42.69], [20.6, 42.74], [20.1, 42.72], [19.72, 42.8]], RS: [[21.07, 42.69], [21.3, 42.85], [21.5, 42.98], [21.8, 43.22]] })) {
  const cv = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => mp(lo, la, 0.75))); LINES[k] = cv;
  mini.lines.add(M(new THREE.TubeGeometry(cv, 40, 0.13, 6, false), tm('#3B3A45'), { ol: 0, recv: false }));
  for (let i = 1; i <= 7; i++) { const p = cv.getPointAt(i / 7.3), y0 = inside(p.x, p.z) ? MY : TY; mini.lines.add(at(cyl(0.09, 0.09, p.y - y0, '#3B3A45', { ol: 0 }, 6), p.x, (p.y + y0) / 2, p.z)); } }
export const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), basic('#FFFFFF'), 48); pulses.frustumCulled = false; outline(pulses, 2.5); mapTop.add(pulses);
{ const c = new THREE.Color(); for (let i = 0; i < 48; i++) pulses.setColorAt(i, c.set(i < 36 ? '#FFC62E' : '#4D8FD6')); }
export function pulsesUpdate(t, kin = 1, kout = 1, only = null) {   // 36 inbound (9 per line), 12 outbound (3 per line)
  Object.keys(LINES).forEach((k, li) => { const cv = LINES[k];
    for (let j = 0; j < 9; j++) { const u = ((t * 0.16 + j / 9 + li * 0.07) % 1 + 1) % 1, s = 0.46 * kin * sstep(u / 0.06) * sstep((1 - u) / 0.06) * (only && only !== k ? 0 : 1); m4.compose(cv.getPointAt(1 - u), q4.identity(), V(s, s, s)); pulses.setMatrixAt(li * 9 + j, m4); }
    for (let j = 0; j < 3; j++) { const u = ((t * 0.16 + j / 3 + li * 0.13) % 1 + 1) % 1, s = 0.4 * kout * sstep(u / 0.06) * sstep((1 - u) / 0.06) * (only && only !== k ? 0 : 1); const p = cv.getPointAt(u); p.y += 0.75; m4.compose(p, q4.identity(), V(s, s, s)); pulses.setMatrixAt(36 + li * 3 + j, m4); } });
  pulses.instanceMatrix.needsUpdate = true; }
mini.gate = new THREE.Group(); { const p = LINES.MK.getPointAt(0.93); mini.gate.position.set(p.x, TY, p.z); mapTop.add(mini.gate); mini.gatePos = p;
  mini.gate.add(at(box(0.35, 2.6, 0.35, '#F4F1EA', { ol: 3 }), -1.7, 1.3, 0), at(box(0.35, 2.6, 0.35, '#F4F1EA', { ol: 3 }), 1.7, 1.3, 0), at(box(3.6, 0.3, 0.3, RED, { ol: 3 }), 0, 1.75, 0.1), at(box(3.3, 1.9, 0.2, '#2B4C9B', { ol: 3 }), 0, 3.7, 0));
  const st = basic('#FFD23F'); for (let i = 0; i < 12; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), st); s.position.set(Math.cos(i / 12 * 6.283) * 0.62, 3.7 + Math.sin(i / 12 * 6.283) * 0.62, 0.13); mini.gate.add(s); } }

// ================================================================ PLANT (1 unit = 10 m)
export const pl = { units: {}, towers: {} };
farHills(PLANT, '#9DBA78', 23);
PLANT.add(at(box(100, 0.3, 34, '#D2CBBB', { ol: 0, cast: false }), -2, 0.15, 0));
export const plPuffs = Puffs(PLANT, 110);
const lampG = new THREE.SphereGeometry(0.5, 12, 8);
function unit(name, x, w, h, d, col, live = true) { const mat = toon(col), b = box(w, h, d, mat, { ol: 5 }); b.position.set(x, h / 2, -1); PLANT.add(b);
  PLANT.add(at(box(w * 0.78, 0.5, 0.1, '#56646F', { ol: 0 }), x, h * 0.8, -1 + d / 2 + 0.03), at(box(w * 0.78, 0.5, 0.1, '#56646F', { ol: 0 }), x, h * 0.55, -1 + d / 2 + 0.03));
  const lamp = new THREE.Mesh(lampG, basic('#5FCB6B')); outline(lamp, 3); lamp.position.set(x, h + 0.55, -1); lamp.visible = live; PLANT.add(lamp);
  pl.units[name] = { name, x, h, mat, col: new THREE.Color(col), lamp, top: V(x, h + 1.1, -1), on: 1, src: [] }; return pl.units[name]; }
// Kosovo B
unit('B1', -27.2, 5.4, 8.2, 5.6, '#B9C6CF'); unit('B2', -20.6, 5.4, 8.2, 5.6, '#B9C6CF');
PLANT.add(at(box(15, 3.4, 4.2, '#E9E0C8', { ol: 5 }), -23.9, 1.7, 4.4), at(box(15.06, 0.55, 4.26, '#3F6FA8', { ol: 0 }), -23.9, 2.75, 4.4), at(stack(21, 1.05), -23.9, 0, -7.5));
pl.towers.B1 = at(ctower(10.5, 4.3), -40, 0, -6); pl.towers.B2 = at(ctower(10.5, 4.3), -37.5, 0, 6); PLANT.add(pl.towers.B1, pl.towers.B2);
const steam = (p, s) => plPuffs.add(p, { n: 8, life: 6, rise: 2.0, size: s, drift: [1.0, 0.15] });
pl.units.B1.src.push(steam(V(-40, 10.6, -6), 2.3)); pl.units.B2.src.push(steam(V(-37.5, 10.6, 6), 2.3));
pl.bStack = plPuffs.add(V(-23.9, 21.4, -7.5), { n: 9, life: 6, rise: 2.4, size: 1.25, drift: [1.5, 0.2], color: '#A29FA6' });
// Kosovo A
[['A1', 6.4], ['A2', 11.1], ['A3', 15.8], ['A4', 20.5], ['A5', 25.2]].forEach(([n, x], i) => { const live = i > 1; unit(n, x, 3.9, live ? 6.4 : 5.6, 4.8, live ? '#CDBEA9' : '#9A8D83', live);
  PLANT.add(at(stack(live ? 13.5 : 10.5, 0.62, live ? 2 : 0, live ? '#D9D3C5' : '#A89D92'), x, 0, -6.2));
  if (live) pl.units[n].src.push(plPuffs.add(V(x, 13.8, -6.2), { n: 7, life: 5, rise: 2.2, size: 0.85, drift: [1.4, 0.2], color: '#A29FA6' })); });
PLANT.add(at(box(24, 3, 4, '#E9E0C8', { ol: 5 }), 15.8, 1.5, 4.0), at(box(24.06, 0.5, 4.06, '#B5523C', { ol: 0 }), 15.8, 2.45, 4.0));
[['A3', 33.5, -6], ['A4', 35, 3.5], ['A5', 41, -1.5]].forEach(([n, x, z]) => { const t = at(ctower(7.4, 3.1), x, 0, z); PLANT.add(t); pl.towers[n] = t; pl.units[n].src.push(steam(V(x, 7.5, z), 1.6)); });
// coal yard, conveyor, mine
for (const [x, z, s] of [[-6, -5, 1.2], [-1.5, -7.5, 1], [1.5, -4, 0.9]]) PLANT.add(at(M(new THREE.ConeGeometry(2.8 * s, 2.3 * s, 9), tm('#35343B'), { ol: 4 }), x, 1.15 * s + 0.3, z));
const CONV = [V(57, 1.0, 12), V(32, 1.3, 13), V(6, 1.6, 11), V(0.5, 4.2, -3.6)];
for (let i = 0; i < CONV.length - 1; i++) { const m = new THREE.Mesh(sb(CONV[i], CONV[i + 1], 0.28, 1.1), tm('#5A5B63')); m.castShadow = true; outline(m, 3.5); PLANT.add(m);
  const n = Math.ceil(CONV[i].distanceTo(CONV[i + 1]) / 4); for (let k = 0; k <= n; k++) { const p = CONV[i].clone().lerp(CONV[i + 1], k / n); PLANT.add(at(box(0.3, p.y, 0.3, '#5A5B63', { ol: 0 }), p.x, p.y / 2, p.z)); } }
const convCurve = new THREE.CurvePath(); for (let i = 0; i < CONV.length - 1; i++) convCurve.add(new THREE.LineCurve3(CONV[i], CONV[i + 1]));
export const lumps = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.42, 0), toon('#2B2A30'), 26); lumps.frustumCulled = false; lumps.castShadow = true; PLANT.add(lumps);
export function lumpsUpdate(t) { for (let i = 0; i < 26; i++) { const u = ((t * 0.07 + i / 26) % 1 + 1) % 1, p = convCurve.getPointAt(u); p.y += 0.42; const s = sstep(u / 0.03) * sstep((1 - u) / 0.02); m4.compose(p, q4.setFromEuler(new THREE.Euler(i, i * 2, 0)), V(s, s, s)); lumps.setMatrixAt(i, m4); } lumps.instanceMatrix.needsUpdate = true; }
export const MINE = V(64, 0, 9);
{ const cols = ['#4A3F36', '#6E5943', '#877052', '#9F8961', '#A8B57C']; for (let i = 0; i < 5; i++) { const s = new THREE.Shape(), r = 9 + 3 * i; s.absarc(0, 0, 26, -Math.PI * 0.62, Math.PI * 0.62, false); s.absarc(0, 0, r, Math.PI * 0.62, -Math.PI * 0.62, true);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.15, bevelEnabled: false, curveSegments: 26 }); g.rotateX(-Math.PI / 2); PLANT.add(at(M(g, tm(cols[i]), { ol: 4 }), MINE.x, i * 1.15, MINE.z)); }
  const fl = new THREE.Mesh(new THREE.CircleGeometry(11, 30), tm('#2F2E34')); fl.rotation.x = -Math.PI / 2; fl.position.set(MINE.x, 0.33, MINE.z); fl.receiveShadow = true; PLANT.add(fl); }
export const exc = new THREE.Group(); exc.position.set(MINE.x - 0.6, 0.33, MINE.z - 1); PLANT.add(exc);
{ const Y = '#EDB935', D = '#3A3A42'; exc.add(at(box(4.4, 0.8, 1.0, D, { ol: 3.5 }), 0, 0.4, 1.3), at(box(4.4, 0.8, 1.0, D, { ol: 3.5 }), 0, 0.4, -1.3), at(box(3.4, 1.7, 2.8, Y, { ol: 4 }), 0, 1.65, 0), at(box(1.3, 1.1, 1.3, '#F7F4EC', { ol: 3.5 }), -0.6, 3.0, 0.5));
  const R = (a, b, t, c) => { const m = new THREE.Mesh(sb(V(...a), V(...b), t), tm(c)); m.castShadow = true; outline(m, 3.5); exc.add(m); };
  R([0.6, 2.4, 0], [0.6, 6.2, 0], 0.42, Y); R([0.8, 3.0, 0], [7.4, 2.2, 0], 0.55, Y); R([0.4, 3.0, 0], [-4.2, 3.9, 0], 0.5, Y); exc.add(at(box(1.5, 1.4, 1.6, D, { ol: 3.5 }), -4.6, 3.9, 0));
  R([0.6, 6.2, 0], [6.6, 2.6, 0], 0.12, D); R([0.6, 6.2, 0], [-4.2, 4.4, 0], 0.12, D);
  const wh = new THREE.Group(); wh.position.set(8.2, 2.1, 0); exc.add(wh); exc.userData.wheel = wh; const disc = cyl(1.55, 1.55, 0.5, '#C99A2B', { ol: 4 }, 12); disc.rotation.x = Math.PI / 2; wh.add(disc);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, b = box(0.62, 0.62, 0.8, D, { ol: 3 }); b.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0); b.rotation.z = a; wh.add(b); } }
pylons(PLANT, [[-34, 14], [-56, 22], [-80, 30], [-106, 38]], 1.2);
// refurbishment props (hurdles)
export const crane = new THREE.Group(); crane.position.set(13.5, 0, 9); PLANT.add(crane);
{ const Y = '#EDB935'; crane.add(at(box(0.8, 17, 0.8, Y, { ol: 4 }), 0, 8.5, 0), at(box(2.2, 0.5, 2.2, '#5A5B63', { ol: 3 }), 0, 0.25, 0)); const jib = new THREE.Group(); jib.position.y = 17; crane.add(jib); crane.userData.jib = jib;
  jib.add(at(box(15, 0.6, 0.6, Y, { ol: 4 }), 4.5, 0.3, 0), at(box(1.8, 1.3, 1.3, '#5A5B63', { ol: 3 }), -2.4, 0, 0), at(box(1.2, 1.2, 1.2, '#F7F4EC', { ol: 3 }), 0, 1.0, 0), at(box(0.1, 5, 0.1, '#3A3A42', { ol: 0 }), 9.5, -2.5, 0), at(box(1.6, 1.0, 1.0, '#B9C6CF', { ol: 3 }), 9.5, -5.4, 0)); }
export const scaffold = (() => { const p = [], x0 = 13.6, x1 = 27.4, z = 1.9; for (let i = 0; i <= 6; i++) { const x = lerp(x0, x1, i / 6); p.push(sb(V(x, 0, z), V(x, 7.2, z), 0.16)); }
  for (let j = 1; j <= 4; j++) p.push(sb(V(x0, j * 1.8, z), V(x1, j * 1.8, z), 0.16), sb(V(x0, j * 1.8 - 0.1, z + 0.35), V(x1, j * 1.8 - 0.1, z + 0.35), 0.1, 0.7));
  const m = M(mergeGeometries(p), tm('#E59A3A'), { ol: 2.5 }); PLANT.add(m); return m; })();

// ================================================================ TOWN (winter evening)
farHills(TOWN, '#C9D3E6', 41, 300, 9);
export const WINS = []; const winAdd = (x, y, z, w, h, t0) => WINS.push({ x, y, z, w, h, t0 });
TOWN.add(at(box(140, 0.1, 5, '#8B93A8', { ol: 0, cast: false }), 0, 0.05, 6.5));
function house(x, z, w, h, d, col, t0) { const g = new THREE.Group(); g.add(at(box(w, h, d, col, { ol: 4 }), 0, h / 2, 0));
  const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.35, 0); s.lineTo(w / 2 + 0.35, 0); s.lineTo(0, w * 0.34); s.closePath(); const rg = new THREE.ExtrudeGeometry(s, { depth: d + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.6) / 2);
  g.add(at(M(rg, tm('#F6F9FC'), { ol: 4 }), 0, h, 0), at(box(0.6, 1.5, 0.6, '#A65B45', { ol: 3 }), w * 0.26, h + w * 0.2, -d * 0.15), at(box(0.75, 0.22, 0.75, '#F6F9FC', { ol: 0 }), w * 0.26, h + w * 0.2 + 0.8, -d * 0.15), at(box(0.85, 1.6, 0.1, '#6B4A3A', { ol: 0 }), 0, 0.8, d / 2 + 0.03));
  g.position.set(x, 0, z); TOWN.add(g); for (const sx of [-1, 1]) winAdd(x + sx * w * 0.29, h * 0.58, z + d / 2 + 0.06, 0.95, 1.05, t0 + rnd() * 0.5); return g; }
const HC = ['#E7C79E', '#D8A389', '#C7D6BE', '#E4DDCC', '#B5C5D9', '#E3B7A0'];
for (let i = 0; i < 8; i++) house(-35 + i * 10 + (rnd() - 0.5) * 1.5, 13 + (rnd() - 0.5), 5.2 + rnd(), 3.2 + rnd() * 0.5, 4.6, HC[i % 6], 0.2 + Math.abs(i - 3.5) * 0.28);
for (let i = 0; i < 9; i++) house(-40 + i * 10 + (rnd() - 0.5) * 1.5, -2 + (rnd() - 0.5), 5.4 + rnd(), 3.4 + rnd() * 0.6, 4.8, HC[(i + 3) % 6], 0.5 + Math.abs(i - 4) * 0.28);
[[-34, 11, 5], [-17, 14, 6], [0, 12, 5], [17, 15, 6], [34, 11, 5]].forEach(([x, h, cols], bi) => { const w = cols * 1.7 + 0.8; TOWN.add(at(box(w, h, 5, ['#C9BFB2', '#B9C2CC', '#D2C4AE'][bi % 3], { ol: 4 }), x, h / 2, -15), at(box(w + 0.4, 0.35, 5.4, '#F6F9FC', { ol: 0 }), x, h + 0.17, -15));
  for (let r = 0; r < Math.floor((h - 1.2) / 1.9); r++) for (let c = 0; c < cols; c++) winAdd(x + (c - (cols - 1) / 2) * 1.7, 1.6 + r * 1.9, -12.44, 0.9, 1.05, 1.1 + Math.abs(bi - 2) * 0.4 + rnd() * 1.6); });
export const wins = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), basic('#FFFFFF'), WINS.length); wins.frustumCulled = false; TOWN.add(wins);
WINS.forEach((w, i) => { m4.compose(V(w.x, w.y, w.z), q4.identity(), V(w.w, w.h, 1)); wins.setMatrixAt(i, m4); });
{ const off = new THREE.Color('#3C4868'), on = new THREE.Color('#FFD36B'), on2 = new THREE.Color('#FFB85C'), c = new THREE.Color();
  wins.update = (t, t0) => { WINS.forEach((w, i) => { const k = clamp((t - t0 - w.t0) / 0.18); wins.setColorAt(i, c.copy(off).lerp(i % 3 ? on : on2, k)); }); wins.instanceColor.needsUpdate = true; }; }
for (let i = 0; i < 9; i++) { const x = -40 + i * 10; TOWN.add(at(cyl(0.09, 0.12, 4.2, '#4A5068', { ol: 0 }, 6), x, 2.1, 9.4)); const l = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), basic('#FFE9A8')); l.position.set(x, 4.3, 9.4); TOWN.add(l); }
for (let i = 0; i < 16; i++) { const x = -62 + rnd() * 124, z = [20 + rnd() * 5, -8 - rnd() * 3, -22 - rnd() * 8][i % 3], h = 3 + rnd() * 2.2; TOWN.add(at(cyl(0.2, 0.25, 1, '#6B4A3A', { ol: 0 }, 6), x, 0.5, z), at(M(new THREE.ConeGeometry(1.5, h, 7), tm('#5F8F6C'), { ol: 3.5 }), x, 1 + h / 2, z), at(M(new THREE.ConeGeometry(0.85, h * 0.45, 7), tm('#F6F9FC'), { ol: 0 }), x, 1 + h * 0.8, z)); }
pylons(TOWN, [[-70, -30], [-35, -32], [0, -31], [35, -32], [70, -30]], Math.PI / 2);
export const snow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 5, 4), basic('#FFFFFF'), 260); snow.frustumCulled = false; TOWN.add(snow);
{ const S = []; for (let i = 0; i < 260; i++) S.push([-55 + rnd() * 110, rnd() * 26, -28 + rnd() * 60, 1.6 + rnd() * 1.6, rnd() * 6]);
  snow.update = t => { S.forEach((s, i) => { const y = ((s[1] - t * s[3]) % 26 + 26) % 26; m4.makeTranslation(s[0] + Math.sin(t * 0.8 + s[4]) * 0.7, y, s[2]); snow.setMatrixAt(i, m4); }); snow.instanceMatrix.needsUpdate = true; }; }

// ================================================================ RES (renewables landscape)
farHills(RES, '#9DBA78', 67, 340, 11);
export const rs = { wind: [], zat: [], extra: [], fields: [] };
const H1 = { x: -30, z: -18, sx: 30, sy: 10, sz: 14 }, H2 = { x: -3, z: -30, sx: 11, sy: 10, sz: 16 }, H3 = { x: 21, z: -30, sx: 11, sy: 10, sz: 16 }, H4 = { x: 9, z: -58, sx: 40, sy: 15, sz: 16 }, H5 = { x: 48, z: -30, sx: 20, sy: 9, sz: 12 }, H6 = { x: -72, z: -44, sx: 30, sy: 12, sz: 16 }, H7 = { x: 80, z: -56, sx: 30, sy: 13, sz: 15 };
[H1, H5, H6, H7].forEach(h => hillMesh(h, '#93B96C', RES)); [H2, H3].forEach(h => hillMesh(h, '#86AC66', RES)); hillMesh(H4, '#7FA462', RES);
const onHill = (h, x, z) => [x, hy(h, x, z) - 0.25, z];
for (let i = 0; i < 7; i++) { const x = -50 + i * 6.6, z = -18 + (i % 2) * 2.5; rs.wind.push(turbine(RES, ...onHill(H1, x, z), 1, 3)); }
for (let i = 0; i < 12; i++) { const x = 34 + (i % 6) * 5.4 + (i > 5 ? 2.2 : 0), z = -31 + (i > 5 ? 5 : 0); rs.zat.push(turbine(RES, ...onHill(H5, x, z), 0.82, 3)); }
for (let i = 0; i < 9; i++) { const x = -94 + i * 5.2, z = -44 + (i % 2) * 3; rs.extra.push(turbine(RES, ...onHill(H6, x, z), 0.95, 3)); }
for (let i = 0; i < 8; i++) { const x = 62 + i * 5, z = -56 + (i % 2) * 3; rs.extra.push(turbine(RES, ...onHill(H7, x, z), 0.95, 3)); }
for (let i = 0; i < 7; i++) { const x = -18 + i * 9, z = -58 + (i % 2) * 2; rs.extra.push(turbine(RES, ...onHill(H4, x, z), 0.9, 3)); }
// dam
{ const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(3.4, 0); s.lineTo(1.5, 6.6); s.lineTo(0.5, 6.6); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 15, bevelEnabled: false }); g.translate(0, 0, -7.5); g.rotateY(-Math.PI / 2);
  RES.add(at(M(g, tm('#DAD5C8'), { ol: 4.5 }), 9, 0, -25.5)); const sp = box(3, 6.9, 0.14, '#F7FBFD', { ol: 0 }); sp.position.set(9, 3.3, -23.0); sp.rotation.x = -0.28; RES.add(sp);
  const lake = new THREE.Mesh(new THREE.CircleGeometry(17, 30), tm('#4FA7CC')); lake.rotation.x = -Math.PI / 2; lake.position.set(9, 5.6, -41); lake.receiveShadow = true; RES.add(lake);
  RES.add(at(box(3.4, 2.2, 2.4, '#E9E0C8', { ol: 4 }), 13.5, 1.1, -20.3), at(box(3.5, 0.4, 2.5, '#3F6FA8', { ol: 0 }), 13.5, 2.1, -20.3));
  for (const [a, b] of [[[9, -21.5], [9, -6]], [[9, -6], [-3, 8]], [[-3, 8], [-34, 46]]]) { const m = new THREE.Mesh(sb(V(a[0], 0.04, a[1]), V(b[0], 0.04, b[1]), 0.06, 3.2), tm('#4FA7CC')); m.receiveShadow = true; RES.add(m); } }
export const resPuffs = Puffs(RES, 8); resPuffs.add(V(9, 0.4, -21.3), { n: 6, life: 1.6, rise: 0.5, size: 0.75, drift: [0, 1.2] });
// solar fields: 0 = existing, 1..4 = planned
const FIELDS = [[28, 4], [50, 8], [-22, 3], [-44, 10], [9, 12]];
export const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.1, 1.5), toon('#2F5D9B'), FIELDS.length * 24); panels.frustumCulled = false; panels.castShadow = true; outline(panels, 3); RES.add(panels);
export const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1, 0.14), toon('#8A8F98'), FIELDS.length * 24); legs.frustumCulled = false; RES.add(legs);
export function panelsUpdate(t, t0s) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0));
  FIELDS.forEach(([cx, cz], f) => { for (let i = 0; i < 24; i++) { const c = i % 6, r = Math.floor(i / 6), k = t0s[f] === null ? 0 : Math.max(1e-4, pop(t, t0s[f] + i * 0.03, 0.35));
      const p = V(cx + (c - 2.5) * 2.9, 1.0, cz + (r - 1.5) * 2.5); m4.compose(p, q, V(k, k, k)); panels.setMatrixAt(f * 24 + i, m4); m4.compose(V(p.x, 0.5, p.z - 0.2), q4.identity(), V(k, k, k)); legs.setMatrixAt(f * 24 + i, m4); } });
  panels.instanceMatrix.needsUpdate = true; legs.instanceMatrix.needsUpdate = true; }
rs.fieldPos = FIELDS;
export const batts = []; for (let i = 0; i < 10; i++) { const g = new THREE.Group(); g.add(at(box(3.6, 1.5, 1.5, '#F7F4EC', { ol: 3.5 }), 0, 0.85, 0), at(box(3.64, 0.34, 1.54, '#4FB06A', { ol: 0 }), 0, 1.2, 0), at(box(0.5, 0.75, 0.06, '#FFC62E', { ol: 0 }), -1.1, 0.7, 0.78), at(box(3.2, 0.12, 1.2, '#8A8F98', { ol: 0 }), 0, 0.06, 0));
  g.position.set(18 + (i % 5) * 4.4, 0, 20 + Math.floor(i / 5) * 3.2); RES.add(g); batts.push({ g, s: 1 }); }
rs.H = { H1, H5 }; rs.dam = V(9, 6.6, -25.5);

// ================================================================ scenery dressing
dress(PLANT, 70, 91, (x, z) => (z > 18 && Math.abs(x) < 62) || (x > -58 && x < 52 && z > -20 && z < 20) || Math.hypot(x - 64, z - 9) < 31 || (x < -28 && z > 8 && z < 44 && Math.abs((z - 14) - (-(x + 34)) * 0.36) < 7));
const dseg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], u = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz); };
dress(RES, 70, 57, (x, z) => [H1, H2, H3, H4, H5, H6, H7].some(h => ((x - h.x) / (h.sx + 2)) ** 2 + ((z - h.z) / (h.sz + 2)) ** 2 < 1) || FIELDS.some(([cx, cz]) => Math.abs(x - cx) < 15 && z > cz - 9 && z < cz + 26) || (x > 13 && x < 41 && z > 16 && z < 27)
  || dseg(x, z, [9, -22], [9, -6]) < 4 || dseg(x, z, [9, -6], [-3, 8]) < 4 || dseg(x, z, [-3, 8], [-34, 46]) < 4 || (x > 0 && x < 20 && z < -16 && z > -26), 110, -40, 40);
