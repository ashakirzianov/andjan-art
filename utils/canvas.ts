import {
    createElement, createRef, RefObject, useEffect, useMemo, useRef,
} from "react"

export type UseCanvasesReturn = ReturnType<typeof useCanvases>

type CanvasDimensions = [width: number | undefined, height: number | undefined];
export function useCanvases([width, height]: CanvasDimensions, count: number) {
    let array = useRefArray<HTMLCanvasElement>(count)
    const refs = array.current
    let nodes = useMemo(() => refs.map(
        (ref, idx) => createElement('canvas', {
            ref: ref,
            key: `layer-${idx}`,
            width: width,
            height: height,
            style: {
                zIndex: idx,
                backgroundColor: 'transparent',
                gridColumn: 1,
                gridRow: 1,
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
            },
        }),
    ), [refs, width, height])

    let node = useMemo(() => createElement('div', {
        style: {
            display: 'grid',
            flexGrow: 1,
            padding: 0,
            margin: 0,
            width: '100%',
            height: '100%',
        }
    },
        nodes,
    ), nodes)

    useEffect(() => {
        for (let ref of refs) {
            if (ref.current && !ref.current.dataset['setup']) {
                setupCanvas(ref.current)
                ref.current.dataset['setup'] = 'true'
            }
        }
    })
    const result = useMemo(() => {
        return {
            node,
            refs,
        }
    }, [node, refs])

    return result
}

export function getCanvasFromRef(canvasRef: RefObject<HTMLCanvasElement | null> | undefined, kind: '2d' | 'webgl') {
    if (!canvasRef?.current) {
        return undefined
    }
    let context = canvasRef.current.getContext(kind)
    if (!context) {
        return undefined
    }
    return {
        context,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
    }
}

export function setupCanvas(canvas: HTMLCanvasElement) {
    if (canvas.width === undefined || canvas.width === 300) {
        canvas.dataset['autowidth'] = 'true'
    }
    if (canvas.height === undefined || canvas.height === 150) {
        canvas.dataset['autoheight'] = 'true'
    }
    let dpi = window.devicePixelRatio || 1
    // Hack: support safari on old screens
    dpi = Math.max(dpi, 2)
    let style = getComputedStyle(canvas)
    let styleWidth = style.getPropertyValue('width')
    let styleHeight = style.getPropertyValue('height')
    let width = parseInt(styleWidth, 10) * dpi
    let height = parseInt(styleHeight, 10) * dpi
    if (canvas.dataset['autowidth']) {
        canvas.setAttribute('width', width.toString())
    }
    if (canvas.dataset['autoheight']) {
        canvas.setAttribute('height', height.toString())
    }
}

function useRefArray<T>(count: number) {
    let array = useRef<Array<RefObject<T | null>>>([])
    const refs = array.current
    if (refs.length !== count) {
        for (let idx = 0; idx < count; idx++) {
            refs[idx] = refs[idx] ?? createRef()
        }
    }
    return array
}