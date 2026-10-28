import { notFound } from 'next/navigation'
import { SilkLab } from './SilkLab'

export const metadata = { robots: { index: false, follow: false } }

/** Development-only workbench used to tune presets and export still renders. */
export default function LabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <SilkLab />
}
