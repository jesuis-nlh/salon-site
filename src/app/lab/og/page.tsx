import Image from 'next/image'
import { notFound } from 'next/navigation'
import { visuals } from '@/config/etudes'
import { site } from '@/config/site'
import { WeaveMark } from '@/components/layout/Logo'

export const metadata = { robots: { index: false, follow: false } }

/** Development-only composition used to export public/og.jpg (1200×630). */
export default function OgLab() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div
      id="og"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, width: 1200, height: 630, background: '#16110e', overflow: 'hidden' }}
    >
      <Image src={visuals.heroDesktop.src} alt="" fill sizes="1200px" style={{ objectFit: 'cover', objectPosition: '70% 35%' }} priority />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(22,17,14,.92) 0%, rgba(22,17,14,.6) 42%, rgba(22,17,14,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 72, top: 64, display: 'flex', alignItems: 'center', gap: 14, color: '#efe8dd' }}>
        <WeaveMark className="og-mark" />
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 40, lineHeight: 1 }}>{site.name}</span>
      </div>
      <div style={{ position: 'absolute', left: 72, bottom: 72, color: '#efe8dd' }}>
        <p style={{ fontFamily: 'var(--ff-display)', fontSize: 74, lineHeight: 1, letterSpacing: '-0.02em', maxWidth: 640 }}>
          Coupe sur mesure, couleur travaillée fil à fil.
        </p>
        <p style={{ marginTop: 22, fontSize: 24, color: '#b9ad9e' }}>
          {site.descriptor} à {site.city}
        </p>
      </div>
      <style>{`.og-mark{width:28px;height:28px;color:#d5bf98}`}</style>
    </div>
  )
}
