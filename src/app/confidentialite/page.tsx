import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/config/site'
import { PageHero } from '@/components/ui/PageHero'
import { Placeholder } from '@/components/ui/Placeholder'
import styles from '@/components/ui/LegalPage.module.css'

export const metadata: Metadata = {
  title: 'Confidentialité',
  description: `Politique de confidentialité et cookies du site ${site.name}.`,
  alternates: { canonical: '/confidentialite' },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Accueil', href: '/' }, { label: 'Confidentialité' }]}
        title="Confidentialité et cookies"
        lede="Ce que ce site collecte, pourquoi, et comment exercer vos droits."
      />
      <section className="theme-light section">
        <div className={`container ${styles.body}`}>
          {site.draft && (
            <p className={styles.warning} role="note">
              Document à compléter (responsable de traitement, durée de conservation, prestataire d’envoi) et à faire
              valider avant publication. Il ne constitue pas un avis juridique.
            </p>
          )}

          <div>
            <h2>Responsable du traitement</h2>
            <p>
              {site.legal.companyName ?? <Placeholder>raison sociale du salon</Placeholder>}
              {site.legal.registeredAddress ? `, ${site.legal.registeredAddress}` : ''}.
            </p>
            <p>
              Contact pour toute question relative à vos données :{' '}
              {site.contact.email ? (
                <a href={`mailto:${site.contact.email}`} className="inline-link">
                  {site.contact.email}
                </a>
              ) : (
                <Placeholder>e-mail à renseigner</Placeholder>
              )}
              .
            </p>
          </div>

          <div>
            <h2>Données collectées par le formulaire de demande</h2>
            <p>
              Le <Link href="/rendez-vous#demande" className="inline-link">formulaire de demande de rendez-vous</Link>{' '}
              recueille votre prénom, éventuellement votre nom, votre téléphone et/ou votre e-mail, la prestation
              souhaitée, vos disponibilités et votre message.
            </p>
            <ul>
              <li>Finalité : répondre à votre demande et convenir d’un rendez-vous.</li>
              <li>Base légale : mesures précontractuelles prises à votre demande.</li>
              <li>
                Destinataires : le salon uniquement, via un service d’envoi d’e-mails (
                <Placeholder>prestataire à préciser, par exemple Resend</Placeholder>). Les données ne sont pas
                enregistrées dans une base de données par le site.
              </li>
              <li>
                Durée de conservation : <Placeholder>à définir par le salon</Placeholder>.
              </li>
            </ul>
          </div>

          <div>
            <h2>Cookies et mesure d’audience</h2>
            <p>
              Ce site ne dépose aucun cookie de mesure d’audience, publicitaire ou de réseau social. Il n’affiche donc
              pas de bandeau de consentement.
            </p>
            <p>
              Si un outil de mesure d’audience, une carte interactive, une vidéo ou un module de réseau social est
              ajouté, votre consentement devra être recueilli au préalable.
            </p>
          </div>

          <div>
            <h2>Hébergement et journaux techniques</h2>
            <p>
              Le site est hébergé par {site.host.name}. Comme tout hébergeur, il peut traiter des données techniques
              (adresse IP, journaux de connexion) pour assurer la sécurité et le bon fonctionnement du service.
            </p>
          </div>

          <div>
            <h2>Vos droits</h2>
            <p>
              Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de
              portabilité de vos données. Pour les exercer, contactez le salon à l’adresse indiquée ci-dessus.
            </p>
            <p>
              Vous pouvez également adresser une réclamation à la CNIL :{' '}
              <a href="https://www.cnil.fr" className="inline-link" target="_blank" rel="noopener noreferrer">
                cnil.fr
                <span className="visually-hidden"> (nouvel onglet)</span>
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
