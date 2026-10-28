import { bookingHref } from '@/lib/salon'
import { Button } from '@/components/ui/Button'
import styles from './FinalCta.module.css'

export function FinalCta({ title = 'Trouver ma prochaine coupe' }: { title?: string }) {
  const booking = bookingHref()
  return (
    <section className={`theme-dark ${styles.section}`} aria-labelledby="cta-title" data-hide-booking-bar="">
      <div className={`container ${styles.inner}`}>
        <h2 id="cta-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.side}>
          <p className="dim">
            Décrivez votre envie lors de la prise de rendez-vous&nbsp;: nous prévoyons le temps qu’il faut pour le
            diagnostic.
          </p>
          <Button href={booking.href} external={booking.external}>
            Prendre rendez-vous
          </Button>
        </div>
      </div>
    </section>
  )
}
