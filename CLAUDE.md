# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Task tracking

Tasks, issues and ideas live in **Linear**, not in this repo. The rule, stated once:

**One project per track, and the project name *is* the track name.** This repo is not yet a track of axis (`../axis/CLAUDE.md`), so it has a project of its own, named after the repo. Either way the mapping is derived from the name — it is not stored here, and duplicating it is exactly what would let it drift.

**Labels:** `startable` (an agent can begin now), `blocked-on-user` (needs Anton specifically), `parked-until-graduates` (held deliberately, not scheduled).

**What does NOT go to Linear.** Durable records stay in the repo, and getting this wrong is how the tracker fills with things nobody can close:

| Class | Test | Home |
|---|---|---|
| **TASK** | Open, future-facing. Someone must do something. | Linear |
| **RECORD** | Past-facing — diagnosis, measurement, ruling, as-built. Value is being read later. | A doc in the repo |
| **HYBRID** | Open task whose body is mostly record. | Both; the issue links to the doc |
| **STANDING NOTE** | Neither past nor actionable — a caution that stays true and an agent needs *while working*. | This file, or a doc. **Never Linear** |

Two files at root predate this:

- `TASKS.md` — **retired, not authoritative.** Kept as the migration's rollback; do not capture to it.
- `REVIEW.md` — a RECORD (a past-facing code-review analysis), not a board. It stays in the repo and is not a source of open work; the actionable half of it is in Linear.

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run cli` - Run CLI tool for sketch rendering

## CLI Tool for Sketch Rendering

The project includes a CLI tool for rendering and saving sketches:

```bash
npm run cli save <collection>/<sketch> [--width <width>] [--height <height>] [--time <time_ms>] [--output <filename>]
npm run cli save-video <collection>/<sketch> [--width <width>] [--height <height>] [--duration <duration_ms>] [--fps <fps>] [--output <filename>]
```

Examples:
- `npm run cli save rythm/web --width 1024 --time 1000`
- `npm run cli save-video rythm/web --width 1024 --duration 5000 --fps 30`

## Project Architecture

This is Anton Shakirzianov's personal website built with Next.js, featuring:

### Core Structure
- **Next.js App Router** (`app/` directory) - Main website with pages for sketches, texts, and about sections
- **Sketcher Engine** (`sketcher/` directory) - Custom graphics rendering system for creative coding
- **CLI Tools** (`cli/` directory) - Command-line interface for rendering sketches to images/videos

### Key Components

**Sketcher System:**
- Core rendering engine with modules for animations, colors, shapes, transforms, and scenes
- Canvas-based graphics rendering with support for layers and animations
- Vector math utilities and layout systems
- Text rendering and object management

**Sketch Collections:**
- `sketches/` contains organized collections (rythm, atoms, posters, misc)
- Each collection contains multiple sketches that can be rendered via CLI or web
- Collections are exported through `sketches/index.ts`

**Website Features:**
- Multilingual support (Russian/English)
- Text content system with markdown processing
- Google Analytics integration
- Responsive design with custom fonts (Cormorant, Press Start 2P)

### Dependencies
- **Three.js** - 3D graphics library
- **Canvas/FFmpeg** - Image/video generation (CLI only)
- **Gray Matter/Remark** - Markdown processing
- **Tailwind CSS** - Styling

The project combines a personal website with a creative coding platform, allowing sketches to be viewed interactively on the web or rendered as static images/videos via CLI.

## Known Issues

Tracked bugs and improvements are Linear issues (see *Task tracking*); `REVIEW.md` holds the full analysis they came from. Key areas:

- **Bugs**: Draggable touchmove listener leak, useSketcherPlayer missing cleanup
- **Performance**: Animation loop uses setTimeout instead of rAF, gradient objects recreated every frame
- **Bundle size**: No code splitting for sketch collections, eager sketch instantiation on home page
- **Design**: Unscoped CSS in TextCard, incomplete launcher cleanup, global mutable z-index counter