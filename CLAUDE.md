# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

See `TASKS.md` for tracked bugs and improvements, and `REVIEW.md` for the full analysis. Key areas:

- **Bugs**: Draggable touchmove listener leak, useSketcherPlayer missing cleanup
- **Performance**: Animation loop uses setTimeout instead of rAF, gradient objects recreated every frame
- **Bundle size**: No code splitting for sketch collections, eager sketch instantiation on home page
- **Design**: Unscoped CSS in TextCard, incomplete launcher cleanup, global mutable z-index counter