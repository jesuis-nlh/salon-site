'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/config/site'
import { bookingHref, phoneHref } from '@/lib/salon'
import styles from './MobileBookingBar.module.css'

/**
 * Persistent booking access on small screens. Appears once the first screen
 * has been scrolled past, and steps aside when the footer or a booking
 * section (`[data-hide-booking-bar]`) is visible so it never covers them.
 */
export function MobileBookingBar() {
  const pathname = usePathname()
  const [pastHero, setPastHero] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const booking = bookingHref()
  const tel = phoneHref()

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const seen = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)))
      setBlocked(seen.size > 0)
    })
    document.querySelectorAll('[data-hide-booking-bar]').forEach((el) => io.observe(el))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [pathname])

  const visible = pastHero && !blocked && pathname !== '/rendez-vous'

  return (
    <div className={styles.bar} data-booking-bar="" data-visible={visible || undefined} aria-hidden={!visible} inert={!visible}>
      {booking.external ? (
        <a href={booking.href} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          Prendre rendez-vous<span className="visually-hidden"> (nouvel onglet)</span>
        </a>
      ) : (
        <Link href={booking.href} className={styles.cta}>
          Prendre rendez-vous
        </Link>
      )}
      {tel && (
        <a href={tel} className={styles.call} aria-label={`Appeler ${site.name}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M6.6 3.5h2.6l1.4 4.2-2 1.3a12 12 0 0 0 6.4 6.4l1.3-2 4.2 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
          </svg>
        </a>
      )}
    </div>
  )
}
