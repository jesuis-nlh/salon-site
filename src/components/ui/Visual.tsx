import Image from 'next/image'
import type { Visual as VisualData } from '@/config/etudes'
import styles from './Visual.module.css'

interface VisualProps {
  visual: VisualData
  sizes: string
  className?: string
  priority?: boolean
  /** Scroll-driven unveil (pure CSS, progressive enhancement). */
  reveal?: boolean
  /** Decorative images get an empty alt text. */
  decorative?: boolean
  showTag?: boolean
  ratio?: string
}

/** Art-directed image frame. Provisional studies carry a visible "Visuel provisoire" tag. */
export function Visual({
  visual,
  sizes,
  className,
  priority,
  reveal = true,
  decorative,
  showTag = true,
  ratio,
}: VisualProps) {
  return (
    <figure
      className={`${styles.frame} ${reveal ? styles.reveal : ''} ${className ?? ''}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <Image
        src={visual.src}
        alt={decorative ? '' : visual.alt}
        sizes={sizes}
        priority={priority}
        quality={82}
        placeholder="blur"
        className={styles.img}
      />
      {visual.provisional && showTag && (
        <figcaption className={styles.tag}>Visuel provisoire</figcaption>
      )}
    </figure>
  )
}
