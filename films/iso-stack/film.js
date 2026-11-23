// Isometric demo: a web request travels down a stack of layers and the page comes back up.
// Shows the isometric camera (isoKeys), the three-tone light (SUNISO), a stack that is dealt out, pulled apart and closed again.
import * as C from '../../engine/core.js';
import { NAVY, PAPER, label, header, footer } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, at as onScreen, play, loadJSON, SUNISO } from '../../engine/stage.js';
import { at, box, cyl } from '../../engine/parts/kit.js';
import { slab, grid, lift, drop } from '../../engine/parts/iso.js';
const { THREE, scene, toon, basic, M, clamp, sstep, lerp, isoKeys } = C;
const CUES = await loadJSON('./cues.json', import.meta.url);
const E = { ...ENV.studio, ground: '#F4F0E6' }, WHITE = new THREE.Color('#FFFFFF');

// ---------------------------------------------------------------- the set: four layers, listed bottom to top
const SET = new THREE.Group(); scene.add(SET); const FR = frameOf(SET); SET.add(grid(16, 2));
const LAYERS = [{ n: 'Database', role: 'keeps the data', col: '#D9503F' }, { n: 'Application', role: 'builds the page', col: '#3E9A5B' }, { n: 'Cache', role: 'holds ready-made copies', col: '#5BA7D9' }, { n: 'Browser', role: 'asks for the page', col: '#F4BE42' }];
const S = 10, PITCH = 2.0, GAP = 3.0, BASE = LAYERS.map((_, i) => 0.05 + i * PITCH), CREAM = '#F3EAD6';
const parts = LAYERS.map(L => { const g = new THREE.Group(); L.mat = toon(L.col); L.c0 = new THREE.Color(L.col); g.add(slab(S, S, 0.7, L.mat)); SET.add(g); return g; });
for (const x of [-3, 0, 3]) {
  parts[0].add(at(cyl(1.1, 1.1, 1.0, CREAM, {}, 24), x, 1.2, 0));                                                                   // database: disks
  parts[1].add(at(box(2.2, 1.0, 3.6, CREAM), x, 1.2, 0), at(box(1.4, 0.16, 0.06, basic('#3E9A5B'), { ol: 0 }), x, 1.3, 1.83));    // application: servers
  for (const z of [-1.6, 1.6]) parts[2].add(at(box(1.6, 0.9, 1.6, '#FFFFFF'), x, 1.15, z));                                       // cache: stored copies
}
parts[3].add(at(box(7.6, 0.25, 5.6, '#FFFFFF'), 0, 0.825, 0), at(box(7.6, 0.27, 0.9, NAVY, { ol: 0 }), 0, 0.83, -2.35));          // browser: an empty window
const page = [at(box(3.0, 0.3, 3.2, '#5BA7D9', { ol: 2 }), -1.9, 1.1, 0.5), ...[-0.6, 0.5, 1.6].map(z => at(box(3.0, 0.3, 0.6, '#CFC8B8', { ol: 2 }), 1.9, 1.1, z))];
parts[3].add(...page);
// Only the bottom layer casts a shadow. In a stack that is pulled apart, upper layers would otherwise darken everything beneath them.
parts.slice(1).forEach(p => p.traverse(o => { o.castShadow = false; }));
const packet = M(new THREE.BoxGeometry(1.1, 1.1, 1.1), basic('#FFFFFF'), { ol: 4 }); packet.castShadow = false; SET.add(packet);       // moving and small: no shadow
const RX = 5.7, RZ = 5.7, rail = box(0.14, 1, 0.14, '#B9B2A2', { ol: 0 }); rail.castShadow = false; SET.add(rail);

// ---------------------------------------------------------------- staging
const rest = (i, gap) => BASE[i] + i * gap, level = (i, gap) => rest(i, gap) + 1.15;      // where layer i sits, and where the packet stops beside it
const bump = (t, t0, d = 0.7) => Math.sin(Math.PI * clamp((t - t0) / d));
// Places everything for one frame. gap opens the stack; hits = [[layer, when]] makes a layer rise a little and brighten as the packet reaches it.
function stage(t, gap, hits = [], drops) {
  env(E); aim(FR.rel(0, 7, 0), 26, SUNISO); lift(parts, BASE, gap); if (drops) parts.forEach((p, i) => { p.position.y += drops[i]; });
  LAYERS.forEach((L, i) => { const k = Math.max(0, ...hits.filter(h => h[0] === i).map(h => bump(t, h[1]))); parts[i].position.y += 0.45 * k; L.mat.color.copy(L.c0).lerp(WHITE, 0.4 * k); });
  const top = level(3, gap) + 3; rail.visible = gap > 0.5; rail.scale.y = top; rail.position.set(RX, top / 2, RZ);
}
// Piecewise path through [time, value] keys, eased between them.
const track = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], sstep((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]))); return keys[keys.length - 1][1]; };
// Layer names, pinned beside each layer's resting place (not its lifted one, so they hold still while a layer pulses).
function tags(t, t0, a = 1) { if (a <= 0) return; LAYERS.forEach((L, i) => { const P = onScreen(SET, -S / 2, rest(i, GAP) + 0.35, S / 2), tt = t0 + (3 - i) * 0.15;
    label(L.n, P.x - 44, P.y - 16, t, tt, { align: 'r', size: 38 }); label(L.role, P.x - 44, P.y + 46, t, tt + 0.15, { align: 'r', size: 25, bg: PAPER }); }); }
const STEPS = ['Request leaves the browser', 'Cache looks for a copy', 'Application builds the page', 'Database returns the data', 'The page returns to the screen'];
const step = (i, t, t0) => label(`${i + 1}   ${STEPS[i]}`, 1300, 330 + i * 92, t, t0, { align: 'l', size: 32, bg: i === 4 ? '#FFE9A6' : '#FFFFFF' });
const OPEN = { l: [0, 8.2, 0], d: 12.6 }, CLOSED = { l: [0, 2.0, 0], d: 8.6 };

// ---------------------------------------------------------------- scenes
function stack(t, D, q, gt) {
  const gap = GAP * sstep((t - q[1] - 0.2) / 1.2); stage(t, gap, [], LAYERS.map((_, i) => drop(t, 0.3 + i * 0.28, 0.6, 9))); packet.visible = false; page.forEach(p => { p.visible = false; });
  isoKeys(t, [{ t: 0, ...CLOSED }, { t: q[1] + 0.2, ...CLOSED }, { t: q[1] + 1.5, ...OPEN }], FR); finish();      // the camera has settled before the pinned names appear
  tags(t, q[1] + 1.7); header('Opening a web page', 'What happens between the click and the page', t);
}
function down(t, D, q, gt) {
  const arrive = [q[0] + 0.9, q[1] + 1.0, q[2] + 0.9, q[3] + 0.9], top = level(3, GAP) + 3;
  stage(t, GAP, arrive.map((a, i) => [3 - i, a])); page.forEach(p => { p.visible = false; });
  packet.visible = t > q[0] - 0.1; packet.position.set(RX, track(t, [[q[0] + 0.1, top], [arrive[0], level(3, GAP)], [q[1] + 0.3, level(3, GAP)], [arrive[1], level(2, GAP)], [q[2] + 0.2, level(2, GAP)], [arrive[2], level(1, GAP)], [q[3] + 0.2, level(1, GAP)], [arrive[3], level(0, GAP)]]), RZ); packet.rotation.y = gt * 1.5;
  isoKeys(t, [{ t: 0, ...OPEN }], FR); finish();
  tags(t, -9); arrive.forEach((a, i) => step(i, t, a)); header('Opening a web page', 'The request goes down', t);
}
function up(t, D, q, gt) {
  const arrive = [1.1, 1.75, 2.4], home = 3.2, close = q[1] + 0.1, gap = GAP * (1 - sstep((t - close) / 1.2));
  stage(t, gap, [[0, 0.2], ...arrive.map((a, i) => [i + 1, a])]);
  const k = sstep((t - arrive[2] - 0.2) / (home - arrive[2] - 0.2));                                               // from the rail onto the browser window
  packet.visible = t < home + 0.15; packet.position.set(lerp(RX, 0, k), track(t, [[0.5, level(0, GAP)], [arrive[0], level(1, GAP)], [arrive[1], level(2, GAP)], [arrive[2], level(3, GAP)]]) + 0.3 * k, lerp(RZ, 0, k)); packet.rotation.y = gt * 1.5;
  page.forEach((p, i) => { const h = drop(t, home + i * 0.12, 0.5, 1.6); p.visible = h < 100; p.position.y = 1.1 + (h < 100 ? h : 0); });
  isoKeys(t, [{ t: 0, ...OPEN }, { t: close, ...OPEN }, { t: close + 1.4, ...CLOSED }], FR); finish();
  tags(t, -9, t < close - 0.3 ? 1 : 0); if (t < close - 0.3) { for (let i = 0; i < 4; i++) step(i, t, -9); step(4, t, arrive[0] - 0.4); }
  label('Down as a request, back up as a page', 960, 975, t, close + 1.5, { align: 'c', size: 44, bg: '#FFE9A6' });
  header('Opening a web page', 'The answer comes back up', t); footer('An illustration of the idea. No figures are claimed.', t, close + 2.0);
}

play(['stack', 'down', 'up'], CUES, { stack, down, up }, { motion: 'bouncy', transition: 'fade' });
