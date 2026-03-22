# Code Review: Performance & Design Issues

## Bugs

### 1. Wrong event listener in Draggable cleanup

In `components/Draggable.tsx:121`, the cleanup removes `handleTouchStart` for the `touchmove` event instead of `handleTouchMove`. This leaks `touchmove` listeners on every re-render while dragging.

```typescript
// line 121 — should be handleTouchMove, not handleTouchStart
ref.removeEventListener('touchmove', handleTouchStart)
```

### 2. `useSketcherPlayer` creates launcher outside `useEffect`

In `components/Sketcher.tsx:36`, `launcher()` is called during render (not inside a `useEffect`). A new launcher is created on every render but never cleaned up — the returned `cleanup` function is available but never called. Compare with the `Sketcher` component above it which correctly wraps this in `useEffect` with cleanup.

## Performance

### 3. `setTimeout` instead of `requestAnimationFrame`

`sketcher/launch.ts:38` uses `setTimeout` for the animation loop:
- Animations don't sync with the display refresh rate
- Animations keep running when the tab is hidden (wasting CPU/battery)
- Frame timing is imprecise compared to rAF

### 4. Gradient objects recreated every frame

`sketcher/color.ts:60` calls `context.createLinearGradient()` on every `resolveColor` call. For sketches using gradients, this creates new gradient objects every frame for every shape — no caching.

## Bundle Size

### 5. No code splitting for sketch collections

`sketches/index.ts` statically imports all collections. Every page that uses `collections` (the sketch listing pages, the home page indirectly) bundles all sketch code. The largest is `sketches/rythm.ts` at ~1,800 lines. Using `next/dynamic` or `React.lazy` per-collection would reduce initial bundle size significantly.

### 6. All sketches instantiated eagerly on home page

`app/client.tsx:25-62` — all 6 `sketchCards` call their sketch factory functions (`loveMeTwoTimes()`, `titleAtom()`, etc.) at module scope. These run as soon as the module loads, even before any card is visible. Deferring instantiation until the card enters the viewport (via IntersectionObserver, which is already wired up) would improve initial load.

## Design

### 7. Incomplete launcher cleanup

`sketcher/launch.ts:58-61` — `cleanup()` only resets the timer. It doesn't null out references to `state`, `animator`, or `layers`, which can delay garbage collection of potentially large scene state.

### 8. Global mutable z-index counter

`components/Draggable.tsx:5` — `let globalZ = 2` grows unbounded with every drag interaction. The pattern of module-level mutable state in a client component is fragile — it survives across navigations in a SPA but resets on hard refreshes, causing inconsistent behavior.

### 9. Unscoped CSS in TextCard

`components/Cards.tsx:35-41` — an inline `<style>` tag targets bare `p` elements globally:

```html
<style>p { text-indent: 1em; ... }</style>
```

This affects all `<p>` elements on the page, not just within the card. The intent is to style `<p>` tags inside the `dangerouslySetInnerHTML` container on line 42. Fix by adding a class to the wrapper div and scoping the styles (e.g. `.text-card-content p { ... }`), or using Tailwind's `prose` / `[&_p]:` utilities.

### 10. Redundant mouse event handlers on `AboutCardLink`

`components/Cards.tsx:79-83` — both `onMouseLeave` and `onMouseOut` are set to the same handler. `onMouseOut` fires on child exits too (it bubbles), which could cause flickering. Only `onMouseLeave` is needed here.

## Summary

| Severity | Issue |
|----------|-------|
| **Bug** | Draggable touchmove listener leak (#1) |
| **Bug** | useSketcherPlayer no cleanup (#2) |
| **Performance** | setTimeout vs rAF (#3) |
| **Performance** | Gradient recreation per frame (#4) |
| **Bundle size** | No code splitting (#5), eager instantiation (#6) |
| **Design** | Incomplete cleanup (#7), global mutable state (#8), unscoped CSS (#9), redundant handlers (#10) |
