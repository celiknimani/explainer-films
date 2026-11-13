# Instructions for AI coding agents

This repo makes narrated videos in code. When asked to make or change a film, follow this procedure. The full version is in `skills/explainer-film/SKILL.md`.

1. **Facts first.** For anything factual, research current sources before writing a word of script. Keep a `SOURCES.md` in the film folder. Mark figures you computed yourself.
2. **Script.** `npm run new <name> [explainer|engineering|sales]`, then write `films/<name>/script.json`. One list of short phrases per scene. Spell numbers as words and check unusual names for pronunciation.
3. **Cues.** `npm run narrate <name>`. Read the printed scene lengths. Aim for 2.5 words per second when estimating.
4. **Scenes.** Write `film.js`. Every animation start time is a cue plus an offset (`q[1] + 0.3`), never an absolute number. Scene functions are pure functions of `t`.
5. **Stills before renders.** `npm run still <name> scene:seconds ...` at the busiest moments of every scene. Read the image. Fix overlaps, clipped text, things hidden behind other things. Repeat until clean. A full render is slow; never use it to find layout bugs. Then check motion with a range, `scene:6-11`, which draws six frames: anything meant to hold still must not shift between them.
6. **Feel.** Choose a motion, transition, music mood and sound kit that fit the subject and differ from the last film (`docs/api.md` lists them). Unset, they are derived from the film's name.
7. **Render.** `npm run film <name> -- --skip-narration`. Re-render single scenes with `npm run render <name> <scene>` and rebuild with `npm run mix <name>`.
8. **Check the result.** Extract a few frames from the final mp4 and look at them. Compare every on-screen number with `SOURCES.md`.

Rules:
- Do not put claims, testimonials or figures in a sales film that the user has not supplied. Use labelled placeholders.
- Keep reusable models in `engine/parts`, film-specific ones in the film folder.
- Keep the picture steady (`docs/api.md`, "Keeping the picture steady"): the camera moves one way per shot and never sways, it holds still while text is pinned to a model, idle motion spins or flows instead of bobbing, and small moving objects cast no shadows.
- Give the sound some movement: pick a voice with pitch range (or a blend), vary the pace of phrases, and pass `energy` per scene to `m.music()` so the arrangement rises and falls with the story (`docs/api.md`).
- Match the existing code style: small pure helpers, no frameworks, no build step.
