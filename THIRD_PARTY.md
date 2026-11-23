# Third-party components

| Component | Used for | Licence | In this repo? |
|---|---|---|---|
| [three.js](https://github.com/mrdoob/three.js) | 3D rendering | MIT | Installed by npm |
| [Inter](https://github.com/rsms/inter) | On-screen text | SIL Open Font License 1.1 | Four weights bundled in `engine/fonts`, licence text alongside |
| [Noto](https://github.com/notofonts) Sans Elbasan, Sans Vithkuqi, Serif Todhri, Naskh Arabic | Script samples in `films/alfabeti-line` | SIL Open Font License 1.1 | One subset of each bundled in `films/alfabeti-line/fonts`, licence text alongside |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Optional: finds phrase timings in outside narration (`tools/voice.py`) | MIT | Not bundled; installed with pip when needed |
| [Playwright](https://github.com/microsoft/playwright-python) | Headless browser | Apache-2.0 | Installed by pip |
| [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) | Runs the voice model | See upstream | Installed by pip |
| Kokoro voice model and voices | Narration | Listed upstream as Apache-2.0. Confirm before commercial use | Downloaded on first use, not bundled |
| [world-atlas](https://github.com/topojson/world-atlas) / Natural Earth | Country outlines | ISC / public domain | `films/kosovo-electricity/geo.json` is derived from it |
| [topojson-client](https://github.com/topojson/topojson-client) | Reading the outlines | ISC | Installed by npm (dev) |
| ffmpeg | Encoding and mixing | LGPL/GPL depending on build | You install it |

Licences for the pip and npm packages were read from their package metadata. Check the upstream projects before relying on this table for a commercial release.
