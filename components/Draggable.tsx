import {
    MouseEvent, ReactNode, useCallback, useEffect, useRef, useState,
} from 'react'

let globalZ = 2
export type Position = { x: number, y: number }
export function Draggable({
    children, onDrag, onStop, front, back, disabled,
}: {
    disabled?: boolean,
    front?: boolean,
    back?: boolean
    children?: ReactNode,
    onDrag?: () => void,
    onStop?: () => void,
}) {
    const divRef = useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = useState(false)
    const [state, setState] = useState({
        offset: { x: 0, y: 0 },
        touchStart: { x: 0, y: 0 },
    })
    const [zIndex, setZIndex] = useState(
        front ? 2
            : back ? 0 : 1
    )
    const [cursorChanged, setCursorChanged] = useState(false)

    const handleStartDragging = useCallback(function handleStartDragging({ x, y }: Position) {
        if (!disabled) {
            setDragging(true)
            setZIndex(globalZ++)
            setCursorChanged(true)
            setState(state => ({
                ...state,
                touchStart: {
                    x: state.offset.x - x,
                    y: state.offset.y - y,
                }
            }))
        }
    }, [disabled])
    const handleDragging = useCallback(function handleDragging({ x, y }: Position) {
        if (dragging && !disabled) {
            setState(state => {
                const MIN_STEP = 200
                const dx = Math.abs(x - (state.touchStart.x - state.offset.x))
                const dy = Math.abs(y - (state.touchStart.y - state.offset.y))
                if (dx > MIN_STEP || dy > MIN_STEP) {
                    if (onDrag) {
                        onDrag()
                    }
                    return {
                        ...state,
                        offset: {
                            x: state.touchStart.x + x,
                            y: state.touchStart.y + y,
                        },
                    }
                } else {
                    return state
                }
            })
        }
    }, [dragging, disabled, onDrag])
    const handleEndDragging = useCallback(function handleEndDragging() {
        if (onStop) {
            onStop()
        }
        setDragging(false)
        setCursorChanged(false)
    }, [onStop])

    function getTouchPosition(event: globalThis.TouchEvent) {
        const touches = event.targetTouches
        if (touches.length !== 1) {
            return undefined
        }
        const touch = event.targetTouches[0]!
        return {
            x: touch.clientX,
            y: touch.clientY,
        }
    }

    function getMousePosition({ clientX, clientY }: MouseEvent<unknown>) {
        return {
            x: clientX, y: clientY,
        }
    }

    useEffect(() => {
        function handleTouchStart(event: globalThis.TouchEvent) {
            const position = getTouchPosition(event)
            if (position) {
                handleStartDragging(position)
            }
        }
        function handleTouchMove(event: globalThis.TouchEvent) {
            if (dragging) {
                const position = getTouchPosition(event)
                if (position) {
                    event.preventDefault()
                    handleDragging(position)
                }
            }
        }
        function handleTouchEnd() {
            handleEndDragging()
        }
        const ref = divRef.current
        if (ref) {
            ref.addEventListener('touchstart', handleTouchStart)
            ref.addEventListener('touchmove', handleTouchMove, { passive: false })
            ref.addEventListener('touchend', handleTouchEnd)
            ref.addEventListener('touchcancel', handleTouchEnd)
        }
        return function cleanup() {
            if (ref) {
                ref.removeEventListener('touchstart', handleTouchStart)
                ref.removeEventListener('touchmove', handleTouchMove)
                ref.removeEventListener('touchend', handleTouchEnd)
                ref.removeEventListener('touchcancel', handleTouchEnd)
            }
        }
    }, [divRef, dragging, handleDragging, handleStartDragging, handleEndDragging])

    useEffect(() => {
        window.addEventListener('mouseup', handleEndDragging)
        window.addEventListener('touchend', handleEndDragging)
        window.addEventListener('touchcancel', handleEndDragging)

        return () => {
            window.removeEventListener('mouseup', handleEndDragging)
            window.removeEventListener('touchend', handleEndDragging)
            window.removeEventListener('touchcancel', handleEndDragging)
        }
    }, [handleEndDragging])

    return <div ref={divRef} style={{
        position: 'relative',
        transform: disabled
            ? undefined : `translate(${state.offset.x}px, ${state.offset.y}px)`,
        cursor: cursorChanged && !disabled ? 'grab' : undefined,
        zIndex,
    }}
        onMouseDown={function (event) {
            handleStartDragging(getMousePosition(event))
        }}
        onMouseMove={function (event) {
            handleDragging(getMousePosition(event))
        }}
        onMouseEnter={function () {
            setTimeout(() => setCursorChanged(true), 1000)
        }}
        onMouseOut={function () {
            setCursorChanged(false)
        }}
    >{children}</div>
}