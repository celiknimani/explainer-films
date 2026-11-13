import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STYLES } from './styles.js';

export const STYLE_NAME = new URLSearchParams(location.search).get('style') || 'toon';
export const STYLE = STYLES[STYLE_NAME] || STYLES.toon;

export const W = 1920, H = 1080;
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sstep = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const ease = (t, t0, d = 0.5) => { const x = clamp((t - t0) / d); return 1 - Math.pow(1 - x, 3); };
// Motion personality: how things enter and how the camera moves. play() sets one per film so films do not all move alike.
// overshoot: bounce on entrances. speed: entrance tempo. enter: 2D entrance type. camEase: camera easing.
// There is no idle camera sway on purpose: a camera that floats back and forth makes the picture wobble against the fixed overlay.
export const MOTIONS = {
  bouncy: { overshoot: 0.25, speed: 1, enter: 'pop', camEase: 'smooth' },
  snappy: { overshoot: 0.08, speed: 1.5, enter: 'slide', camEase: 'sharp' },
  smooth: { overshoot: 0, speed: 0.7, enter: 'fade', camEase: 'smooth' },
  playful: { overshoot: 0.5, speed: 1.1, enter: 'drop', camEase: 'spring' },
};
export const TRANSITIONS = ['bands', 'iris', 'blinds', 'push', 'fade'];
export const MOTION = { name: 'bouncy', transition: 'bands', ...MOTIONS.bouncy };
export function setMotion(name, transition) { if (MOTIONS[name]) Object.assign(MOTION, { name }, MOTIONS[name]); if (transition) MOTION.transition = transition; return MOTION; }
export const pop = (t, t0, d = 0.45) => { const x = clamp((t - t0) / (d / MOTION.speed)); return x <= 0 ? 0 : 1 + MOTION.overshoot * Math.sin(x * Math.PI) * (1 - x); };
export const lerp = (a, b, k) => a + (b - a) * k;

// ---------- renderer / scene
export const glc = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(35, W / H, 0.2, 3000);
export const HORIZON = new THREE.Color('#FBE6BF');
scene.fog = new THREE.Fog(HORIZON, 260, 1400);

export const SUN = V(0.5, 0.27, 0.75).normalize();
export const sun = new THREE.DirectionalLight('#FFE6BC', 2.7); scene.add(sun); scene.add(sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06;
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix();
export const hemi = new THREE.HemisphereLight('#D6EEF0', '#CDAA84', 1.55); scene.add(hemi);
export function aimSun(p, dir = SUN) { sun.target.position.copy(p); sun.position.copy(p).addScaledVector(dir, 70); }

const grad = new THREE.DataTexture(new Uint8Array(STYLE.ramp || [255]), (STYLE.ramp || [255]).length, 1, THREE.RedFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
// toon(): the standard lit surface. basic(): unlit colour (lights, screens, glows). Both follow the active style.
export const toon = (color, o = {}) => { let m;
  if (STYLE.mat === 'standard') m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...o });
  else if (STYLE.mat === 'basic') m = new THREE.MeshBasicMaterial({ color: STYLE.fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...o, map: null });
  else m = new THREE.MeshToonMaterial({ color, gradientMap: grad, ...o });
  m.userData.src = color; return m; };
export const basic = (color, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: STYLE.mono ? STYLE.ink : color, ...o }); m.userData.src = color; return m; };
function glow(src) { const c = new THREE.Color(src), h = {}; c.getHSL(h); c.setHSL(h.h, h.s < 0.12 ? h.s : Math.max(h.s, 0.6), Math.max(h.l, 0.64)); return c; }

// ---------- crease edges for the line styles (blueprint, neon): fat lines along every hard edge
const EG = new WeakMap(), LM = {};
function edgeLines(mesh, src) { const g = mesh.geometry; let eg = EG.get(g);
  if (!eg) { eg = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(g, 28)); EG.set(g, eg); }
  const key = STYLE.ink === 'self' ? src : 'ink';
  const mat = LM[key] || (LM[key] = new LineMaterial({ color: STYLE.ink === 'self' ? glow(src) : new THREE.Color(STYLE.ink), linewidth: STYLE.edges, resolution: new THREE.Vector2(W, H), fog: false }));
  const l = new LineSegments2(eg, mat); l.frustumCulled = false; mesh.add(l); }

// ---------- outlines (inverted hull, constant screen width)
const OM = {};
function outlineMat(px, src) {
  const key = STYLE.ink === 'self' ? px + src : px; if (OM[key]) return OM[key];
  return OM[key] = new THREE.ShaderMaterial({
    uniforms: { px: { value: px * STYLE.outline }, color: { value: STYLE.ink === 'self' ? glow(src) : new THREE.Color(STYLE.ink) } }, side: THREE.BackSide,
    polygonOffset: true, polygonOffsetFactor: 2.5, polygonOffsetUnits: 2.5, fog: false,
    vertexShader: `uniform float px; attribute vec3 onormal;
      void main(){
        vec3 objectNormal = onormal;
        #include <defaultnormal_vertex>
        #include <begin_vertex>
        #include <project_vertex>
        vec3 n = normalize(transformedNormal);
        #ifdef FLIP_SIDED
          n = -n;
        #endif
        vec4 cn = projectionMatrix * vec4(n, 0.0);
        vec2 off = normalize(cn.xy + vec2(1e-5));
        float k = px * clamp(34.0 / gl_Position.w, 0.22, 1.0);
        gl_Position.xy += off * k * (2.0 / ${H}.0) * gl_Position.w * vec2(${H}.0 / ${W}.0, 1.0);
      }`,
    fragmentShader: `uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }` });
}
function smoothNormals(g) {
  const p = g.attributes.position, n = g.attributes.normal, m = new Map(), out = new Float32Array(p.count * 3);
  const key = i => `${Math.round(p.getX(i) * 1e3)},${Math.round(p.getY(i) * 1e3)},${Math.round(p.getZ(i) * 1e3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i); const a = m.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); m.set(k, a); }
  for (let i = 0; i < p.count; i++) { const a = m.get(key(i)); const l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
  return new THREE.BufferAttribute(out, 3);
}
export function outline(mesh, px = 3, dynamic = false) {
  if (!STYLE.outline) return mesh;
  const g = mesh.geometry, mm = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material, src = String((mm && mm.userData.src) || '#9AA0A8');
  if (!g.attributes.onormal) g.setAttribute('onormal', dynamic ? g.attributes.normal : smoothNormals(g));
  let o;
  if (mesh.isInstancedMesh) { o = new THREE.InstancedMesh(g, outlineMat(px, src), mesh.count); o.instanceMatrix = mesh.instanceMatrix; }
  else o = new THREE.Mesh(g, outlineMat(px, src));
  o.frustumCulled = false; mesh.add(o); mesh.userData.outline = o;
  if (STYLE.edges && !mesh.isInstancedMesh && !dynamic) edgeLines(mesh, src);
  return mesh;
}
export function M(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false;
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale) m.scale.set(...o.scale);
  if (o.ol !== 0) outline(m, o.ol || 3); return m;
}

// ---------- sky, clouds, islands, water
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color('#7CC3CB') }, mid: { value: new THREE.Color('#BFE0D6') }, hor: { value: HORIZON }, bot: { value: new THREE.Color('#2E8C9B') },
    sunDir: { value: SUN }, sunCol: { value: new THREE.Color('#FFF3CF') }, halo: { value: new THREE.Color('#FFD58A') } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 top, mid, hor, bot, sunDir, sunCol, halo; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = d.y;
      vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, h)); c = mix(c, top, smoothstep(0.12, 0.5, h)); c = mix(c, bot, smoothstep(0.0, -0.03, h));
      float s = dot(d, sunDir);
      c = mix(c, halo, 0.55 * smoothstep(0.90, 0.995, s)); c = mix(c, halo, 0.35 * step(0.9955, s)); c = mix(c, sunCol, step(0.9986, s));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }` });
export const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 32, 16), skyMat); sky.renderOrder = -10; scene.add(sky);

export const clouds = new THREE.Group(); scene.add(clouds);
{ const cm = basic('#FFF8E6', { fog: false }); const cg = new THREE.SphereGeometry(1, 10, 8);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 16; i++) { const g = new THREE.Group(); const a = rnd() * Math.PI * 2, r = 900 + rnd() * 500;
    g.position.set(Math.cos(a) * r, 130 + rnd() * 220, Math.sin(a) * r);
    for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(cg, cm); m.position.set((k - 2) * 38 + rnd() * 12, rnd() * 14, rnd() * 20); const q = 26 + rnd() * 26; m.scale.set(q * 1.5, q * 0.62, q); g.add(m); }
    g.lookAt(0, g.position.y, 0); clouds.add(g); } }
export function tube(pts, r, mat, o = {}) {
  const cv = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(cv, o.seg || pts.length * 4, r, 7, false), mat);
  m.castShadow = true; if (o.ol !== 0) outline(m, o.ol || 2.6); return m;
}
const ux = V(1, 0, 0), up = V(0, 1, 0), tmpQ = new THREE.Quaternion(), tmpS = V(1, 1, 1), tmpM = new THREE.Matrix4();
export function segMatrix(a, b, th, out = new THREE.Matrix4(), th2 = th) {   // unit box (x length) from a to b
  const d = b.clone().sub(a), l = d.length() || 1e-4; tmpQ.setFromUnitVectors(ux, d.multiplyScalar(1 / l));
  return out.compose(a.clone().add(b).multiplyScalar(0.5), tmpQ, tmpS.set(l, th, th2));
}
export function rod(a, b, r, mat, ol = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat); m.applyMatrix4(segMatrix(a, b, r * 2)); m.castShadow = true; if (ol) outline(m, ol); return m; }
// ---------- camera keys
const camEase = x => MOTION.camEase === 'sharp' ? (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2) : MOTION.camEase === 'spring' ? 1 + 2.0 * (x - 1) ** 3 + 1.0 * (x - 1) ** 2 : sstep(x);
export function camKeys(t, keys, frame) {   // keys: {t, p:[x,y,z], l:[x,y,z], f}
  let a = keys[0], b = keys[0], k = 0;
  if (t >= keys[keys.length - 1].t) a = b = keys[keys.length - 1];
  else for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; k = camEase((t - a.t) / Math.max(1e-6, b.t - a.t)); break; }
  const mix3 = (u, v) => [lerp(u[0], v[0], k), lerp(u[1], v[1], k), lerp(u[2], v[2], k)];
  const p = mix3(a.p, b.p), l = mix3(a.l, b.l); camera.fov = lerp(a.f || 35, b.f || 35, k); camera.updateProjectionMatrix();
  const P = frame ? frame.rel(...p) : V(...p), Lk = frame ? frame.rel(...l) : V(...l);
  camera.position.copy(P); camera.up.set(0, 1, 0); camera.lookAt(Lk); return { P, L: Lk };
}
export function proj(v) { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H, ok: p.z < 1 }; }
export { THREE, mergeGeometries };