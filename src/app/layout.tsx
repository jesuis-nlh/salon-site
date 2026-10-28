import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/config/site'
import { displayFont, textFont } from '@/lib/fonts'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileBookingBar } from '@/components/layout/MobileBookingBar'
import { PointerFX } from '@/components/layout/PointerFX'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { JsonLd } from '@/components/seo/JsonLd'
import { salonSchema } from '@/components/seo/structuredData'
import './globals.css'

const defaultTitle = `${site.name}, atelier de coiffure à ${site.city}`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s | ${site.name}, coiffure à ${site.city}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: site.name,
    title: defaultTitle,
    description: site.description,
    url: '/',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: `${site.name}, atelier de coiffure à ${site.city}` }],
  },
  twitter: { card: 'summary_large_image', title: defaultTitle, description: site.description, images: ['/og.jpg'] },
  // Draft mode keeps a provisional identity out of search engines.
  robots: site.draft ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: '#16110e',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const schema = salonSchema()
  return (
    <html lang="fr" className={`${displayFont.variable} ${textFont.variable}${site.draft ? ' is-draft' : ''}`}>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <SmoothScroll>
          <Header />
          <main id="contenu" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileBookingBar />
        </SmoothScroll>
        <PointerFX />
        {schema && <JsonLd data={schema} />}
      </body>
    </html>
  )
}
