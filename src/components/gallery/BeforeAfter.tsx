'use client'

import Image from 'next/image'
import { useId, useState } from 'react'
import type { Transformation } from '@/config/content'
import styles from './BeforeAfter.module.css'

/**
 * Before/after comparison driven by a native range input (keyboard and
 * screen-reader operable). Only for genuine, authorised photo pairs.
 */
export function BeforeAfter({ item }: { item: Transformation }) {
  const [value, setValue] = useState(50)
  const id = useId()
  return (
    <figure className={styles.wrap}>
      <div className={styles.stage} style={{ ['--pos' as string]: `${value}%` }}>
        <Image src={item.after.src} alt={item.after.alt} sizes="(min-width: 960px) 50vw, 92vw" className={styles.img} />
        <div className={styles.before} aria-hidden="true">
          <Image src={item.before.src} alt="" sizes="(min-width: 960px) 50vw, 92vw" className={styles.img} />
        </div>
        <span className={styles.handle} aria-hidden="true" />
        <span className={`${styles.tag} ${styles.tagBefore}`}>Avant</span>
        <span className={`${styles.tag} ${styles.tagAfter}`}>Après</span>
        <label htmlFor={id} className="visually-hidden">
          Part de la photo « avant » affichée
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className={styles.range}
          aria-valuetext={`${value} % avant, ${100 - value} % après`}
        />
      </div>
      <figcaption className={styles.caption}>{item.title}</figcaption>
    </figure>
  )
}
