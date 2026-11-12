// Starter film: two short scenes that use the whole workflow. Copy this folder to begin a new film (npm run new <name>).
import * as C from '../../engine/core.js';
import { header, call, card, footer, GRN, NAVY } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, at as onScreen, play, loadJSON } from '../../engine/stage.js';
import { at, box } from '../../engine/parts/kit.js';
import { turbine, spin, popAll, dress } from '../../engine/parts/energy.js';
const { THREE, scene, camKeys } = C;
const CUES = await loadJSON('./cues.json', import.meta.url);      // written by: npm run narrate starter

// 1. Build a set: a group of models. Units are whatever you choose; here 1 unit is about 10 m.
const SET = new THREE.Group(); scene.add(SET); const FR = frameOf(SET);
const mills = [-9, 0, 9].map(x => turbine(SET, x, 0, 0));
SET.add(at(box(4, 2.4, 3, '#E9E0C8'), -16, 1.2, 5), at(box(4.1, 0.5, 3.1, '#3F6FA8', { ol: 0 }), -16, 2.2, 5));
dress(SET, 36, 7, (x, z) => Math.abs(x) < 24 && Math.abs(z) < 11, 70, -40, 16);       // trees and fields, kept clear of the middle

// 2. One function per scene. t = seconds into the scene, D = its length, q[i] = when narration phrase i starts,
//    gt = a clock that keeps running across scenes (use it for motion that should never restart, like rotors).
function intro(t, D, q, gt) {
  env(ENV.day); aim(FR.rel(0, 0, 0), 34); spin(mills, gt); popAll(mills, t, q[0] + 0.2, 0.3);
  camKeys(t, [{ t: 0, p: [0, 8, 36], l: [0, 5, 0], f: 36 }, { t: D, p: [5, 9, 31], l: [0, 5, 0], f: 36 }], FR);
  finish();                                                         // draws the 3D frame; overlay calls come after it
  header('Your title here', 'A subtitle for the scene', t);
  call('Callouts point at things in 3D', onScreen(SET, 0, 8, 0.9), 1180, 330, t, q[1] + 0.2, { align: 'l' });
}
function numbers(t, D, q, gt) {
  env(ENV.day); aim(FR.rel(0, 0, 0), 34); spin(mills, gt); popAll(mills, t, -9);
  camKeys(t, [{ t: 0, p: [5, 9, 31], l: [0, 5, 0], f: 36 }, { t: D, p: [-6, 12, 38], l: [0, 2, 0], f: 36 }], FR);
  finish();
  card(640, 820, '3 turbines', 'cards hold the key figures', t, q[0] + 0.3, GRN); card(1280, 820, '24 fps', 'any frame rate works', t, q[1] + 0.3, NAVY);
  header('Numbers on cue', null, t); footer('Sources go here, so viewers can check the numbers.', t, q[1] + 1.5);
}

// 3. Register the scenes in order. Names must match the scenes in script.json.
play(['intro', 'numbers'], CUES, { intro, numbers });
