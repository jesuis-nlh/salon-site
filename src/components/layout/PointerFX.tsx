'use client'

import { useEffect, useRef } from 'react'
import styles from './PointerFX.module.css'

/**
 * Desktop-only pointer layer:
 *  - a follower ring that grows and shows a label over `[data-cursor]` zones
 *    (images, the hero strands) — the native cursor stays everywhere else;
 *  - a gentle magnetic pull on `[data-magnetic]` buttons.
 * Disabled for touch input and reduced-motion users.
 */
export function PointerFX() {
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return
    const ring = ringRef.current!
    const label = labelRef.current!
    document.documentElement.classList.add('has-fx-cursor')

    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }
    let raf = 0
    let running = false
    let magnet: HTMLElement | null = null

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.2
      cur.y += (pos.y - cur.y) * 0.2
      ring.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
      if (Math.abs(pos.x - cur.x) + Math.abs(pos.y - cur.y) > 0.1) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }
    const kick = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const releaseMagnet = () => {
      if (magnet) {
        magnet.style.transform = ''
        magnet = null
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      ring.dataset.visible = 'true'
      kick()

      const target = e.target as Element | null
      const zone = target?.closest<HTMLElement>('[data-cursor]')
      const interactive = target?.closest('a, button, input, select, textarea, label, [role="button"]')
      const text = zone?.dataset.cursor ?? ''
      // A link or button inside a labelled zone keeps the plain link state.
      const nestedControl = interactive && zone && interactive !== zone && zone.contains(interactive)
      if (zone && text && !nestedControl) {
        ring.dataset.state = 'label'
        if (label.textContent !== text) label.textContent = text
      } else {
        ring.dataset.state = interactive ? 'link' : ''
      }

      const m = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (m !== magnet) releaseMagnet()
      if (m) {
        magnet = m
        const r = m.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        m.style.transform = `translate(${dx * 5}px, ${dy * 4}px)`
      }
    }
    const onLeave = () => {
      ring.dataset.visible = ''
      releaseMagnet()
    }
    const onDown = () => ring.classList.add(styles.pressed)
    const onUp = () => ring.classList.remove(styles.pressed)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      releaseMagnet()
      document.documentElement.classList.remove('has-fx-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div ref={ringRef} className={styles.ring} data-cursor-ring="" aria-hidden="true">
      <span ref={labelRef} className={styles.label} />
    </div>
  )
}
