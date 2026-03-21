import { getAllPreviews } from '@/utils/text'
import { MainPage } from './client'
import { Metadata } from 'next'
import { buildMetadata } from '@/utils/metadata'

export const metadata: Metadata = buildMetadata({
    title: 'Анҗан',
    description: 'Сайт с буквами и картинками',
})

export default async function Page({ searchParams }: {
    searchParams: Promise<{ hue?: string }>
}) {
    const { hue: hueParam } = await searchParams
    const hue = hueParam ? Number(hueParam) : undefined
    const previews = await getAllPreviews()
    return <MainPage previews={previews} hue={hue} />
}