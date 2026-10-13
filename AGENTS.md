---
track: andjan-art
---

# andjan-art

Anton Shakirzianov's personal site, andjan.art, and his creative-coding platform: a Next.js app whose sketches are viewed interactively on the web or rendered to images and videos through a CLI.

## Documentation layout

- `AGENTS.md` — this file: the map and the conventions. The track itself (its status and direction) is `andjan-art/about` in xaxis (`get-project`).
- `SCRATCHPAD.md` — when present, Anton's untracked drafting space; never open it without an explicit ask.
- `docs/`, `archive/` — when present, notes about working on this checkout, and finished efforts. Decisions, when the track has any, go to `andjan-art/decisions` in xaxis.
- `texts/` is site content (the published texts), not documentation.

## Review posture

**High-level** (Anton, 2026-10-08). Anton reviews design and interfaces, not implementation. Agents surface the design deltas they introduce rather than letting them pass silently.

**Commits: this repo's exception to the fleet rule.** Anton makes all commits and pushes; do not commit or push unless explicitly asked. Propose a commit message after each change. Anton reads every change before it lands in this public repo.

## Commands

- `npm run dev` — development server.
- `npm run build`, `npm run start` — production build and server.
- `npm run lint` — `eslint .`.

## Sketch CLI

Renders a sketch to a PNG (`save`) or an MP4 (`save-video`):

```bash
npm run cli -- save <collection>/<sketch> [--width <px>] [--height <px>] [--time <ms>] [--output <path>]
npm run cli -- save-video <collection>/<sketch> [--width <px>] [--height <px>] [--duration <ms>] [--fps <fps>] [--output <path>]
```

- Keep the `--` after `cli`: without it npm eats the flag names (with only an npm warning), and the CLI runs with its defaults.
- `<sketch>` is the sketch's `id`, or else its title as an id (`sceneId` in `sketcher/scene.ts`).
- Defaults: `--width` 800; `--height` follows the sketch's aspect ratio, square when it declares none; `--time` 0 (how long the animation runs, in real time, before the frame is captured); `--duration` 3000; `--fps` 30 (the encoding rate only).
- Output defaults to the gitignored `output/`, as `<collection>-<sketch>-<time>ms.png` or `-<duration>ms.mp4`. `save` needs `output/` to exist, or an explicit `--output`. `save-video`'s timing is broken: the video plays the animation several times too fast.
- Only sketches whose layers are all 2D render. `canvas`, `fluent-ffmpeg` and `ffmpeg-static` are dev dependencies, used by the CLI only.

Examples: `npm run cli -- save rythm/web --width 1024 --time 1000`, `npm run cli -- save-video rythm/web --width 1024 --duration 5000 --fps 30`.

## Map

- **Stack**: Next.js 16 App Router, React 19, Tailwind v4, Three.js.
- `app/` — the site's routes: home, `sketches/` (index, `[collection]`, `[collection]/[sketch]`), `texts/` (index, `[id]`, `en`), `about` and `about-en`, `playground`.
- `sketcher/` — the custom canvas rendering engine (scenes, layers, animation, the launcher), exported from `sketcher/index.ts`.
- `sketches/` — the sketch collections (rythm, atoms, posters, misc). The site loads them lazily through `sketches/registry.ts`, so each collection is its own chunk, though the home page imports its cover sketches directly; the CLI imports the eager list in `sketches/index.ts`. A new collection is registered in both.
- `cli/` — the sketch CLI above: `index.ts` parses arguments, `save.ts` and `save-video.ts` render.
- `components/` — the site's React components.
- `texts/` — the texts as markdown with front matter (title, date, language, translation links), read by `utils/text/`.
- `utils/` — shared helpers.
