# API reference

Everything a film imports, grouped by file. Signatures list the arguments you will normally pass.

## Scene functions

```js
function myScene(t, D, q, gt) { ... }
play(['intro', 'myScene'], CUES, { intro, myScene });
```

| Argument | Meaning |
|---|---|
| `t` | Seconds since this scene started |
| `D` | Length of the scene in seconds |
| `q` | Start time of each narration phrase in this scene (`q[0]`, `q[1]`, ...) |
| `gt` | A clock that keeps running across scenes, for motion that should not restart |

A scene function must be a pure function of time: given the same `t` it draws the same frame. Do not keep state between calls. That is what lets any frame be rendered on its own, in any order, by several workers.

The usual order inside a scene: set the environment, pose the models, set the camera, call `finish()`, then draw overlay elements.

## engine/core.js

| Name | Use |
|---|---|
| `toon(color, opts)` | Standard lit material. Follows the active style |
| `basic(color, opts)` | Unlit colour for lights, glows and screens |
| `M(geometry, material, { ol, pos, rot, scale, cast, recv })` | Mesh with shadows and an outline. `ol` is the outline width in pixels, `ol: 0` for none |
| `outline(mesh, px)` | Add an outline to an existing mesh or instanced mesh |
| `camKeys(t, keys, frame)` | Camera keyframes: `{ t, p: [x,y,z], l: [x,y,z], f }` for position, look-at and field of view, eased between keys |
| `isoKeys(t, keys, frame)` | Isometric camera keyframes: `{ t, l: [x,y,z], d, az, el }`. See [Isometric views](#isometric-views) |
| `proj(vector)` | 3D point to screen pixels: `{ x, y, ok }` |
| `ease(t, t0, d)` | 0 to 1 starting at `t0` over `d` seconds, decelerating |
| `pop(t, t0, d)` | 0 to 1 with a small overshoot, for things that appear |
| `sstep(x)`, `clamp(x)`, `lerp(a, b, k)` | Smoothstep, clamp to 0..1, linear blend |
| `tube(points, r, material, opts)`, `rod(a, b, r, material)`, `segMatrix(a, b, th)` | Curved tubes and straight bars between points |
| `scene`, `camera`, `renderer`, `sun`, `hemi`, `sky`, `clouds` | The three.js objects, if you need them directly |
| `STYLE`, `STYLE_NAME` | The active style preset |

## engine/stage.js

| Name | Use |
|---|---|
| `env(preset)` | Sky, fog, ground and light colours. Presets: `ENV.day`, `ENV.studio`, `ENV.dusk`, `ENV.night`. Spread and override: `env({ ...ENV.day, ground: '#DDE' })`. `ground: null` hides the ground |
| `aim(point, size, direction)` | Point the sun at a place and size its shadow area. `SUNHI` and `SUNLOW` are ready-made directions |
| `frameOf(group)` | Frame of reference for `camKeys`, so camera positions are written relative to a set |
| `at(group, x, y, z)` | Screen position of a point given in a set's local coordinates |
| `finish()` | Render the 3D frame under the overlay. Call once per frame before overlay drawing |
| `play(order, cues, scenes, opts)` | Register the film. `opts.wipe` sets transition colours or `false` to disable |
| `loadJSON(name, import.meta.url)` | Load a file that sits next to the film |
| `ground` | The ground plane mesh |

## engine/overlay.js

All overlay functions take the scene time `t` and a start time `t0` and animate themselves in.

| Name | Use |
|---|---|
| `header(title, subtitle, t)` | Title plate, top left |
| `label(text, x, y, t, t0, { size, align, bg, fg, t1 })` | A pill that pops in. `t1` hides it again. `\n` makes a second line |
| `call(text, point, x, y, t, t0, opts)` | A label with a leader line to a screen point from `proj()` or `at()` |
| `card(x, y, big, small, t, t0, colour, size)` | A card with one large figure and a caption |
| `badge(n, x, y, t, t0)` | Numbered circle |
| `hbar(x, y, w, h, fraction, colour, alpha)` | Progress or share bar |
| `footer(text, t, t0)` | Small source line, bottom left |
| `text(...)`, `plate(...)`, `pill(...)`, `leader(...)`, `flash(...)` | Lower-level pieces the above are built from |
| `ctx` | The 2D canvas context, for custom drawing |
| `fmt(n, decimals)` | Number with thousands separators |

## engine/parts

**kit.js**: `box(w, h, d, colour, opts)`, `cyl(rTop, rBottom, h, colour, opts)`, `prism(w, h, d, colour, opts)` for gable roofs, `at(object, x, y, z)`, `tm(colour)` cached material, `rnd()` seeded random, `sb(a, b, thickness)` box geometry between two points, `hideInst(instancedMesh)`.

**energy.js**: `ctower(height, baseRadius)`, `stack(height, radius, bands)`, `pylons(parent, [[x, z], ...], rotation)` with wires, `turbine(parent, x, y, z, scale)` with `spin(list, gt)` and `popAll(list, t, t0, gap)`, `Puffs(parent, count)` for smoke and steam (`add(position, opts)`, `update(gt)`), `hillMesh(...)`, `farHills(...)`, `dress(parent, count, seed, avoidFn, ...)` for trees and fields.

**iso.js**: `slab(w, d, h, colour)` a box that stands on its base, `grid(cells, step, colour)` a floor grid, `lift(parts, base, gap)` to open and close a stack, `drop(t, t0, d, h)` the height of something falling into place.

**sea.js**: `water`, `islands`, `buildShip(config)` returning a ship with oars, sail, crew and wake, `hullGeo`, `hullPoint`, `figure`.

**devices.js**: `laptop()` and `phone()` return `{ g, scr }` where `scr.ctx` is a canvas you draw the interface on, then call `scr.update()`. `laptop().open(angle)` moves the lid and `laptop().point(px, py)` gives the screen position of an interface pixel for callouts. Props: `desk()`, `mug(colour)`, `plant()`.

## Motion and transitions

Each film has a motion personality and a transition, set in `play()`:

```js
play(order, CUES, scenes, { motion: 'snappy', transition: 'push' });
```

| `motion` | Entrances | Camera |
|---|---|---|
| `bouncy` | Pop with overshoot, cards drop in | Smooth |
| `snappy` | Fast slide-up, almost no bounce | Sharp starts and stops |
| `smooth` | Slow fades | Smooth |
| `playful` | Big bounce and wobble | Slight overshoot |

`transition`: `bands`, `iris`, `blinds`, `push`, `fade` or `cut`. Colours come from `wipe: { c1, c2 }`.

Leave both out and they are picked from the film's folder name, so a new film does not move like the last one. Try others without editing: `npm run still my-film intro:3 -- --motion smooth --transition iris`, or add `&motion=smooth&transition=iris` to the preview URL.

## Keeping the picture steady

The overlay is fixed to the screen and the 3D scene is not, so any small back-and-forth movement in 3D shows up as wobble against the text. Five rules prevent it:

- **The camera moves one way per shot.** Write a move as two or more `camKeys` keys and let it end. Never add a sine or other sway to the camera; the engine has no idle camera float for this reason.
- **Hold the camera while text is pinned to a model.** A panel placed with `proj()` or `at()` is recomputed every frame, so under a moving camera it slides by fractions of a pixel and its text shimmers. End the camera move before the first pinned panel appears: the last key's time can be a cue, such as `{ t: q[2] - 0.4, ... }`. Callouts made with `call()` are fine under a moving camera, because only the leader line follows the point and the label stays put.
- **Idle motion travels or turns one way.** Spinning rotors, flowing coins, rising steam and a turning globe read as life. A model that bobs or rocks about a fixed position on a slow loop reads as wobble.
- **Moving things cast no shadows unless the shadow is the point.** Coins, sparks, cards and other small items that fly across a scene drag grey blobs over walls and ground, and those read as flicker. Give them `castShadow = false`. Shadows belong to things that stand still or move slowly as a whole.
- **Check motion, not only layout.** A single still cannot show this. `npm run still my-film scene:6-11` draws six frames across a range; anything that should hold still must sit in the same place in all six.

## Isometric views

An isometric view has no perspective: nothing shrinks with distance, so stacks, floors, exploded diagrams and process layouts read like a technical drawing. Use it when someone asks for an isometric, 2.5D or exploded-view film.

A scene becomes isometric by calling `isoKeys` where it would call `camKeys`. Everything else (models, styles, overlay, `proj`, narration cues) is unchanged, and a film can mix both kinds of scene.

```js
import { SUNISO } from '../../engine/stage.js';
aim(FR.rel(0, 6, 0), 26, SUNISO);
isoKeys(t, [{ t: 0, l: [0, 3, 0], d: 8 }, { t: q[1], l: [0, 8, 0], d: 12.5 }], FR);
```

| Key | Meaning |
|---|---|
| `l` | The point at the centre of the frame |
| `d` | Half the height of the view in world units. Smaller is closer; this is the zoom |
| `az` | Direction the camera looks from, in degrees around the vertical axis. Default 45 |
| `el` | Elevation in degrees. Default 35.26, true isometric. 30 gives the 2:1 look of pixel-art games |

Rules that make it read as isometric:

- **Three tones per block.** Pass `SUNISO` to `aim()`. The top face comes out lightest, the left mid and the right darkest. With the other suns two visible faces share a tone and blocks look flat.
- **Show height by lifting, never by scaling.** Move a part up its axis; `lift(parts, base, gap)` opens a whole stack with one number and closes it again at 0.
- **Build from the bottom.** Deal layers out lowest first with `drop()`, staggered by where they sit, not by the order they were written in.
- **Only the bottom layer casts a shadow in a stack that opens.** Upper layers would darken everything under them. Set `castShadow = false` on the rest.
- **Pan and zoom with `l` and `d`; leave `az` and `el` alone within a shot.** The steadiness rules above apply in full: no drifting camera, and the view holds still while labels are pinned to models.
- **Pin labels to where a part rests,** not to where it is this frame, if the part pulses or lifts.

The ground fills the frame in this view, so there is no sky or horizon. `grid()` gives the floor some structure.

## Flat films

A second engine, `engine/flat.js`, for infographic motion design: flat shapes, large type, drawn lines, and one camera that travels over a single large board, so there are no cuts. It uses Canvas 2D only and does not load three.js. Nothing from `core.js`, `stage.js` or `overlay.js` is used. `films/alfabeti-line` is the example. A two-minute film renders in about two minutes on two CPU cores.

A flat film is one function of time, not one function per scene:

```js
import { timeline, camAt, fit, world, clear, dots, type, roll, path, trace, along, slide, when, stop, play, loadJSON } from '../../engine/flat.js';
const CUES = await loadJSON('./cues.json', import.meta.url), ORDER = ['intro', 'body'];
const { Q, end } = timeline(ORDER, CUES);            // Q.body[1]: when phrase 1 of "body" starts, in seconds from the start of the film
const CAMK = [{ t: 0, d: 0, x: 960, y: 540, z: 1 }, { t: Q.body[0] + 0.5, d: 1.8, ...fit(2000, 300, 3600, 900) }];
const cam = T => camAt(T, CAMK);
function draw(T) { const c = cam(T); clear(); world(c); dots(c); /* lines, then type */ }
play(ORDER, CUES, draw, { cam });
```

Render at 30 frames a second: `npm run film <name> -- --skip-narration --fps 30`, and pass `fps=30` to `Mix` in `audio.py`. Stills work as usual (`npm run still <name> scene:seconds`), with times counted from the start of that scene.

| Function | What it does |
|---|---|
| `timeline(order, cues)` | `{ Q, start, end }`: absolute cue times, scene starts, film length |
| `camAt(T, keys)` | Camera `{ x, y, z }` from keys `{ t, d, x, y, z, lift }`: it arrives at time `t` after travelling `d` seconds and holds until the next move. `lift` pulls the zoom back mid-move (default 0.08) |
| `fit(x0, y0, x1, y1, pad)` | The camera that frames a rectangle of the board. Spread it into a key |
| `world(c)`, `screen()` | Draw in board coordinates, or in screen pixels |
| `toScreen(x, y, c)` | Where a board point is on screen |
| `clear(col)`, `dots(c)` | Background, and a faint dot grid fixed to the board that shows the camera's movement |
| `type(s, x, y, T, t0, o)` | Text that rises from behind its baseline, word by word. `o`: `size`, `w`, `col`, `align`, `by` (`word`, `char`, `line`), `gap`, `t1` (when it leaves), `a`, `fam`, `ls`, `lh` |
| `roll(s, x, y, T, t0, o)` | A number whose digits roll into place, in tabular figures |
| `path(pts)` | A line through points; a point may carry a corner radius, `[x, y, r]`. `ess(x0, y0, x1, y1)` gives the points of an S-shaped link |
| `trace(P, s0, s1, o)` | Stroke a path between two distances along it. Animate `s1` to draw the line on |
| `along(P, x)`, `at(P, s)` | Distance at which a path reaches board x; the point at a distance |
| `slide(T, keys)`, `when(keys, v)` | A value that moves between holds, `[[t, d, v], ...]`; and the moment it reaches `v` |
| `stop(x, y, T, t0, col)` | A stop on a line: a ringed dot that pops in with one ripple |
| `disc`, `ring`, `box`, `rule` | Circle, arc, rounded rectangle, straight line; `ring` and `rule` take a progress value |
| `flood(sx, sy, k, col)` | A colour that grows from a screen point until it fills the picture, or shrinks back into it |
| `play(order, cues, draw, { cam, fonts })` | Registers the film. `fonts: [{ family, url, weight }]` are loaded first |

Rules for this style:

- Give every idea one stop. Lay the stops out along a line, give each a rectangle, and let `fit()` frame it. Check each stop with a still.
- Tie what moves to a line's head: keep head positions in a `slide()` key list and time stops with `when()`, so things appear as the line reaches them.
- Type is the picture. Use few sizes: one very large for the number or word that matters, one for titles, one for notes in grey.
- Keep to paper, ink, one accent, and at most three more colours when lines must be told apart.
- Text that would still be on screen at the next stop needs a `t1`.
- Motion blur is automatic while the camera moves (`cam` passed to `play`): each frame averages up to 40 moments inside one sixtieth of a second.

## Narration: script.json

```json
{ "voice": "af_heart:0.6+af_sarah:0.4", "lang": "en-us", "speed": 1.05,
  "scenes": { "intro": [ { "say": "Is it safe?", "speed": 0.93 }, "About two percent of loans are late." ] } }
```

| Key | Meaning |
|---|---|
| `voice` | A Kokoro voice (`bm_george`, `bf_emma`, `af_heart`, ...) or a weighted blend of several, joined with `+` |
| `lang` | `en-gb` or `en-us`; match it to the voice (`b*` voices are British, `a*` American) |
| `speed` | Default pace. A phrase written as `{ "say", "speed" }` sets its own |
| `lead`, `pause`, `short_pause`, `hold`, `tail` | Silence before the first phrase, after a sentence, after a comma, at the end of a scene and at the end of the film |

A flat read is usually the voice, not the script. Measured on the same lines, `bf_emma` moves through about 6.6 semitones of pitch, `af_heart` about 9.4 and `af_sarah` about 12. Blending a clean voice with a livelier one keeps the first one's quality and adds movement. Vary the pace too: slow the questions and the closing line by a few percent, and speed up short lists.

### A voice from elsewhere

To use a voice actor, another speech service or a language the built-in voice does not speak, put one audio file per scene in `films/<name>/voice/<scene>.mp3` (or `.wav`, `.m4a`), each reading that scene's phrases from `script.json` in order, and run `python3 tools/voice.py <name>` in place of `npm run narrate`. It writes the same `narr/` files and `cues.json`, finding where each phrase starts by speech recognition (`pip install faster-whisper`; set `"lang"` in `script.json`, for example `"sq"`). It also writes `words.json`, every recognised word with its time, which is what to read when setting offsets inside a phrase. Check its printout: each phrase should begin on the words shown. The recogniser can write a number wrongly as digits even when it is spoken correctly, so confirm numbers by ear or by a second pass. `films/alfabeti-line` is narrated this way.

## Sound: tools/synth.py

```python
from synth import *
m = Mix('my-film', kit='wood')             # sound-effect kit: classic, soft, wood, digital, or 'auto'
m.music('warm')                            # or m.music() to let the film's name pick a mood
m.transitions()                            # a whoosh at each scene change
q = m.q('intro'); m.ev('intro', q[0] + 0.3, pop_())
m.write()
```

| Mood | Feel |
|---|---|
| `warm` | Major key, electric piano and strings, half-time beat, flute lead |
| `playful` | Fast major, marimba, shuffle, flute lead |
| `tech` | Dorian, sixteenth-note plucks, four-on-the-floor, keys lead |
| `folk` | Mixolydian, plucked strings, hand drums, flute lead |
| `tense` | Minor, marimba ostinato, pulsing bass, no snare |
| `cinematic` | Slow minor, strings, low drums, bell lead |

Within a mood, the key, tempo, chord loop, arpeggio and melody are generated from a seed, by default the film's name. `bpm=104` overrides the tempo. The same film always gets the same tune; `m.music('warm', seed=2)` gives another one. `bright`, `upbeat` and `calm` are three fixed tunes kept for films already made with them.

### Music that follows the story

By default a mood plays one even arrangement from start to finish. Give it an energy per scene and the arrangement changes with the film:

```python
m.music('folk', energy=dict(title=0.35, growth=1.0, health=0.5))   # scenes not named play at 0.7
m.music('folk', energy='arc')                                      # a built-in rise and fall
```

| Energy | What plays |
|---|---|
| below 0.45 | Pad, bass and arpeggio only |
| 0.45 and up | Drums join |
| 0.6 and up | The lead melody joins, and a short drum fill leads into the scene |
| 0.85 and up | A second percussion layer and an upper octave |

Higher energy is also mixed a few decibels louder. Use low values for questions and careful passages, high ones for growth, action and the close.

Effects: `pop_`, `tick`, `thud`, `whoosh`, `riser`, `buzz`, `bell`. Place them with the same cue arithmetic the scene uses, so sound and picture stay together.
