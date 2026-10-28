import { site } from '@/config/site'
import { directionsHref, fullAddress, hoursTable, phoneHref, socialLinks } from '@/lib/salon'
import { Placeholder } from '@/components/ui/Placeholder'
import styles from './VisitInfo.module.css'

/** Address, access, opening hours and contact — every value from src/config/site.ts. */
export function VisitInfo({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  const address = fullAddress()
  const directions = directionsHref()
  const tel = phoneHref()
  const socials = socialLinks()

  return (
    <div className={styles.grid}>
      <div className={styles.block}>
        <H className={styles.heading}>Adresse</H>
        <address className={styles.body}>
          {address ? <span>{address}</span> : <Placeholder>Adresse à renseigner</Placeholder>}
          {site.address.district && <span className="dim">{site.address.district}</span>}
        </address>
        {site.access.length > 0 ? (
          <ul className={`dim ${styles.list}`}>
            {site.access.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <Placeholder block>Accès (métro, tram, stationnement) à renseigner</Placeholder>
        )}
        {directions && (
          <a href={directions} target="_blank" rel="noopener noreferrer" className="link">
            Itinéraire
            <span className="visually-hidden"> (nouvel onglet)</span>
          </a>
        )}
      </div>

      <div className={styles.block}>
        <H className={styles.heading}>Horaires</H>
        {site.hoursConfirmed ? (
          <dl className={styles.hours}>
            {hoursTable().map((h) => (
              <div key={h.day} className={styles.hoursRow}>
                <dt>{h.day}</dt>
                <dd className={h.value === 'Fermé' ? 'dim' : undefined}>{h.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Placeholder block>Horaires d’ouverture à renseigner</Placeholder>
        )}
      </div>

      <div className={styles.block}>
        <H className={styles.heading}>Contact</H>
        <div className={styles.body}>
          {tel && site.contact.phoneDisplay ? (
            <a href={tel} className="inline-link">
              {site.contact.phoneDisplay}
            </a>
          ) : (
            <Placeholder>Téléphone à renseigner</Placeholder>
          )}
          {site.contact.email ? (
            <a href={`mailto:${site.contact.email}`} className="inline-link">
              {site.contact.email}
            </a>
          ) : (
            <Placeholder>E-mail à renseigner</Placeholder>
          )}
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-link">
              {s.label}
              <span className="visually-hidden"> (nouvel onglet)</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
