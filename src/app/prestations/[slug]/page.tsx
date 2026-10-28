import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getService, pricingNote, services } from '@/config/services'
import { bookingHref } from '@/lib/salon'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { ServiceItems } from '@/components/services/ServiceItems'
import { FinalCta } from '@/components/home/FinalCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/structuredData'
import styles from './page.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps<'/prestations/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return {}
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/prestations/${service.slug}` },
    openGraph: { title: service.seoTitle, description: service.seoDescription, url: `/prestations/${service.slug}` },
  }
}

export default async function ServicePage({ params }: PageProps<'/prestations/[slug]'>) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()
  const booking = bookingHref()
  const others = services.filter((s) => s.slug !== service.slug)

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/prestations' },
          { label: service.name },
        ]}
        title={service.name}
        lede={service.lede}
        visual={service.visual}
      >
        <Button href={booking.href} external={booking.external}>
          Réserver ma prestation
        </Button>
      </PageHero>

      <section className={`theme-light section`} aria-labelledby="approche-title">
        <div className={`container grid ${styles.grid}`}>
          <div className={styles.intro}>
            <h2 id="approche-title" className={styles.h2}>
              Notre approche
            </h2>
            <div className="prose dim">
              {service.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className={styles.list}>
            <h2 className={styles.h2}>Les prestations</h2>
            <ServiceItems items={service.items} />
            <p className={`small dim ${styles.note}`}>{pricingNote}</p>
          </div>
        </div>
      </section>

      {service.faq.length > 0 && (
        <section className="theme-light section" aria-labelledby="faq-title" style={{ paddingTop: 0 }}>
          <div className={`container grid ${styles.grid}`}>
            <h2 id="faq-title" className={`${styles.h2} ${styles.faqTitle}`}>
              Questions fréquentes
            </h2>
            <div className={styles.faq}>
              <Accordion items={service.faq} />
            </div>
          </div>
        </section>
      )}

      <section className="theme-dark section" aria-labelledby="autres-title">
        <div className="container">
          <h2 id="autres-title" className={styles.h2}>
            Autres prestations
          </h2>
          <ul className={styles.others}>
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={`/prestations/${s.slug}`} className={styles.other}>
                  <span className={styles.otherName}>{s.name}</span>
                  <span className="dim small">{s.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta title="Réserver ma prestation" />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Prestations', path: '/prestations' },
          { name: service.name, path: `/prestations/${service.slug}` },
        ])}
      />
    </>
  )
}
