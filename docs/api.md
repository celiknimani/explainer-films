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

**kit.js**: `box(w, h, d, colour, opts)`, `cyl(rTop, rBottom, h, colour, opts)`, `at(object, x, y, z)`, `tm(colour)` cached material, `rnd()` seeded random, `sb(a, b, thickness)` box geometry between two points, `hideInst(instancedMesh)`.

**energy.js**: `ctower(height, baseRadius)`, `stack(height, radius, bands)`, `pylons(parent, [[x, z], ...], rotation)` with wires, `turbine(parent, x, y, z, scale)` with `spin(list, gt)` and `popAll(list, t, t0, gap)`, `Puffs(parent, count)` for smoke and steam (`add(position, opts)`, `update(gt)`), `hillMesh(...)`, `farHills(...)`, `dress(parent, count, seed, avoidFn, ...)` for trees and fields.

**sea.js**: `water`, `islands`, `buildShip(config)` returning a ship with oars, sail, crew and wake, `hullGeo`, `hullPoint`, `figure`.

**devices.js**: `laptop()` and `phone()` return `{ g, scr }` where `scr.ctx` is a canvas you draw the interface on, then call `scr.update()`. `laptop().open(angle)` moves the lid and `laptop().point(px, py)` gives the screen position of an interface pixel for callouts. Props: `desk()`, `mug(colour)`, `plant()`.

## Sound: tools/synth.py

```python
from synth import *
m = Mix('my-film'); m.music('bright')      # presets: bright, upbeat, calm, or pass your own dict
m.transitions()                            # a whoosh at each scene change
q = m.q('intro'); m.ev('intro', q[0] + 0.3, pop_())
m.write()
```

Effects: `pop_`, `tick`, `thud`, `whoosh`, `riser`, `buzz`, `bell`. Place them with the same cue arithmetic the scene uses, so sound and picture stay together.
