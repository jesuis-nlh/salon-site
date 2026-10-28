'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { galleryCategories, type GalleryCategory, type GalleryItem } from '@/config/content'
import styles from './Gallery.module.css'

type Filter = GalleryCategory | 'all'

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const visible = filter === 'all' ? items : items.filter((i) => i.category === filter)
  const current = openIndex !== null ? visible[openIndex] : null
  const label = (c: GalleryCategory) => galleryCategories.find((x) => x.id === c)?.label ?? c

  const open = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setOpenIndex(index)
  }

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  const step = useCallback(
    (dir: 1 | -1) => setOpenIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  )

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (openIndex !== null && !d.open) d.showModal()
  }, [openIndex])

  // Deep link: /realisations#id opens that item.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const index = items.findIndex((i) => i.id === id)
    if (index < 0) return
    const el = document.getElementById(`etude-${id}`)
    el?.scrollIntoView({ block: 'center' })
    el?.querySelector('button')?.focus({ preventScroll: true })
  }, [items])

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filtrer les réalisations">
        {(['all', ...galleryCategories.map((c) => c.id)] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={styles.filter}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Toutes' : label(f)}
            <span className={styles.count}>
              {f === 'all' ? items.length : items.filter((i) => i.category === f).length}
            </span>
          </button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {visible.length} réalisation{visible.length > 1 ? 's' : ''} affichée{visible.length > 1 ? 's' : ''}
      </p>

      <ul className={styles.grid}>
        {visible.map((item, i) => (
          <li key={item.id} id={`etude-${item.id}`} className={styles.cell} data-shape={item.shape}>
            <button
              type="button"
              className={styles.card}
              data-cursor="Agrandir"
              onClick={(e) => open(i, e.currentTarget)}
              aria-haspopup="dialog"
              aria-label={`${item.title}, ${label(item.category)} : agrandir`}
            >
              <span className={styles.frame}>
                <Image
                  src={item.visual.src}
                  alt={item.visual.alt}
                  sizes="(min-width: 1100px) 30vw, (min-width: 640px) 45vw, 92vw"
                  quality={82}
                  placeholder="blur"
                  className={styles.img}
                />
              </span>
              <span className={styles.caption}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.cat}>{label(item.category)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={current ? `${current.title}, ${label(current.category)}` : 'Réalisation'}
        onClose={() => {
          setOpenIndex(null)
          triggerRef.current?.focus()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        {current && (
          <div className={styles.dialogInner}>
            <div className={styles.dialogFrame}>
              <Image
                key={current.id}
                src={current.visual.src}
                alt={current.visual.alt}
                sizes="(min-width: 960px) 60vw, 100vw"
                quality={82}
                className={styles.dialogImg}
              />
            </div>
            <div className={styles.dialogBar}>
              <p>
                <span className={styles.title}>{current.title}</span>
                <span className={styles.cat}>
                  {label(current.category)}
                  {current.visual.provisional ? ' (visuel provisoire)' : ''}
                </span>
              </p>
              <div className={styles.dialogNav}>
                <button type="button" onClick={() => step(-1)} className={styles.navBtn}>
                  Précédente
                </button>
                <span aria-hidden="true" className={styles.counter}>
                  {(openIndex ?? 0) + 1} / {visible.length}
                </span>
                <button type="button" onClick={() => step(1)} className={styles.navBtn}>
                  Suivante
                </button>
                <button type="button" onClick={close} className={styles.closeBtn}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
