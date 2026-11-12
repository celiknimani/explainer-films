// The Liburna: engineering film about the Illyrian warship (anatomy, sewn planks, oars, bireme, ram).
import * as C from './engine.js';
const { THREE, V, W, H, scene, camera, renderer, clamp, sstep, ease, pop, lerp, PAL, toon, basic, M, outline, proj, camKeys, sec, hullPoint, hullGeo, tube, rod, segMatrix, figure } = C;
const CUES = await (await fetch(new URL('./cues.json', import.meta.url))).json();
const ORDER = ['title', 'anatomy', 'sewn', 'oars', 'bireme', 'ram', 'outro'];
const out = document.getElementById('out'), ctx = out.getContext('2d');
const INK = '#2B2A33', PAPER = '#F6EFE0', NAVY = '#27496D', RED = '#D9503F', SEA = '#2E8C9B', SEA2 = '#1F6F7E', FOAM = '#DDF2F2';

// =============================================================== 2D overlay helpers
const font = (w, s) => { ctx.font = `${w} ${s}px Inter, sans-serif`; };
function text(s, x, y, size, color = INK, w = 600, a = 1, align = 'left', halo = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; font(w, size); ctx.textAlign = align;
  if (halo) { ctx.lineJoin = 'round'; ctx.lineWidth = halo; ctx.strokeStyle = PAPER; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
function pill(s, x, y, o = {}) {
  const { a = 1, size = 34, align = 'l', bg = '#FFFFFF', fg = INK, scale = 1 } = o; if (a <= 0 || scale <= 0) return;
  const lines = s.split('\n'); font(600, size); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 44, h = lines.length * size * 1.28 + 26;
  const x0 = align === 'l' ? x : align === 'c' ? x - w / 2 : x - w;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x0 + w / 2, y); ctx.scale(scale, scale); ctx.translate(-w / 2, -h / 2);
  ctx.beginPath(); ctx.roundRect(5, 7, w, h, 18); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = fg; ctx.textAlign = 'left'; lines.forEach((l, i) => ctx.fillText(l, 22, 13 + size * 0.95 + i * size * 1.28)); ctx.restore();
}
const label = (s, x, y, t, t0, o = {}) => { const k = pop(t, t0, 0.35); if (k > 0 && (o.t1 === undefined || t < o.t1)) pill(s, x, y, { ...o, scale: k }); };
function call(s, P, lx, ly, t, t0, o = {}) {   // P: screen anchor
  if (o.t1 !== undefined && t > o.t1) return; const a = ease(t, t0, 0.25); if (a <= 0 || !P.ok) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x + (lx - P.x) * a, P.y + (ly - P.y) * a); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
  const r = 11 * pop(t, t0, 0.3); ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, 7); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  const ring = clamp((t - t0) / 0.6); if (ring > 0 && ring < 1) { ctx.globalAlpha = 1 - ring; ctx.beginPath(); ctx.arc(P.x, P.y, 11 + 50 * ring, 0, 7); ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.stroke(); }
  ctx.restore(); label(s, lx, ly, t, t0 + 0.12, o);
}
function header(title, sub, t) {
  const a = ease(t, 0.3, 0.45); if (a <= 0) return; font(800, 52); const w = Math.max(ctx.measureText(title).width, sub ? (font(500, 27), ctx.measureText(sub).width) : 0) + 64, h = sub ? 128 : 92;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(-80 * (1 - a), 0);
  ctx.beginPath(); ctx.roundRect(52, 48, w, h, 20); ctx.fillStyle = 'rgba(30,28,39,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(46, 40, w, h, 20); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  font(800, 52); ctx.fillStyle = INK; ctx.fillText(title, 76, 100); if (sub) { font(500, 27); ctx.fillStyle = NAVY; ctx.fillText(sub, 78, 143); }
  ctx.restore();
}
function footer(s, t, t0) { const a = ease(t, t0, 0.5); if (a <= 0) return; font(500, 24); const w = ctx.measureText(s).width + 36;
  ctx.save(); ctx.globalAlpha = a * 0.92; ctx.beginPath(); ctx.roundRect(46, 1012, w, 44, 12); ctx.fillStyle = PAPER; ctx.fill(); ctx.globalAlpha = a; ctx.fillStyle = '#5B5548'; ctx.fillText(s, 64, 1042); ctx.restore(); }
function dim(A, B, s, t, t0, o = {}) {   // dimension line between two screen points
  const a = ease(t, t0, 0.5); if (a <= 0 || (o.t1 !== undefined && t > o.t1)) return; const bx = A.x + (B.x - A.x) * a, by = A.y + (B.y - A.y) * a;
  const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l * 16, ny = dx / l * 16;
  ctx.save(); ctx.lineCap = 'round'; for (const [c, w] of [[INK, 11], ['#FFFFFF', 5]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(bx, by); ctx.moveTo(A.x - nx, A.y - ny); ctx.lineTo(A.x + nx, A.y + ny); ctx.moveTo(bx - nx, by - ny); ctx.lineTo(bx + nx, by + ny); ctx.stroke(); }
  ctx.restore(); if (s) label(s, (A.x + B.x) / 2 + (o.dx || 0), (A.y + B.y) / 2 + (o.dy || 46), t, t0 + 0.3, { align: 'c', bg: NAVY, fg: '#FFFFFF', size: o.size || 32 });
}
function speedlines(a, n = 14) { if (a <= 0) return; ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(255,255,255,${0.55 * a})`; ctx.lineWidth = 7;
  for (let i = 0; i < n; i++) { const y = 140 + (i * 613) % 820, x = (i * 397) % 1500, l = 180 + (i * 131) % 320; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); } ctx.restore(); }
function wave(x0, x1) { for (const [off, c] of [[90, FOAM], [40, SEA2], [0, SEA]]) { ctx.beginPath(); ctx.moveTo(x0 - off, -10);
  for (let y = -10; y < H + 40; y += 30) ctx.lineTo(x0 - off + 40 * Math.sin(y / 110), y); for (let y = H + 30; y > -40; y -= 30) ctx.lineTo(x1 + off + 40 * Math.sin(y / 110 + 1), y); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); } }
function wipe(t, D, first, last) { const d = 0.38;
  if (!first && t < d) wave(-300 + (W + 600) * sstep(t / d), W + 300);
  if (!last && t > D - d) wave(-300, -300 + (W + 600) * sstep((t - (D - d)) / d));
  if (last && t > D - 0.7) { ctx.fillStyle = `rgba(246,239,224,${clamp((t - (D - 0.7)) / 0.6)})`; ctx.fillRect(0, 0, W, H); }
  if (first && t < 0.5) { ctx.fillStyle = `rgba(246,239,224,${1 - t / 0.5})`; ctx.fillRect(0, 0, W, H); } }
function flash(a, c = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${c},${clamp(a)})`; ctx.fillRect(0, 0, W, H); } }
function card(x, y, big, small, t, t0, col) { const k = pop(t, t0, 0.4); if (k <= 0) return; const b = clamp((t - t0) / 0.35);
  ctx.save(); ctx.translate(x, y - 500 * (1 - b) * (1 - b)); ctx.rotate(-0.1 * (1 - b)); ctx.scale(k, k);
  ctx.beginPath(); ctx.roundRect(-240, -83, 500, 190, 26); ctx.fillStyle = 'rgba(30,28,39,0.28)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-250, -95, 500, 190, 26); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.textAlign = 'center'; font(800, 60); ctx.fillStyle = col; ctx.fillText(big, 0, -8); font(500, 26); ctx.fillStyle = INK; small.split('\n').forEach((l, i) => ctx.fillText(l, 0, 38 + i * 32)); ctx.restore(); }

// =============================================================== sets
const LIB = { L: 30, B: 3.8, fb: 1.2, sheer: 1.0, draft: 0.9, n: 25, mastH: 11.6, yard: 11, sailH: 7 };
const ROM = { L: 20.5, B: 3.5, fb: 1.9, sheer: 0.6, draft: 0.95, deck: true, n: 9, spacing: 1.05, inb: 0.6, outb: 3.6, mastH: 9.4, yard: 8.4, sailH: 5.2, prow: 0.8,
  rows: [{ a: 0.70, n: 9, off: 0.52, lift: 0, dp0: 0.20 }, { a: 0.86, n: 9, off: 0, lift: 0, dp0: 0.36, ph: 0.45 }] };
const ENE = { L: 24, B: 6, fb: 2.3, sheer: 0.9, draft: 1.5, wood: PAL.enemy, dark: PAL.enemyDark, stern: 0.5, deck: true, plain: true, rows: [], ram: false, sail: false, prow: 0.45, mastH: 9, yard: 8, helm: false };
const SML = { L: 7.6, B: 2.1, fb: 0.78, sheer: 0.4, draft: 0.4, rows: [], ram: false, crew: false, mast: false, prow: 0.3, stern: 0.3, helm: false };
const lib = C.buildShip(LIB), rom = C.buildShip(ROM), ene = C.buildShip(ENE);
scene.add(lib.g, rom.g, ene.g);
const hole = M(new THREE.IcosahedronGeometry(1, 0), basic('#15131b'), { ol: 0, cast: false, scale: [0.75, 0.6, 0.12] }); hole.position.set(0.3, -0.25, -2.62); ene.g.add(hole);
const debris = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.12, 0.28), toon(PAL.enemy), 14); debris.frustumCulled = false; outline(debris, 2.2); scene.add(debris);
const splash = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), basic('#F2FBF7'), 46); splash.frustumCulled = false; scene.add(splash);
const arrows = new THREE.InstancedMesh((() => { const a = new THREE.CylinderGeometry(0.025, 0.025, 1.3, 5); a.rotateZ(-Math.PI / 2); const h = new THREE.ConeGeometry(0.07, 0.2, 5); h.rotateZ(-Math.PI / 2); h.translate(0.72, 0, 0);
  const f = new THREE.BoxGeometry(0.22, 0.14, 0.02); f.translate(-0.56, 0, 0); return C.mergeGeometries([a, h, f]); })(), toon('#5a4636'), 8); arrows.frustumCulled = false; outline(arrows, 1.8); scene.add(arrows);

// --- stele set
const ST = V(1500, 0, 1500), stele = new THREE.Group(); stele.position.copy(ST); scene.add(stele);
{ const rock = new THREE.IcosahedronGeometry(1, 2).toNonIndexed(); rock.computeVertexNormals(); stele.add(M(rock, toon('#D9CCAE'), { pos: [0, -1.2, 0], scale: [9, 2.2, 7], ol: 3 }));
  for (const [x, z, s] of [[-5, 2.5, 1.2], [5.5, -1, 1.6], [3.5, 3.2, 0.8]]) stele.add(M(new THREE.IcosahedronGeometry(1, 0), toon('#CDBF9F'), { pos: [x, 0.5, z], scale: [s, s * 0.7, s], ol: 3 }));
  const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 1300; const x = cv.getContext('2d');
  x.fillStyle = '#CDC5B3'; x.fillRect(0, 0, 1100, 1300); let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 260; i++) { x.fillStyle = rnd() > 0.5 ? '#BDB4A0' : '#DAD3C3'; x.beginPath(); x.arc(rnd() * 1100, rnd() * 1300, 2 + rnd() * 5, 0, 7); x.fill(); }
  const eng = (fn, w = 10) => { for (const [c, lw, dy] of [['#F3EEE2', w, 5], ['#57503F', w, 0]]) { x.save(); x.translate(0, dy); x.strokeStyle = c; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); fn(); x.stroke(); x.restore(); } };
  eng(() => { x.roundRect(60, 60, 980, 1180, 30); }, 8);
  eng(() => { for (let i = 0; i < 9; i++) { const cx = 130 + i * 105; x.moveTo(cx + 30, 130); x.arc(cx, 130, 30, 0, Math.PI * 1.6); } }, 7);
  const ship = (ox, oy, k) => { eng(() => { x.moveTo(ox + 60 * k, oy); x.quadraticCurveTo(ox + 380 * k, oy + 70 * k, ox + 720 * k, oy); x.moveTo(ox + 60 * k, oy); x.quadraticCurveTo(ox - 10 * k, oy - 60 * k, ox + 50 * k, oy - 150 * k);
      x.moveTo(ox + 720 * k, oy); x.quadraticCurveTo(ox + 790 * k, oy - 60 * k, ox + 830 * k, oy - 170 * k); x.moveTo(ox + 715 * k, oy + 22 * k); x.lineTo(ox + 830 * k, oy + 30 * k); x.lineTo(ox + 700 * k, oy + 46 * k);
      x.moveTo(ox + 60 * k, oy - 26 * k); x.lineTo(ox + 720 * k, oy - 26 * k); x.moveTo(ox + 390 * k, oy - 26 * k); x.lineTo(ox + 390 * k, oy - 390 * k); x.moveTo(ox + 200 * k, oy - 370 * k); x.lineTo(ox + 580 * k, oy - 370 * k); x.rect(ox + 215 * k, oy - 365 * k, 350 * k, 230 * k);
      for (let i = 1; i < 5; i++) { x.moveTo(ox + (215 + i * 70) * k, oy - 365 * k); x.lineTo(ox + (215 + i * 70) * k, oy - 135 * k); } for (let i = 1; i < 3; i++) { x.moveTo(ox + 215 * k, oy - (365 - i * 77) * k); x.lineTo(ox + 565 * k, oy - (365 - i * 77) * k); }
      for (let i = 0; i < 13; i++) { x.moveTo(ox + (120 + i * 46) * k, oy + 4 * k); x.lineTo(ox + (90 + i * 46) * k, oy + 100 * k); } x.moveTo(ox + 90 * k, oy - 40 * k); x.lineTo(ox + 30 * k, oy + 110 * k); }, 9 * k + 2);
    for (let i = 0; i < 5; i++) eng(() => { x.arc(ox + (160 + i * 110) * k, oy - 52 * k, 15 * k, 0, 7); }, 6); };
  ship(130, 760, 1.0); ship(250, 1090, 0.62);
  eng(() => { for (let i = 0; i < 12; i++) { x.moveTo(110 + i * 76, 1170); x.quadraticCurveTo(130 + i * 76, 1150, 150 + i * 76, 1170); x.quadraticCurveTo(170 + i * 76, 1190, 186 + i * 76, 1170); } }, 6);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.repeat.set(1 / 2.2, 1 / 2.6); tex.offset.set(0.5, 0);
  const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(1.1, 2.1); sh.quadraticCurveTo(1.1, 2.6, 0.6, 2.6); sh.lineTo(-0.6, 2.6); sh.quadraticCurveTo(-1.1, 2.6, -1.1, 2.1); sh.closePath();
  const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: false });
  const sm = new THREE.Mesh(sg, [toon('#ffffff', { map: tex }), toon(PAL.stone)]); sm.position.set(0, 0.75, -0.17); sm.castShadow = true; sm.receiveShadow = true; outline(sm, 3.4); stele.add(sm); }

// --- workshop set (sewn planks)
const WS = V(-1500, 0, 1500), shop = new THREE.Group(); shop.position.copy(WS); scene.add(shop);
const PY = 0.95, HX = Array.from({ length: 12 }, (_, i) => -1.0 + i * 2.0 / 11), HZ = 0.05;
const planks = [-1, 1].map(s => { const m = M(new THREE.BoxGeometry(2.7, 0.05, 0.34), toon(PAL.wood), { ol: 3 }); m.userData.s = s; shop.add(m); return m; });
const holes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.013, 0.013, 0.006, 8), basic('#2a1a10'), 24); shop.add(holes);
const stitches = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#F3E7C3'), 23); stitches.frustumCulled = false; outline(stitches, 1.6); shop.add(stitches);
const pegs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.017, 0.008, 0.05, 8), toon(PAL.light), 24); pegs.frustumCulled = false; outline(pegs, 1.6); shop.add(pegs);
const needle = M(new THREE.CylinderGeometry(0.006, 0.002, 0.2, 6), toon('#EFE8D8'), { ol: 1.6 }); shop.add(needle);
const sml = C.buildShip(SML); shop.add(sml.g);
{ const sand = M(new THREE.CylinderGeometry(70, 76, 0.5, 40), toon(PAL.sand), { pos: [0, 0.05, 0], ol: 0, cast: false }); shop.add(sand);
  shop.add(M(new THREE.BoxGeometry(3.4, 0.09, 1.1), toon(PAL.light), { pos: [0, PY - 0.07, 0], ol: 3 }));
  for (const x of [-1.4, 1.4]) for (const z of [-0.42, 0.42]) shop.add(M(new THREE.BoxGeometry(0.1, PY - 0.4, 0.1), toon(PAL.dark), { pos: [x, (PY - 0.1 + 0.3) / 2, z], ol: 2.4 }));
  const coil = M(new THREE.TorusGeometry(0.13, 0.035, 8, 20), toon('#F3E7C3'), { pos: [-1.35, PY, 0.36], rot: [Math.PI / 2, 0, 0], ol: 2 }); shop.add(coil);
  shop.add(M(new THREE.CylinderGeometry(0.09, 0.07, 0.1, 12), toon(PAL.dark), { pos: [1.4, PY + 0.03, 0.38], ol: 2 }));
  shop.add(M(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 10), toon(PAL.light), { pos: [1.15, PY + 0.03, -0.38], rot: [0, 0, Math.PI / 2], ol: 2 }));
  shop.add(M(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 6), toon(PAL.dark), { pos: [1.15, PY + 0.03, -0.2], rot: [Math.PI / 2, 0, 0], ol: 2 }));
  sml.place(0, 0, 0, 0); sml.g.position.set(5.6, 0.85, -2.6); sml.g.rotation.set(0.16, 0.5, 0, 'YXZ'); sml.update(0, { row: false });
  for (const dx of [-1.8, 1.8]) shop.add(M(new THREE.CylinderGeometry(0.16, 0.16, 2.6, 10), toon(PAL.dark), { pos: [5.6 + dx * Math.cos(0.5), 0.45, -2.6 - dx * Math.sin(0.5)], rot: [Math.PI / 2, 0, 0.5], ol: 2.4 }));
  const n = 46, st = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), basic('#F6ECCB'), n * 6); const m4 = new THREE.Matrix4(); let i = 0;
  for (const a of [0.45, 0.7, 0.9]) for (const s of [-1, 1]) for (let k = 0; k < n; k++) { const u = 0.08 + 0.84 * k / (n - 1); st.setMatrixAt(i++, segMatrix(hullPoint(SML, u, s * (a - 0.035), 0.02), hullPoint(SML, u + 0.008, s * (a + 0.035), 0.02), 0.02, m4)); }
  sml.g.add(st);
  for (const [x, z, s] of [[-7, -5, 1.4], [9, 3, 1.0], [-4, 6, 0.8], [12, -7, 1.8]]) shop.add(M(new THREE.IcosahedronGeometry(1, 0), toon('#CDBF9F'), { pos: [x, 0.5, z], scale: [s, s * 0.6, s], ol: 3 })); }

// --- cross-section set (Roman two-level rowing)
const XS = V(1500, 0, -1500), xsec = new THREE.Group(); xsec.position.copy(XS); scene.add(xsec);
const XR = [];   // rower rigs
{ const d = 0.9 / ROM.L, g = hullGeo(ROM, 2, 22, 0.5 - d, 0.5 + d); const hm = new THREE.Mesh(g, toon(PAL.wood, { side: THREE.DoubleSide })); hm.castShadow = hm.receiveShadow = true; outline(hm, 3.4); xsec.add(hm);
  for (const e of [-1, 1]) xsec.add(tube(Array.from({ length: 23 }, (_, j) => hullPoint(ROM, 0.5 + e * d, -1 + 2 * j / 22)), 0.075, toon(PAL.light), { ol: 2.6 }));
  const gh = sec(ROM, 0.5).gh, bh = sec(ROM, 0.5).bh;
  xsec.add(M(new THREE.BoxGeometry(1.8, 0.1, bh * 2 + 0.1), toon(PAL.light), { pos: [0, gh, 0], ol: 2.8 }));
  for (const e of [-1, 1]) xsec.add(M(new THREE.BoxGeometry(0.16, 0.16, bh * 2), toon(PAL.dark), { pos: [e * 0.8, gh - 0.13, 0], ol: 2.4 }));
  for (const s of [-1, 1]) for (const lv of [0, 1]) {
    const a = lv ? 0.86 : 0.70, pivot = hullPoint(ROM, 0.5 + (lv ? -0.3 : 0.3) / ROM.L, s * a), inb = lv ? 0.62 : 1.0, outb = 3.4;
    const seat = V(pivot.x + 0.55, lv ? 0.82 : 0.2, s * (lv ? 1.08 : 0.6));
    xsec.add(M(new THREE.BoxGeometry(0.34, 0.07, 0.7), toon(PAL.light), { pos: [seat.x, seat.y - 0.04, seat.z], ol: 2 }));
    xsec.add(M(new THREE.BoxGeometry(0.1, seat.y + 0.5, 0.1), toon(PAL.dark), { pos: [seat.x, (seat.y - 0.5) / 2 - 0.04, seat.z], ol: 2 }));
    const f = figure({ tunic: lv ? '#F0E4C4' : '#E9C9A0' }); f.position.copy(seat); xsec.add(f);
    const oar = M(new THREE.BoxGeometry(1, 1, 1), toon(PAL.light), { ol: 2.2 }); oar.matrixAutoUpdate = false; const blade = M(new THREE.BoxGeometry(1, 1, 1), toon(PAL.light), { ol: 2.2 }); blade.matrixAutoUpdate = false; xsec.add(oar, blade);
    XR.push({ s, lv, pivot, inb, outb, seat, f, oar, blade, dp0: lv ? 0.38 : 0.2, ph: lv ? 0.45 : 0 });
  } }
function xsecUpdate(t) { const d = V();
  for (const r of XR) { const ph = 2 * Math.PI * t / 1.5 - r.ph, sw = 0.5 * Math.cos(ph), dp = r.dp0 + 0.13 * Math.sin(ph);
    d.set(Math.sin(sw) * Math.cos(dp), -Math.sin(dp), r.s * Math.cos(sw) * Math.cos(dp));
    const hnd = r.pivot.clone().addScaledVector(d, -r.inb), tip = r.pivot.clone().addScaledVector(d, r.outb);
    segMatrix(hnd, tip, 0.09, r.oar.matrix); segMatrix(r.pivot.clone().addScaledVector(d, r.outb - 0.9), tip, 0.05, r.blade.matrix, 0.26);
    const al = 0.075 + 0.275 * Math.cos(ph); r.f.rotation.z = al; r.f.updateMatrixWorld(true);
    const hl = [-0.16, 0.16].map(o => r.f.worldToLocal(xsec.localToWorld(hnd.clone().addScaledVector(d, o + 0.1)))); r.f.userData.pose(hl); } }

const SHOPSUN = V(0.35, 0.85, 0.5).normalize();
const SETS = [lib.g, rom.g, ene.g, stele, shop, xsec, debris, splash, arrows];
function show(...objs) { for (const s of SETS) s.visible = objs.includes(s); C.noFoam(); C.waterU.alpha.value = 1; hole.visible = false; }
const tunic = new THREE.Color(PAL.tunic), redC = new THREE.Color(PAL.red);
function tint(fn) { lib.oarInfo.forEach((oi, i) => lib.torso.setColorAt(i, fn && fn(oi) ? redC : tunic)); lib.torso.instanceColor.needsUpdate = true; }
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), one = V(1, 1, 1), zero = V(0, 0, 0);
function hideInst(mesh) { for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); mesh.instanceMatrix.needsUpdate = true; }
function finish(t, gt) { C.waterU.time.value = gt; C.sky.position.copy(camera.position); renderer.render(scene, camera); ctx.drawImage(C.glc, 0, 0); }
const W2 = v => proj(v);

// =============================================================== scenes
function sTitle(t, D, q, gt) {
  show(lib.g); tint(null); lib.place(3.4 * t, 0, 0, gt); lib.update(gt, { period: 1.25 }); lib.foam(0, 1, 1); C.aimSun(lib.pos);
  camKeys(t, [{ t: 0, p: [27, 1.3, -6], l: [13, 4.2, 0], f: 40 }, { t: 2.6, p: [14, 3.0, -24], l: [3, 8.2, 0], f: 36 }, { t: 5.2, p: [0, 4.6, -40], l: [0, 10.6, 0], f: 34 }, { t: D, p: [-7, 5, -42], l: [0, 11, 0], f: 34 }], lib);
  finish(t, gt);
  font(800, 176); const word = 'LIBURNA', tw = ctx.measureText(word).width; let xx = 960 - tw / 2;
  for (let i = 0; i < word.length; i++) { const b = clamp((t - q[0] - i * 0.07) / 0.45); const cw = (font(800, 176), ctx.measureText(word[i]).width);
    if (b > 0) { const bo = 1 - Math.abs(Math.cos(b * Math.PI * 1.5)) * (1 - b); ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = PAPER; font(800, 176); ctx.strokeText(word[i], xx, 232 - 330 * (1 - bo)); ctx.fillStyle = INK; ctx.fillText(word[i], xx, 232 - 330 * (1 - bo)); ctx.restore(); }
    xx += cw; }
  let a = ease(t, q[1], 0.5); text('The fast raiding galley of the Liburnians,', 960 - 80 * (1 - a), 304, 42, NAVY, 700, a, 'center', 9);
  a = ease(t, q[1] + 2.0, 0.5); text('an Illyrian seafaring people of the eastern Adriatic', 960 + 80 * (1 - a), 358, 42, NAVY, 700, a, 'center', 9);
}

function sAnatomy(t, D, q, gt) {
  const rev = q[1] - 0.9;
  if (t < rev) {
    show(stele); C.aimSun(ST);
    camKeys(t, [{ t: 0, p: [ST.x - 3.2, 2.1, ST.z + 8.5], l: [ST.x, 2.0, ST.z], f: 36 }, { t: rev, p: [ST.x + 0.6, 2.2, ST.z + 4.6], l: [ST.x, 2.15, ST.z], f: 34 }]);
    finish(t, gt);
    label('Novilara stele: the oldest picture of a liburna', 960, 985, t, 1.3, { align: 'c', bg: NAVY, fg: '#FFFFFF', size: 36 });
    flash((t - (rev - 0.18)) / 0.18);
  } else {
    show(lib.g); tint(null); lib.place(3.0 * t, 0, 0, gt); lib.update(gt, { period: 1.7 }); lib.foam(0, 1, 0.8); C.aimSun(lib.pos);
    const K = [{ t: rev, p: [3, 6, 46], l: [0, 4, 0] }, { t: q[1] + 0.5, p: [24, 6.5, 13], l: [15.5, 4.2, 0] }, { t: q[2] - 0.15, p: [25, 6.2, 12], l: [15.5, 4.2, 0] },
      { t: q[2] + 0.5, p: [22.5, 1.5, 8.5], l: [15.6, 0.6, 0] }, { t: q[3] - 0.15, p: [23, 1.4, 8], l: [15.6, 0.6, 0] }, { t: q[3] + 0.6, p: [9, 8, 26], l: [1.5, 6.4, 0] }, { t: q[4] - 0.15, p: [8, 8, 27], l: [1.5, 6.4, 0] },
      { t: q[4] + 0.6, p: [5, 2.2, 15], l: [0, 0.6, 2.5] }, { t: q[5] - 0.15, p: [1, 2.2, 15], l: [-2, 0.6, 2.5] }, { t: q[5] + 0.6, p: [-21, 3.6, 10.5], l: [-14, 1.0, 1.0] }, { t: q[6] - 0.15, p: [-22, 3.6, 10], l: [-14, 1.0, 1.0] },
      { t: q[6] + 0.9, p: [-3, 6.5, 40], l: [0, 4.6, 0] }, { t: D, p: [5, 7, 41], l: [0, 4.6, 0] }];
    camKeys(t, K, lib); finish(t, gt);
    const A = lib.anchors, w = k => W2(lib.world(A[k])), fin = q[6] + 1.0;
    const own = [['prow', 'Prow curving outward', 1, -520, 60, 'r'], ['ram', 'Ram (rostrum) at the waterline', 2, -420, -230, 'r'], ['sail', 'One mast, one square sail', 3, 330, -150, 'l'], ['oars', 'Single bank: 25 oars per side', 4, -300, 200, 'c'], ['steer', 'Steering oar at the stern', 5, 340, -260, 'l']];
    for (const [k, s, i, dx, dy, al] of own) { const P = w(k); call(s, P, clamp(P.x + dx, 80, 1840), clamp(P.y + dy, 250, 990), t, q[i] + 0.55, { align: al, t1: q[i + 1] - 0.1 }); }
    const end = [['prow', 'Prow curving outward', 1500, 290, 'l'], ['sail', 'One mast, one square sail', 1160, 215, 'l'], ['ram', 'Ram (rostrum) at the waterline', 1320, 900, 'l'], ['oars', 'Single bank: 25 oars per side', 640, 960, 'l'], ['steer', 'Steering oar at the stern', 70, 890, 'l'], ['hull', 'Light, low, open hull:\nbuilt for speed, not cargo', 70, 330, 'l']];
    end.forEach(([k, s, lx, ly, al], i) => call(s, w(k), lx, ly, t, fin + i * 0.16, { align: al }));
    flash(1 - (t - rev) / 0.3);
  }
  header('Anatomy of the early liburna', '6th to 5th century BC', t);
  footer('Illustration is a schematic reconstruction. No liburna hull has been found.', t, q[6] + 2.0);
}

function sSewn(t, D, q, gt) {
  show(shop); C.aimSun(WS, SHOPSUN); const z0 = q[2], ytop = PY + 0.027;
  const sl = 1 - ease(t, q[0], 0.55); planks.forEach(p => p.position.set(0, PY, p.userData.s * (0.17 + 0.55 * sl)));
  const hk = pop(t, q[1] + 0.2, 0.3); let i = 0; for (const x of HX) for (const s of [-1, 1]) holes.setMatrixAt(i++, m4.compose(V(x, ytop, s * HZ), q4.identity(), V(hk, 1, hk))); holes.instanceMatrix.needsUpdate = true;
  hideInst(stitches); let nd = null;
  for (let k = 0; k < 12; k++) { const u = t - z0 - 0.3 - k * 0.17, a = clamp(u / 0.12); if (a <= 0) continue; const x = HX[k], A = V(x, ytop + 0.006, -HZ), B = V(x, ytop + 0.006, HZ);
    stitches.setMatrixAt(k * 2 - (k ? 0 : 0), segMatrix(A, A.clone().lerp(B, a), 0.016, m4)); if (k < 11) { const b = clamp((u - 0.1) / 0.1); if (b > 0) { const Cn = V(HX[k + 1], ytop + 0.006, -HZ); stitches.setMatrixAt(k * 2 + 1, segMatrix(B, B.clone().lerp(Cn, b), 0.016, m4)); } }
    if (u > 0 && u < 0.17) nd = A.clone().lerp(B, a); }
  stitches.instanceMatrix.needsUpdate = true;
  needle.visible = !!nd; if (nd) { needle.position.copy(nd).add(V(0.03, 0.09, 0.02)); needle.rotation.set(0.5, 0, -0.4); }
  i = 0; for (const x of HX) for (const s of [-1, 1]) { const k = pop(t, q[3] + 0.3 + HX.indexOf(x) * 0.09, 0.3); const dr = 1 - clamp((t - q[3] - 0.3 - HX.indexOf(x) * 0.09) / 0.2); pegs.setMatrixAt(i++, m4.compose(V(x, ytop + 0.012 + dr * 0.12, s * HZ), q4.identity(), V(k, k, k))); } pegs.instanceMatrix.needsUpdate = true;
  const X = WS.x, Z = WS.z, bx = X + 5.6, bz = Z - 2.6;
  camKeys(t, [{ t: 0, p: [X + 2.4, 2.5, Z + 3.4], l: [X, 0.95, Z], f: 36 }, { t: q[1] + 0.8, p: [X + 1.0, 2.1, Z + 2.0], l: [X - 0.1, 0.96, Z], f: 34 }, { t: z0 - 0.2, p: [X + 0.9, 2.05, Z + 1.9], l: [X - 0.1, 0.96, Z], f: 34 },
    { t: z0 + 0.4, p: [X - 0.95, 1.5, Z + 0.72], l: [X - 0.85, 0.97, Z], f: 34 }, { t: z0 + 2.2, p: [X + 0.75, 1.5, Z + 0.72], l: [X + 0.75, 0.97, Z], f: 34 }, { t: z0 + 2.9, p: [X + 0.5, 1.85, Z + 1.45], l: [X + 0.05, 0.97, Z], f: 34 },
    { t: q[5] - 0.2, p: [X + 0.3, 1.9, Z + 1.5], l: [X + 0.05, 0.97, Z], f: 34 }, { t: q[5] + 1.3, p: [bx + 5.5, 2.6, bz + 8.5], l: [bx, 0.9, bz], f: 36 }, { t: D, p: [bx - 1.5, 2.8, bz + 9.5], l: [bx, 0.9, bz], f: 36 }]);
  finish(t, gt);
  const w = (x, y, z) => W2(V(X + x, y, Z + z)), t1 = q[5] - 0.1;
  call('Thin planks: 1.5 to 2 cm thick\n(Caska 1 boat)', w(0.75, PY + 0.03, 0.3), 1230, 330, t, q[1] + 0.9, { t1: z0 - 0.1 });
  call('Cord of flax and Spanish broom', w(HX[9], ytop, 0), 1230, 420, t, z0 + 3.0, { t1 });
  call('Tapered wooden pegs lock each\nstitch, about every 2.4 cm', w(HX[7], ytop, HZ), 1230, 760, t, q[3] + 1.6, { t1 });
  if (t > q[4] && t < t1) { const k = pop(t, q[4], 0.4); ctx.save(); ctx.translate(300, 760); ctx.scale(k, k); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 74, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    for (const [c, lw] of [[INK, 16], ['#B8BEC6', 8]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-30, -42); ctx.lineTo(30, -42); ctx.moveTo(0, -42); ctx.lineTo(0, 46); ctx.stroke(); }
    ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 74, 0, 7); ctx.moveTo(-52, 52); ctx.lineTo(52, -52); ctx.stroke(); ctx.restore();
    label('No metal fastenings at all', 400, 760, t, q[4] + 0.15, { bg: NAVY, fg: '#FFFFFF' }); }
  call('Sewn boats ("serilia") found at\nZaton near Nin and Caska on Pag', W2(V(bx, 1.3, bz)), 1180, 300, t, q[5] + 1.6);
  header('The Liburnian trick: sewn planks', 'Hulls laced together, with no nails', t);
  footer('Finds date to the 1st century AD. Whether the war galleys were sewn the same way is not known.', t, q[5] + 3.0);
}

function sOars(t, D, q, gt) {
  show(lib.g); const c0 = q[1] + 0.4, c1 = q[2] + 2.6, tq = q[3] + 2.2;
  const hd = t > tq ? 0.32 * sstep((t - tq) / 2.6) : 0, sp = t > q[3] ? lerp(3.4, 5.2, sstep((t - q[3]) / 0.8)) * (t > tq ? lerp(1, 0.75, sstep((t - tq) / 2)) : 1) : 3.4;
  const x = 3.4 * Math.min(t, q[3]) + (t > q[3] ? 4.6 * (Math.min(t, tq) - q[3]) + (t > tq ? 3.6 * (t - tq) * Math.cos(hd * 0.5) : 0) : 0), z = t > tq ? -3.6 * (t - tq) * Math.sin(hd * 0.5) : 0;
  lib.place(x, z, hd, gt); lib.update(gt, { period: t > q[3] && t < tq ? 0.95 : 1.4 }); lib.foam(0, 1, t > q[3] ? 1 : 0.7); C.aimSun(lib.pos);
  const cnt = t > c0 ? Math.min(25, Math.floor(clamp((t - c0) / (c1 - c0)) * 25 + 0.999)) : 0; tint(cnt ? oi => (24 - oi.k) < cnt : null);
  camKeys(t, [{ t: 0, p: [0, 52, 12], l: [0, 0, 0], f: 34 }, { t: q[1] - 0.2, p: [0, 49, 12], l: [0, 0, 0], f: 34 }, { t: c0, p: [11.5, 8.5, 7.5], l: [11.5, 0.8, 0], f: 36 }, { t: c1, p: [-11.5, 8.5, 7.5], l: [-11.5, 0.8, 0], f: 36 },
    { t: c1 + 0.9, p: [0, 50, 12], l: [0, 0, 0], f: 34 }, { t: q[3] - 0.1, p: [0, 50, 12], l: [0, 0, 0], f: 34 }, { t: q[3] + 0.8, p: [-34, 13, 12], l: [4, 1.5, 0], f: 36 }, { t: tq - 0.2, p: [-36, 13, 12], l: [4, 1.5, 0], f: 36 },
    { t: tq + 0.8, p: [0, 56, 15], l: [0, 0, 0], f: 34 }, { t: D, p: [0, 58, 15], l: [0, 0, 0], f: 34 }], lib);
  finish(t, gt);
  if (t > q[3] && t < tq) speedlines(sstep((t - q[3]) / 0.5) * (1 - sstep((t - tq + 0.5) / 0.5)));
  const info = lib.oarInfo.filter(o => o.s > 0), pA = W2(lib.world(info[22].pivot)), pB = W2(lib.world(info[23].pivot));
  dim(pA, pB, '~1 m', t, q[1] + 0.6, { t1: c1 + 0.2, dy: -62 });
  const eA = W2(lib.world(V(info[0].x, 1.2, 6.2))), eB = W2(lib.world(V(info[24].x, 1.2, 6.2)));
  dim(eA, eB, '~25 m of benches', t, c1 + 1.0, { t1: q[3] - 0.05, dy: 52, size: 36 });
  header('Why 50 oars make a long ship', 'One rower per oar, one behind another', t);
  if (cnt) { font(800, 56); const s = `${cnt} rowers per side`, w = ctx.measureText(s).width + 56; ctx.save(); ctx.beginPath(); ctx.roundRect(1870 - w, 52, w, 84, 20); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); text(s, 1842, 114, 56, RED, 800, 1, 'right'); }
  label('Each rower needs about 1 m of hull', 960, 960, t, q[1] + 0.7, { align: 'c', t1: c1 + 0.3 });
  label('25 in a row: roughly 25 m of benches alone', 960, 960, t, c1 + 1.0, { align: 'c', bg: NAVY, fg: '#FFFFFF', t1: q[3] + 0.2 });
  label('Fast in a straight line', 960, 960, t, q[3] + 0.4, { align: 'c', bg: NAVY, fg: '#FFFFFF', t1: tq + 0.1 });
  label('Slow to turn', 960, 960, t, tq + 0.3, { align: 'c', bg: RED, fg: '#FFFFFF', size: 40 });
  footer('Spacing is the usual estimate for ancient oared ships (about two cubits per rower).', t, q[1] + 1.5);
}

function sBireme(t, D, q, gt) {
  const cut1 = q[1] - 0.15, cut2 = q[2] - 0.2;
  if (t >= cut1 && t < cut2) {
    show(xsec); xsecUpdate(gt); C.aimSun(XS); C.waterU.alpha.value = 0.5; const X = XS.x, Z = XS.z;
    camKeys(t, [{ t: cut1, p: [X + 7.5, 2.6, Z - 2.2], l: [X, 0.75, Z], f: 34 }, { t: cut2, p: [X + 7.5, 2.4, Z + 2.2], l: [X, 0.75, Z], f: 34 }]); finish(t, gt);
    const lo = XR.find(r => r.lv === 0 && r.s > 0), up = XR.find(r => r.lv === 1 && r.s < 0);
    call('Lower oarsman', W2(xsec.localToWorld(lo.seat.clone().add(V(0, 0.55, 0)))), 1500, 930, t, q[1] + 0.5);
    call('Upper oarsman', W2(xsec.localToWorld(up.seat.clone().add(V(0, 0.6, 0)))), 150, 330, t, q[1] + 1.3);
    label('Cross-section of the Roman liburna', 960, 1010, t, q[1] + 0.2, { align: 'c', bg: NAVY, fg: '#FFFFFF', size: 32 });
    flash(1 - (t - cut1) / 0.25);
  } else {
    show(rom.g, arrows); const tt = q[3], turn = t > tt ? 0.95 * sstep((t - tt) / 2.6) : 0;
    const x = 3.6 * Math.min(t, tt) + (t > tt ? 3.2 * (t - tt) * Math.cos(turn * 0.5) : 0), z = t > tt ? -3.2 * (t - tt) * Math.sin(turn * 0.5) : 0;
    rom.place(x, z, turn, gt, { roll: t > tt ? -0.05 * Math.sin(Math.PI * clamp((t - tt) / 2.6)) : 0 }); rom.update(gt, { period: 1.3 }); rom.foam(0, 1, 1); C.aimSun(rom.pos);
    camKeys(t, [{ t: 0, p: [20, 4.5, 24], l: [0, 3.2, 0], f: 36 }, { t: cut1, p: [10, 4.5, 27], l: [0, 3.2, 0], f: 36 }, { t: cut2, p: [4, 2.4, 21], l: [0, 2.4, 0], f: 36 }, { t: q[3] - 0.2, p: [-1, 2.4, 21], l: [0, 2.4, 0], f: 36 },
      { t: q[3] + 0.7, p: [-10, 30, 22], l: [0, 0, 0], f: 36 }, { t: q[4] - 0.3, p: [-10, 30, 22], l: [0, 0, 0], f: 36 }, { t: q[4] + 0.5, p: [11, 7.5, 11], l: [0, 2.6, 0], f: 36 }, { t: q[5] - 0.2, p: [9, 7.5, 12], l: [0, 2.6, 0], f: 36 },
      { t: q[5] + 0.8, p: [0, 3.2, 28], l: [0, 3.4, 0], f: 32 }, { t: D, p: [-2, 3.2, 28], l: [0, 3.4, 0], f: 32 }], rom);
    // arrows hitting the side screens
    for (let i = 0; i < 8; i++) { const t0 = q[4] + 0.5 + i * 0.28, k = clamp((t - t0) / 0.45); if (k <= 0) { arrows.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; }
      const u = 0.28 + 0.06 * i, tgt = rom.world(hullPoint(ROM, u, 1).add(V(0, 0.45 + 0.1 * (i % 3), 0.06))), src = tgt.clone().addScaledVector(rom.right, 26).add(V(0, 9 + i, 0)).addScaledVector(rom.fwd, 4 - i);
      const p = src.clone().lerp(tgt, k); p.y += 5 * Math.sin(Math.PI * k) * (1 - k * 0.2); const p2 = src.clone().lerp(tgt, Math.min(1, k + 0.03)); p2.y += 5 * Math.sin(Math.PI * Math.min(1, k + 0.03)) * (1 - Math.min(1, k + 0.03) * 0.2);
      const dir = k < 1 ? p2.sub(p).normalize() : tgt.clone().sub(src).setY(-7).normalize(); q4.setFromUnitVectors(V(1, 0, 0), dir); const wob = k >= 1 ? 0.06 * Math.sin((t - t0) * 40) * Math.exp(-(t - t0 - 0.45) * 6) : 0;
      arrows.setMatrixAt(i, m4.compose(p.addScaledVector(dir, -0.6), q4.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), wob)), one)); }
    arrows.instanceMatrix.needsUpdate = true; finish(t, gt);
    const rows = rom.oarInfo.filter(o => o.s > 0);
    if (t >= cut2) {
      const lo = rows.find(o => o.row.a < 0.8 && o.k === 6), upr = rows.find(o => o.row.a > 0.8 && o.k === 2), t1 = q[3] - 0.1;
      call('Lower row: 9 oars', W2(rom.world(lo.pivot)), 1420, 930, t, q[2] + 0.5, { t1 }); call('Upper row: 9 oars', W2(rom.world(upr.pivot)), 420, 930, t, q[2] + 0.9, { t1, align: 'r' });
      label('Later Roman form: 18 oars per side in two rows', 960, 270, t, q[2] + 0.4, { align: 'c', t1 });
      label('Same muscle, shorter hull: quicker to turn', 960, 960, t, q[3] + 0.5, { align: 'c', bg: NAVY, fg: '#FFFFFF', size: 38, t1: q[4] - 0.2 });
      call('Decked, with protection from missiles', W2(rom.world(rom.anchors.screen)), 1150, 930, t, q[4] + 0.7, { t1: q[5] - 0.15 });
      const a = W2(rom.world(V(-9, 0.05, 2.6))), b = W2(rom.world(V(9, 0.05, 2.6))); dim(a, b, '18 m at the waterline', t, q[5] + 1.0, { dy: 54, size: 34 });
      label('One reconstruction (J. Coates, 1994):\n50 oars, 18 x 3 m at the waterline, deck 2 m above water', 960, 285, t, q[5] + 0.6, { align: 'c', size: 34 });
      flash(1 - (t - cut2) / 0.25);
    }
  }
  header('The Roman upgrade: two levels of oars', 'Rome adopted the liburna in the 1st century BC', t);
}

function sRam(t, D, q, gt) {
  show(lib.g, ene.g, debris, splash); tint(null); const hit = q[1] + 1.5, EX = 0, x1 = -47.5 + 2.2 * q[1], xh = EX - 2.64 - 16.9 + 0.5;
  let x; if (t < q[1]) x = xh - 20 - 2.2 * (q[1] - t); else if (t < hit) x = xh - 20 + 20 * Math.pow((t - q[1]) / 1.5, 1.8); else x = xh - 0.7 * sstep((t - hit) / 1.6);
  const u = t - hit, sh = u > 0 ? 0.45 * Math.exp(-u * 4) * Math.sin(u * 70) : 0;
  lib.place(x, 0, 0, gt, { pitch: u > 0 ? 0.03 * Math.exp(-u * 3) * Math.sin(u * 14) : 0 }); lib.update(gt, { period: t < q[1] ? 1.5 : t < hit ? 0.7 : 3 }); lib.foam(0, 1, t < hit ? 1 : 0.2);
  const k = clamp(u / 4.2), jolt = u > 0 ? 0.07 * Math.exp(-u * 2.5) * Math.sin(u * 9) : 0;
  ene.place(EX, 0, Math.PI / 2, gt * 0.6, { y: -1.7 * k * k, roll: -0.3 * sstep(k) + jolt }); ene.update(gt, { row: false }); ene.foam(1, 0.9, 0); hole.visible = u > 0;
  C.aimSun(V(EX - 8, 0, 0)); if (u > 0.25) C.waterU.alpha.value = lerp(1, 0.66, sstep((u - 0.25) / 0.6));
  const imp = V(EX - 2.7, 0.0, 0);
  for (let i = 0; i < 14; i++) { if (u <= 0) { debris.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; } const vx = -5 + (i * 37 % 11) - 2, vy = 6 + (i * 53 % 7), vz = ((i * 29) % 13) - 6;
    const p = imp.clone().add(V(vx * u, vy * u - 7 * u * u, vz * u * 0.8)); if (p.y < -0.3) { debris.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; }
    debris.setMatrixAt(i, m4.compose(p, q4.setFromEuler(new THREE.Euler(u * (3 + i), u * (2 + i * 0.7), i)), one)); } debris.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 46; i++) { if (u <= 0) { splash.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; } const a = i * 2.399, r = 1.5 + (i % 7) * 0.55, vy = 7 + (i * 31 % 9);
    const p = imp.clone().add(V(Math.cos(a) * r * u * 1.6 - 0.6 * u, vy * u - 8 * u * u, Math.sin(a) * r * u * 1.6)); const s = p.y < -0.2 ? 0 : 0.55 + (i % 4) * 0.3;
    splash.setMatrixAt(i, m4.compose(p, q4.identity(), V(s, s, s))); } splash.instanceMatrix.needsUpdate = true;
  if (t < q[1] - 0.12) camKeys(t, [{ t: 0, p: [25, 1.6, 9], l: [16.2, 0.5, 0], f: 36 }, { t: q[1] - 0.12, p: [23.5, 1.2, 7.2], l: [16.4, 0.4, 0], f: 34 }], lib);
  else if (t < hit) camKeys(t, [{ t: q[1] - 0.12, p: [-34, 11, 6], l: [18, 1, 0], f: 40 }, { t: hit, p: [-24, 7.5, 5], l: [18, 1, 0], f: 36 }], lib);
  else camKeys(t, [{ t: hit, p: [EX - 10, 2.4, 17], l: [EX - 4, 1.0, 0], f: 36 }, { t: hit + 1.4, p: [EX - 9, 2.8, 20], l: [EX - 3.5, 0.6, 0], f: 36 }, { t: D, p: [EX - 7, 3.4, 24], l: [EX - 3.5, 0.6, 0], f: 36 }]);
  camera.position.x += sh; camera.position.y += sh * 0.6;
  finish(t, gt);
  if (t < q[1] - 0.12) call('Bronze ram', W2(lib.world(lib.anchors.ram)), 560, 420, t, q[0] + 1.6, { align: 'r', size: 40 });
  if (t > q[1] - 0.12 && t < hit) { speedlines(sstep((t - q[1]) / 0.4)); flash(1 - (t - (q[1] - 0.12)) / 0.2); }
  if (u > 0) { flash(1 - u / 0.22); call('Hole below the waterline:\nthe sea does the rest', W2(imp.clone().add(V(0, -0.4 - 1.2 * k, 0))), 620, 880, t, q[2] - 0.2, { align: 'r' }); }
  header('The ram strikes below the waterline', 'A bronze beak at the bow, aimed at the enemy hull', t);
}

function sOutro(t, D, q, gt) {
  show(lib.g); tint(null); lib.place(3.4 * t, 0, 0, gt); lib.update(gt, { period: 1.5 }); lib.foam(0, 1, 1); C.aimSun(lib.pos);
  camKeys(t, [{ t: 0, p: [16, 3.0, -37], l: [2, 9.6, 0], f: 36 }, { t: D, p: [-12, 4.5, -46], l: [0, 13.2, 0], f: 34 }], lib);
  const sh = q.slice(0, 3).reduce((s, t0) => s + (t > t0 + 0.4 ? 0.12 * Math.exp(-(t - t0 - 0.4) * 9) * Math.sin((t - t0 - 0.4) * 60) : 0), 0); camera.position.y += sh;
  finish(t, gt);
  card(330, 335, '7+ knots', 'under oars (Roman version)', t, q[0] + 0.2, RED); card(960, 335, '~1 m draft', 'shallow enough for\ncoves and island channels', t, q[1] + 0.1, NAVY); card(1590, 335, '31 BC', 'liburnae play a key part\nin the Battle of Actium', t, q[2] + 0.6, RED);
  let a = ease(t, q[3] + 0.1, 0.5); if (a > 0) { ctx.save(); ctx.globalAlpha = 0.93 * a; ctx.beginPath(); ctx.roundRect(470, 458, 980, 152, 22); ctx.fillStyle = PAPER; ctx.fill(); ctx.globalAlpha = a; ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  text('Small, light and quick:', 960, 520 - 30 * (1 - a), 60, INK, 800, a, 'center', 0);
  a = ease(t, q[3] + 2.0, 0.5); text("the core of Rome's provincial fleets", 960, 584 + 20 * (1 - a), 44, NAVY, 800, a, 'center', 0);
  header('Why Rome copied it', null, t);
  footer('Sizes varied by period. Figures are estimates from texts, carvings and reconstructions.', t, q[3] + 3.2);
}

const FN = { title: sTitle, anatomy: sAnatomy, sewn: sSewn, oars: sOars, bireme: sBireme, ram: sRam, outro: sOutro };
window.frame = (i, t, raw = false) => { const n = ORDER[i], D = CUES[n].D, q = CUES[n].q; hideInst(arrows);
  FN[n](t, D, q, t + i * 23.7); wipe(t, D, i === 0, i === ORDER.length - 1); return raw ? 0 : out.toDataURL('image/jpeg', 0.93); };
window.info = ORDER.map(n => ({ n, D: CUES[n].D })); window.ready = true;
