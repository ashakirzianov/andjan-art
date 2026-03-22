import { SketchCollection } from '@/sketcher'

const collectionIds = ['rythm', 'atoms', 'posters', 'misc'] as const
export type CollectionId = typeof collectionIds[number]

const loaders: Record<CollectionId, () => Promise<SketchCollection>> = {
    rythm: () => import('./rythm').then(m => m.rythm),
    atoms: () => import('./atoms').then(m => m.atoms),
    posters: () => import('./posters').then(m => m.posters),
    misc: () => import('./misc').then(m => m.misc),
}

export async function getCollection(id: string): Promise<SketchCollection | undefined> {
    const loader = loaders[id as CollectionId]
    if (!loader) return undefined
    return loader()
}

export async function getAllCollections(): Promise<SketchCollection[]> {
    return Promise.all(collectionIds.map(id => loaders[id]()))
}
