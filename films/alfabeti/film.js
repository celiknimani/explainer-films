// The Albanian alphabet and the Abetare: from the first written lines to Alphabet Day 2026. Isometric. Figures and dates: see SOURCES.md.
import * as C from '../../engine/core.js';
import * as S from './sets.js';
import { INK, PAPER, NAVY, RED, text, plate, label, header, footer } from '../../engine/overlay.js';
import { ENV, env, aim, finish, frameOf, at as onScreen, play, loadJSON, SUNISO } from '../../engine/stage.js';
import { drop } from '../../engine/parts/iso.js';
const { THREE, clamp, ease, lerp, isoKeys } = C;
const CUES = await loadJSON('./cues.json', import.meta.url);
const ORDER = ['title', 'early', 'scripts', 'primer', 'congress', 'letters', 'today', 'outro'];
const FR = Object.fromEntries(['GRID', 'EARLY', 'SCRIPTS', 'PRIMER', 'CONG', 'TODAY'].map(n => [n, frameOf(S[n])]));
const E = { ...ENV.studio, ground: '#F5F0E4' }, GREY = '#5B5548', R2 = Math.SQRT2;
// Screen-aligned placing: sx runs to the right of the frame and sd towards the viewer. Returns world [x, z].
const W2 = (sx, sd) => [(sx + sd) / R2, (sd - sx) / R2];
const put = (o, sx, sd, y = 0) => { const [x, z] = W2(sx, sd); o.position.set(x, y, z); return o; };
// One set on stage, lit for isometric, with a camera that settles in the first second and then holds, so pinned labels stay still.
function stage(name, t, l, d) { for (const s of S.SETS) s.visible = s === S[name]; env(E); aim(FR[name].rel(l[0], 0, l[2]), 26, SUNISO); isoKeys(t, [{ t: 0, l, d: d * 1.07 }, { t: 1.0, l, d }], FR[name]); finish(); }
// Things fall into place: y is the resting height. Before t0 they are out of sight.
const fall = (o, t, t0, y = 0, h = 7) => { o.position.y = y + drop(t, t0, 0.55, h); };
// A label pinned to a point of a set, given in screen-aligned coordinates.
const tag = (name, sx, sd, s, t, t0, o = {}) => { const [x, z] = W2(sx, sd), P = onScreen(S[name], x, o.y || 0, z); label(s, P.x, P.y + (o.dy || 0), t, t0, { align: 'c', size: 28, ...o }); };
const year = (name, sx, sd, s, t, t0, o = {}) => tag(name, sx, sd, s, t, t0, { size: 50, bg: '#FFE9A6', ...o });

// ---------------------------------------------------------------- the 36 blocks
const TINT = { base: new THREE.Color(S.CREAM), vowel: new THREE.Color('#F2A79C'), cons: new THREE.Color('#BCD5F0'), pair: new THREE.Color('#F7D277'), mark: new THREE.Color('#BFE3B4') }, col = new THREE.Color();
// k = [vowels, consonants, pairs, marked], each 0 to 1: how far that group is tinted and lifted. arrive: time the blocks start dropping in, or null if already there.
function grid36(t, k, arrive) { S.blocks.forEach((b, i) => { const v = S.VOWELS.has(b.ch), p = S.PAIRS.has(b.ch), m = S.MARKED.has(b.ch);
    col.copy(TINT.base); if (v) col.lerp(TINT.vowel, k[0]); else col.lerp(TINT.cons, k[1]); if (p) col.lerp(TINT.pair, k[2]); if (m) col.lerp(TINT.mark, k[3]); b.mat.color.copy(col);
    const up = (v ? 0.5 * k[0] : 0) + (p ? 0.5 * k[2] : 0) + (m ? 0.7 * k[3] : 0); b.g.position.y = up + (arrive === null ? 0 : drop(t, arrive + i * 0.05, 0.5, 7)); }); }
const LG = [2.55, 0.8, -2.55];      // looks to the right of the blocks, which leaves the right third of the frame for text

// ---------------------------------------------------------------- scenes
function sTitle(t, D, q) {
  grid36(t, [0, 0, 0, 0], 0.2); S.abetare.position.y = -100; stage('GRID', t, LG, 7.6);
  const a = ease(t, q[0] - 0.2, 0.5), b = ease(t, q[1], 0.5); plate(1296, 262 + 30 * (1 - a), 576, 300 + 196 * b, a);
  text('36', 1584, 470, 190, RED, 800, a, 'center'); text('shkronja · letters', 1584, 532, 38, INK, 700, a, 'center');
  text('Alfabeti i gjuhës shqipe', 1584, 636, 42, NAVY, 800, b, 'center'); text('The Albanian alphabet', 1584, 684, 30, INK, 600, b, 'center'); text('and the Abetare, the first schoolbook', 1584, 724, 26, GREY, 500, b, 'center');
}

function sEarly(t, D, q) {
  S.speakers.forEach((p, i) => { p.g.position.set(p.x, 0, p.z); fall(p.g, t, 0.3 + i * 0.15, 0, 5); fall(p.bubble, t, q[0] + 0.5 + i * 0.45, 2.6, 1.4); });
  put(S.earlyA, -5.2, 2.2); fall(S.earlyA, t, q[1] + 0.3); put(S.earlyB, 5.2, 2.2); fall(S.earlyB, t, q[2] + 0.3); stage('EARLY', t, [0, 1, 0], 6.8);
  tag('EARLY', 7.2, -4.4, 'Spoken for centuries\nbefore it was written', t, q[0] + 1.4, { size: 32 });
  year('EARLY', -5.2, 5.9, '1462', t, q[1] + 2.6); tag('EARLY', -5.2, 5.9, 'Baptism formula: the oldest\ndated line in Albanian', t, q[1] + 2.9, { dy: 96 });
  year('EARLY', 5.2, 5.9, '1555', t, q[2] + 1.6); tag('EARLY', 5.2, 5.9, 'Meshari, by Gjon Buzuku:\nthe first known printed book', t, q[2] + 1.9, { dy: 96 });
  header('Before the alphabet', 'The earliest Albanian writing', t);
}

function sScripts(t, D, q) {
  const T0 = [q[1] + 0.2, q[1] + 2.9, q[1] + 4.6, q[2] + 0.2], SX = [-7.05, -2.35, 2.35, 7.05];
  S.scriptTiles.forEach((g, i) => { put(g, SX[i], 0.4); fall(g, t, T0[i]); }); stage('SCRIPTS', t, [0, 1.2, 0], 6.6);
  ['Latin letters\nin the north', 'Greek letters\nin the south', 'Arabic script\nin Ottoman times', 'Invented scripts:\nElbasan, Todhri, Vithkuqi'].forEach((s, i) => tag('SCRIPTS', SX[i], 3.4, s, t, T0[i] + 0.7, { dy: 40, size: i === 3 ? 25 : 28 }));
  header('One language, many alphabets', 'How Albanian was written before 1908', t);
}

function sPrimer(t, D, q) {
  put(S.evetar, -7.6, -1.6); fall(S.evetar, t, 0.5); S.primers.forEach((g, i) => { put(g, 1.6 + i * 2.7, -3.0); g.rotation.y = 0.25 - i * 0.2; fall(g, t, q[1] + 0.3 + i * 0.3); });
  S.sixTabs.forEach((g, i) => { put(g, -0.6 + i * 1.95, 3.4); fall(g, t, q[2] + 0.4 + i * 0.14); }); stage('PRIMER', t, [0, 1, 0], 7.1);
  year('PRIMER', -7.6, 1.5, '1844', t, q[0] + 1.6); tag('PRIMER', -7.6, 1.5, 'Ëvetar, by Naum Veqilharxhi:\nthe first Albanian primer, printed\nin his own 33-letter script', t, q[0] + 1.9, { dy: 116 });
  tag('PRIMER', 4.3, -1.0, 'Kristoforidhi (1867–72), the Istanbul society (1879),\nGurakuqi (1905–06) and others', t, q[1] + 1.3, { size: 26 });
  year('PRIMER', 4.3, 5.6, '6 or more', t, q[2] + 1.6, { size: 44 }); tag('PRIMER', 4.3, 5.6, 'alphabets in use before 1908', t, q[2] + 1.9, { dy: 78 });
  header('The first primers', 'From the Ëvetar of 1844 to a crowd of alphabets', t);
}

const NAVYC = new THREE.Color('#3F6FA8'), GOLDC = new THREE.Color('#F4BE42'), COMM = new Set([13, 14, 15, 16, 23, 24, 25, 26, 34, 35, 36]);      // the eleven who step out as the commission
function sCongress(t, D, q) {
  put(S.theHouse, 2.2, -5.2); fall(S.theHouse, t, 0.3); const kc = ease(t, q[2] + 0.3, 0.6);
  S.delegates.forEach((p, i) => { const c = COMM.has(i) ? kc : 0; p.mat.color.copy(NAVYC).lerp(GOLDC, c); p.g.position.y = 0.6 * c + drop(t, q[0] + 1.5 + i * 0.035, 0.4, 5); });
  const sink = ease(t, q[3] + 0.6, 1.2), rise = ease(t, q[3] + 0.9, 0.6);
  put(S.tabIstanbul, -9.6, 3.0); S.tabIstanbul.position.y = -3.2 * sink + drop(t, q[1] + 0.3, 0.55, 7); put(S.tabLatin, 9.6, 3.0); S.tabLatin.position.y = 0.7 * rise + drop(t, q[1] + 0.9, 0.55, 7);
  stage('CONG', t, [0, 1.6, 1], 9.0);
  tag('CONG', 11.6, -6.4, 'Manastir (today Bitola)\n14–22 November 1908', t, q[0] + 3.0, { size: 30 });
  tag('CONG', 0, 8.2, '50 delegates, 32 with a vote', t, q[0] + 2.4, { t1: q[2] + 0.2, size: 30 });
  tag('CONG', 0, 8.2, 'A commission of 11, chaired by Gjergj Fishta', t, q[2] + 0.5, { size: 30, bg: '#FFE9A6' }); tag('CONG', 0, 8.2, 'Decision: the Latin and the Istanbul alphabet, side by side', t, q[2] + 2.8, { dy: 70, size: 27 });
  tag('CONG', -9.6, 5.6, 'Istanbul alphabet\n(1879)', t, q[1] + 1.0, { t1: q[3] + 0.9, size: 26 }); tag('CONG', 9.6, 5.6, 'Latin alphabet\n(Bashkimi, Shkodër)', t, q[1] + 1.5, { t1: q[3] + 1.4, size: 26 });
  tag('CONG', 9.6, 5.6, 'Today\'s alphabet', t, q[3] + 1.6, { size: 32, bg: '#FFE9A6', dy: 20 }); tag('CONG', -9.6, 5.6, 'out of use\nwithin a few years', t, q[3] + 2.0, { size: 26, bg: PAPER });
  header('The Congress of Manastir', 'Eight days in November 1908', t);
}

function sLetters(t, D, q) {
  const k = [ease(t, q[0] + 2.0, 0.5), ease(t, q[0] + 3.3, 0.5), ease(t, q[1] + 0.5, 0.5), ease(t, q[2] + 0.3, 0.5)]; grid36(t, k, null); S.abetare.position.y = -100; stage('GRID', t, LG, 7.6);
  [['36 letters, one sound each', '#FFFFFF', 1.1], ['7 vowels', '#F2A79C', q[0] + 2.0], ['29 consonants', '#BCD5F0', q[0] + 3.3], ['9 written as pairs:\ndh gj ll nj rr sh th xh zh', '#F7D277', q[1] + 0.5], ['2 with a mark:  ç  ë', '#BFE3B4', q[2] + 0.3]].forEach(([s, bg, t0], i) =>
    label(s, 1310, 300 + [0, 96, 192, 310, 428][i], t, t0, { align: 'l', size: 36, bg }));
  header('The alphabet today', 'One letter for each sound', t);
}

function sToday(t, D, q) {
  [S.todayA, S.todayB, S.todayC].forEach((g, i) => { put(g, -8.4 + i * 8.4, 0); fall(g, t, q[i] + 0.3); }); stage('TODAY', t, [0, 1.2, 0], 7.0);
  year('TODAY', -8.4, 3.7, '1972', t, q[0] + 1.3); tag('TODAY', -8.4, 3.7, 'Orthography Congress, Tirana:\none standard spelling', t, q[0] + 1.6, { dy: 96 });
  year('TODAY', 0, 3.7, '2012 · 2022', t, q[1] + 1.3, { size: 44 }); tag('TODAY', 0, 3.7, 'A shared Abetare for Albania\nand Kosovo, then a new joint edition', t, q[1] + 1.6, { dy: 96, size: 26 });
  year('TODAY', 8.4, 3.7, 'Unicode', t, q[2] + 1.3, { size: 44 }); tag('TODAY', 8.4, 3.7, 'Elbasan (2014), Vithkuqi (2021)\nand Todhri (2024) scripts added', t, q[2] + 1.6, { dy: 96, size: 26 });
  header('Since 1908', 'Spelling, schoolbooks and screens', t);
}

function sOutro(t, D, q) {
  grid36(t, [1, 1, 1, 1], null); const [bx, bz] = W2(0, 10.6); S.abetare.position.set(bx, 0, bz); fall(S.abetare, t, q[1] + 0.4);
  stage('GRID', t, [4.4, 0.8, -0.7], 8.6);
  const a = ease(t, q[0] + 0.2, 0.5); plate(1300, 250 + 30 * (1 - a), 570, 330, a); text('118', 1585, 420, 150, RED, 800, a, 'center'); text('years', 1585, 474, 40, INK, 700, a, 'center');
  text('since the Congress of Manastir', 1585, 526, 28, GREY, 600, a, 'center'); text('22 November 1908 – 2026', 1585, 562, 28, NAVY, 700, a, 'center');
  label('Abetare: the first book,\nthe same 36 letters', 1585, 700, t, q[1] + 1.4, { align: 'c', size: 34, bg: '#FFE9A6' });
  footer('Sources: Wikipedia (Congress of Manastir, Albanian alphabet, Abetare), Unicode Consortium, ATSH, Radio Evropa e Lirë, Dukagjini. See SOURCES.md.', t, q[1] + 3.0);
}

play(ORDER, CUES, { title: sTitle, early: sEarly, scripts: sScripts, primer: sPrimer, congress: sCongress, letters: sLetters, today: sToday, outro: sOutro },
  { motion: 'snappy', transition: 'iris', wipe: { c1: '#D9503F', c2: '#F4BE42' } });
