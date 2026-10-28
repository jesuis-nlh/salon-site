'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { services } from '@/config/services'
import styles from './ServiceIndex.module.css'

/**
 * Index of service categories. On desktop, a preview of the category's
 * visual follows the pointer while a row is hovered; on touch screens each
 * row carries its own thumbnail.
 */
export function ServiceIndex() {
  const [active, setActive] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0, raf: 0 })

  useEffect(() => {
    const p = pos.current
    return () => cancelAnimationFrame(p.raf)
  }, [])

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const p = pos.current
    p.x = e.clientX
    p.y = e.clientY
    if (p.raf) return
    const tick = () => {
      p.cx += (p.x - p.cx) * 0.16
      p.cy += (p.y - p.cy) * 0.16
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${p.cx}px, ${p.cy}px, 0)`
      }
      p.raf = Math.abs(p.x - p.cx) + Math.abs(p.y - p.cy) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    p.raf = requestAnimationFrame(tick)
  }

  return (
    <section id="prestations" className={`theme-dark section ${styles.section}`} aria-labelledby="prestations-title">
      <div className={`container grid ${styles.head}`}>
        <h2 id="prestations-title" className={styles.title}>
          Prestations
        </h2>
        <div className={styles.intro}>
          <p className="dim">
            Quatre savoir-faire, un même point de départ&nbsp;: le diagnostic. Les tarifs vous sont annoncés avant de
            commencer.
          </p>
          <Link href="/prestations" className="link">
            Toutes les prestations et les tarifs
          </Link>
        </div>
      </div>

      <div className="container">
        <ul
          className={styles.list}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          {services.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/prestations/${s.slug}`}
                className={styles.row}
                data-active={active === i || undefined}
                data-dim={(active !== null && active !== i) || undefined}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') {
                    const p = pos.current
                    if (active === null) {
                      p.cx = e.clientX
                      p.cy = e.clientY
                    }
                    setActive(i)
                  }
                }}
                onFocus={() => setActive(null)}
              >
                <span className={styles.name}>{s.name}</span>
                <span className={styles.short}>{s.short}</span>
                <span className={styles.thumb} aria-hidden="true">
                  <Image src={s.visual.src} alt="" sizes="96px" quality={70} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div ref={previewRef} className={styles.preview} data-service-preview="" data-visible={active !== null || undefined} aria-hidden="true">
        {services.map((s, i) => (
          <div key={s.slug} className={styles.previewItem} data-active={active === i || undefined}>
            <Image src={s.visual.src} alt="" sizes="22vw" quality={70} />
          </div>
        ))}
      </div>
    </section>
  )
}
