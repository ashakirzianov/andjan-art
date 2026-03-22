import { Layer } from './layer'
import { SketcherCanvas } from './render'
import { Scene } from './scene'

type CanvasKind = Layer['kind']
export type CanvasGetter = (idx: number, kind: CanvasKind) => SketcherCanvas<any> | undefined
export type LaunchProps<State> = {
    scene: Scene<State>,
    getCanvas: CanvasGetter,
    period?: number,
    skip?: number,
    chunk?: number,
}
export type Launcher = ReturnType<typeof launcher>
export function launcher<State>({
    scene: { state: initialState, animator: initialAnimator, layers: initialLayers },
    period, skip, chunk,
    getCanvas: initialGetCanvas,
}: LaunchProps<State>) {
    let paused = true
    let cleaned = false
    const timer = makeTimer()
    let frame = 0
    let state: State | Promise<State> = initialState
    let animator = initialAnimator
    let layers = initialLayers
    let getCanvas = initialGetCanvas
    const renderState = makeRenderState({ layers, getCanvas })
    async function loop(current?: number) {
        if (cleaned) return
        const awaitedState = await state
        if (cleaned) return
        if (animator) {
            state = Promise.resolve(animator(awaitedState, {
                frame,
                getCanvas: i => getCanvas(i, layers[i]!.kind),
            }))
        }
        if (renderState(awaitedState, frame)) {
            if (period) { // If animated
                if (frame < (skip ?? 0) // Still skiping
                    && (current ?? 0) < (chunk ?? 100)) { // But do it in chunks
                    loop((current ?? 0) + 1)
                } else {
                    timer.schedule(loop, period)
                }
            }
            frame++
        } else { // Try again later if render failed
            timer.schedule(loop, period ?? 0)
        }
    }
    function start() {
        timer.reset()
        paused = false
        loop()
    }
    function pause() {
        timer.reset()
        paused = true
    }
    function isPaused() {
        return paused
    }
    function cleanup() {
        timer.reset()
        cleaned = true
        state = undefined as any
        animator = undefined
        layers = undefined as any
        getCanvas = undefined as any
    }
    return { start, pause, isPaused, cleanup }
}

function makeRenderState<State>({ layers, getCanvas }: {
    layers: Layer<State>[],
    getCanvas: CanvasGetter,
}) {
    const layerData = layers.map(layer => ({
        layer,
        prepared: false,
        width: 0,
        height: 0,
    }))
    return function renderLayers(state: State, frame: number) {
        const canvases: SketcherCanvas<any>[] = []
        for (let idx = 0; idx < layerData.length; idx++) {
            const canvas = getCanvas(idx, layerData[idx]!.layer.kind)
            if (canvas === undefined) {
                return false
            }
            canvases.push(canvas)
            const ld = layerData[idx]!
            if (ld.width !== canvas.width || ld.height !== canvas.height) {
                ld.width = canvas.width
                ld.height = canvas.height
                ld.prepared = false
            }
        }
        for (let idx = 0; idx < layerData.length; idx++) {
            const { layer, prepared } = layerData[idx]!
            if (layer.hidden) {
                continue
            }
            const canvas = canvases[idx]!
            if (!prepared && layer.prepare) {
                canvas.context.resetTransform()
                layer.prepare({ canvas, state, frame: 0 })
                layerData[idx]!.prepared = true
            }
            if (layer.render) {
                layer.render({ canvas, state, frame })
            }
        }
        return true
    }
}

const hasRAF = typeof requestAnimationFrame === 'function'

function makeTimer() {
    let id: any
    let useRAF = false
    function schedule(f: () => void, t: number) {
        reset()
        if (hasRAF && t > 0) {
            useRAF = true
            let last = performance.now()
            const tick = (now: number) => {
                if (now - last >= t) {
                    last = now
                    f()
                } else {
                    id = requestAnimationFrame(tick)
                }
            }
            id = requestAnimationFrame(tick)
        } else {
            useRAF = false
            id = setTimeout(f, t)
        }
    }
    function reset() {
        if (id != null) {
            if (useRAF) {
                cancelAnimationFrame(id)
            } else {
                clearTimeout(id)
            }
            id = undefined
        }
    }
    return { schedule, reset }
}