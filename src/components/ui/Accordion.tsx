'use client'

import { useId, useState } from 'react'
import styles from './Accordion.module.css'

export interface AccordionItem {
  q: string
  a: string
}

/** Disclosure list (WAI-ARIA accordion pattern): buttons with aria-expanded controlling regions. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()
  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const expanded = open === i
        return (
          <div key={item.q} className={styles.item} data-open={expanded || undefined}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={`${id}-panel-${i}`}
                id={`${id}-trigger-${i}`}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.q}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`${id}-panel-${i}`}
              role="region"
              aria-labelledby={`${id}-trigger-${i}`}
              className={styles.panel}
              hidden={!expanded}
            >
              <p>{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
