# Contributing

Questions, bug reports and ideas go in the issue tracker. Pull requests are welcome.

## Setup

```bash
npm install
pip install -r requirements.txt
python3 -m playwright install chromium
```

## Before opening a pull request

1. Render a frame from each film your change touches and look at it:
   ```bash
   npm run still starter intro:5 numbers:6.5
   ```
2. If you changed the engine, check one frame of every film in `films/`.
3. If you changed narration timing, run `npm run narrate <film>` and confirm `cues.json` did not change for films you did not mean to touch.

## Conventions

- Reusable models go in `engine/parts`. Film-specific ones stay in the film folder.
- Scene functions are pure functions of time. Animation start times are a narration cue plus an offset.
- Small helpers, no frameworks, no build step.
- New films keep a `SOURCES.md` for every figure shown on screen.
