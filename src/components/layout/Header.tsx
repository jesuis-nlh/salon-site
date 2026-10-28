'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { site } from '@/config/site'
import { bookingHref, fullAddress, phoneHref } from '@/lib/salon'
import { DraftBanner } from './DraftBanner'
import { useSmoothScroll } from './SmoothScroll'
import { Logo } from './Logo'
import { mainNav } from './nav'
import styles from './Header.module.css'

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const lenis = useSmoothScroll()
  const booking = bookingHref()
  const tel = phoneHref()

  // Solid background once scrolled; hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 24)
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 480)
          last = y
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  // Menu open: lock scroll, make the page inert, trap focus, close on Escape.
  useEffect(() => {
    const main = document.getElementById('contenu')
    const footer = document.querySelector('footer')
    if (!open) {
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
      document.documentElement.style.overflow = ''
      lenis?.start()
      return
    }
    main?.setAttribute('inert', '')
    footer?.setAttribute('inert', '')
    document.documentElement.style.overflow = 'hidden'
    lenis?.stop()
    const panel = menuRef.current
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key !== 'Tab') return
      const els = [toggleRef.current!, ...focusables()]
      const first = els[0]
      const lastEl = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close, lenis])

  const isActive = (href: string) => {
    const base = href.split('#')[0]
    return base !== '/rendez-vous' && pathname.startsWith(base)
  }

  return (
    <header
      className={`theme-dark ${styles.header}`}
      data-scrolled={scrolled || open || undefined}
      data-hidden={(hidden && !open) || undefined}
      onFocusCapture={() => setHidden(false)}
    >
      <DraftBanner />
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.home} aria-label={`${site.name}, retour à l’accueil`}>
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className={styles.nav}>
          <ul className={styles.navList}>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          {booking.external ? (
            <a href={booking.href} target="_blank" rel="noopener noreferrer" className={styles.cta} data-magnetic="">
              Prendre rendez-vous<span className="visually-hidden"> (nouvel onglet)</span>
            </a>
          ) : (
            <Link href={booking.href} className={styles.cta} data-magnetic="">
              Prendre rendez-vous
            </Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => (open ? close(false) : setOpen(true))}
          >
            <span className={styles.toggleLabel}>{open ? 'Fermer' : 'Menu'}</span>
            <span className={styles.toggleIcon} aria-hidden="true" data-open={open || undefined} />
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        ref={menuRef}
        className={styles.menu}
        data-open={open || undefined}
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <nav aria-label="Navigation mobile" className={styles.menuNav}>
          <ul>
            {[{ href: '/', label: 'Accueil' }, ...mainNav].map((item, i) => (
              <li key={item.href} style={{ ['--i' as string]: i }}>
                <Link
                  href={item.href}
                  className={styles.menuLink}
                  aria-current={item.href === '/' ? (pathname === '/' ? 'page' : undefined) : isActive(item.href) ? 'page' : undefined}
                  onClick={() => close(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.menuFoot}>
          {booking.external ? (
            <a href={booking.href} target="_blank" rel="noopener noreferrer" className={styles.menuCta}>
              Prendre rendez-vous<span className="visually-hidden"> (nouvel onglet)</span>
            </a>
          ) : (
            <Link href={booking.href} className={styles.menuCta} onClick={() => close(false)}>
              Prendre rendez-vous
            </Link>
          )}
          <div className={styles.menuInfo}>
            {tel && site.contact.phoneDisplay && <a href={tel}>{site.contact.phoneDisplay}</a>}
            {fullAddress() && <span>{fullAddress()}</span>}
            <span>{site.descriptor} à {site.city}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
