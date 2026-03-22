# Tasks

Tracked issues from code review. See `REVIEW.md` for full details.

## Bugs

- [x] **Fix Draggable touchmove listener leak** — `components/Draggable.tsx:121` removes `handleTouchStart` instead of `handleTouchMove` in cleanup, leaking touchmove listeners on re-renders.

- [x] **Fix useSketcherPlayer missing cleanup** — `components/Sketcher.tsx:36` calls `launcher()` during render without `useEffect`, so launchers are never cleaned up. Refactor to match the `Sketcher` component pattern (create launcher inside `useEffect`, return `cleanup`).

## Performance

- [x] **Replace setTimeout with requestAnimationFrame** — `sketcher/launch.ts:38` uses `setTimeout` for the animation loop. Switch to `requestAnimationFrame` for proper display sync and automatic throttling when tab is hidden.

- [x] **Cache gradient objects in resolveColor** — `sketcher/color.ts:60` creates a new `CanvasLinearGradient` on every call. Add memoization (e.g. by gradient identity) to avoid re-creating gradients every frame.

## Bundle Size

- [x] **Add code splitting for sketch collections** — `sketches/index.ts` statically imports all collections, bundling everything together. Use `next/dynamic` or dynamic `import()` to load collections on demand per route.

- [x] **Defer sketch instantiation on home page** — `app/client.tsx:25-62` calls all sketch factory functions at module scope. Defer instantiation until cards enter the viewport (IntersectionObserver is already wired up in `Card`).

## Design

- [x] **Improve launcher cleanup** — `sketcher/launch.ts:58-61` only resets the timer. Null out `state`/`animator`/`layers` references to allow earlier garbage collection.

- [x] **Scope CSS in TextCard** — `components/Cards.tsx:35-41` uses an inline `<style>` targeting bare `p` elements, which bleeds globally. Scope the styles to the `dangerouslySetInnerHTML` container using a wrapper class (e.g. `.text-card-content p { ... }`).

- [x] **Remove redundant onMouseOut on AboutCardLink** — `components/Cards.tsx:79-83` has both `onMouseLeave` and `onMouseOut` doing the same thing. Remove `onMouseOut` to avoid redundant calls and potential flickering from bubbling.

## Experiments (try & evaluate)

- [ ] **[Experiment] Fullscreen expand button for sketches** — Instead of navigating to a separate "poster page" route, try an expand button that shows the sketch fullscreen in-place (e.g. via a modal/overlay). Evaluate whether the UX feels better than the current navigation approach.

- [ ] **[Experiment] Carousel swipe for collection sketches** — When viewing a single sketch from a collection (`/sketches/[collection]/[sketch]`), try adding carousel-style horizontal swipe to navigate between sketches in that collection. Evaluate whether it improves browsing flow or feels cluttered.

- [ ] **[Experiment] Pre-generated OG images for sketches** — Generate OpenGraph images for each sketch at build time via a script (using the existing CLI rendering pipeline), saving them to `/public`. On-demand OG generation is too slow, so pre-generate and reference statically.
