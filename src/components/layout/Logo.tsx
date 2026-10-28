import { site } from '@/config/site'
import styles from './Logo.module.css'

/** Woven mark: two warp and two weft threads passing over and under each other. */
export function WeaveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true" className={className}>
      <path d="M8 2v5.2M8 10.8V22M16 2v11.2M16 16.8V22M2 9h11.6M18.4 9H22M2 15h3.6M10.4 15H22" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className={styles.logo}>
      <WeaveMark className={styles.mark} />
      <span className={styles.word}>{site.name}</span>
    </span>
  )
}
