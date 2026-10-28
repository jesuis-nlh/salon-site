'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const LenisContext = createContext<Lenis | null>(null)

export function useSmoothScroll() {
  return useContext(LenisContext)
}

/**
 * Inertial wheel scrolling on desktop. Native scrolling is kept for touch,
 * keyboard and reduced-motion users (Lenis is not started at all for them).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(pointer: fine)')
    if (reduce.matches || !fine.matches) return
    const headerOffset = -((document.querySelector('header')?.getBoundingClientRect().height ?? 72) + 16)
    const instance = new Lenis({ lerp: 0.11, anchors: { offset: headerOffset }, autoRaf: true })
    // Publishing the instance to context is the purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance)
    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [])

  // New page: jump to top (or to the hash target) without inertia.
  useEffect(() => {
    if (!lenis) return
    const hash = window.location.hash
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    const headerOffset = -((document.querySelector('header')?.getBoundingClientRect().height ?? 72) + 16)
    lenis.scrollTo(target ?? 0, { immediate: true, offset: target ? headerOffset : 0, force: true })
  }, [pathname, lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
