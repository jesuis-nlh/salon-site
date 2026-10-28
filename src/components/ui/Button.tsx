import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  external?: boolean
  className?: string
  /** Label shown by the custom cursor on hover (desktop). */
  cursor?: string
}

/** Link styled as a button. External links open in a new tab and say so to assistive tech. */
export function Button({ href, children, variant = 'primary', external, className, cursor }: ButtonProps) {
  const cls = [styles.btn, variant === 'ghost' ? styles.ghost : '', className ?? ''].join(' ')
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {external && <span className="visually-hidden"> (nouvel onglet)</span>}
    </>
  )
  const data = { 'data-magnetic': '', ...(cursor ? { 'data-cursor': cursor } : {}) }
  if (external || /^(tel:|mailto:|https?:)/.test(href)) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...data}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={cls} {...data}>
      {content}
    </Link>
  )
}
