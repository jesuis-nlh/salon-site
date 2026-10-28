import type { Metadata } from 'next'
import { site } from '@/config/site'
import { phoneHref } from '@/lib/salon'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { Placeholder } from '@/components/ui/Placeholder'
import { RequestForm } from '@/components/booking/RequestForm'
import { VisitInfo } from '@/components/booking/VisitInfo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/structuredData'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Prendre rendez-vous',
  description:
    'Prenez rendez-vous à l’atelier de coiffure : réservation en ligne, par téléphone ou par message. Adresse, horaires et accès.',
  alternates: { canonical: '/rendez-vous' },
}

export default function BookingPage() {
  const tel = phoneHref()
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Accueil', href: '/' }, { label: 'Rendez-vous' }]}
        title="Prendre rendez-vous"
        lede={"Réservez en ligne, appelez-nous ou envoyez une demande\u00a0: choisissez ce qui vous convient."}
      />

      <section className="theme-light section" aria-labelledby="options-title" data-hide-booking-bar="">
        <div className="container">
          <h2 id="options-title" className="visually-hidden">
            Trois façons de prendre rendez-vous
          </h2>
          <ul className={styles.options}>
            {(site.booking.url || site.draft) && (
              <li className={styles.option}>
                <h3 className={styles.optionTitle}>En ligne</h3>
                {site.booking.url ? (
                  <>
                    <p className="dim">
                      Choisissez votre prestation et votre créneau
                      {site.booking.provider ? ` sur ${site.booking.provider}` : ''}, à toute heure.
                    </p>
                    <Button href={site.booking.url} external>
                      Réserver en ligne
                    </Button>
                  </>
                ) : (
                  <Placeholder block>Lien de réservation en ligne à connecter (Planity, Treatwell…)</Placeholder>
                )}
              </li>
            )}
            {(tel || site.draft) && (
              <li className={styles.option}>
                <h3 className={styles.optionTitle}>Par téléphone</h3>
                {tel && site.contact.phoneDisplay ? (
                  <>
                    <p className="dim">Pendant les heures d’ouverture, pour un conseil ou un créneau rapide.</p>
                    <Button href={tel} variant="ghost">
                      Appeler le {site.contact.phoneDisplay}
                    </Button>
                  </>
                ) : (
                  <Placeholder block>Numéro de téléphone à renseigner</Placeholder>
                )}
              </li>
            )}
            <li className={styles.option}>
              <h3 className={styles.optionTitle}>Par message</h3>
              <p className="dim">
                Envoyez une demande avec vos disponibilités&nbsp;: le salon vous recontacte pour fixer le créneau.
              </p>
              <a href="#demande" className="link">
                Remplir le formulaire
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section id="demande" className="theme-light section" aria-labelledby="demande-title" style={{ paddingTop: 0 }}>
        <div className={`container grid ${styles.formGrid}`}>
          <div className={styles.formIntro}>
            <h2 id="demande-title" className={styles.h2}>
              Demande de rendez-vous
            </h2>
            <p className="dim">
              Votre rendez-vous n’est confirmé qu’après la réponse du salon. Pour une couleur, précisez si c’est une
              première fois&nbsp;: un test de tolérance peut être nécessaire 48 heures avant.
            </p>
          </div>
          <div className={styles.formCol}>
            <RequestForm />
          </div>
        </div>
      </section>

      <section id="contact" className="theme-prune section" aria-labelledby="contact-title">
        <div className="container">
          <h2 id="contact-title" className={styles.h2}>
            Contact et accès
          </h2>
          <VisitInfo />
        </div>
      </section>
      <JsonLd data={breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'Rendez-vous', path: '/rendez-vous' }])} />
    </>
  )
}
