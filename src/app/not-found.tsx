import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { bookingHref } from '@/lib/salon'
import styles from './not-found.module.css'

export default function NotFound() {
  const booking = bookingHref()
  return (
    <section className={`theme-dark ${styles.section}`}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className={styles.title}>Cette page est introuvable</h1>
        <p className="dim">Le lien est peut-être ancien, ou l’adresse contient une faute de frappe.</p>
        <div className={styles.actions}>
          <Button href="/">Retour à l’accueil</Button>
          <Link href="/prestations" className="link">
            Voir les prestations
          </Link>
          <Link href={booking.href} className="link">
            Prendre rendez-vous
          </Link>
        </div>
      </div>
    </section>
  )
}
