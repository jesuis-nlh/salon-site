/**
 * Composition and palette presets for the silk strand renderer.
 * Modes map to `uMode` in shaders.ts.
 */

export type SilkMode = 'cascade' | 'carre' | 'ondes' | 'boucles' | 'torsade' | 'lisse'

const MODE_INDEX: Record<SilkMode, number> = {
  cascade: 0,
  carre: 1,
  ondes: 2,
  boucles: 3,
  torsade: 4,
  lisse: 5,
}

export function modeIndex(mode: SilkMode): number {
  return MODE_INDEX[mode]
}

export interface SilkPalette {
  root: string
  mid: string
  tip: string
  sheen: string
  /** start / end of the root → tip colour transition, along the strand (0–1) */
  blend: [number, number]
  background: string
  glow: string
}

export const palettes = {
  miel: {
    root: '#2e1d14',
    mid: '#6e4a2f',
    tip: '#d0a56b',
    sheen: '#fff1dc',
    blend: [0.18, 0.92],
    background: '#16110e',
    glow: '#24190f',
  },
  expresso: {
    root: '#140d0a',
    mid: '#2a1b13',
    tip: '#4a3324',
    sheen: '#e9dccb',
    blend: [0.2, 1],
    background: '#16110e',
    glow: '#231a14',
  },
  cuivre: {
    root: '#3d150b',
    mid: '#8a3517',
    tip: '#d27a3f',
    sheen: '#ffe0bd',
    blend: [0.1, 0.9],
    background: '#16110e',
    glow: '#2a1710',
  },
  platine: {
    root: '#4d463d',
    mid: '#8f8676',
    tip: '#d9d1c2',
    sheen: '#ffffff',
    blend: [0.05, 0.75],
    background: '#16110e',
    glow: '#241d17',
  },
  chatain: {
    root: '#26160e',
    mid: '#5e3720',
    tip: '#a8703f',
    sheen: '#f6dcbc',
    blend: [0.25, 1],
    background: '#16110e',
    glow: '#261b14',
  },
  ebene: {
    root: '#0f0a08',
    mid: '#24170f',
    tip: '#3d2818',
    sheen: '#d9bc98',
    blend: [0.3, 1],
    background: '#16110e',
    glow: '#211811',
  },
} satisfies Record<string, SilkPalette>

export type PaletteName = keyof typeof palettes

export interface SilkComposition {
  mode: SilkMode
  strands: number
  segments: number
  clumps: number
  /** length, spread, wave amplitude, wave frequency */
  shape: [number, number, number, number]
  shape2?: [number, number, number, number]
  /** world-space offset x, y, scale, rotation (rad) */
  frame: [number, number, number, number]
  /** base strand width in CSS pixels */
  width: number
  alpha: number
  specular: number
  light: [number, number, number]
  glowPos: [number, number]
  bloom: number
  /** where along the strand the tips start fading out (1 = blunt) */
  tipFade?: number
}

export const compositions = {
  cascade: {
    mode: 'cascade',
    strands: 3200,
    segments: 96,
    clumps: 46,
    shape: [2.6, 0.66, 0.04, 1.3],
    frame: [0.3, 0.02, 1.08, -0.22],
    width: 0.95,
    alpha: 0.6,
    specular: 1,
    light: [-0.35, 0.55, 0.75],
    glowPos: [0.66, 0.6],
    bloom: 0.32,
  },
  carre: {
    mode: 'carre',
    strands: 2600,
    segments: 80,
    clumps: 60,
    shape: [1.6, 0.62, 0.006, 0.6],
    shape2: [-0.5, 0, 0, 0],
    tipFade: 0.985,
    frame: [0, 0.05, 1, 0],
    width: 1.05,
    alpha: 0.7,
    specular: 1.15,
    light: [-0.2, 0.75, 0.62],
    glowPos: [0.5, 0.62],
    bloom: 0.45,
  },
  ondes: {
    mode: 'ondes',
    strands: 2600,
    segments: 110,
    clumps: 40,
    shape: [2.3, 0.62, 0.075, 1.6],
    frame: [0, 0, 1, 0],
    width: 1.1,
    alpha: 0.62,
    specular: 1.1,
    light: [-0.3, 0.6, 0.72],
    glowPos: [0.5, 0.55],
    bloom: 0.5,
  },
  boucles: {
    mode: 'boucles',
    strands: 3600,
    segments: 220,
    clumps: 40,
    shape: [2.25, 0.9, 0, 0],
    shape2: [9, 0.06, 52, 0],
    frame: [0, 0, 1, 0],
    width: 1.05,
    alpha: 0.6,
    specular: 1.15,
    light: [-0.3, 0.65, 0.7],
    glowPos: [0.5, 0.55],
    bloom: 0.5,
  },
  torsade: {
    mode: 'torsade',
    strands: 2400,
    segments: 130,
    clumps: 30,
    shape: [1, 0.78, 0.12, 0],
    shape2: [1.35, 0, 0, 0],
    frame: [0, 0, 1, 0],
    width: 1.05,
    alpha: 0.62,
    specular: 1.1,
    light: [-0.4, 0.55, 0.73],
    glowPos: [0.5, 0.5],
    bloom: 0.5,
  },
  lisse: {
    mode: 'lisse',
    strands: 2600,
    segments: 90,
    clumps: 50,
    shape: [2.3, 0.6, 0.012, 0.8],
    frame: [0, 0, 1, 0],
    width: 0.95,
    alpha: 0.5,
    specular: 0.8,
    light: [-0.25, 0.7, 0.66],
    glowPos: [0.5, 0.6],
    bloom: 0.22,
  },
} satisfies Record<string, SilkComposition>

export type CompositionName = keyof typeof compositions
