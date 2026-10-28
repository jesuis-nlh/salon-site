'use client'

import { useEffect, useRef } from 'react'
import { SilkRenderer } from '@/lib/silk/engine'
import { compositions, palettes, type CompositionName, type PaletteName } from '@/lib/silk/presets'

declare global {
  interface Window {
    __silkReady?: boolean
    __silkExport?: (type?: string, quality?: number) => string
  }
}

export function SilkLab() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const base = compositions[(params.get('comp') ?? 'cascade') as CompositionName] ?? compositions.cascade
    const comp = {
      ...base,
      width: base.width * Number(params.get('wscale') ?? '1'),
      bloom: base.bloom * Number(params.get('bscale') ?? '1'),
    }
    const pal = palettes[(params.get('pal') ?? 'miel') as PaletteName] ?? palettes.miel
    const still = params.get('still') === '1'
    const scale = Number(params.get('scale') ?? '1')
    const time = Number(params.get('time') ?? '6')
    const frame = params.get('frame')?.split(',').map(Number) as [number, number, number, number] | undefined
    const canvas = ref.current!
    const r = new SilkRenderer(canvas, {
      composition: comp,
      palette: pal,
      strandScale: scale,
      maxDpr: Number(params.get('dpr') ?? '2'),
      preserveDrawingBuffer: true,
      seed: Number(params.get('seed') ?? '7'),
    })
    if (frame && frame.length === 4) r.setFrame(frame)
    r.resize()
    window.__silkExport = (type = 'image/webp', q = 0.92) => canvas.toDataURL(type, q)
    if (still) {
      r.renderStill(time)
      window.__silkReady = true
    } else {
      r.playReveal()
      r.start()
      window.__silkReady = true
    }
    const move = (e: PointerEvent) => r.pointerMove(e.clientX, e.clientY)
    const leave = () => r.pointerLeave()
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      r.dispose()
    }
  }, [])

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', display: 'block' }} />
}
