import type { MetadataRoute } from 'next'
import { site } from '@/config/site'
import { absoluteUrl } from '@/lib/salon'

export default function robots(): MetadataRoute.Robots {
  // Draft mode: keep the provisional site out of search engines.
  if (site.draft) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/lab'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
