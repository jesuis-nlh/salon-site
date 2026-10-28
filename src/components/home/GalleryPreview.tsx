import Link from 'next/link'
import { gallery, galleryCategories } from '@/config/content'
import { site } from '@/config/site'
import { Visual } from '@/components/ui/Visual'
import styles from './GalleryPreview.module.css'

const PICKS = ['carre-net', 'vagues-cuivre', 'boucles-cuivre', 'chignon']

export function GalleryPreview() {
  const items = PICKS.map((id) => gallery.find((g) => g.id === id)).filter((g) => g !== undefined)
  const label = (c: string) => galleryCategories.find((x) => x.id === c)?.label
  return (
    <section className={`theme-dark section ${styles.section}`} aria-labelledby="realisations-title">
      <div className={`container ${styles.head}`}>
        <h2 id="realisations-title" className={styles.title}>
          Réalisations
        </h2>
        <div className={styles.intro}>
          {site.draft && (
            <p className="dim small">
              Les visuels ci-dessous sont des études de matière créées pour la maquette. Ils seront remplacés par des
              photos des réalisations du salon.
            </p>
          )}
          <Link href="/realisations" className="link">
            Voir toutes les réalisations
          </Link>
        </div>
      </div>
      <ul className={`container ${styles.grid}`}>
        {items.map((item, i) => (
          <li key={item.id} className={styles.item} data-slot={i + 1}>
            <Link href={`/realisations#${item.id}`} className={styles.card} data-cursor="Voir">
              <Visual
                visual={item.visual}
                sizes={i === 1 ? '(min-width: 960px) 46vw, 92vw' : '(min-width: 960px) 32vw, 46vw'}
                className={styles.visual}
                showTag={false}
              />
              <span className={styles.caption}>
                <span className={styles.name}>{item.title}</span>
                <span className="dim small">{label(item.category)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
