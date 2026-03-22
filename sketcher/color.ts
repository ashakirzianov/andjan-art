import type { Canvas2DContext } from './render'

export type StringColor = string
export type RGBAColor = {
    kind?: undefined,
    r?: number,
    g?: number,
    b?: number,
    a?: number,
}
export type HSLAColor = {
    kind?: undefined,
    h?: number,
    s?: number,
    l?: number,
    a?: number,
}
export type TupleColor = [r: number, g: number, b: number, a?: number]
export type GradientColor = {
    kind: 'gradient',
    start: [number, number],
    end: [number, number],
    stops: ColorStop[],
}
export type PrimitiveColor = StringColor | RGBAColor | HSLAColor | TupleColor
export type Color = PrimitiveColor | GradientColor
export type ColorStop = { offset: number, color: PrimitiveColor }
export type ResolvedColor = StringColor | CanvasGradient
export type ColorGetter<T> = (x: T) => Color
export type ColorOrGetter<T> = Color | ColorGetter<T>

export function getColor<T>(colorOrGetter: ColorOrGetter<T>, x: T) {
    return typeof colorOrGetter === 'function'
        ? colorOrGetter(x)
        : colorOrGetter
}

export function resolvePrimitiveColor(color: PrimitiveColor): StringColor {
    if (Array.isArray(color)) {
        return fromTupleColor(color)
    } else if (typeof color === 'object') {
        if ('r' in color) {
            return fromRGBA(color)
        } else {
            return fromHSLA(color)
        }
    } else {
        return color
    }
}

export function isPrimitiveColor(color: Color): color is PrimitiveColor {
    return !((color as any)['kind'] === 'gradient')
}

const gradientCache = new WeakMap<GradientColor, CanvasGradient>()

export function resolveColor(color: Color, context: Canvas2DContext): ResolvedColor {
    if (isPrimitiveColor(color)) {
        return resolvePrimitiveColor(color)
    } else {
        let gradient = gradientCache.get(color)
        if (!gradient) {
            gradient = context.createLinearGradient(
                color.start[0], color.start[1], color.end[0], color.end[1],
            )
            color.stops.forEach(
                ({ offset, color }) => gradient!.addColorStop(offset, resolvePrimitiveColor(color)),
            )
            gradientCache.set(color, gradient)
        }
        return gradient
    }
}

const colorMap = {
    orange: { r: 255, g: 165, b: 0 },
}
export function toRGBA(name: keyof typeof colorMap): RGBAColor {
    return colorMap[name]
}

export function gray(value: number): PrimitiveColor {
    return {
        r: value,
        g: value,
        b: value,
    }
}

export function fromRGBA({ r, g, b, a }: RGBAColor): StringColor {
    if (a) {
        return `rgba(${(r ?? 0)},${(g ?? 0)},${(b ?? 0)},${a})`
    } else {
        return `rgb(${(r ?? 0)},${(g ?? 0)},${(b ?? 0)})`
    }
}

export function fromHSLA({ h, s, l, a }: HSLAColor): StringColor {
    return `hsla(${h ?? 0},${s ?? 0}%,${l ?? 0}%,${a ?? 1})`
}

export function fromTupleColor([r, g, b, a]: TupleColor): StringColor {
    return fromRGBA({ r, g, b, a })
}

export function multRGBA({ r, g, b, a }: RGBAColor, value: number): RGBAColor {
    return {
        r: Math.min(255, Math.floor((r ?? 0) * value)),
        g: Math.min(255, Math.floor((g ?? 0) * value)),
        b: Math.min(255, Math.floor((b ?? 0) * value)),
        a,
    }
}

export function mapStops({ colors, func }: {
    colors: PrimitiveColor[],
    func: (value: number) => number,
}): ColorStop[] {
    const delta = 1 / colors.length
    return colors.map((color, i) => ({
        offset: func(i * delta),
        color,
    }))
}

export function unifromStops(colors: PrimitiveColor[]): ColorStop[] {
    return mapStops({
        colors,
        func: x => x,
    })
}

export type ColorStopObject = {
    [k in number]: PrimitiveColor;
}
export function makeStops(object: ColorStopObject): ColorStop[] {
    return Object.entries(object).map(
        ([offsetString, color]) => ({
            offset: Number(offsetString),
            color,
        }),
    )
}

export function rainbow({
    count, s, l,
}: {
    count: number,
    s?: number,
    l?: number,
}): StringColor[] {
    return hslaRange({
        count,
        from: { h: 0, s: s ?? 80, l: l ?? 50 },
        to: { h: 360 },
    })
}

export function hslaRange({ from, to, count }: {
    from: HSLAColor,
    to: HSLAColor,
    count: number,
}): StringColor[] {
    if (count === 0) {
        return []
    }
    const rfrom = {
        h: from.h ?? 0,
        s: from.s ?? 0,
        l: from.l ?? 0,
        a: from.a ?? 1,
    }
    const rto = {
        h: to.h ?? rfrom.h,
        s: to.s ?? rfrom.s,
        l: to.l ?? rfrom.l,
        a: to.a ?? rfrom.a,
    }
    const divisor = Math.max(1, count - 1)
    const delta = {
        h: (rto.h - rfrom.h) / divisor,
        s: (rto.s - rfrom.s) / divisor,
        l: (rto.l - rfrom.l) / divisor,
        a: (rto.a - rfrom.a) / divisor,
    }
    return Array(count).fill(undefined).map(
        (_, idx) => `hsla(${rfrom.h + delta.h * idx},${rfrom.s + delta.s * idx}%,${rfrom.l + delta.l * idx}%,${rfrom.a + delta.a * idx})`,
    )
}

export function rgbaRange({ from, to, count }: {
    from: RGBAColor,
    to: RGBAColor,
    count: number,
}): StringColor[] {
    if (count === 0) {
        return []
    }
    const rfrom = {
        r: from.r ?? 0,
        g: from.g ?? 0,
        b: from.b ?? 0,
        a: from.a ?? 1,
    }
    const rto = {
        r: to.r ?? rfrom.r,
        g: to.g ?? rfrom.g,
        b: to.b ?? rfrom.b,
        a: to.a ?? rfrom.a,
    }
    const delta = {
        r: (rto.r - rfrom.r) / count,
        g: (rto.g - rfrom.g) / count,
        b: (rto.b - rfrom.b) / count,
        a: (rto.a - rfrom.a) / count,
    }
    return Array(count).fill(undefined).map(
        (_, idx) => `rgba(${rfrom.r + delta.r * idx},${rfrom.g + delta.g * idx},${rfrom.b + delta.b * idx},${rfrom.a + delta.a * idx})`,
    )
}

export function pulsating<T>(palette: T[]): T[] {
    const back = [...palette].reverse()
    return [...palette, ...back]
}