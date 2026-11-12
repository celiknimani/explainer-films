// Staging helpers shared by films: ground, environment presets, sun aiming, frame output and the player hook.
import * as C from './core.js';
import { out, ctx, wipe } from './overlay.js';
const { THREE, V, W, H, scene, camera, renderer, STYLE } = C;

export const ground = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000), C.toon('#A9C07E')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.visible = false; scene.add(ground);
const skyU = C.sky.material.uniforms;
export const SUNHI = V(0.45, 0.72, 0.5).normalize(), SUNLOW = V(-0.5, 0.4, 0.6).normalize();

// Point the sun at p and size its shadow box (world units either side of p).
export function aim(p, size = 60, dir = SUNHI) { C.sun.target.position.copy(p); C.sun.position.copy(p).addScaledVector(dir, 200);
  const c = C.sun.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 500; c.updateProjectionMatrix(); }

// Environment presets. Every key is optional; the active style may override colours.
export const ENV = {
  day: { top: '#7CC3CB', mid: '#BFE0D6', hor: '#FBE6BF', ground: '#A9C07E' },
  studio: { top: '#A9D5DC', mid: '#DCEBDD', hor: '#F6EFE0', ground: '#F1E8D2', si: 2.5, clouds: false },
  dusk: { top: '#27335F', mid: '#6F5F95', hor: '#EDA783', ground: '#F4F7FC', sun: '#DCD6FF', si: 1.35, hi: 1.9, hsky: '#B9C6F2', hgr: '#B9B2D0', clouds: false, sunvis: false },
  night: { top: '#222C55', mid: '#57508A', hor: '#3D4270', ground: '#3D4270', sun: '#BFB8FF', si: 0.9, hi: 1.0, hsky: '#8FA0E0', hgr: '#7D78A8', clouds: false, sunvis: false },
};
export function env(e) { if (STYLE.env) e = { ...e, ...STYLE.env };
  skyU.top.value.set(e.top); skyU.mid.value.set(e.mid); skyU.hor.value.set(e.hor); skyU.bot.value.set(e.hor); scene.fog.color.set(e.hor);
  ground.visible = e.ground !== null; if (e.ground) ground.material.color.set(STYLE.fill || e.ground);
  C.sun.color.set(e.sun || '#FFE6BC'); C.sun.intensity = e.si ?? 2.7; C.hemi.intensity = e.hi ?? 1.55; C.hemi.color.set(e.hsky || '#D6EEF0'); C.hemi.groundColor.set(e.hgr || '#CDAA84');
  skyU.halo.value.set(e.sunvis === false ? e.hor : '#FFD58A'); skyU.sunCol.value.set(e.sunvis === false ? e.hor : '#FFF3CF'); C.clouds.visible = e.clouds !== false; }

// Camera keyframes are written relative to a set; frameOf(group) gives camKeys that frame of reference.
export const frameOf = g => ({ rel: (x, y, z) => V(g.position.x + x, g.position.y + y, g.position.z + z) });
// Screen position of a point given in a set's local coordinates.
export const at = (set, x, y, z) => C.proj(V(set.position.x + x, set.position.y + y, set.position.z + z));

// Render the 3D frame and copy it under the 2D overlay. Call once per frame, before drawing overlay elements.
export function finish() { C.sky.position.copy(camera.position); renderer.render(scene, camera); ctx.drawImage(C.glc, 0, 0);
  if (STYLE.grid) { ctx.save(); ctx.strokeStyle = STYLE.grid; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); ctx.restore(); } }

export const loadJSON = async (name, base) => (await fetch(new URL(name, base))).json();

// Register a film with the player. scenes: { name: (t, D, q, gt) => void }. cues: { name: { D, q: [...] } }.
// t = seconds into the scene, D = scene length, q = narration cue times, gt = a running clock for looping motion.
// opts.motion: bouncy | snappy | smooth | playful. opts.transition: bands | iris | blinds | push | fade | cut.
// Left unset, both are picked from the film's folder name, so a new film does not move like the last one.
// ?motion= and ?transition= in the URL override them for a quick look.
export function play(order, cues, scenes, o = {}) {
  const Q = new URLSearchParams(location.search), film = Q.get('film') || ''; let h = 2166136261; for (const ch of film) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const names = Object.keys(C.MOTIONS); C.setMotion(Q.get('motion') || o.motion || names[h % names.length], Q.get('transition') || o.transition || C.TRANSITIONS[(h >>> 8) % C.TRANSITIONS.length]);
  window.motion = { motion: C.MOTION.name, transition: C.MOTION.transition };
  window.frame = (i, t, raw = false) => { const n = order[i], D = cues[n].D, q = cues[n].q; if (o.before) o.before();
    scenes[n](t, D, q, t + i * 23.7); if (o.wipe !== false) wipe(t, D, i === 0, i === order.length - 1, o.wipe || {}); return raw ? 0 : out.toDataURL('image/jpeg', 0.93); };
  window.info = order.map(n => ({ n, D: cues[n].D })); window.ready = true; }
