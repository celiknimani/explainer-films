import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// Sea and ship parts: water with wake and foam, islands, lofted hulls, oars, sails, crew, buildShip().
import { V, W, H, clamp, sstep, lerp, ease, pop, scene, camera, toon, basic, outline, M, tube, segMatrix, rod, HORIZON, SUN, STYLE } from '../core.js';
const ux = V(1, 0, 0), up = V(0, 1, 0), tmpQ = new THREE.Quaternion(), tmpS = V(1, 1, 1), tmpM = new THREE.Matrix4();

export const PAL = { wood: '#B97A3E', dark: '#7A4A22', light: '#DDA865', bronze: '#D09A2E', sail: '#F8EDCB', rope: '#3A2E28', skin: '#E2A77C',
  tunic: '#F0E4C4', hair: '#3B2A20', red: '#D9503F', stone: '#CFC7B6', sand: '#EAD9AE', enemy: '#8F5A41', enemyDark: '#5E3626', ink: '#1E1C27' };


export const islands = new THREE.Group(); scene.add(islands);
{ let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const mat = toon('#E9DCBF'), scrub = toon('#8FA36B');
  const spots = [[260, -420, 150, 34, 90], [-380, -520, 220, 46, 120], [640, -260, 190, 30, 80], [-700, 120, 240, 52, 140], [120, 640, 260, 40, 110], [820, 420, 210, 58, 130], [-260, 520, 130, 24, 70], [460, -760, 300, 66, 160], [-900, -300, 260, 44, 150]];
  for (const [x, z, sx, sy, sz] of spots) {
    let g = new THREE.IcosahedronGeometry(1, 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 1 + (rnd() - 0.5) * 0.28; p.setXYZ(i, p.getX(i) * k, Math.max(-0.05, p.getY(i)) * k, p.getZ(i) * k); }
    g = g.toNonIndexed(); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.position.set(x, -1, z); m.scale.set(sx, sy, sz); m.rotation.y = rnd() * 6; islands.add(m);
    for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), scrub); const a = rnd() * 6.28, r = 0.2 + rnd() * 0.45;
      b.position.set(x + Math.cos(a) * r * sx, sy * (0.55 - r * 0.5), z + Math.sin(a) * r * sz); b.scale.set(sx * 0.09, sy * 0.1, sz * 0.09); islands.add(b); } } }

export const waterU = { time: { value: 0 }, alpha: { value: 1 }, deep: { value: new THREE.Color('#237785') }, mid: { value: new THREE.Color('#2F93A1') }, light: { value: new THREE.Color('#58B5BE') },
  foam: { value: new THREE.Color('#F2FBF7') }, hor: { value: HORIZON }, glint: { value: new THREE.Color('#FFE9B0') }, sunXZ: { value: new THREE.Vector2(SUN.x, SUN.z).normalize() },
  shipP: { value: [new THREE.Vector2(), new THREE.Vector2()] }, shipF: { value: [new THREE.Vector2(1, 0), new THREE.Vector2(1, 0)] },
  shipD: { value: [new THREE.Vector4(0, 0, 0, 0), new THREE.Vector4(0, 0, 0, 0)] } };   // L, B, foam strength, wake strength
const waterMat = new THREE.ShaderMaterial({ uniforms: waterU, transparent: true, fog: false,
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float time, alpha; uniform vec3 deep, mid, light, foam, hor, glint; uniform vec2 sunXZ; uniform vec2 shipP[2]; uniform vec2 shipF[2]; uniform vec4 shipD[2]; varying vec3 vW;
    float rib(vec2 p, float t){ float y = p.y * 0.55 + 1.6 * sin(p.x * 0.11 + t * 0.35) + 0.7 * sin(p.x * 0.31 - t * 0.5); return sin(y + t * 0.9); }
    void main(){ vec2 p = vW.xz; float t = time; float dist = length(cameraPosition - vW);
      float w = sin(p.x * 0.07 + t * 0.3) + sin(p.y * 0.09 - t * 0.25) + sin((p.x + p.y) * 0.05 + t * 0.2);
      vec3 c = mix(deep, mid, smoothstep(-0.35, -0.3, w)); c = mix(c, light, smoothstep(1.25, 1.3, w) * 0.7);
      float near = 1.0 - smoothstep(70.0, 260.0, dist);
      float r1 = rib(p, t), r2 = rib(p * 1.7 + vec2(13.0, 7.0), t * 1.2);
      c = mix(c, light, smoothstep(0.93, 0.95, r2) * near * 0.85);
      c = mix(c, foam, smoothstep(0.985, 0.992, r1) * near * 0.9);
      vec2 vd = normalize(p - cameraPosition.xz); float g = pow(max(dot(vd, sunXZ), 0.0), 60.0);
      c = mix(c, glint, g * (0.25 + 0.75 * smoothstep(0.55, 0.75, r1)));
      for (int i = 0; i < 2; i++) { vec4 D = shipD[i]; if (D.x < 1.0) continue;
        vec2 q = p - shipP[i]; vec2 f = shipF[i]; vec2 l = vec2(dot(q, f), dot(q, vec2(-f.y, f.x)));
        float u = l.x / D.x + 0.5; float bw = 0.0; if (u > 0.0 && u < 1.0) bw = 0.5 * D.y * pow(sin(3.14159 * u), 0.55) * 0.88;
        if (u > 0.01 && u < 0.99 && abs(l.y) < bw * 0.9) discard;
        float n = 0.10 * sin(l.x * 2.3 + t * 4.0) + 0.06 * sin(l.x * 5.1 - t * 6.0);
        float dz = abs(l.y) - bw; float ring = (u > -0.02 && u < 1.03) ? smoothstep(0.55 + n, 0.25 + n, dz) : 0.0;
        float fm = ring * D.z;
        float bx = -(l.x + D.x * 0.42);
        if (bx > 0.0) { float sp = 0.5 * D.y * 0.7 + bx * 0.26; float e = abs(abs(l.y) - sp);
          float arm = smoothstep(0.55 + bx * 0.02, 0.0, e + 0.25 * sin(bx * 0.9 - t * 3.0)) * smoothstep(70.0, 3.0, bx);
          float cen = smoothstep(sp * 0.8, 0.0, abs(l.y)) * smoothstep(45.0, 1.0, bx) * (0.5 + 0.5 * sin(bx * 1.7 - t * 5.0 + l.y * 2.5));
          fm = max(fm, max(step(0.5, arm) * 0.9, step(0.72, cen) * 0.7) * D.w); }
        float fx = l.x - D.x * 0.5; if (fx > -1.5) { float bwv = smoothstep(2.6 + n * 3.0, 0.3, length(vec2(fx * 0.8, (abs(l.y) - 0.9) * 1.2))); fm = max(fm, step(0.45, bwv) * D.w * step(0.55, abs(l.y))); }
        c = mix(c, foam, clamp(fm, 0.0, 1.0)); }
      c = mix(c, hor, smoothstep(300.0, 1500.0, dist));
      gl_FragColor = vec4(c, alpha);
      #include <colorspace_fragment>
    }` });
export const water = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), waterMat); water.rotation.x = -Math.PI / 2; water.renderOrder = 1; scene.add(water);

// ---------- hull maths
export function sec(c, u) {
  const e = Math.sin(Math.PI * clamp(u, 0, 1));
  return { x: (u - 0.5) * c.L, bh: (c.B / 2) * Math.pow(Math.max(e, 0), 0.55), kd: -c.draft * Math.pow(Math.max(e, 0), 0.35), gh: c.fb + c.sheer * Math.pow(Math.abs(2 * u - 1), 3) };
}
export function hullPoint(c, u, a, push = 0) {
  const s = sec(c, u), th = a * Math.PI / 2, sg = a < 0 ? -1 : 1;
  return V(s.x, s.gh - (s.gh - s.kd) * Math.pow(Math.cos(th), 0.9), (s.bh + push) * sg * Math.pow(Math.abs(Math.sin(th)), 0.75));
}
export function hullGeo(c, N = 56, Mm = 18, u0 = 0, u1 = 1) {
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= Mm; j++) { const p = hullPoint(c, lerp(u0, u1, i / N), -1 + 2 * j / Mm); pos.push(p.x, p.y, p.z); }
  for (let i = 0; i < N; i++) for (let j = 0; j < Mm; j++) { const a = i * (Mm + 1) + j, b = a + 1, d = a + Mm + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
  let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const k = Math.floor(N / 2) * (Mm + 1) + Mm;   // starboard gunwale midship: normal must point +z
  if (g.attributes.normal.getZ(k) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  return g;
}

function oarGeo(inb, outb, bl = 0.95, bw = 0.24) {
  const sh = new THREE.CylinderGeometry(0.045, 0.045, inb + outb - bl * 0.5, 6); sh.rotateZ(-Math.PI / 2); sh.translate((outb - bl * 0.5 - inb) / 2, 0, 0);
  const b = new THREE.BoxGeometry(bl, bw, 0.05); b.translate(outb - bl / 2, 0, 0);
  return mergeGeometries([sh, b]);
}
function sailTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#F4EBD3'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#D3C39A'; x.lineWidth = 5;
  for (let i = 1; i < 7; i++) { x.beginPath(); x.moveTo(i * 512 / 7, 0); x.lineTo(i * 512 / 7, 512); x.stroke(); }
  x.lineWidth = 3; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(0, i * 128); x.lineTo(512, i * 128); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const SAILTEX = sailTexture();

export function figure(o = {}) {   // simple standing / sitting person
  const g = new THREE.Group();
  const torso = M(new THREE.BoxGeometry(0.3, 0.6, 0.46), toon(o.tunic || PAL.tunic), { pos: [0, 0.3, 0], ol: 2.4 });
  const head = M(new THREE.SphereGeometry(0.15, 12, 10), toon(PAL.skin), { pos: [0, 0.78, 0], ol: 2.4 });
  const hair = M(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(PAL.hair), { pos: [-0.015, 0.8, 0], ol: 0 });
  g.add(torso, head, hair);
  if (o.legs) { g.add(M(new THREE.BoxGeometry(0.2, o.legs, 0.36), toon(o.tunic || PAL.tunic), { pos: [0, -o.legs / 2, 0], ol: 2.4 })); }
  g.userData.arms = [0, 1].map(() => { const a = M(new THREE.BoxGeometry(1, 1, 1), toon(PAL.skin), { ol: 2 }); a.matrixAutoUpdate = false; g.add(a); return a; });
  g.userData.pose = (handsLocal) => { g.userData.arms.forEach((a, i) => { segMatrix(V(0, 0.52, i ? 0.24 : -0.24), handsLocal[i], 0.09, a.matrix); }); };
  return g;
}

// ---------- ship
export function buildShip(c) {
  const g = new THREE.Group(), S = { g, c, anchors: {} }; const L = c.L;
  const wood = toon(c.wood || PAL.wood, { side: THREE.DoubleSide }), dark = toon(c.dark || PAL.dark), light = toon(PAL.light), rope = basic(PAL.rope);
  const hull = new THREE.Mesh(hullGeo(c), wood); hull.castShadow = hull.receiveShadow = true; outline(hull, 3.4); g.add(hull);
  const us = n => Array.from({ length: n + 1 }, (_, i) => 0.012 + 0.976 * i / n);
  for (const s of [-1, 1]) {
    g.add(tube(us(40).map(u => hullPoint(c, u, s)), 0.1, dark));
    g.add(tube(us(40).map(u => hullPoint(c, u, s * 0.74, 0.02)), 0.055, dark, { ol: 0 }));
    for (const a of [0.86, 0.6]) g.add(tube(us(40).map(u => hullPoint(c, u, s * a, 0.012)), 0.018, basic(c.dark || PAL.dark), { ol: 0 }));
  }
  // floor or deck
  const fy = c.deck ? null : 0.3, strip = [], sidx = [];
  const NS = 40; for (let i = 0; i <= NS; i++) { const u = 0.03 + 0.94 * i / NS, s = sec(c, u); const y = c.deck ? s.gh - 0.04 : fy; const w = c.deck ? s.bh * 0.985 : s.bh * 0.80; strip.push(s.x, y, -w, s.x, y, w); }
  for (let i = 0; i < NS; i++) { const a = i * 2; sidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(strip, 3)); fg.setIndex(sidx); fg.computeVertexNormals();
  const floor = new THREE.Mesh(fg, toon(c.deck ? PAL.light : (c.dark || PAL.dark), { side: THREE.DoubleSide })); floor.receiveShadow = true; g.add(floor);
  // stem, prow, stern
  const hb = L / 2, kd0 = -c.draft * 0.5, ps = c.prow || 1;
  g.add(tube([V(hb - 1.6, kd0, 0), V(hb - 0.1, 0.1, 0), V(hb + 0.05, c.fb + c.sheer * 0.9, 0), V(hb + 0.5 * ps, c.fb + c.sheer + 0.9 * ps, 0), V(hb + 1.4 * ps, c.fb + c.sheer + 1.8 * ps, 0), V(hb + 2.3 * ps, c.fb + c.sheer + 2.2 * ps, 0), V(hb + 2.7 * ps, c.fb + c.sheer + 2.9 * ps, 0)], 0.19, wood, { seg: 40 }));
  S.anchors.prow = V(hb + 2.3 * ps, c.fb + c.sheer + 2.3 * ps, 0);
  const ss = c.stern ?? 1; g.add(tube([V(-hb + 1.6, kd0, 0), V(-hb + 0.1, 0.2, 0), V(-hb - 0.5 * ss, c.fb + c.sheer * 0.9, 0), V(-hb - 0.9 * ss, c.fb + c.sheer + 1.5 * ss, 0), V(-hb - 0.5 * ss, c.fb + c.sheer + 2.9 * ss, 0), V(-hb + 0.6 * ss, c.fb + c.sheer + 3.5 * ss, 0), V(-hb + 1.7 * ss, c.fb + c.sheer + 3.2 * ss, 0)], 0.19 * Math.max(0.6, ss), wood, { seg: 40 }));
  if (c.ram !== false) {
    const rg = new THREE.CylinderGeometry(0.03, 0.62, 3.0, 4); rg.rotateZ(-Math.PI / 2); rg.rotateX(Math.PI / 4); rg.scale(1, 0.85, 0.8);
    g.add(M(rg, toon(PAL.bronze), { pos: [hb + 0.95, 0.22, 0], ol: 3 }));
    g.add(M(new THREE.BoxGeometry(1.5, 0.5, 0.5), wood, { pos: [hb - 0.9, 0.0, 0], ol: 2.6 }));
    S.anchors.ram = V(hb + 1.9, 0.3, 0);
  }
  // mast, yard, sail, rigging
  if (c.mast !== false) {
    const mx = c.mastX ?? 1.0, mh = c.mastH || 9.6, yw = c.yard || 9.2, sh = c.sailH || 5.6, ty = mh - 0.9;
    g.add(M(new THREE.CylinderGeometry(0.13, 0.17, mh, 8), dark, { pos: [mx, mh / 2 + 0.1, 0], ol: 2.8 }));
    const sgp = new THREE.Group(); sgp.position.set(mx, 0, 0); sgp.rotation.y = c.sailYaw ?? -0.8; g.add(sgp);
    const yard = new THREE.CylinderGeometry(0.09, 0.09, yw, 8); yard.rotateX(Math.PI / 2); sgp.add(M(yard, dark, { pos: [0.18, ty, 0], ol: 2.6 }));
    if (c.sail !== false) {
      const sg = new THREE.PlaneGeometry(yw - 0.5, sh, 14, 10); const sail = new THREE.Mesh(sg, toon('#ffffff', { map: SAILTEX, side: THREE.DoubleSide }));
      sail.rotation.y = Math.PI / 2; sail.position.set(0.24, ty - sh / 2 - 0.1, 0); sail.castShadow = true; sgp.add(sail); outline(sail, 3, true);
      const base = sg.attributes.position.array.slice(); S.sail = { mesh: sail, base, w: yw - 0.5, h: sh };
      const yw2 = c.sailYaw ?? -0.8; S.anchors.sail = V(mx + 0.9 * Math.cos(yw2), ty - sh * 0.45, -0.9 * Math.sin(yw2) + 0.6);
      for (const s2 of [-1, 1]) { const zz = s2 * (yw - 0.5) * 0.45, cx = mx + 0.6 * Math.cos(yw2) + zz * Math.sin(yw2), cz = -0.6 * Math.sin(yw2) + zz * Math.cos(yw2); const ux2 = 0.5 + (mx - 6) / L;
        g.add(rod(V(cx, ty - sh - 0.05, cz), V(mx - 6, sec(c, ux2).gh, s2 * sec(c, ux2).bh), 0.02, rope)); }
    } else { const fr = new THREE.CylinderGeometry(0.2, 0.2, yw - 0.8, 8); fr.rotateX(Math.PI / 2); sgp.add(M(fr, toon('#F4EBD3'), { pos: [0.18, ty - 0.22, 0], ol: 2.4 })); }
    g.add(rod(V(mx, mh, 0), V(hb - 0.6, c.fb + c.sheer * 0.7, 0), 0.02, rope)); g.add(rod(V(mx, mh, 0), V(-hb + 1.2, c.fb + c.sheer * 0.7, 0), 0.02, rope));
    for (const s of [-1, 1]) g.add(rod(V(mx, mh - 1.2, 0), V(mx - 0.4, sec(c, 0.5 + mx / L).gh, s * sec(c, 0.5 + mx / L).bh), 0.02, rope));
  }
  // oars (+ rowers when the hull is open)
  const rows = c.rows || [{ a: 1, n: c.n, off: 0, lift: 0.06 }]; const sp = c.spacing || 0.96; const inb = c.inb || 1.0, outb = c.outb || 3.3;
  const total = rows.reduce((s, r) => s + r.n, 0) * 2; S.oarCount = total;
  const oars = new THREE.InstancedMesh(oarGeo(inb, outb), light, total); oars.castShadow = true; oars.frustumCulled = false; outline(oars, 2.4); g.add(oars);
  S.oarInfo = []; for (const r of rows) { const x0 = (c.rowX ?? 0) - (r.n - 1) * sp / 2 + r.off; for (let k = 0; k < r.n; k++) for (const s of [-1, 1]) { const x = x0 + k * sp, u = x / L + 0.5; const p = hullPoint(c, u, s * r.a); p.y += r.lift; S.oarInfo.push({ x, s, pivot: p, k, row: r }); } }
  let torso, head, hair, arms;
  if (!c.deck && c.crew !== false) {
    const n2 = total; const tg = new THREE.BoxGeometry(0.3, 0.58, 0.46); tg.translate(0, 0.29, 0);
    torso = new THREE.InstancedMesh(tg, toon('#ffffff'), n2); head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 10, 8), toon(PAL.skin), n2);
    hair = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon(PAL.hair), n2); arms = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon(PAL.skin), n2 * 2);
    for (const m of [torso, head, hair, arms]) { m.castShadow = true; m.frustumCulled = false; g.add(m); }
    outline(torso, 2.2); outline(head, 2.2); outline(arms, 1.8);
    const tc = new THREE.Color(PAL.tunic); for (let i = 0; i < n2; i++) torso.setColorAt(i, tc); S.torso = torso;
    const tw = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.07, 1), light, c.n); S.tunic = tc; tw.receiveShadow = true; g.add(tw); outline(tw, 1.8);
    for (let k = 0; k < c.n; k++) { const x = (c.rowX ?? 0) - (c.n - 1) * sp / 2 + k * sp + 0.6, s = sec(c, x / L + 0.5); tw.setMatrixAt(k, tmpM.compose(V(x, 0.5, 0), new THREE.Quaternion(), V(1, 1, s.bh * 1.75))); }
  }
  if (c.deck && !c.plain) {   // side screens + marines
    const n = 16, sc = new THREE.InstancedMesh(new THREE.BoxGeometry(1.02, 0.75, 0.07), toon('#ffffff'), n * 2); sc.castShadow = true; g.add(sc); outline(sc, 2.4);
    let i = 0; for (let k = 0; k < n; k++) for (const s of [-1, 1]) { const u = 0.2 + 0.6 * k / (n - 1), p = hullPoint(c, u, s), p2 = hullPoint(c, u + 0.01, s);
      tmpQ.setFromUnitVectors(ux, p2.clone().sub(p).normalize()); sc.setMatrixAt(i, tmpM.compose(V(p.x, p.y + 0.42, p.z), tmpQ, V(1, 1, 1))); sc.setColorAt(i, new THREE.Color(k % 2 ? PAL.red : '#EFE2BE')); i++; }
    S.anchors.screen = hullPoint(c, 0.5, 1).add(V(0, 0.5, 0));
    for (const [x, z] of [[4.5, 0.5], [1.5, -0.6], [-2.5, 0.4], [-5.5, -0.3]]) { const f = figure({ tunic: PAL.red, legs: 0.75 }); f.position.set(x, sec(c, x / L + 0.5).gh + 0.72, z); f.userData.pose([V(0.25, 0.2, -0.24), V(0.25, 0.2, 0.24)]);
      f.add(M(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 14), toon(PAL.bronze), { pos: [0.1, 0.25, 0.38], rot: [Math.PI / 2, 0, 0], ol: 2.2 })); g.add(f); }
  }
  if (c.helm !== false) {
  // steering oars + helmsman
  const su = 0.085, sgw = hullPoint(c, su, 1);
  for (const s of [-1, 1]) { const top = V(sgw.x + 0.9, sgw.y + 0.55, s * (sgw.z - 0.15)), bot = V(sgw.x - 1.0, -1.0, s * (sgw.z + 0.45));
    g.add(rod(top, bot, 0.05, light, 2.2)); const d = bot.clone().sub(top).normalize(); const bm = M(new THREE.BoxGeometry(1.5, 0.5, 0.06), light, { ol: 2.4 }); bm.quaternion.setFromUnitVectors(ux, d); bm.position.copy(bot).addScaledVector(d, -0.55); g.add(bm);
    if (s > 0) S.anchors.steer = bot.clone().addScaledVector(d, -1.0); }
  const hm = figure({ legs: 0.75 }); hm.position.set(sgw.x + 1.1, (c.deck ? sgw.y : 0.3) + 0.75, 0); hm.userData.pose([V(-0.2, 0.25, -0.5), V(-0.2, 0.25, 0.5)]); g.add(hm);
  }
  S.anchors.hull = hullPoint(c, 0.36, 0.8); S.anchors.oars = V(0, 0, 0);

  const d = V(), Y = V(), Z = V(), hand = V(), sh = V(), q = new THREE.Quaternion(), zAxis = V(0, 0, 1), one = V(1, 1, 1), pos = V(), m4 = new THREE.Matrix4(), bas = new THREE.Matrix4();
  S.update = (t, o = {}) => {
    const T = o.period || 1.5, A = 0.5, moving = o.row !== false;
    S.oarInfo.forEach((oi, i) => {
      const ph = moving ? 2 * Math.PI * t / T - (oi.row.ph || 0) : 0.9;
      const sw = A * Math.cos(ph), dp = (oi.row.dp0 ?? 0.33) + 0.13 * Math.sin(ph) + (moving ? 0 : -0.25);
      d.set(Math.sin(sw) * Math.cos(dp), -Math.sin(dp), oi.s * Math.cos(sw) * Math.cos(dp));
      Y.copy(up).addScaledVector(d, -up.dot(d)).normalize(); Z.crossVectors(d, Y);
      bas.makeBasis(d, Y, Z).setPosition(oi.pivot); oars.setMatrixAt(i, bas);
      if (i === (o.anchorOar ?? Math.floor(S.oarInfo.length / 2) + 1)) S.anchors.oars.copy(oi.pivot).addScaledVector(d, outb - 0.4);
      if (torso) {
        hand.copy(oi.pivot).addScaledVector(d, -inb + 0.1);
        const al = 0.075 + 0.275 * Math.cos(ph); const bhh = sec(c, oi.x / L + 0.5).bh;
        pos.set(oi.x + 0.6, 0.54, oi.s * Math.max(0.3, bhh - 0.95)); q.setFromAxisAngle(zAxis, al);
        m4.compose(pos, q, one); torso.setMatrixAt(i, m4);
        const hx = pos.x - Math.sin(al) * 0.76, hy = pos.y + Math.cos(al) * 0.76;
        head.setMatrixAt(i, m4.compose(V(hx, hy, pos.z), q, one)); hair.setMatrixAt(i, m4.compose(V(hx + 0.02, hy + 0.02, pos.z), q, one));
        for (const k of [0, 1]) { sh.set(pos.x - Math.sin(al) * 0.5, pos.y + Math.cos(al) * 0.5, pos.z + (k ? 0.22 : -0.22)); arms.setMatrixAt(i * 2 + k, segMatrix(sh, hand.clone().addScaledVector(d, k ? 0.16 : -0.16), 0.09, m4)); }
      }
    });
    oars.instanceMatrix.needsUpdate = true;
    if (torso) for (const m of [torso, head, hair, arms]) m.instanceMatrix.needsUpdate = true;
    if (S.sail) { const p = S.sail.mesh.geometry.attributes.position, b = S.sail.base, w = S.sail.w, h = S.sail.h, bl = o.billow ?? 1;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], u = x / w + 0.5, v = y / h + 0.5;
        const bz = bl * 1.15 * Math.sin(Math.PI * u) * Math.pow(1 - v, 0.6) * (0.88 + 0.12 * Math.sin(t * 1.6 + u * 5 + v * 3)) + 0.05 * Math.sin(t * 5 + u * 14) * (1 - v);
        p.setXYZ(i, x * (1 - 0.07 * (1 - v)), y, bz); }
      p.needsUpdate = true; S.sail.mesh.geometry.computeVertexNormals(); }
  };
  S.place = (x, z, heading, t, o = {}) => {   // heading: local +x -> world (cos h, 0, -sin h)
    g.position.set(x, (o.y || 0) + 0.06 * Math.sin(t * 1.7) + 0.04 * Math.sin(t * 2.6 + 1), z);
    g.rotation.set((o.roll || 0) + 0.018 * Math.sin(t * 1.3), heading, (o.pitch || 0) + 0.012 * Math.sin(t * 1.9 + 0.5), 'YXZ'); g.updateMatrixWorld(true);
    S.fwd = V(Math.cos(heading), 0, -Math.sin(heading)); S.right = V(Math.sin(heading), 0, Math.cos(heading)); S.pos = V(x, 0, z);
  };
  S.rel = (x, y, z) => S.pos.clone().addScaledVector(S.fwd, x).addScaledVector(S.right, z).add(V(0, y, 0));
  S.world = v => g.localToWorld(v.clone());
  S.foam = (i, k = 1, wake = 1) => { waterU.shipP.value[i].set(g.position.x, g.position.z); waterU.shipF.value[i].set(S.fwd.x, S.fwd.z); waterU.shipD.value[i].set(c.L, c.B, k, wake); };
  return S;
}
export function noFoam() { waterU.shipD.value[0].set(0, 0, 0, 0); waterU.shipD.value[1].set(0, 0, 0, 0); }

