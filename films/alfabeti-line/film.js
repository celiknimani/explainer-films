// The Albanian alphabet told as one line: speech becomes writing, one line becomes many scripts, and many become one alphabet.
// Flat style (engine/flat.js): a single board and a camera that travels along the line. Facts and dates: see SOURCES.md.
import { W, H, ctx, INK, PAPER, MUTE, clamp, lerp, prog, io3, settle, over, ez, pop, mix, timeline, slide, when, camAt, fit, world, screen, toScreen, clear, dots,
  font, width, type, roll, path, ess, at, along, trace, disc, ring, box, rule, stop, flood, play, loadJSON } from '../../engine/flat.js';
const CUES = await loadJSON('./cues.json', import.meta.url);
const ORDER = ['title', 'early', 'scripts', 'primer', 'congress', 'letters', 'today', 'outro'];
const { Q, end } = timeline(ORDER, CUES);
const RED = '#E5322D', NAVY = '#27407A', TEAL = '#1E9C8B', AMBER = '#EFA325', GREY = '#B4B7BF', FAINT = '#CDCFD5', WHITE = '#FFFFFF';
const LETTERS = 'a b c ç d dh e ë f g gj h i j k l ll m n nj o p q r rr s sh t th u v x xh y z zh'.split(' '), VOWELS = new Set('aeëiouy'), MARKED = new Set('çë');
const Y1 = 700, Y2 = 1900;                    // the two levels the line runs on

// ---------- the line
const wave = []; for (let x = 2050; x <= 3250; x += 6) wave.push([x, Y1 - 82 * Math.sin(Math.PI * (x - 2050) / 1200) * Math.sin((x - 2050) / 150 * Math.PI * 2)]);
const SP = path([[150, Y1], ...wave, [6900, Y1], ...ess(6900, Y1, 7900, Y2)]);                                   // title underline, speech, writing, down to the split
const slotY = i => Y2 + (i - 2.5) * 18, INTO = 16340;                                                             // the strands arrive at the congress as a tight bundle
const strand = (lead, y, slot) => path([...lead, ...ess(14700, y, 15300, slotY(slot)), [INTO, slotY(slot)]]);
const STR = [                                                                                                     // top to bottom
  { P: strand(ess(7900, Y2, 8300, 1540), 1540, 0), y: 1540, col: RED, base: 0 }, { P: strand(ess(12900, 1540, 13200, 1660), 1660, 1), y: 1660, col: INK },
  { P: strand(ess(7900, Y2, 8300, 1780), 1780, 2), y: 1780, col: NAVY, base: 1 }, { P: strand(ess(7900, Y2, 8300, 2020), 2020, 3), y: 2020, col: TEAL, base: 2 },
  { P: strand(ess(12900, 2260, 13200, 2140), 2140, 4), y: 2140, col: GREY }, { P: strand(ess(7900, Y2, 8300, 2260), 2260, 5), y: 2260, col: AMBER, base: 3 }];
const BK = { x: 27500, l: 27140, r: 27860, top: 1750, bot: 2060 };                                                 // the book the line ends as
const RP = path([[17060, 1860], ...ess(18000, 1860, 18300, Y2), ...ess(26800, Y2, BK.l, BK.bot), [BK.x, BK.bot + 50, 30], [BK.r, BK.bot, 24], [BK.r, BK.top, 24], [BK.x, BK.top + 50, 30], [BK.l, BK.top, 24], [BK.l, BK.bot]]);
const IP = path([[17060, 1940], [18100, 1940]]);
// Where each line's head is, as a board x that slides between holds. Every time is a narration cue plus an offset.
const SPX = [[0, 0, 150], [Q.title[1] + 1.6, 1.1, 1300], [Q.early[0] + 0.6, 2.1, 3450], [Q.early[1] + 0.9, 1.4, 3600], [Q.early[1] + 4.2, 2.6, 5000], [Q.early[2] + 0.7, 1.3, 5500], [Q.early[2] + 2.6, 1.5, 6900], [Q.scripts[0] + 0.8, 1.9, 7900]];
const INTRO = [Q.scripts[1] + 0.2, Q.scripts[1] + 2.5, Q.scripts[1] + 4.8, Q.scripts[2] + 0.2];                   // when each script is named
const STX = s => s.base !== undefined
  ? [[0, 0, 7900], [Q.scripts[0] + 2.1 + s.base * 0.08, 1.1, 8380], [INTRO[s.base] + 1.3, 1.3, 9850], [Q.primer[0] + 0.8, 1.8, 11660], [Q.primer[1] + 0.9, 1.7, 13500], [Q.primer[2] + 1.0, 1.6, 15100], [Q.congress[0] + 0.7, 1.6, INTO]]
  : [[0, 0, 12900], [Q.primer[2] + 1.3, 1.3, 15100], [Q.congress[0] + 0.7, 1.6, INTO]];
STR.forEach(s => { s.keys = STX(s); });
const RPX = [[0, 0, 17060], [Q.congress[2] + 3.8, 1.6, 18000], [Q.congress[3] + 2.4, 1.5, 18700], [Q.letters[0] + 2, 1, 19350], [Q.today[0] + 1.3, 1.7, 20960], [Q.today[1] + 1.1, 1.3, 21150], [Q.today[1] + 6.0, 1.4, 22150],
  [Q.today[2] + 1.2, 1.5, 22900], [Q.today[2] + 2.7, 0.6, 23100], [Q.today[2] + 3.4, 0.6, 23650], [Q.today[2] + 4.1, 0.6, 24200], [Q.today[2] + 4.7, 0.5, 24500], [Q.outro[0] + 0.6, 1.5, 25050], [Q.outro[0] + 2.4, 1.5, 26500]];
const IPX = [[0, 0, 17060], [Q.congress[2] + 3.8, 1.6, 18000], [Q.congress[3] + 1.4, 0.8, 18100]];
const BOOK0 = Q.outro[1] + 1.0, BOOK1 = Q.outro[1] + 3.4, S26500 = along(RP, 26500);

// ---------- the camera: one stop per idea
const CAMK = [{ t: 0, d: 0, x: 960, y: 540, z: 1 },
  { t: Q.early[0] + 0.3, d: 1.8, ...fit(2040, 250, 3500, 905) }, { t: Q.early[1] + 1.1, d: 1.6, ...fit(3580, 420, 5010, 930) }, { t: Q.early[2] + 0.9, d: 1.6, ...fit(5480, 360, 6770, 930) },
  { t: Q.scripts[0] + 0.9, d: 2.0, ...fit(6560, 1500, 8390, 2290, 40) }, { t: Q.scripts[1] + 0.9, d: 1.6, ...fit(7880, 1440, 9510, 2330, 70) },
  { t: Q.primer[0] + 0.9, d: 1.8, ...fit(9880, 1990, 11500, 2550) }, { t: Q.primer[1] + 1.1, d: 1.6, ...fit(11640, 1290, 13340, 2530, 50) }, { t: Q.primer[2] + 1.0, d: 1.6, ...fit(12880, 1330, 15000, 2300, 60) },
  { t: Q.congress[0] + 0.9, d: 2.0, ...fit(15410, 1470, 17000, 2210) }, { t: Q.congress[2] + 3.9, d: 1.7, ...fit(17010, 1530, 18720, 2040, 90) },
  { t: Q.letters[0] + 3, d: 1, ...fit(19330, 1620, 20840, 2090), lift: 0 },                                       // made behind the red, so it is never seen
  { t: Q.today[1] + 1.2, d: 1.6, ...fit(21130, 1600, 22700, 2080) }, { t: Q.today[2] + 1.1, d: 1.5, ...fit(22950, 1510, 24590, 2305) },
  { t: Q.outro[0] + 0.7, d: 1.7, ...fit(25030, 1550, 26600, 2030) }, { t: Q.outro[1] + 1.3, d: 1.7, x: 27500, y: 1890, z: 1 }, { t: end - 0.2, d: 5.0, x: 27500, y: 1900, z: 0.93, lift: 0 }];
const cam = T => camAt(T, CAMK);

// ---------- small pieces
const cap = (s, x, y, T, t0, o = {}) => type(s, x, y, T, t0, { size: 26, w: 700, ls: 0.16, col: MUTE, by: 'line', ...o });          // small spaced capitals
const sub = (s, x, y, T, t0, o = {}) => type(s, x, y, T, t0, { size: 36, w: 500, col: MUTE, ...o });
// An open book in line art. It opens from the spine and its text lines draw on.
function book(x, y, s, T, t0, o = {}) {
  const k = settle(prog(T, t0, 0.8)); if (k <= 0) return; const { col = INK, lw = 6, rules = 3, fill = PAPER } = o, w = s * (0.1 + 0.9 * k);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = clamp(k * 3); ctx.lineJoin = ctx.lineCap = 'round';
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(d * w, -s * 0.52); ctx.lineTo(d * w, s * 0.4); ctx.lineTo(0, s * 0.5); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
    for (let j = 0; j < rules; j++) { const r = settle(prog(T, t0 + 0.5 + j * 0.12 + (d > 0 ? 0.36 : 0), 0.4)), yy = -s * 0.24 + j * s * 0.56 / Math.max(1, rules - 1) * 0.8, xa = d * w * 0.2, xb = d * w * (0.2 + 0.6 * r);
      if (r > 0) { ctx.beginPath(); ctx.moveTo(xa, yy - s * 0.02); ctx.lineTo(xb, yy - s * 0.02 - s * 0.06 * r); ctx.strokeStyle = FAINT; ctx.lineWidth = lw * 0.7; ctx.stroke(); } } }
  ctx.restore();
}
// One glyph or short sample, centred, popping in.
function glyph(s, x, y, T, t0, o = {}) { const k = pop(T, t0); if (k <= 0) return; const { size = 84, col = INK, fam = 'Inter', w = 700, a = 1 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha = a * clamp(k * 3); font(size, w, fam, 0); ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.fillText(s, 0, size * 0.34); ctx.restore(); }

// ---------- lines, drawn first so type sits on top
function lines(T) {
  trace(SP, 0, along(SP, slide(T, SPX)), { col: RED, w: 12 });
  for (const s of STR) trace(s.P, 0, along(s.P, slide(T, s.keys)), { col: s.col, w: 10 });
  trace(IP, 0, along(IP, slide(T, IPX)), { col: mix(INK, GREY, prog(T, Q.congress[3] + 1.5, 0.8)), w: 10 });
  rule(18100, 1916, 18100, 1964, ez(T, Q.congress[3] + 1.5, 0.3), GREY, 10);
  trace(RP, 0, T < BOOK0 ? along(RP, slide(T, RPX)) : lerp(S26500, RP.len, io3(prog(T, BOOK0, BOOK1 - BOOK0))), { col: RED, w: 12 });
}

// ---------- title
function title(T) {
  const q = Q.title;
  cap('22 NËNTOR  ·  DITA E ALFABETIT', 152, 150, T, 0.3);
  roll('36', 132, 660, T, q[0], { size: 480, col: RED, t1: q[1] - 0.3 });
  type('letters.', 800, 480, T, q[0] + 0.5, { size: 160, w: 800, t1: q[1] - 0.25 });
  type('One sound for each.', 808, 606, T, q[0] + 1.7, { size: 68, w: 600, col: MUTE, t1: q[1] - 0.2 });
  LETTERS.forEach((l, i) => { const t0 = q[0] + 0.1 + i * 0.034, k = settle(prog(T, t0, 0.4)); if (k <= 0) return;      // the whole alphabet, lit one letter at a time
    const hot = Math.max(1 - prog(T, t0 + 0.12, 0.6), Math.sin(Math.PI * prog(T, q[1] + 2.9 + i * 0.03, 0.5)));
    ctx.save(); ctx.globalAlpha = clamp(k * 2); font(40, 700, 'Inter', 0); ctx.textAlign = 'center'; ctx.fillStyle = mix(FAINT, RED, hot); ctx.fillText(l, 172 + i * 45.2, 946 + 24 * (1 - k)); ctx.restore(); });
  type('The Albanian\nalphabet', 144, 440, T, q[1] + 0.1, { size: 176, w: 800, lh: 0.97 });
  sub('and the first book every child opens.', 152, 806, T, q[1] + 2.7, { size: 46 });
  book(1570, 470, 170, T, q[1] + 3.4);
}

// ---------- spoken, then written
const T1462 = when(SPX, 3600), T1555 = when(SPX, 5500);
function early(T) {
  const q = Q.early;
  type('Spoken', 2046, 400, T, q[0] + 0.2, { size: 176, w: 800 }); type('long before it was written.', 2056, 500, T, q[0] + 0.9, { size: 64, w: 600, col: MUTE });
  cap('SPOKEN', 2650, 884, T, q[0] + 0.8, { align: 'c', t1: q[1] - 0.4 }); cap('WRITTEN', 3410, 884, T, q[0] + 2.0, { align: 'c', col: INK, t1: q[1] - 0.4 });
  stop(3600, Y1, T, T1462, RED); roll('1462', 3584, Y1 - 100, T, T1462, { size: 220 });
  type('Baptism formula', 3590, Y1 + 116, T, T1462 + 0.3, { size: 58, w: 800 }); sub('The oldest dated line in Albanian', 3590, Y1 + 170, T, T1462 + 0.5); sub('Pal Engjëlli · 8 November 1462', 3590, Y1 + 218, T, T1462 + 0.65);
  type('“Un’te paghesont’ pr’emenit\nt’Atit e t’Birit e t’Spertit Senit.”', 4250, Y1 - 190, T, T1462 + 0.9, { size: 54, w: 600, by: 'char', gap: 0.03, d: 0.4, lh: 1.3 });
  sub('“I baptise you in the name of the Father,\nand the Son, and the Holy Spirit.”', 4250, Y1 + 116, T, T1462 + 3.0, { size: 34, lh: 1.36 });
  stop(5500, Y1, T, T1555, RED); roll('1555', 5484, Y1 - 100, T, T1555, { size: 220 });
  type('Meshari', 5490, Y1 + 116, T, T1555 + 0.3, { size: 58, w: 800 }); sub('The first known printed book in Albanian', 5490, Y1 + 170, T, T1555 + 0.5); sub('Gjon Buzuku', 5490, Y1 + 218, T, T1555 + 0.65);
  book(6560, 470, 190, T, T1555 + 0.6, { rules: 4 });
}

// ---------- one line becomes four
const NAMES = ['Latin', 'Greek', 'Arabic', 'Invented scripts'], NOTES = ['in the north', 'in the south', 'the Ottoman script', 'Elbasan · Todhri · Vithkuqi'];
function scripts(T) {
  const q = Q.scripts;
  type('For centuries,', 6570, 1640, T, q[0] + 0.1, { size: 64, w: 600, col: MUTE }); type('no single\nalphabet.', 6564, 1790, T, q[0] + 1.3, { size: 150, w: 800, lh: 1.02 });
  stop(7900, Y2, T, when(SPX, 7890), INK, 30);
  STR.filter(s => s.base !== undefined).forEach(s => { const i = s.base, t0 = INTRO[i] + 0.25;
    type(NAMES[i], 8400, s.y - 34, T, t0, { size: 58, w: 800 }); sub(NOTES[i], 8402, s.y + 56, T, t0 + 0.25, { size: 30 });
    if (i === 0) glyph('Aa Bb Cc', 9330, s.y - 74, T, t0 + 0.5, { col: s.col });
    if (i === 1) glyph('Αα Ββ Γγ', 9330, s.y - 74, T, t0 + 0.5, { col: s.col });
    if (i === 2) glyph('ا ب ج', 9330, s.y - 78, T, t0 + 0.5, { col: s.col, fam: 'Arabic', w: 400, size: 96 });
    if (i === 3) [['𐔀', 'Elbasan'], ['𐗀', 'Todhri'], ['𐕰', 'Vithkuqi']].forEach(([g, fam], j) => glyph(g, 9200 + j * 130, s.y - 76, T, t0 + 0.5 + j * 0.14, { col: s.col, fam, w: 400, size: 116 })); });
}

// ---------- primers, and more alphabets
const T1844 = Q.primer[0] + 1.0, PRIMERS = [['1867–72', 'Kristoforidhi · Gheg and Tosk'], ['1879', 'The Istanbul primer'], ['1905–06', 'Gurakuqi']];
function primer(T) {
  const q = Q.primer;
  stop(9900, 2260, T, T1844, AMBER); roll('1844', 9884, 2512, T, T1844, { size: 220 });
  book(10640, 2436, 112, T, T1844 + 2.3, { rules: 0 }); ['𐕰', '𐕱', '𐕲', '𐕳'].forEach((g, j) => glyph(g, 10640 + (j < 2 ? -1 : 1) * (j % 2 ? 76 : 34), 2428, T, T1844 + 2.9 + j * 0.1, { size: 36, fam: 'Vithkuqi', w: 400, col: AMBER }));
  type('Ëvetar', 10830, 2416, T, T1844 + 2.6, { size: 64, w: 800, t1: q[1] - 0.4 }); sub('The first Albanian primer', 10832, 2470, T, T1844 + 2.8, { t1: q[1] - 0.4 }); sub('by Naum Veqilharxhi, in his own script', 10832, 2518, T, T1844 + 3.0, { t1: q[1] - 0.4 });
  PRIMERS.forEach(([yr, who], j) => { const x = 11720 + j * 600, t0 = q[1] + 1.4 + j * 0.5;
    rule(x, 1492, x, 2308, ez(T, t0, 0.7), FAINT, 3); book(x, 1396, 56, T, t0 + 0.1, { rules: 0, lw: 5 });
    type(yr, x + 80, 1392, T, t0 + 0.2, { size: 54, w: 800 }); sub(who, x + 81, 1436, T, t0 + 0.35, { size: 30 }); });
  type('More primers followed', 11700, 2436, T, q[1] + 0.7, { size: 96, w: 800, t1: q[2] - 0.5 }); sub('in different alphabets, and in both dialects', 11705, 2494, T, q[1] + 1.2, { size: 40, t1: q[2] - 0.5 });
  type('At least six alphabets', 13420, 1440, T, q[2] + 1.9, { size: 120, w: 800 }); sub('in use by the start of the twentieth century', 13426, 1498, T, q[2] + 2.3);
  STR.forEach((s, i) => { const k = pop(T, q[2] + 2.6 + i * 0.13); if (k <= 0) return;                             // count them
    disc(14250, s.y, 30 * k, s.col); disc(14250, s.y, 22 * k, PAPER); ctx.save(); ctx.globalAlpha = clamp(k * 2); font(28, 800, 'InterNum', 0); ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(i + 1, 14250, s.y + 10); ctx.restore(); });
}

// ---------- the congress: fifty delegates, thirty-two votes, a commission of eleven
const HUB = [16700, Y2, 290], NOVOTE = i => (i * 18) % 50 < 18, VOTERS = [...Array(50).keys()].filter(i => !NOVOTE(i)), COMM = [...Array(11).keys()].map(j => VOTERS[Math.floor(j * 32 / 11)]);
const seat = i => { const a = (-90 + (i + 0.5) * 7.2) * Math.PI / 180; return [HUB[0] + HUB[2] * Math.cos(a), HUB[1] + HUB[2] * Math.sin(a)]; };
const huddle = j => j === 0 ? [HUB[0], HUB[1] - 40] : [HUB[0] + 74 * Math.cos(j * Math.PI / 5), HUB[1] - 40 + 74 * Math.sin(j * Math.PI / 5)];
function congress(T) {
  const q = Q.congress, tH = q[0] + 0.7, tSeat = q[0] + 2.7, tVote = q[0] + 5.0, tCom = q[2] + 0.6;
  roll('1908', 15414, 1650, T, tH, { size: 220 }); type('Manastir', 15420, 1740, T, q[0] + 4.3, { size: 62, w: 800 }); sub('today Bitola · 14–22 November', 15420 + width('Manastir', 62, 800) + 26, 1740, T, q[0] + 5.2, { size: 34 });
  roll('50', 15418, 2112, T, tSeat, { size: 120 }); sub('delegates', 15424, 2162, T, tSeat + 0.2, { size: 32 });
  roll('32', 15758, 2112, T, tVote, { size: 120 }); sub('with a vote', 15764, 2162, T, tVote + 0.2, { size: 32 });
  roll('11', 16078, 2112, T, tCom, { size: 120, col: RED }); sub('on the alphabet\ncommission', 16084, 2162, T, tCom + 0.2, { size: 32, lh: 1.25 });
  for (let i = 0; i < 50; i++) { const k = pop(T, tSeat + i * 0.03, 0.4); if (k <= 0) continue; const [x, y] = seat(i), j = COMM.indexOf(i);
    if (NOVOTE(i)) { disc(x, y, 12 * k, INK); disc(x, y, 7.5 * k * ez(T, tVote + i * 0.01, 0.4), PAPER); }                // observers become rings
    else if (j < 0) disc(x, y, 12 * k, INK);
    else { const m = io3(prog(T, tCom + 0.3 + j * 0.05, 0.9)), [hx, hy] = huddle(j); disc(lerp(x, hx, m), lerp(y, hy, m), 12 * k + 4 * m, mix(INK, RED, prog(T, tCom + j * 0.04, 0.3))); } }
  sub('One question', HUB[0], 1826, T, q[1] + 0.2, { align: 'c', w: 600, t1: q[2] - 0.25 }); type('Which\nletters?', HUB[0], 1908, T, q[1] + 1.9, { size: 96, w: 800, align: 'c', lh: 1.0, t1: q[2] - 0.2 });
  type('Commission of 11', HUB[0], 2046, T, tCom + 1.1, { size: 34, w: 700, col: RED, align: 'c' });
  type('Latin', 17660, 1826, T, q[2] + 3.4, { size: 58, w: 800, col: RED }); type('Istanbul', 17660, 2012, T, q[2] + 4.8, { size: 58, w: 800, col: mix(INK, GREY, prog(T, q[3] + 1.5, 0.8)) });
  type('Within a few years,', 17020, 1578, T, q[3] + 0.1, { size: 48, w: 600, col: MUTE }); type('one alphabet.', 17014, 1704, T, q[3] + 2.0, { size: 130, w: 800 });
}

// ---------- thirty-six letters, on red. Drawn in screen pixels over everything else.
const FLOOD0 = Q.congress[3] + 4.1, FLOOD1 = Q.letters[2] + 1.7, WH = a => `rgba(255,255,255,${a})`;
function letters(T, c) {
  const q = Q.letters, kin = io3(prog(T, FLOOD0, 0.9)), kout = io3(prog(T, FLOOD1, 0.9)); if (kin <= 0 || kout >= 1) return;
  flood(...(kout > 0 ? toScreen(19350, Y2, c) : toScreen(18700, Y2, c)), kin * (1 - kout), RED);
  const A = prog(T, FLOOD0 + 0.5, 0.4) * (1 - prog(T, FLOOD1 - 0.4, 0.4)); if (A <= 0) return;
  const tV = q[0] + 2.0, tC = q[0] + 3.3, tP = q[1] + 0.5, tM = q[2] + 0.3; let nv = 0, np = 0;
  cap('ALFABETI I GJUHËS SHQIPE', 132, 122, T, q[0] - 0.4, { col: WH(0.75), a: A });
  LETTERS.forEach((l, i) => { const cx = 190 + (i % 9) * 128, cy = 262 + Math.floor(i / 9) * 162, k = pop(T, q[0] - 0.5 + i * 0.022, 0.5); if (k <= 0) return;
    const vow = VOWELS.has(l), v = vow ? pop(T, tV + nv++ * 0.07) : 0, bump = vow ? 0 : Math.sin(Math.PI * prog(T, tC + i * 0.014, 0.4));
    if (v > 0) disc(cx, cy, 62 * v, WHITE, A);
    if (l.length === 2) { const p = pop(T, tP + np++ * 0.06); if (p > 0) box(cx - 60 * p, cy - 60 * p, 120 * p, 120 * p, 26, WHITE, { line: 5, a: A * clamp(p * 2) }); }
    if (MARKED.has(l)) { const m = pop(T, tM + (l === 'ë' ? 0.25 : 0)), u = prog(T, tM + (l === 'ë' ? 0.25 : 0), 0.9); ring(cx, cy, 76 * m, 6, WHITE, 1, A); if (u > 0 && u < 1) ring(cx, cy, 76 + 70 * settle(u), 4, WHITE, 1, A * (1 - u)); }
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k * (1 + 0.2 * bump), k * (1 + 0.2 * bump)); ctx.globalAlpha = A * clamp(k * 2); font(84, 700, 'Inter', -0.02); ctx.textAlign = 'center'; ctx.fillStyle = v > 0.5 ? RED : WHITE; ctx.fillText(l, -1, 27); ctx.restore(); });
  roll('36', 1404, 520, T, q[0] - 0.3, { size: 300, col: WHITE, a: A }); type('letters', 1414, 612, T, q[0], { size: 76, w: 700, col: WHITE, a: A }); sub('one sound for each', 1416, 668, T, q[0] + 0.3, { col: WH(0.78), a: A });
  [[170, '7', 'vowels', tV], [480, '29', 'consonants', tC], [940, '9', 'written as pairs', tP], [1430, '2', 'carry a mark', tM]].forEach(([x, n, s, t0]) => {
    roll(n, x, 968, T, t0, { size: 120, col: WHITE, a: A, d: 0.7 }); type(s, x + width(n, 120, 800, 'InterNum', -0.03) + 20, 968, T, t0 + 0.15, { size: 40, w: 600, col: WH(0.82), a: A }); });
}

// ---------- one standard, one shared primer, a place in Unicode
const WORD = [...'drejtshkrimi'], JIT = WORD.map((_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1]);     // fixed scatter, -1 to 1
const T2012 = when(RPX, 21150), T2022 = when(RPX, 22150), TILES = [['Elbasan', '7.0', '2014', '𐔀', 23100], ['Vithkuqi', '14.0', '2021', '𐕰', 23650], ['Todhri', '16.0', '2024', '𐗀', 24200]];
function today(T) {
  const q = Q.today, tJ = q[0] - 0.5, tS = q[0] + 5.3;
  stop(19350, Y2, T, 0, RED); roll('1972', 19334, 1800, T, tJ, { size: 220 });
  type('Orthography Congress', 19340, 2016, T, q[0] + 2.4, { size: 58, w: 800 }); sub('Tirana · 20–25 November 1972', 19340, 2070, T, q[0] + 2.7);
  font(120, 800, 'Inter', -0.02); let x = 20090; WORD.forEach((ch, i) => { const wch = ctx.measureText(ch).width, k = settle(prog(T, q[0] + 3.6 + i * 0.04, 0.4)), m = 1 - clamp(over(prog(T, tS + i * 0.035, 0.6)), 0, 1.1);      // letters out of line, then in line
    if (k > 0) { ctx.save(); ctx.translate(x + wch / 2, 1790 + JIT[i][0] * 44 * m); ctx.rotate(JIT[i][1] * 0.32 * m); ctx.globalAlpha = clamp(k * 2); font(120, 800, 'Inter', -0.02); ctx.textAlign = 'center'; ctx.fillStyle = mix(INK, MUTE, m); ctx.fillText(ch, 0, 0); ctx.restore(); }
    x += wch; });
  type('One standard spelling', 20094, 2016, T, tS + 0.5, { size: 46, w: 700, col: RED }); sub('drejtshkrimi: orthography', 20094, 2066, T, tS + 0.8, { size: 30 });
  stop(21150, Y2, T, T2012, RED); roll('2012', 21136, 1800, T, T2012, { size: 170 });
  type('A shared Abetare', 21140, 2012, T, T2012 + 2.5, { size: 54, w: 800 }); sub('Albania and Kosovo', 21140, 2064, T, T2012 + 2.8);
  { const k = pop(T, T2012 + 0.8), dx = lerp(150, 52, io3(prog(T, T2012 + 2.4, 1.0))), cx = 21830, cy = 1716, r = 86 * k;                       // two circles that come to share a middle
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.arc(cx - dx, cy, r, 0, 7); ctx.clip(); disc(cx + dx, cy, r, RED); ctx.restore(); ring(cx - dx, cy, r, 6, INK); ring(cx + dx, cy, r, 6, INK); } }
  stop(22150, Y2, T, T2022, RED); roll('2022', 22136, 1800, T, T2022, { size: 170 }); type('A new joint edition', 22140, 2012, T, T2022 + 0.9, { size: 54, w: 800 });
  sub('The old invented scripts', 22962, 1560, T, q[2] + 0.9, { size: 48, w: 600 }); type('now in Unicode', 22956, 1694, T, q[2] + 2.6, { size: 130, w: 800 }); sub('the standard behind every screen', 23990, 1694, T, q[2] + 4.7);
  TILES.forEach(([name, ver, yr, g, tx]) => { const t0 = when(RPX, tx), k = pop(T, t0 + 0.25, 0.5);
    rule(tx, Y2 + 16, tx, 1996, ez(T, t0 + 0.1, 0.3), INK, 4); if (k > 0) box(tx - 95 * k, 1996, 190 * k, 190 * k, 36, INK, { a: clamp(k * 3) });
    glyph(g, tx, 2076, T, t0 + 0.45, { size: 150, fam: name, w: 400, col: PAPER }); stop(tx, Y2, T, t0, AMBER, 20);
    type(name, tx - 95, 2246, T, t0 + 0.5, { size: 40, w: 800 }); sub(`Unicode ${ver} · ${yr}`, tx - 94, 2290, T, t0 + 0.65, { size: 28 }); });
}

// ---------- 118 years on, the line becomes the book
const T2026 = when(RPX, 25050), SLOT = LETTERS.map((_, i) => [BK.x + (i % 12 - 5.5) * 84, 1486 + Math.floor(i / 12) * 84]);      // three tidy rows above the book
function outro(T) {
  const q = Q.outro;
  stop(25050, Y2, T, T2026, RED); roll('2026', 25036, 1800, T, T2026, { size: 170 }); sub('22 November · Alphabet Day', 25040, 2012, T, T2026 + 0.4, { size: 40, w: 600 });
  roll('118', 25634, 1812, T, q[0] + 1.7, { size: 330, col: RED, d: 1.3, t1: q[1] - 0.3 }); type('years', 26310, 1812, T, q[0] + 2.8, { size: 100, w: 800, t1: q[1] - 0.35 });
  type('since the Congress of Manastir', 25646, 2012, T, q[0] + 3.5, { size: 48, w: 700, t1: q[1] - 0.3 });
  rule(BK.x, BK.top + 50, BK.x, BK.bot + 50, ez(T, BOOK1 - 0.1, 0.5), RED, 12);                                    // the spine, once the line has closed the outline
  for (const d of [-1, 1]) for (let j = 0; j < 4; j++) { const r = ez(T, BOOK1 + 0.2 + j * 0.1 + (d > 0 ? 0.35 : 0), 0.5), xa = BK.x + d * 70, yy = 1870 + j * 50; rule(xa, yy - 10, xa + d * 220, yy - 40, r, FAINT, 7); }
  LETTERS.forEach((l, i) => { const k = settle(prog(T, q[1] + 4.2 + i * 0.045, 0.8)); if (k <= 0) return; const [sx, sy] = SLOT[i];       // the letters rise out of it
    ctx.save(); ctx.translate(lerp(BK.x, sx, k), lerp(BK.top + 30, sy, k) - 60 * Math.sin(Math.PI * k)); ctx.scale(0.3 + 0.7 * k, 0.3 + 0.7 * k); ctx.globalAlpha = clamp(k * 3); font(46, 700, 'Inter', 0); ctx.textAlign = 'center'; ctx.fillStyle = VOWELS.has(l) ? RED : INK; ctx.fillText(l, 0, 15); ctx.restore(); });
  type('Abetare', BK.x, 2282, T, q[1] + 3.2, { size: 112, w: 800, align: 'c' }); sub('the same 36 letters, every autumn', BK.x, 2340, T, q[1] + 5.2, { align: 'c', size: 38 });
}

function draw(T) {
  const c = cam(T), near = (x0, x1) => x1 > c.x - 1500 / c.z && x0 < c.x + 1500 / c.z;                             // skip what the camera is nowhere near
  clear(PAPER); world(c); dots(c); lines(T);
  if (near(0, 1920)) title(T); if (near(2000, 7200)) early(T); if (near(6500, 9900)) scripts(T); if (near(9800, 15100)) primer(T); if (near(15300, 19000)) congress(T);
  if (near(19000, 24800)) today(T); if (near(24900, 28500)) outro(T);
  letters(T, c); screen();
}
const F = n => ({ family: n[0].toUpperCase() + n.slice(1), url: new URL(`./fonts/${n}.woff2`, import.meta.url).href });
play(ORDER, CUES, draw, { cam, fonts: ['elbasan', 'vithkuqi', 'todhri', 'arabic'].map(F) });
