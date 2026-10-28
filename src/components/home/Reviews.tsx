import { reviews, reviewsSourceUrl } from '@/config/content'
import styles from './Reviews.module.css'

/** Genuine reviews only (src/config/content.ts). Renders nothing while the list is empty. */
export function Reviews() {
  if (reviews.length === 0) return null
  return (
    <section className={`theme-light section ${styles.section}`} aria-labelledby="avis-title">
      <div className="container">
        <h2 id="avis-title" className={styles.title}>
          Ce qu’en disent nos clientes et clients
        </h2>
        <ul className={styles.list}>
          {reviews.map((r) => (
            <li key={`${r.author}-${r.text.slice(0, 16)}`} className={styles.item}>
              <figure>
                <blockquote className={styles.quote}>
                  <p>{r.text}</p>
                </blockquote>
                <figcaption className={styles.meta}>
                  <span>{r.author}</span>
                  {r.rating !== null && (
                    <span aria-label={`Note : ${r.rating} sur 5`}>{'★'.repeat(Math.round(r.rating))}</span>
                  )}
                  <span className="dim">
                    {r.source}
                    {r.date ? `, ${r.date}` : ''}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {reviewsSourceUrl && (
          <a href={reviewsSourceUrl} target="_blank" rel="noopener noreferrer" className="link">
            Lire tous les avis
            <span className="visually-hidden"> (nouvel onglet)</span>
          </a>
        )}
      </div>
    </section>
  )
}
