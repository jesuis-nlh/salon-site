import Link from 'next/link'
import styles from './Breadcrumbs.module.css'

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li key={c.label} className={styles.item}>
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className={styles.link}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
