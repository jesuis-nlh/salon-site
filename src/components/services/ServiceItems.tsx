import type { ServiceItem } from '@/config/services'
import { site } from '@/config/site'
import { Placeholder } from '@/components/ui/Placeholder'
import styles from './ServiceItems.module.css'

/** Service list with duration and price. Missing values are never invented. */
export function ServiceItems({ items, headingLevel = 3 }: { items: ServiceItem[]; headingLevel?: 3 | 4 }) {
  const H = `h${headingLevel}` as const
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.name} className={styles.item}>
          <div className={styles.main}>
            <H className={styles.name}>{item.name}</H>
            <p className={styles.desc}>{item.description}</p>
          </div>
          <dl className={styles.meta}>
            <div>
              <dt className="visually-hidden">Durée</dt>
              <dd>
                {item.duration ?? (site.draft ? <Placeholder>durée</Placeholder> : null)}
              </dd>
            </div>
            <div>
              <dt className="visually-hidden">Tarif</dt>
              <dd className={styles.price}>
                {item.price ??
                  (site.draft ? <Placeholder>tarif à renseigner</Placeholder> : 'Tarif annoncé au diagnostic')}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}
