'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { Scene } from '@/sketcher'
import { Sketcher } from '@/components/Sketcher'
import { findCollectionSketch } from '@/app/collection'

export function SingleSketch({ collectionId, sketchId }: {
    collectionId: string,
    sketchId: string,
}) {
    const [sketch, setSketch] = useState<Scene | null>(null)
    const [notFoundState, setNotFoundState] = useState(false)
    useEffect(() => {
        findCollectionSketch(collectionId, sketchId).then(({ sketch }) => {
            if (sketch) setSketch(sketch)
            else setNotFoundState(true)
        })
    }, [collectionId, sketchId])
    if (notFoundState) return notFound()
    if (!sketch) return null
    return <SingleSketchImpl scene={sketch} />
}

export function SingleSketchImpl({ scene }: {
    scene: Scene,
}) {
    return <main>
        <div className="flex items-start justify-center h-screen w-screen" style={{
            padding: 'min(10vh,40pt) min(2vw,20pt)',
        }}>
            <div className="flex aspect-poster max-w-full max-h-full drop-shadow-2xl">
                <div className="flex w-full h-full items-stretch rounded-lg overflow-hidden" style={{
                    clipPath: 'border-box',
                }}>
                    <Sketcher scene={scene} period={40} />
                </div>
            </div>
        </div>
    </main>
}