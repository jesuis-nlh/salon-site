import type { ReactNode } from 'react'
import { site } from '@/config/site'
import styles from './Placeholder.module.css'

/**
 * Visible marker for information the salon has not supplied yet.
 * Rendered only in draft mode; once `site.draft` is false the gap simply disappears.
 */
export function Placeholder({ children, block }: { children: ReactNode; block?: boolean }) {
  if (!site.draft) return null
  const Tag = block ? 'p' : 'span'
  return (
    <Tag className={`${styles.ph} ${block ? styles.block : ''}`} title="Information à compléter dans src/config">
      <span className="visually-hidden">Information à compléter : </span>
      {children}
    </Tag>
  )
}
