import type { ReactNode } from 'react'

/** Re-mounted on every navigation: a short opacity-only entrance (no transform, so fixed children stay fixed). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>
}
