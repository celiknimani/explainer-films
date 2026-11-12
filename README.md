# explainer-films

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node 18+](https://img.shields.io/badge/node-18%2B-green.svg)
![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-green.svg)

Narrated explainer, engineering and sales videos made entirely in code.

You write a script. The narrator's timing drives the animation. A browser renders every frame. Every number, label and camera move lives in text files, so a film is updated by editing and re-rendering.

| Explainer | Engineering | Sales |
|---|---|---|
| ![Explainer](docs/thumbs/explainer.jpg) | ![Engineering](docs/thumbs/engineering.jpg) | ![Sales](docs/thumbs/sales.jpg) |
| [`kosovo-electricity`](films/kosovo-electricity), 2 min 56 s | [`liburna`](films/liburna), 2 min 4 s | [`acme-sales`](films/acme-sales), 32 s |

[Install](#install) · [Usage](#usage) · [Styles](#styles) · [Layout](#layout) · [AI agents](#with-an-ai-coding-agent) · [Limits](#limits) · [API](#api) · [Maintainer](#maintainer) · [Credits](#credits) · [Contributing](#contributing) · [License](#license)

## Install

Requires Node 18+, Python 3.10+ and ffmpeg.

```bash
npm install
pip install -r requirements.txt
python3 -m playwright install chromium
```

## Usage

Try the bundled starter film:

```bash
npm run preview starter     # live preview with a timeline scrubber
npm run film starter        # full pipeline, writes films/starter/out/starter.mp4
```

The first run downloads the voice model (about 350 MB).

Make your own:

```bash
npm run new my-film         # or: npm run new my-film explainer | engineering | sales
```

| Step | Command | What you edit |
|---|---|---|
| 1. Script | | `films/my-film/script.json`: phrases per scene |
| 2. Voice | `npm run narrate my-film` | writes `cues.json`, the phrase timings |
| 3. Scenes | `npm run preview my-film` | `film.js`: one function per scene |
| 4. Check | `npm run still my-film intro:3.5` | fix layout before any long render |
| 5. Finish | `npm run film my-film -- --skip-narration` | final mp4 in `out/` |

Animations start on narration cues (`q[1] + 0.3`), so changing the script re-times the film.

To redo one scene: `npm run render my-film intro`, then `npm run mix my-film`.

Each film also gets its own feel: a motion style, a scene transition, a music mood and a sound-effect kit. They are picked from the film's name unless you set them. See [`docs/api.md`](docs/api.md#motion-and-transitions).

## Styles

![Styles](docs/thumbs/styles.jpg)

```bash
npm run preview kosovo-electricity blueprint
npm run film kosovo-electricity -- --style blueprint
```

`toon` (default), `paper`, `clay`, `blueprint`, `neon`. Define your own in [`engine/styles.js`](engine/styles.js).

## Layout

```
engine/    renderer, overlay graphics, staging, styles, reusable parts
films/     one folder per film: script.json, cues.json, film.js, audio.py
tools/     narrate, still, render, mix, preview, new
docs/      API reference
skills/    instructions for AI coding agents
```

## With an AI coding agent

Scenes are code, so an agent can write them. [`AGENTS.md`](AGENTS.md) and the [skill](skills/explainer-film/SKILL.md) give it the procedure: verify facts, write the script, build scenes on the cues, check stills, render.

## Limits

- **Output** is 1920 x 1080. Vertical and square are not supported yet.
- **Speed:** rendering uses the CPU by default, about one frame per second per worker on a small cloud machine. `--gpu` uses your graphics card and is not benchmarked yet.
- **Parts** cover what the examples needed. New subjects need new models.
- **Line styles** (`blueprint`, `neon`) draw only models that have an outline.
- **Voices:** English and a few other languages. Check yours before writing a script.
- **Facts:** each example lists its sources in `SOURCES.md`. The sales template uses a placeholder brand and placeholder figures.

## API

Function reference for the engine, parts and sound tools: [`docs/api.md`](docs/api.md).

## Maintainer

[Celik Nimani](https://github.com/celiknimani)

## Credits

Built on three.js, the Kokoro voice model, the Inter typeface and Natural Earth map data. Details in [`THIRD_PARTY.md`](THIRD_PARTY.md).

## Contributing

Questions and bug reports go in the issue tracker. Pull requests are welcome; see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Celik Nimani
