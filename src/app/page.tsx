import { Hero } from '@/components/hero/Hero'
import { Approach } from '@/components/home/Approach'
import { FinalCta } from '@/components/home/FinalCta'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { Reviews } from '@/components/home/Reviews'
import { Ritual } from '@/components/home/Ritual'
import { ServiceIndex } from '@/components/home/ServiceIndex'
import { Visit } from '@/components/home/Visit'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Approach />
      <ServiceIndex />
      <Ritual />
      <GalleryPreview />
      <Reviews />
      <Visit />
      <FinalCta />
    </>
  )
}
