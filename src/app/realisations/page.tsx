import type { Metadata } from 'next'
import { gallery, transformations } from '@/config/content'
import { site } from '@/config/site'
import { PageHero } from '@/components/ui/PageHero'
import { Gallery } from '@/components/gallery/Gallery'
import { BeforeAfter } from '@/components/gallery/BeforeAfter'
import { FinalCta } from '@/components/home/FinalCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/structuredData'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Réalisations',
  description: 'Coupes, couleurs, balayages, boucles et coiffures de cérémonie réalisés à l’atelier, à Lyon.',
  alternates: { canonical: '/realisations' },
}

export default function RealisationsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Accueil', href: '/' }, { label: 'Réalisations' }]}
        title="Réalisations"
        lede="Coupes nettes, balayages lumineux, boucles définies et coiffures de cérémonie."
      />
      <section className="theme-dark section" aria-label="Galerie" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="container">
          {site.draft && (
            <p className={`small ${styles.notice}`} role="note">
              Les images de cette galerie sont des études de matière créées pour la maquette&nbsp;: elles ne montrent
              ni des clientes ni des réalisations du salon. Remplacez-les par vos propres photos, avec l’accord des
              personnes photographiées.
            </p>
          )}
          <Gallery items={gallery} />
        </div>
      </section>

      {transformations.length > 0 && (
        <section className="theme-light section" aria-labelledby="avant-apres-title">
          <div className="container">
            <h2 id="avant-apres-title" className={styles.h2}>
              Avant, après
            </h2>
            <div className={styles.pairs}>
              {transformations.map((t) => (
                <BeforeAfter key={t.id} item={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCta />
      <JsonLd data={breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'Réalisations', path: '/realisations' }])} />
    </>
  )
}
