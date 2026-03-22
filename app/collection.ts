import { sceneId } from '@/sketcher'
import { getCollection } from '@/sketches/registry'

export async function findCollectionSketch(collectionId: string, sketchId: string) {
    const collection = await getCollection(collectionId)
    if (!collection) {
        return {}
    }
    let sketch = collection.sketches.find(s => sceneId(s) === sketchId)
    if (!sketch) {
        const sketchIdx = parseInt(sketchId, 10)
        if (sketchIdx >= 0 && sketchIdx < collection.sketches.length) {
            sketch = collection.sketches[sketchIdx]
        }
    }
    return { sketch, collection }
}