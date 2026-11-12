---
name: explainer-film
description: Make a narrated explainer, engineering or sales video in code with the explainer-films repo (three.js scenes timed to narration cues). Use when asked for an animated explainer, a product video or a code-made film.
---

# Making a film with explainer-films

The repo turns a script into a narrated 1080p video. Narration is generated first; its phrase timings (`cues.json`) drive every animation. Scenes are JavaScript functions that draw one frame for a given time. Work inside the repo; if it is not in the workspace, ask where it lives and clone it.

Read `README.md` for setup and `docs/api.md` for the function reference before writing scene code. Read one example film close to the request: `films/kosovo-electricity` (explainer), `films/liburna` (engineering), `films/acme-sales` (sales), `films/starter` (minimal).

## Procedure

1. **Settle the content before any code.**
   - Factual films: look up current sources for every figure, even familiar ones. Write `films/<name>/SOURCES.md` with each number, its source and date. Mark anything you calculated yourself.
   - Sales films: use only the product facts, numbers and quotes the user gave you. Never invent customers, testimonials or results. Where something is missing, put a labelled placeholder on screen.
2. **Scaffold:** `npm run new <name> [explainer|engineering|sales]`.
3. **Write `script.json`.** One list of phrases per scene; 5 to 9 scenes for a two to three minute film. Plan at about 2.5 words per second.
   - A phrase is the smallest thing you can time to. Start a new phrase wherever something should appear on screen.
   - Write numbers as words ("one thousand six hundred and twenty-four"). Say rounded numbers and show exact ones on screen.
   - A phrase ending in a comma or colon runs into the next one; anything else gets a pause.
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
8. **Sound:** copy an example `audio.py`. Place effects with the same cue arithmetic as the scene.
9. **Render and mix:** `npm run film <name> -- --skip-narration`. On a machine with a graphics card add `--gpu`. To change one scene later: `npm run render <name> <scene>` then `npm run mix <name>`.
10. **Verify the finished file.** Pull frames from the mp4 at several times and look at them. Check every on-screen number against `SOURCES.md`. Tell the user which figures are your own arithmetic and anything you could not verify.

## Layout rules that save re-renders

- The frame is 1920 x 1080. Keep text at 24 px or larger and 46 px clear of the edges.
- Outline width shrinks with distance. For models seen from more than about 40 units away, pass a larger `ol` (5 or 6).
- Frame the subject so it fills the picture: move the camera closer or widen the field of view before enlarging models.
- Put number cards where the 3D scene is empty, usually the bottom third or the sky.
- Anchor callouts with `at()` or `proj()` and place the label near the anchor so lines stay short.
- Interfaces on a laptop or phone screen need large type: design them in a 1000 px wide space.

## Styles

`--style toon|paper|clay|blueprint|neon` on preview, still and render. Check one still in the chosen style: the line styles only draw outlined models.

## Honesty

- Say what is stylised. Models are illustrative and usually not to scale.
- If an animation shows data over time that you do not have (for example the dates of outages), say it is illustrative.
- You cannot hear the audio. Report pronunciation risks instead of claiming it sounds right.
