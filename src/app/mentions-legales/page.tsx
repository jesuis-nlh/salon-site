import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/config/site'
import { PageHero } from '@/components/ui/PageHero'
import { Placeholder } from '@/components/ui/Placeholder'
import styles from '@/components/ui/LegalPage.module.css'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: `Mentions légales du site ${site.name}.`,
  alternates: { canonical: '/mentions-legales' },
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? <Placeholder>à renseigner</Placeholder>}</dd>
    </div>
  )
}

export default function LegalNoticePage() {
  const l = site.legal
  return (
    <>
      <PageHero crumbs={[{ label: 'Accueil', href: '/' }, { label: 'Mentions légales' }]} title="Mentions légales" />
      <section className="theme-light section">
        <div className={`container ${styles.body}`}>
          {site.draft && (
            <p className={styles.warning} role="note">
              Document à compléter avec les informations officielles du salon et à faire relire avant publication. Il
              ne constitue pas un avis juridique.
            </p>
          )}

          <div>
            <h2>Éditeur du site</h2>
            <dl>
              <Row label="Raison sociale" value={l.companyName} />
              <Row label="Forme juridique et capital" value={l.legalForm && `${l.legalForm}${l.capital ? `, capital de ${l.capital}` : ''}`} />
              <Row label="Siège social" value={l.registeredAddress} />
              <Row label="SIRET" value={l.siret} />
              <Row label="RCS ou Répertoire des métiers" value={l.rcs} />
              <Row label="N° de TVA intracommunautaire" value={l.vatNumber} />
              <Row label="Directeur ou directrice de la publication" value={l.publicationDirector} />
              <Row label="Contact" value={site.contact.email ?? site.contact.phoneDisplay} />
            </dl>
          </div>

          <div>
            <h2>Hébergement</h2>
            <p>
              {site.host.name}, {site.host.address}.{' '}
              <a href={site.host.url} className="inline-link" target="_blank" rel="noopener noreferrer">
                {site.host.url.replace('https://', '')}
                <span className="visually-hidden"> (nouvel onglet)</span>
              </a>
            </p>
          </div>

          <div>
            <h2>Médiation de la consommation</h2>
            <p>
              Conformément au Code de la consommation, le client peut recourir gratuitement à un médiateur de la
              consommation en cas de litige.
            </p>
            <p>
              Médiateur désigné : <Placeholder>nom et coordonnées du médiateur à renseigner</Placeholder>
            </p>
          </div>

          <div>
            <h2>Propriété intellectuelle</h2>
            <p>
              Les textes, visuels, logo et éléments graphiques de ce site sont protégés. Toute reproduction sans
              autorisation préalable est interdite.
            </p>
          </div>

          <div>
            <h2>Crédits</h2>
            <ul>
              <li>
                Visuels provisoires : études de matière générées par le moteur de rendu du site. Ils ne représentent
                ni des clientes ni des réalisations du salon.
              </li>
              <li>Typographies : Bodoni Moda et Jost, sous licence SIL Open Font License.</li>
              <li>
                Conception et réalisation : <Placeholder>à renseigner</Placeholder>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
