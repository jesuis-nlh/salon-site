import type { MetadataRoute } from 'next'
import { services } from '@/config/services'
import { absoluteUrl } from '@/lib/salon'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/prestations', '/realisations', '/salon', '/rendez-vous', '/mentions-legales', '/confidentialite']
  return [
    ...pages.map((p) => ({
      url: absoluteUrl(p),
      changeFrequency: 'monthly' as const,
      priority: p === '/' ? 1 : p.startsWith('/mentions') || p.startsWith('/confid') ? 0.2 : 0.8,
    })),
    ...services.map((s) => ({
      url: absoluteUrl(`/prestations/${s.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
