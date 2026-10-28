import { bookingHref } from '@/lib/salon'
import { Button } from '@/components/ui/Button'
import { VisitInfo } from '@/components/booking/VisitInfo'
import styles from './Visit.module.css'

export function Visit() {
  const booking = bookingHref()
  return (
    <section className={`theme-prune section ${styles.section}`} aria-labelledby="venir-title" data-hide-booking-bar="">
      <div className="container">
        <div className={styles.head}>
          <h2 id="venir-title" className={styles.title}>
            Venir à l’atelier
          </h2>
          <Button href={booking.href} external={booking.external}>
            Prendre rendez-vous
          </Button>
        </div>
        <VisitInfo />
      </div>
    </section>
  )
}
