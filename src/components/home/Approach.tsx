import Link from 'next/link'
import { visuals } from '@/config/etudes'
import { Visual } from '@/components/ui/Visual'
import styles from './Approach.module.css'

export function Approach() {
  return (
    <section className={`theme-light section ${styles.section}`} aria-labelledby="approche-title">
      <div className={`container grid ${styles.grid}`}>
        <h2 id="approche-title" className={styles.title}>
          La chaîne et la trame
        </h2>
        <p className={`lede ${styles.lede}`}>
          Dans un tissu, la chaîne tient la structure et la trame apporte la couleur. Nous travaillons vos cheveux de
          la même manière.
        </p>

        <div className={styles.pillars}>
          <div>
            <h3 className={styles.pillarTitle}>La coupe, pour la structure</h3>
            <p className="dim">
              Une forme pensée pour la nature de vos cheveux, leur densité et votre façon de les porter, afin qu’elle
              se recoiffe facilement chez vous.
            </p>
          </div>
          <div>
            <h3 className={styles.pillarTitle}>La couleur, pour la lumière</h3>
            <p className="dim">
              Balayages, mèches et patines posés à la main, mèche par mèche, pour des nuances accordées à votre
              carnation et une repousse en douceur.
            </p>
          </div>
        </div>

        <Link href="/salon" className={`link ${styles.more}`}>
          Découvrir la maison
        </Link>

        <Visual
          visual={visuals.cascadeChatain}
          sizes="(min-width: 960px) 36vw, 92vw"
          className={styles.visual}
        />
      </div>
    </section>
  )
}
