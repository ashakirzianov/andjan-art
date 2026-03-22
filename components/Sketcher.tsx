'use client'
import { LaunchProps, Launcher, launcher } from '@/sketcher'
import { useCallback, useEffect, useRef } from 'react'
import { getCanvasFromRef, useCanvases } from '@/utils/canvas'

type SketcherProps<S> = Omit<LaunchProps<S>, 'getCanvas'>
export function Sketcher<State>({
    scene, dimensions, period, skip, chunk
}: SketcherProps<State> & {
    dimensions?: [width: number, height: number],
}) {
    const actualDimensions = dimensions ?? scene.dimensions ?? [undefined, undefined]
    const { node, refs } = useCanvases(actualDimensions, scene.layers.length)
    useEffect(() => {
        const { start, cleanup } = launcher({
            scene,
            period, skip, chunk,
            getCanvas: idx => getCanvasFromRef(
                refs[idx],
                scene.layers[idx]?.kind === '3d' ? 'webgl' : '2d',
            ),
        })
        start()

        return cleanup
    }, [node, refs, scene, period, skip, chunk])
    return node
}

export function useSketcherPlayer<State>(props: SketcherProps<State> & {
    dimensions?: [width: number, height: number],
}) {
    const dimensions = props.dimensions ?? props.scene.dimensions ?? [undefined, undefined]
    const layers = props.scene.layers
    const { node, refs } = useCanvases(dimensions, layers.length)
    const launcherRef = useRef<Launcher | null>(null)
    const playingRef = useRef(false)

    useEffect(() => {
        const l = launcher({
            ...props,
            getCanvas: idx => getCanvasFromRef(
                refs[idx],
                layers[idx]?.kind === '3d' ? 'webgl' : '2d',
            ),
        })
        launcherRef.current = l
        if (playingRef.current) l.start()
        return l.cleanup
    }, [node, refs, props.scene, props.period, props.skip, props.chunk])

    const setPlay = useCallback(function setPlay(play: boolean) {
        playingRef.current = play
        const l = launcherRef.current
        if (!l) return
        if (l.isPaused() && play) {
            l.start()
        } else if (!l.isPaused() && !play) {
            l.pause()
        }
    }, [])

    return { node, setPlay }
}