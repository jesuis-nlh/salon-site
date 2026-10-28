import type { ReactNode } from 'react'
import type { Visual as VisualData } from '@/config/etudes'
import { Visual } from './Visual'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import styles from './PageHero.module.css'

interface PageHeroProps {
  title: ReactNode
  lede?: ReactNode
  visual?: VisualData
  crumbs?: Crumb[]
  children?: ReactNode
}

/** Dark opening band shared by inner pages. */
export function PageHero({ title, lede, visual, crumbs, children }: PageHeroProps) {
  return (
    <section className={`theme-dark ${styles.hero} ${visual ? styles.withVisual : ''}`}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          {crumbs && <Breadcrumbs items={crumbs} />}
          <h1 className={styles.title}>{title}</h1>
          {lede && <p className={styles.lede}>{lede}</p>}
          {children && <div className={styles.actions}>{children}</div>}
        </div>
        {visual && (
          <Visual
            visual={visual}
            sizes="(min-width: 960px) 34vw, 90vw"
            className={styles.visual}
            priority
            reveal={false}
          />
        )}
      </div>
    </section>
  )
}
