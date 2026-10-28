import { site } from '@/config/site'
import styles from './DraftBanner.module.css'

/** Honest notice shown while the site still contains provisional content. */
export function DraftBanner() {
  if (!site.draft) return null
  return (
    <div className={styles.banner} role="note">
      <p className="container">
        <span className={styles.long}>
          Maquette : le nom «&nbsp;{site.name}&nbsp;», les coordonnées et les visuels sont provisoires, à valider
          par le salon avant la mise en ligne.
        </span>
        <span className={styles.short} aria-hidden="true">
          Maquette : nom, coordonnées et visuels provisoires.
        </span>
      </p>
    </div>
  )
}
