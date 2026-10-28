'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { visuals } from '@/config/etudes'
import type { SilkRenderer } from '@/lib/silk/engine'
import styles from './Hero.module.css'

type Frame = [number, number, number, number]

/** Placement of the strand composition for the current aspect ratio. */
function frameFor(aspect: number): Frame {
  if (aspect >= 1.25) return [0.44, 0.04, 1.02, -0.14]
  if (aspect >= 0.8) return [0.2, 0.1, 0.96, -0.18]
  return [0.05, 0.14, 0.8, -0.12]
}

/**
 * Hero media layer: a static still is painted first (and stays as the
 * fallback for reduced motion, Save-Data, or browsers without WebGL2), then
 * the live strand renderer fades in and reacts to the pointer.
 */
export function SilkHero() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (reduce || conn?.saveData) return

    const mountedAt = performance.now()
    let renderer: SilkRenderer | null = null
    let disposed = false
    const cleanups: (() => void)[] = []

    ;(async () => {
      const [{ SilkRenderer }, { compositions, palettes }] = await Promise.all([
        import('@/lib/silk/engine'),
        import('@/lib/silk/presets'),
      ])
      if (disposed || !SilkRenderer.isSupported()) return

      const coarse = window.matchMedia('(pointer: coarse)').matches
      const w = window.innerWidth
      const tier =
        w < 768 || coarse
          ? { strandScale: 0.42, maxDpr: 1.5, bloom: false }
          : w < 1280
            ? { strandScale: 0.75, maxDpr: 1.5, bloom: true }
            : { strandScale: 1, maxDpr: 1.75, bloom: true }

      try {
        renderer = new SilkRenderer(canvas, {
          composition: compositions.cascade,
          palette: palettes.miel,
          ...tier,
          onContextLost: () => {
            setLive(false)
            setFallback(true)
          },
          onTooSlow: () => {
            setLive(false)
            setFallback(true)
            cleanups.forEach((fn) => fn())
            cleanups.length = 0
          },
        })
      } catch {
        return // keep the still
      }
      const r = renderer

      const fit = () => {
        const rect = wrap.getBoundingClientRect()
        r.setFrame(frameFor(rect.width / Math.max(rect.height, 1)))
        r.resize(rect.width, rect.height)
      }
      fit()
      // One probe frame: if the GPU needs more than 250 ms for it, keep the still.
      const gpuMs = await r.probe()
      if (disposed) return
      if (gpuMs > 250) {
        setFallback(true)
        return
      }
      setLive(true)
      if (performance.now() - mountedAt < 1100) r.playReveal(2.4)
      else r.skipReveal()

      let visible = true
      const update = () => (visible && !document.hidden ? r.start() : r.stop())
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        update()
      })
      io.observe(wrap)
      document.addEventListener('visibilitychange', update)
      update()

      const ro = new ResizeObserver(fit)
      ro.observe(wrap)

      const section = wrap.closest('section') ?? wrap
      const onMove = (e: PointerEvent) => r.pointerMove(e.clientX, e.clientY)
      const onLeave = () => r.pointerLeave()
      section.addEventListener('pointermove', onMove as EventListener, { passive: true })
      section.addEventListener('pointerleave', onLeave)

      const onScroll = () => r.setOffset(Math.min(window.scrollY / window.innerHeight, 1.2) * 0.45)
      window.addEventListener('scroll', onScroll, { passive: true })

      cleanups.push(() => {
        io.disconnect()
        ro.disconnect()
        document.removeEventListener('visibilitychange', update)
        section.removeEventListener('pointermove', onMove as EventListener)
        section.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('scroll', onScroll)
      })
    })()

    return () => {
      disposed = true
      cleanups.forEach((fn) => fn())
      renderer?.dispose()
    }
  }, [])

  const common = { alt: '', sizes: '100vw', quality: 70 }
  const { props: desktop } = getImageProps({ ...common, src: visuals.heroDesktop.src })
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: visuals.heroMobile.src })

  return (
    <div
      ref={wrapRef}
      className={styles.media}
      data-live={live || undefined}
      data-fallback={fallback || undefined}
      aria-hidden="true"
    >
      <picture className={styles.poster}>
        <source media="(max-aspect-ratio: 1/1)" srcSet={mobileSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative, alt="" comes from props */}
        <img {...desktop} className={styles.posterImg} fetchPriority="high" />
      </picture>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
