// Sets for the Kosovo finance film: coin stacks with sector icons, a bank street, a globe, a car and a shop, a phone and a card terminal.
import * as C from '../../engine/core.js';
import { tm, at, box, cyl, m4, q4, rnd } from '../../engine/parts/kit.js';
import { phone } from '../../engine/parts/devices.js';
const { THREE, V, scene, M, basic, outline, rod, clamp } = C;

export const GOLD = '#F4BE42', STONE = '#F3EAD6', STONE2 = '#E2D5B8', ROOF = '#27496D', PINK = '#F0A3B4', GLASS = '#BFE0EA';
const prism = (w, h, d, col, o) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return M(g, tm(col), o); };

// ---------------------------------------------------------------- coins
// A pool of identical coins drawn as one instanced mesh. put() places coin i; done() uploads the frame's positions.
// shadow = false for coins that fly: small shadows sliding over walls and ground read as flicker.
// A coin with k = 0 is parked out of sight: outlines keep a constant screen width, so scaling alone would leave a dot.
export function coinPool(parent, n, r = 1.9, h = 0.2, shadow = true, col = GOLD) {
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, h, 28), tm(col), n); mesh.frustumCulled = false; mesh.castShadow = shadow; mesh.receiveShadow = true; outline(mesh, 2.4); parent.add(mesh);
  const jit = [...Array(n)].map(() => [(rnd() - 0.5) * 0.07 * r, (rnd() - 0.5) * 0.07 * r, rnd() * 6.28]), e = new THREE.Euler(), p = V(0, 0, 0), s = V(1, 1, 1);
  return { mesh, n, r, h, jit,
    put(i, x, y, z, k = 1, rx = 0, ry = null) { p.set(x, k > 0 ? y : -1e4, z); s.setScalar(Math.max(1e-4, k)); m4.compose(p, q4.setFromEuler(e.set(rx, ry ?? jit[i][2], 0)), s); mesh.setMatrixAt(i, m4); },
    done() { mesh.instanceMatrix.needsUpdate = true; } };
}
// Coins i0 .. i0+count-1 as a stack at (x, z). g runs 0 to 1 as the stack is dealt out; a few coins are always in the air. Returns the height landed so far.
const FLIGHT = 5;
export function stack(pool, i0, count, x, z, g, y0 = 0) { const kk = clamp(g) * (count + FLIGHT);
  for (let j = 0; j < count; j++) { const u = clamp((kk - j) / FLIGHT), i = i0 + j; pool.put(i, x + pool.jit[i][0], y0 + pool.h * (j + 0.5) + (1 - u * u) * 4.5, z + pool.jit[i][1], u > 0 ? 1 : 0); }
  return y0 + pool.h * clamp(kk - FLIGHT, 0, count); }

// ---------------------------------------------------------------- models (each about 3 units wide; scale the group for larger ones)
export function temple(n = 4) { const g = new THREE.Group(), w = 3.4, d = 2.6;
  g.add(at(box(w + 0.4, 0.14, d + 0.4, STONE2), 0, 0.07, 0), at(box(w, 0.16, d, STONE), 0, 0.22, 0), at(box(w - 0.5, 1.5, d - 0.9, STONE2, { ol: 0 }), 0, 1.05, -0.2),
    at(box(0.5, 0.95, 0.06, ROOF, { ol: 0 }), 0, 0.78, d / 2 - 0.63), at(box(w, 0.26, d, STONE), 0, 1.93, 0), at(prism(w + 0.2, 0.9, d + 0.1, ROOF), 0, 2.06, 0));
  for (let i = 0; i < n; i++) g.add(at(cyl(0.15, 0.17, 1.5, '#FFFFFF', { ol: 2.5 }, 12), -w / 2 + 0.3 + i * (w - 0.6) / (n - 1), 1.05, d / 2 - 0.3));
  return g; }
export function pig() { const g = new THREE.Group(), body = M(new THREE.SphereGeometry(1, 20, 14), tm(PINK)); body.scale.set(1.35, 1, 1.05); body.position.y = 1.35; g.add(body);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(cyl(0.17, 0.2, 0.6, PINK, {}, 10), sx * 0.7, 0.3, sz * 0.5));
  const sn = cyl(0.3, 0.34, 0.3, '#E88FA3', {}, 14); sn.rotation.z = Math.PI / 2; g.add(at(sn, 1.42, 1.3, 0));
  for (const sz of [-1, 1]) { const e = M(new THREE.ConeGeometry(0.22, 0.42, 4), tm('#E88FA3')); e.position.set(0.75, 2.3, sz * 0.45); e.rotation.z = -0.3; g.add(e);
    g.add(at(M(new THREE.SphereGeometry(0.08, 8, 6), basic('#2B2A33'), { ol: 0 }), 1.13, 1.68, sz * 0.52)); }
  g.add(at(box(0.7, 0.05, 0.12, '#2B2A33', { ol: 0 }), -0.1, 2.36, 0)); return g; }
export function shop() { const g = new THREE.Group(); g.add(at(box(2.9, 1.7, 2.0, STONE), 0, 0.85, -0.1), at(box(3.1, 0.14, 2.2, STONE2), 0, 1.77, -0.1), at(box(0.55, 1.0, 0.06, ROOF, { ol: 0 }), -0.75, 0.5, 0.92), at(box(1.1, 0.7, 0.06, GLASS, { ol: 0 }), 0.55, 0.85, 0.92));
  for (let i = 0; i < 6; i++) { const s = box(0.5, 0.07, 0.8, i % 2 ? '#FFFFFF' : '#D9503F', { ol: 0 }); s.rotation.x = 0.45; g.add(at(s, -1.25 + i * 0.5, 1.5, 1.2)); }
  return g; }
export function shield(col = '#3E9A5B') { const s = new THREE.Shape(); s.moveTo(-1, 1.25); s.lineTo(1, 1.25); s.lineTo(1, 0.15); s.quadraticCurveTo(0.95, -0.9, 0, -1.35); s.quadraticCurveTo(-0.95, -0.9, -1, 0.15); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -0.18); const g = new THREE.Group(); g.add(M(geo, tm(col), { ol: 3.5 }));
  const w = basic('#FFFFFF'); g.add(rod(V(-0.5, 0.05, 0.2), V(-0.12, -0.38, 0.2), 0.09, w), rod(V(-0.12, -0.38, 0.2), V(0.55, 0.5, 0.2), 0.09, w)); return g; }
export function house(col = STONE, roof = '#C4573F') { const g = new THREE.Group(); g.add(at(box(3, 2.2, 3, col), 0, 1.1, 0), at(prism(3.5, 1.4, 3.4, roof), 0, 2.2, 0), at(box(0.6, 1.1, 0.06, '#7A5236', { ol: 0 }), -0.6, 0.55, 1.52), at(box(0.8, 0.7, 0.06, GLASS, { ol: 0 }), 0.7, 1.25, 1.52)); return g; }
export function office(h = 6, col = '#DCE6EE') { const g = new THREE.Group(); g.add(at(box(4, h, 3.6, col), 0, h / 2, 0), at(box(4.3, 0.2, 3.9, STONE2), 0, h + 0.1, 0));
  for (let r = 0; r < Math.floor((h - 0.6) / 1.3); r++) for (let c = 0; c < 3; c++) g.add(at(box(0.8, 0.7, 0.06, '#7FB3D5', { ol: 0 }), -1.2 + c * 1.2, 1 + r * 1.3, 1.82)); return g; }
export function tree(s = 1) { const g = new THREE.Group(); g.add(at(cyl(0.16, 0.2, 0.9, '#8A6A45', { ol: 2 }, 8), 0, 0.45, 0), at(M(new THREE.ConeGeometry(0.95, 1.7, 8), tm('#6FA869')), 0, 1.6, 0), at(M(new THREE.ConeGeometry(0.7, 1.3, 8), tm('#84BC78')), 0, 2.5, 0)); g.scale.setScalar(s); return g; }
const Z = V(0, 0, 1);
export function globe(R = 4.5) { const g = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group(); tilt.rotation.z = 0.38; tilt.position.y = R + 1.5; tilt.add(spin); g.add(tilt);
  spin.add(M(new THREE.SphereGeometry(R, 36, 24), tm('#5BA7D9'), { ol: 4 })); const land = tm('#84BC78'), blob = new THREE.SphereGeometry(1, 12, 8);
  for (const [lat, lon, a, b] of [[0.75, 0.2, 1.5, 1.0], [0.45, 0.55, 1.2, 1.4], [0.1, 0.5, 1.0, 1.3], [-0.45, 0.6, 0.8, 1.1], [0.7, 1.8, 1.9, 1.1], [0.35, 2.3, 1.3, 1.0], [0.6, -1.6, 1.5, 1.2], [0.2, -1.4, 0.8, 0.7], [-0.3, -1.1, 0.9, 1.4], [-0.5, 2.7, 1.0, 0.7], [0.85, 3.4, 1.6, 0.8], [0.5, 3.9, 1.1, 1.0]]) {
    const m = new THREE.Mesh(blob, land), n = V(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)); m.position.copy(n).multiplyScalar(R * 0.965); m.quaternion.setFromUnitVectors(Z, n); m.scale.set(a * R * 0.2, b * R * 0.2, R * 0.07); spin.add(m); }
  g.add(at(cyl(0.35, 0.5, 1.5, STONE2, {}, 12), 0, 0.9, 0), at(cyl(2.2, 2.4, 0.3, ROOF, {}, 24), 0, 0.15, 0)); return { g, spin }; }
export function car(col = '#D9503F') { const g = new THREE.Group(); g.add(at(box(3.8, 0.8, 1.7, col), 0, 0.85, 0), at(box(2.0, 0.7, 1.5, GLASS), -0.2, 1.6, 0), at(box(2.15, 0.12, 1.6, col), -0.2, 2.0, 0));
  for (const sx of [-1.15, 1.15]) for (const sz of [-0.86, 0.86]) { const w = cyl(0.45, 0.45, 0.3, '#2B2A33', {}, 16); w.rotation.x = Math.PI / 2; g.add(at(w, sx, 0.45, sz)); }
  for (const sz of [-0.5, 0.5]) g.add(at(box(0.08, 0.25, 0.4, basic('#FFE9A6'), { ol: 0 }), 1.92, 0.95, sz)); return g; }
export function terminal() { const g = new THREE.Group(), b = new THREE.Group(); b.rotation.x = -1.0; b.position.y = 0.75; g.add(b);
  const scr = at(box(1.2, 0.8, 0.02, basic('#CDEFD6'), { ol: 0 }), 0, 0.65, 0.235); b.add(box(1.5, 2.5, 0.45, '#3A3941', { ol: 3 }), scr);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) b.add(at(box(0.26, 0.2, 0.04, r === 3 && c === 2 ? '#3E9A5B' : STONE, { ol: 0 }), -0.4 + c * 0.4, -0.05 - r * 0.3, 0.24));
  return { g, scr }; }
export function payCard() { const g = new THREE.Group(); g.add(box(1.7, 0.04, 1.07, ROOF, { ol: 3 }), at(box(0.3, 0.02, 0.24, GOLD, { ol: 0 }), -0.5, 0.03, -0.1), at(box(1.7, 0.02, 0.16, '#F4F1EA', { ol: 0 }), 0, 0.03, 0.33)); return g; }

// ---------------------------------------------------------------- sets, placed far apart so only one is ever in view
const mk = x => { const g = new THREE.Group(); g.position.x = x; g.visible = false; scene.add(g); return g; };
export const SECT = mk(0), GROW = mk(300), BANK = mk(600), PENS = mk(900), OTH = mk(1200), PAY = mk(1500), SETS = [SECT, GROW, BANK, PENS, OTH, PAY];
const trees = (set, list) => list.forEach(([x, z, s]) => set.add(at(tree(s), x, 0, z)));
const disc = (set, x, z, r, col) => set.add(at(cyl(r, r + 0.12, 0.12, col, { ol: 2.5 }, 32), x, 0.06, z));

// Four sectors: one coin stack each, with its icon riding on top.
export const SX = [-13.5, -4.5, 4.5, 13.5], SCOL = ['#27496D', '#C2578A', '#D9503F', '#3E9A5B'];
SX.forEach((x, i) => disc(SECT, x, 0, 2.5, SCOL[i]));
export const sectCoins = coinPool(SECT, 84);
const sh0 = shield(); sh0.position.y = 1.45;
export const ICONS = [temple(4), pig(), shop(), new THREE.Group().add(sh0)]; ICONS.forEach(i => SECT.add(i));
trees(SECT, [[-22, -10, 1.7], [-17, -13, 1.3], [-9, -11, 1.6], [-1, -13, 1.2], [8, -11, 1.7], [15, -13, 1.3], [21, -10, 1.6], [26, -14, 1.2], [-27, -14, 1.3]]);

// Five years of totals.
export const GX = [-12, -6, 0, 6, 12]; GX.forEach(x => disc(GROW, x, 0, 2.2, ROOF));
export const growCoins = coinPool(GROW, 201, 1.7);
trees(GROW, [[-21, -9, 1.6], [-15, -12, 1.2], [15, -12, 1.3], [21, -9, 1.7], [0, -14, 1.3]]);

// The bank street: savers on the left, borrowers on the right.
export const bankT = temple(6); bankT.scale.setScalar(3.2); bankT.position.z = -2; BANK.add(bankT);
const h1 = at(house(), -15.5, 0, -1), h2 = at(house('#F6E3C5', '#B8603F'), -11.5, 0, 4.5), sp = at(shop(), 13, 0, 3), of = at(office(6.5), 17.5, 0, -4);
h1.scale.setScalar(1.25); h1.rotation.y = 0.3; h2.rotation.y = 0.45; sp.scale.setScalar(2.1); sp.rotation.y = -0.3; BANK.add(h1, h2, sp, of);
trees(BANK, [[-20, -6, 1.6], [-8.5, -7, 1.3], [9, -8, 1.5], [22, 2, 1.4], [-20, 5, 1.2], [-24, -12, 1.5], [25, -12, 1.4]]);
export const flyCoins = coinPool(BANK, 28, 0.5, 0.12, false);
export const bigShield = shield(); bigShield.scale.setScalar(1.7); bigShield.position.set(0, 12.6, 0); BANK.add(bigShield);

// Pensions: a savings pig and the world it invests in.
export const bigPig = pig(); bigPig.scale.setScalar(2.6); bigPig.position.set(-9, 0, 0); bigPig.rotation.y = -0.3; PENS.add(bigPig);
export const GLOBE = globe(4.2); GLOBE.g.position.set(9, 0, 0); PENS.add(GLOBE.g);
export const pensCoins = coinPool(PENS, 16, 0.5, 0.12, false);
trees(PENS, [[-19, -8, 1.5], [0, -11, 1.3], [19, -8, 1.6], [-24, -13, 1.3], [24, -13, 1.2]]);

// Insurance (a car under a shield) and microfinance (a small shop with a few coins).
export const theCar = car(); theCar.scale.setScalar(1.7); theCar.position.set(-8, 0, 1); theCar.rotation.y = 0.45; OTH.add(theCar);
export const carShield = shield(); carShield.scale.setScalar(1.25); OTH.add(carShield);
const sp2 = at(shop(), 8, 0, 0); sp2.scale.setScalar(2.3); sp2.rotation.y = -0.2; OTH.add(sp2);
export const othCoins = coinPool(OTH, 8, 0.8, 0.16);
trees(OTH, [[-16, -6, 1.5], [0, -9, 1.4], [16, -6, 1.6], [-21, -11, 1.2], [21, -11, 1.3]]);

// Payments: a phone, a card and a terminal.
export const ph = phone(); ph.g.scale.setScalar(2.6); ph.g.position.set(-0.3, 2.55, 0); ph.g.rotation.set(-0.16, 0.22, 0); PAY.add(ph.g);
export const TERM = terminal(); TERM.g.scale.setScalar(1.35); TERM.g.position.set(4.4, 0, 0.5); TERM.g.rotation.y = -0.4; PAY.add(TERM.g);
export const theCard = payCard(); theCard.traverse(o => { o.castShadow = false; }); PAY.add(theCard);
