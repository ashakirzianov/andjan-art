'use client'
import { SketchCollection } from '@/sketcher'
import { SketchCollectionBlock } from '@/components/SketchCollection'
import { getAllCollections } from '@/sketches/registry'
import { useEffect, useState } from 'react'

export function AllCollections() {
    const [collections, setCollections] = useState<SketchCollection[]>([])
    useEffect(() => {
        getAllCollections().then(setCollections)
    }, [])
    return <div className="flex flex-col items-center gap-stn">
        {
            collections.map((collection, idx) =>
                <SketchCollectionBlock
                    key={`${collection.id}-${idx}`}
                    collection={collection}
                    linkToCollection={true}
                />
            )
        }
    </div>
}