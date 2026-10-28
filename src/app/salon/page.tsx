import type { Metadata } from 'next'
import Image from 'next/image'
import { brandStory, principles, team } from '@/config/content'
import { visuals } from '@/config/etudes'
import { site } from '@/config/site'
import { PageHero } from '@/components/ui/PageHero'
import { Placeholder } from '@/components/ui/Placeholder'
import { Visual } from '@/components/ui/Visual'
import { WeaveMark } from '@/components/layout/Logo'
import { Reviews } from '@/components/home/Reviews'
import { FinalCta } from '@/components/home/FinalCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/structuredData'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'La maison',
  description:
    'Un atelier de coiffure à Lyon où l’on prend le temps du diagnostic, du geste et du conseil. Notre approche et notre équipe.',
  alternates: { canonical: '/salon' },
}

export default function SalonPage() {
  // Without verified names, the team section only exists as a draft placeholder.
  const members = site.draft ? team : team.filter((m) => m.name)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Accueil', href: '/' }, { label: 'La maison' }]}
        title="La maison"
        lede="Un atelier de coiffure à Lyon où l’on prend le temps du diagnostic, du geste et du conseil."
        visual={visuals.ondesEbene}
      />

      <section className="theme-light section" aria-labelledby="histoire-title">
        <div className={`container grid ${styles.story}`}>
          <h2 id="histoire-title" className={styles.storyTitle}>
            {brandStory.title}
          </h2>
          <div className={styles.storyText}>
            <p className="lede">{brandStory.paragraphs[0]}</p>
            {brandStory.paragraphs.slice(1).map((p) => (
              <p key={p.slice(0, 20)} className="dim">
                {p}
              </p>
            ))}
          </div>
          <Visual visual={visuals.torsadeCuivre} sizes="(min-width: 960px) 30vw, 80vw" className={styles.storyVisual} />
        </div>
      </section>

      <section className="theme-light section" aria-labelledby="principes-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 id="principes-title" className={styles.h2}>
            Ce qui guide notre travail
          </h2>
          <ul className={styles.principles}>
            {principles.map((p) => (
              <li key={p.title} className={styles.principle}>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className="dim">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {members.length > 0 && (
        <section className="theme-dark section" aria-labelledby="equipe-title">
          <div className="container">
            <h2 id="equipe-title" className={styles.h2}>
              L’équipe
            </h2>
            <ul className={styles.team}>
              {members.map((m, i) => (
                <li key={`${m.role}-${i}`} className={styles.member}>
                  <div className={styles.portrait}>
                    {m.portrait ? (
                      <Image src={m.portrait.src} alt={m.portrait.alt} sizes="(min-width: 960px) 28vw, 90vw" className={styles.portraitImg} />
                    ) : (
                      <div className={styles.portraitEmpty} aria-hidden="true">
                        <WeaveMark className={styles.portraitMark} />
                      </div>
                    )}
                  </div>
                  <h3 className={styles.memberName}>{m.name ?? <Placeholder>Prénom et nom</Placeholder>}</h3>
                  <p className="dim small">{m.role}</p>
                  {m.bio ? <p className={styles.bio}>{m.bio}</p> : <Placeholder block>Parcours et spécialités, portrait photo</Placeholder>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Reviews />
      <FinalCta />
      <JsonLd data={breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'La maison', path: '/salon' }])} />
    </>
  )
}
