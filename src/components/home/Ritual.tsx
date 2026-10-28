import styles from './Ritual.module.css'

const STEPS = [
  {
    title: 'Le diagnostic',
    text: 'Nous regardons et touchons vos cheveux, nous parlons de leur historique, de vos habitudes et de vos envies. Le tarif vous est annoncé à ce moment-là.',
  },
  {
    title: 'La préparation',
    text: 'Shampooing adapté et, si besoin, un soin, pour travailler sur une matière saine.',
  },
  {
    title: 'Le geste',
    text: 'Coupe, couleur ou les deux, sans précipitation, avec des points d’étape devant le miroir.',
  },
  {
    title: 'Les finitions',
    text: 'Coiffage, puis des conseils concrets pour refaire le geste chez vous et espacer les rendez-vous.',
  },
]

export function Ritual() {
  return (
    <section className={`theme-light section ${styles.section}`} aria-labelledby="deroule-title">
      <div className={`container grid ${styles.grid}`}>
        <div className={styles.aside}>
          <h2 id="deroule-title" className={styles.title}>
            Votre rendez-vous, étape par étape
          </h2>
          <p className="dim">Le déroulé est le même pour une coupe, une couleur ou un soin.</p>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.num} aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className="dim">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
