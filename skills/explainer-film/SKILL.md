---
name: explainer-film
description: Make a narrated explainer, engineering or sales video in code with the explainer-films repo (three.js scenes timed to narration cues), in a perspective or an isometric view. Use when asked for an animated explainer, a product video, an isometric or exploded-view animation, or a code-made film.
---

# Making a film with explainer-films

The repo turns a script into a narrated 1080p video. Narration is generated first; its phrase timings (`cues.json`) drive every animation. Scenes are JavaScript functions that draw one frame for a given time. Work inside the repo; if it is not in the workspace, ask where it lives and clone it.

Read `README.md` for setup and `docs/api.md` for the function reference before writing scene code. Read one example film close to the request: `films/kosovo-electricity` (explainer), `films/liburna` (engineering), `films/acme-sales` (sales), `films/alfabeti-line` (flat), `films/starter` (minimal).

## Procedure

1. **Settle the content before any code.**
   - Factual films: look up current sources for every figure, even familiar ones. Write `films/<name>/SOURCES.md` with each number, its source and date. Mark anything you calculated yourself.
   - Sales films: use only the product facts, numbers and quotes the user gave you. Never invent customers, testimonials or results. Where something is missing, put a labelled placeholder on screen.
2. **Scaffold:** `npm run new <name> [explainer|engineering|sales]`.
3. **Write `script.json`.** One list of phrases per scene; 5 to 9 scenes for a two to three minute film. Plan at about 2.5 words per second.
   - A phrase is the smallest thing you can time to. Start a new phrase wherever something should appear on screen.
   - Write numbers as words ("one thousand six hundred and twenty-four"). Say rounded numbers and show exact ones on screen.
   - A full pause follows only a phrase that ends a sentence (. ? !); commas and colons run on.
   - Respell names the voice may get wrong and check with the phonemizer before generating.
4. **Generate cues:** `npm run narrate <name>`. Note each scene's length.
5. **Storyboard in a comment or note:** for each scene, the set, the camera path, and what appears at which cue.
6. **Build sets, then scenes** in `film.js`.
   - Reuse `engine/parts` first. Put new general-purpose models there and film-specific ones in the film folder.
   - Every start time is a cue plus an offset: `label(..., t, q[2] + 0.3)`. No absolute times.
   - Scene functions are pure functions of `t`. No counters, no state carried between frames.
   - Order inside a scene: `env`, pose models, `camKeys`, `finish()`, then overlay calls.
   - Keep sets about 1,500 units apart and show one at a time, so their shadows and fog do not interact.
7. **Check still frames, then fix, then check again.** `npm run still <name> scene:seconds ...` at the busiest moment of each scene, plus one mid-transition. Open the image and look for: overlapping labels, text off the edge, leader lines crossing, models hidden behind foreground objects, empty halves of the frame, tiny models. Do this before any full render.
8. **Give the film its own feel.** Pick a motion, a transition, a music mood and a sound kit that suit the subject, and do not reuse the combination from the previous film. Set `motion` and `transition` in `play()`; set the mood and kit in `audio.py` (`Mix(name, kit=...)`, `m.music(mood)`). Left unset, all four are derived from the film's name. Options are listed in `docs/api.md`. Place sound effects with the same cue arithmetic as the scene.
9. **Render and mix:** `npm run film <name> -- --skip-narration`. On a machine with a graphics card add `--gpu`. To change one scene later: `npm run render <name> <scene>` then `npm run mix <name>`.
10. **Verify the finished file.** Pull frames from the mp4 at several times and look at them. Check every on-screen number against `SOURCES.md`. Tell the user which figures are your own arithmetic and anything you could not verify.

## Layout rules that save re-renders

- The frame is 1920 x 1080. Keep text at 24 px or larger and 46 px clear of the edges.
- Outline width shrinks with distance. For models seen from more than about 40 units away, pass a larger `ol` (5 or 6).
- Frame the subject so it fills the picture: move the camera closer or widen the field of view before enlarging models.
- Put number cards where the 3D scene is empty, usually the bottom third or the sky.
- Anchor callouts with `at()` or `proj()` and place the label near the anchor so lines stay short.
- Interfaces on a laptop or phone screen need large type: design them in a 1000 px wide space.

## Motion rules that prevent wobble

The overlay is fixed to the screen; the 3D scene is not. Small back-and-forth movement in 3D shows as wobble against the text.

- Move the camera one way per shot and let the move end. Never add a sway or float to the camera.
- Finish the camera move before any panel pinned to a model with `proj()` or `at()` appears, and hold it while the panel is up. `call()` labels are exempt: only their leader line follows the point.
- Idle motion should spin, flow or travel. Do not bob or rock a model around a fixed position.
- Small objects that fly through a scene (coins, sparks, cards) get `castShadow = false`. Their shadows sliding over walls and ground look like flicker.
- Check motion with a frame range, `npm run still <name> scene:6-11` (six frames). Things meant to hold still must be in the same place in every frame.

## Styles

`--style toon|paper|clay|blueprint|neon` on preview, still and render. Check one still in the chosen style: the line styles only draw outlined models.

## Flat films

When the request is for infographic, motion-graphics, flat, minimal or 2D animation, do not use the 3D engine. Use `engine/flat.js` and read "Flat films" in `docs/api.md` and `films/alfabeti-line` first.

- Find one visual idea that carries the whole story (a line, a grid, a shape that changes) before laying anything out.
- One board, one camera, no cuts. Each idea gets a stop; `fit()` frames it; the camera travels between stops while the narration moves on.
- Write one `draw(T)`. Every start time is an absolute cue from `timeline()` plus an offset.
- Render with `--fps 30` and pass `fps=30` to `Mix`.

## Isometric films

Use the isometric view when the request says isometric, 2.5D, exploded view, tech stack, floor plan or "like a technical drawing". It suits things made of layers and blocks; landscapes and anything with a horizon belong in the normal perspective view.

- Call `isoKeys(t, [{ t, l, d }], frame)` where a scene would call `camKeys`. `l` is the centre of the frame and `d` the zoom (half the view's height). Leave the angles at their defaults.
- Light with `aim(point, size, SUNISO)` so every block shows three tones: top lightest, left mid, right darkest.
- Show height by lifting parts, never by scaling them. `lift(parts, base, gap)` opens and closes a stack; `drop()` deals layers in from the bottom up.
- In a stack that opens, only the bottom layer casts a shadow.
- Pan and zoom only. No camera drift, and hold the view while labels are pinned.
- Build models from `slab()`, `box()` and `cyl()`; add `grid()` for the floor.

## Sound with some movement

- Voice: the default read can be flat. In `script.json`, choose a voice with pitch range or blend two (`"voice": "af_heart:0.6+af_sarah:0.4"`), and set the pace of single phrases with `{ "say": "...", "speed": 0.95 }`: slower for questions and the close, quicker for short lists.
- Music: pass an energy per scene, `m.music(mood, energy=dict(intro=0.35, growth=1.0))`, so instruments enter and drop out with the story. Low for questions and careful passages, high for growth, action and the ending.

## Honesty

- Say what is stylised. Models are illustrative and usually not to scale.
- If an animation shows data over time that you do not have (for example the dates of outages), say it is illustrative.
- You cannot hear the audio. Report pronunciation risks instead of claiming it sounds right.
