'use client'
import { SketchCollection } from '@/sketcher'
import { PixelPage } from '@/components/PixelPage'
import { notFound } from 'next/navigation'
import { SketchCollectionBlock } from '@/components/SketchCollection'
import { AllSketchesButton, HomeButton } from '@/components/Buttons'
import { getCollection } from '@/sketches/registry'
import { useEffect, useState } from 'react'

export function CollectionPage({ collectionId, hue }: {
    collectionId: string,
    hue: number | undefined,
}) {
    const [collection, setCollection] = useState<SketchCollection | null>(null)
    const [notFoundState, setNotFoundState] = useState(false)
    useEffect(() => {
        getCollection(collectionId).then(c => {
            if (c) setCollection(c)
            else setNotFoundState(true)
        })
    }, [collectionId])
    if (notFoundState) return notFound()
    if (!collection) return null
    return <PixelPage hue={hue}>
        <div className="flex flex-col items-center gap-stn p-stn">
            <SketchCollectionBlock collection={collection} linkToCollection={false} />
            <footer className="flex flex-col items-center gap-stn p-stn">
                <AllSketchesButton hue={hue} />
                <HomeButton hue={hue} />
            </footer >
        </div>
    </PixelPage>
}