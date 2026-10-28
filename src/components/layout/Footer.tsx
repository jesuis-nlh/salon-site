import Link from 'next/link'
import { site } from '@/config/site'
import { services } from '@/config/services'
import { directionsHref, fullAddress, hoursTable, phoneHref, socialLinks } from '@/lib/salon'
import { Placeholder } from '@/components/ui/Placeholder'
import { WeaveMark } from './Logo'
import { legalNav, mainNav } from './nav'
import styles from './Footer.module.css'

export function Footer() {
  const address = fullAddress()
  const tel = phoneHref()
  const socials = socialLinks()
  const directions = directionsHref()
  // Scale the signature wordmark to the brand name's length so any name fits.
  const wordSize = `min(${(92 / Math.max(site.name.length, 4)).toFixed(2)}vw, 15rem)`

  return (
    <footer className={`theme-dark ${styles.footer}`} data-hide-booking-bar="">
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <WeaveMark className={styles.mark} />
          <p className={styles.descriptor}>
            {site.descriptor} à {site.city}.
            <br />
            Coupe, couleur, soins et coiffage.
          </p>
        </div>

        <nav aria-label="Pages" className={styles.col}>
          <h2 className={styles.heading}>Le site</h2>
          <ul className={styles.links}>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rendez-vous" className="inline-link">
                Prendre rendez-vous
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Prestations" className={styles.col}>
          <h2 className={styles.heading}>Prestations</h2>
          <ul className={styles.links}>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/prestations/${s.slug}`} className="inline-link">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.heading}>L’atelier</h2>
          <address className={styles.address}>
            {address ? (
              directions ? (
                <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-link">
                  {address}
                  <span className="visually-hidden"> (itinéraire, nouvel onglet)</span>
                </a>
              ) : (
                <span>{address}</span>
              )
            ) : (
              <Placeholder>Adresse à renseigner</Placeholder>
            )}
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
          </address>
          {site.hoursConfirmed ? (
            <dl className={styles.hours}>
              {hoursTable().map((h) => (
                <div key={h.day}>
                  <dt>{h.day}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <Placeholder block>Horaires à renseigner</Placeholder>
          )}
        </div>
      </div>

      <p className={styles.word} style={{ fontSize: wordSize }} aria-hidden="true">
        {site.name}
      </p>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {new Date().getFullYear()} {site.legal.companyName ?? site.name}
        </p>
        <ul className={styles.legal}>
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="inline-link">
                {item.label}
              </Link>
            </li>
          ))}
          {socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-link">
                {s.label}
                <span className="visually-hidden"> (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.note}>Ce site n’utilise aucun cookie de mesure d’audience ni publicitaire.</p>
      </div>
    </footer>
  )
}
