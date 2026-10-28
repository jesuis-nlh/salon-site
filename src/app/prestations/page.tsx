import type { Metadata } from 'next'
import Link from 'next/link'
import { pricingNote, services } from '@/config/services'
import { bookingHref } from '@/lib/salon'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { Visual } from '@/components/ui/Visual'
import { ServiceItems } from '@/components/services/ServiceItems'
import { FinalCta } from '@/components/home/FinalCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/structuredData'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Prestations et tarifs',
  description:
    'Coupe, couleur et balayage, soins capillaires, coiffage et mariages à Lyon. Le tarif vous est annoncé lors du diagnostic, avant de commencer.',
  alternates: { canonical: '/prestations' },
}

export default function ServicesPage() {
  const booking = bookingHref()
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Accueil', href: '/' }, { label: 'Prestations' }]}
        title="Prestations et tarifs"
        lede="Coupe, couleur, soins et coiffage. Chaque prestation commence par un diagnostic, et le tarif vous est annoncé avant de commencer."
      >
        <Button href={booking.href} external={booking.external}>
          Prendre rendez-vous
        </Button>
      </PageHero>

      <nav aria-label="Catégories de prestations" className={`theme-dark ${styles.tabs}`}>
        <ul className={`container ${styles.tabList}`}>
          {services.map((s) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`} className={styles.tab}>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="theme-light">
        <p className={`container ${styles.note}`}>{pricingNote}</p>
        {services.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            className={`section ${styles.category}`}
            aria-labelledby={`${s.slug}-title`}
          >
            <div className={`container grid ${styles.grid}`}>
              <div className={styles.aside} data-flip={i % 2 === 1 || undefined}>
                <h2 id={`${s.slug}-title`} className={styles.title}>
                  {s.name}
                </h2>
                <p className="dim">{s.short}</p>
                <Visual visual={s.visual} sizes="(min-width: 960px) 28vw, 60vw" className={styles.visual} />
                <Link href={`/prestations/${s.slug}`} className="link">
                  Tout savoir sur {s.name.toLowerCase()}
                </Link>
              </div>
              <div className={styles.items}>
                <ServiceItems items={s.items} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <FinalCta title="Réserver ma prestation" />
      <JsonLd data={breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'Prestations', path: '/prestations' }])} />
    </>
  )
}
