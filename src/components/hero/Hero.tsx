import { site } from '@/config/site'
import { bookingHref } from '@/lib/salon'
import { Button } from '@/components/ui/Button'
import { Placeholder } from '@/components/ui/Placeholder'
import { SilkHero } from './SilkHero'
import styles from './Hero.module.css'

const TITLE_LINES = ['Coupe sur mesure,', 'couleur travaillée', 'fil à fil.']

export function Hero() {
  const booking = bookingHref()
  return (
    <section className={`theme-dark ${styles.hero}`} aria-labelledby="hero-title" data-cursor="Effleurer">
      <SilkHero />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <h1 id="hero-title" className={styles.title}>
          {TITLE_LINES.map((line, i) => (
            <span key={line} className={styles.line} style={{ ['--i' as string]: i }}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className={styles.lower}>
          <p className={styles.intro}>
            {site.name} est un atelier de coiffure à {site.city}. Coupe, couleur, balayage et soins&nbsp;: chaque
            rendez-vous commence par un diagnostic de vos cheveux.
          </p>
          <div className={styles.actions}>
            <Button href={booking.href} external={booking.external}>
              Prendre rendez-vous
            </Button>
            <a href="#prestations" className="link">
              Voir les prestations
            </a>
          </div>
        </div>

        <div className={styles.meta}>
          <p>
            {site.descriptor}, {site.city}
            {site.address.district ? ` ${site.address.district}` : ''}
            {!site.address.street && (
              <>
                {' '}
                <Placeholder>adresse à renseigner</Placeholder>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
