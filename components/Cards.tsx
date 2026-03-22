'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Scene } from '@/sketcher'
import { href } from '@/utils/refs'
import { useSketcherPlayer } from '@/components/Sketcher'
import { TextPost } from '@/utils/text'
import Link from 'next/link'

export function SketchCard({ sketch, pixelated, placeholder }: {
    sketch: Scene<any>,
    pixelated: boolean,
    placeholder?: string,
}) {
    const u = 20
    const { node, setPlay } = useSketcherPlayer({
        scene: sketch, period: 40,
        dimensions: pixelated ? [3 * u, 4 * u] : undefined,
    })
    const [onVisibilityChanged] = useState(() => setPlay)
    return <Card
        onVisibilityChanged={onVisibilityChanged}
        backgroundColor={placeholder}
    >
        {node}
    </Card>
}

export function TextCard({ post }: {
    post: TextPost,
}) {
    return <Card>
        <div className="flex justify-center items-start h-full w-full bg-paper-light text-fgl break-words">
            <div className="overflow-hidden text-[0.4em] select-none max-h-card-height py-[3em] px-[5%] w-full">
                {post.title && <h1 className="mt-[0.5em] mb-[1em] leading-[1em] bold text-[2em]">{post.title}</h1>}
                <style>{`
                    .text-card-content p {
                        text-indent: 1em;
                        line-height: 1em;
                        margin-bottom: 0em;
                    }
                `}</style>
                <div className="text-card-content" dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
        </div>
    </Card>
}

export type HighlightKind = 'stories' | 'posters'
export function AboutCard({ hue, onHover }: {
    hue: number | undefined,
    onHover?: (target?: HighlightKind) => void,
}) {
    return <Card>
        <div className="text-fgl bg-paper-light indent-4 leading-[1.2em] p-[10%] w-full h-full select-none" unselectable="on">
            —Привет! Меня зовут <span>Анҗан</span>. Я пишу <AboutCardLink href={href('text', { hue })} highlight="stories" onHover={onHover}>рассказы</AboutCardLink> и <AboutCardLink href={href('sketch', { hue })} highlight="posters" onHover={onHover}>генерирую формы</AboutCardLink>.
            <p>&nbsp;</p>
            — Что? Кто ты такой и <AboutCardLink href={href('about', { hue })}>что это за буква җ?</AboutCardLink>
        </div>
    </Card >
}

function AboutCardLink({ children, href, highlight, onHover }: {
    href: string,
    children?: ReactNode,
    highlight?: HighlightKind,
    onHover?: (target?: HighlightKind) => void,
}) {
    return <Link href={href} className="text-skyblue"
        onMouseOver={function () {
            if (onHover && highlight) {
                onHover(highlight)
            }
        }}
        onMouseLeave={function () {
            if (onHover) {
                onHover(undefined)
            }
        }}
    >
        {children}
    </Link>
}


function Card({
    children,
    onVisibilityChanged,
    backgroundColor,
}: {
    children?: ReactNode;
    onVisibilityChanged?: (isVisible: boolean) => void;
    backgroundColor?: string;
}) {
    const THRESHOLD = 0.01
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!onVisibilityChanged || !cardRef.current) return
        const ref = cardRef.current

        let lastVisibility: boolean | null = null

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const isVisible = entry.intersectionRatio >= THRESHOLD
                    if (isVisible !== lastVisibility) {
                        onVisibilityChanged(isVisible)
                        lastVisibility = isVisible
                    }
                })
            },
            { threshold: THRESHOLD }
        )

        observer.observe(ref)

        return () => {
            observer.unobserve(ref)
        }
    }, [onVisibilityChanged])

    return (
        <div className="pixel-shadow" ref={cardRef}>
            <div className="flex overflow-hidden aspect-poster w-card text-card pixel-corners" style={{ backgroundColor }}>{children}</div>
        </div>
    )
}