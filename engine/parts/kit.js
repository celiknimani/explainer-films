// Small building blocks used by every parts module and most films.
import * as C from '../core.js';
const { THREE, V, toon, M, segMatrix } = C;
export const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), one = V(1, 1, 1);
const MAT = {};
export const tm = c => MAT[c] || (MAT[c] = toon(c));                       // cached toon material by colour
export const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };   // position and return
export const box = (w, h, d, c, o = {}) => M(new THREE.BoxGeometry(w, h, d), typeof c === 'string' ? tm(c) : c, o);
export const cyl = (rt, rb, h, c, o = {}, seg = 18) => M(new THREE.CylinderGeometry(rt, rb, h, seg), typeof c === 'string' ? tm(c) : c, o);
let seed = 5; export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // seeded, so every render is identical
export const sb = (a, b, th, th2) => new THREE.BoxGeometry(1, 1, 1).applyMatrix4(segMatrix(a, b, th, new THREE.Matrix4(), th2 ?? th));   // box geometry from a to b
export const hideInst = mesh => { for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); mesh.instanceMatrix.needsUpdate = true; };
export const RED = '#D9503F';
