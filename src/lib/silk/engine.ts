import {
  TRAIL_LENGTH,
  backgroundFrag,
  blurFrag,
  brightFrag,
  compositeFrag,
  quadVert,
  strandFrag,
  strandVert,
} from './shaders'
import { modeIndex, type SilkComposition, type SilkPalette } from './presets'

export interface SilkOptions {
  composition: SilkComposition
  palette: SilkPalette
  /** Upper bound for the device pixel ratio used for rendering. */
  maxDpr?: number
  /** Multiplier applied to the composition's strand count (quality tier). */
  strandScale?: number
  bloom?: boolean
  grain?: number
  /** Keep the drawing buffer so it can be exported (offline stills). */
  preserveDrawingBuffer?: boolean
  seed?: number
  /** Called once the first frame has been drawn. */
  onReady?: () => void
  onContextLost?: () => void
  /** Called when the device cannot sustain the effect; the host should show its static fallback. */
  onTooSlow?: () => void
}

interface Program {
  program: WebGLProgram
  uniforms: Map<string, WebGLUniformLocation | null>
}

interface Target {
  fbo: WebGLFramebuffer
  tex: WebGLTexture
  w: number
  h: number
}

interface TrailPoint {
  x: number
  y: number
  strength: number
  radius: number
  born: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16)
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

/**
 * Renders a field of hair-like silk strands with WebGL2.
 * Framework-agnostic: the React wrapper lives in components/hero/SilkCanvas.
 */
export class SilkRenderer {
  readonly canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private opts: Required<Omit<SilkOptions, 'onReady' | 'onContextLost' | 'onTooSlow'>> &
    Pick<SilkOptions, 'onReady' | 'onContextLost' | 'onTooSlow'>
  private strandProg!: Program
  private bgProg!: Program
  private brightProg!: Program
  private blurProg!: Program
  private compProg!: Program
  private strandVao!: WebGLVertexArrayObject
  private quadVao!: WebGLVertexArrayObject
  private buffers: WebGLBuffer[] = []
  private indexCount = 0
  private instanceCount = 0
  private targets: { scene?: Target; bright?: Target; blurA?: Target; blurB?: Target } = {}
  private width = 1
  private height = 1
  private dpr = 1
  private raf = 0
  private running = false
  private startTime = 0
  private lastFrame = 0
  private time = 0
  private reveal = 0
  private revealElapsed = 0
  private revealDuration = 2.2
  private frame: [number, number, number, number]
  private trail: TrailPoint[] = []
  private pointer = { x: 0, y: 0, inside: false, vx: 0, vy: 0, lastT: 0 }
  private light: [number, number, number]
  private lightTarget: [number, number, number]
  private trailData = new Float32Array(TRAIL_LENGTH * 4)
  private readyFired = false
  private disposed = false
  private frameTimes: number[] = []
  private monitorElapsed = 0
  /** 0 = full quality, 1 = reduced (no bloom, lower resolution, fewer strands) */
  private degradeLevel = 0
  private slowStreak = 0
  private strandBuffers: WebGLBuffer[] = []
  private motion = 1
  private yOffset = 0

  constructor(canvas: HTMLCanvasElement, options: SilkOptions) {
    this.canvas = canvas
    this.opts = {
      maxDpr: 1.75,
      strandScale: 1,
      bloom: true,
      grain: 0.035,
      preserveDrawingBuffer: false,
      seed: 7,
      ...options,
    }
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: this.opts.preserveDrawingBuffer,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL2 indisponible')
    this.gl = gl
    this.light = [...this.opts.composition.light]
    this.lightTarget = [...this.opts.composition.light]
    this.frame = [...this.opts.composition.frame]
    canvas.addEventListener('webglcontextlost', this.handleContextLost, false)
    this.init()
  }

  static isSupported(): boolean {
    try {
      const c = document.createElement('canvas')
      return !!c.getContext('webgl2')
    } catch {
      return false
    }
  }

  private handleContextLost = (e: Event) => {
    e.preventDefault()
    this.stop()
    this.opts.onContextLost?.()
  }

  private compile(vsSrc: string, fsSrc: string, names: string[]): Program {
    const gl = this.gl
    const make = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh)
        gl.deleteShader(sh)
        throw new Error(`Shader: ${log}`)
      }
      return sh
    }
    const vs = make(gl.VERTEX_SHADER, vsSrc)
    const fs = make(gl.FRAGMENT_SHADER, fsSrc)
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program: ${gl.getProgramInfoLog(program)}`)
    }
    const uniforms = new Map<string, WebGLUniformLocation | null>()
    for (const n of names) uniforms.set(n, gl.getUniformLocation(program, n))
    return { program, uniforms }
  }

  private init() {
    const gl = this.gl
    this.strandProg = this.compile(strandVert, strandFrag, [
      'uTime', 'uMotion', 'uMode', 'uShape', 'uShape2', 'uFrame', 'uRes', 'uAspect', 'uDpr',
      'uWidth', 'uReveal', 'uTrail', 'uVel', 'uLight', 'uRoot', 'uMid', 'uTip', 'uSheen',
      'uBlend', 'uAlpha', 'uSpecular', 'uTipFade',
    ])
    this.bgProg = this.compile(quadVert, backgroundFrag, ['uBg', 'uGlow', 'uGlowPos', 'uAspect'])
    this.brightProg = this.compile(quadVert, brightFrag, ['uTex', 'uThreshold'])
    this.blurProg = this.compile(quadVert, blurFrag, ['uTex', 'uDir'])
    this.compProg = this.compile(quadVert, compositeFrag, [
      'uScene', 'uBloom', 'uBloomStrength', 'uGrain', 'uTime', 'uVignette',
    ])

    // Full-screen triangle pair.
    this.quadVao = gl.createVertexArray()!
    gl.bindVertexArray(this.quadVao)
    const qb = gl.createBuffer()!
    this.buffers.push(qb)
    gl.bindBuffer(gl.ARRAY_BUFFER, qb)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    this.buildStrands()
    gl.bindVertexArray(null)
  }

  private buildStrands() {
    const gl = this.gl
    const c = this.opts.composition
    const rand = mulberry32(this.opts.seed)
    const gauss = () => {
      let u = 0
      let v = 0
      while (u === 0) u = rand()
      while (v === 0) v = rand()
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    }

    // Template ribbon: (segments + 1) * 2 vertices.
    const segs = c.segments
    const tmpl = new Float32Array((segs + 1) * 4)
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      tmpl.set([t, -1, t, 1], i * 4)
    }
    const idx = new Uint16Array(segs * 6)
    for (let i = 0; i < segs; i++) {
      const a = i * 2
      idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6)
    }
    this.indexCount = idx.length

    // Per-strand instance data, grouped in clumps (locks of hair).
    const count = Math.max(200, Math.round(c.strands * this.opts.strandScale))
    const clumps = c.clumps
    const clumpU: number[] = []
    const clumpPhase: number[] = []
    const clumpDepth: number[] = []
    for (let k = 0; k < clumps; k++) {
      clumpU.push(Math.min(1, Math.max(0, (k + 0.5 + (rand() - 0.5) * 0.6) / clumps)))
      clumpPhase.push(rand())
      clumpDepth.push(rand())
    }
    const lengthJitter = c.mode === 'carre' ? 0.012 : 0.2
    const strands: { a: number[]; b: number[] }[] = []
    for (let i = 0; i < count; i++) {
      const k = Math.floor(rand() * clumps)
      const stray = rand() < 0.05 ? 3.2 : 1
      const u = Math.min(1.05, Math.max(-0.05, clumpU[k] + gauss() * (0.42 / clumps) * stray))
      const depth = Math.min(1, Math.max(0, clumpDepth[k] * 0.8 + rand() * 0.2))
      strands.push({
        a: [u, clumpU[k], clumpPhase[k] + gauss() * 0.012, rand()],
        b: [
          depth,
          1 - rand() * lengthJitter,
          Math.min(1, Math.max(0, 0.5 + gauss() * 0.2)),
          0.55 + rand() * 0.75 + (rand() < 0.08 ? 0.5 : 0),
        ],
      })
    }
    // Back-to-front so premultiplied "over" blending reads as depth.
    strands.sort((p, q) => p.b[0] - q.b[0])
    const inst = new Float32Array(count * 8)
    strands.forEach((s, i) => inst.set([...s.a, ...s.b], i * 8))
    this.instanceCount = count

    this.strandVao = gl.createVertexArray()!
    gl.bindVertexArray(this.strandVao)
    const tb = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, tb)
    gl.bufferData(gl.ARRAY_BUFFER, tmpl, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const ib = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, ib)
    gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0)
    gl.vertexAttribDivisor(1, 1)
    gl.enableVertexAttribArray(2)
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16)
    gl.vertexAttribDivisor(2, 1)

    const eb = gl.createBuffer()!
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW)
    this.strandBuffers = [tb, ib, eb]
  }

  private rebuildStrands() {
    const gl = this.gl
    this.strandBuffers.forEach((b) => gl.deleteBuffer(b))
    gl.deleteVertexArray(this.strandVao)
    this.buildStrands()
    gl.bindVertexArray(null)
  }

  private createTarget(w: number, h: number): Target {
    const gl = this.gl
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fbo = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { fbo, tex, w, h }
  }

  private deleteTarget(t?: Target) {
    if (!t) return
    this.gl.deleteFramebuffer(t.fbo)
    this.gl.deleteTexture(t.tex)
  }

  /** Resize the drawing buffer to the canvas' CSS size. */
  resize(cssWidth?: number, cssHeight?: number) {
    const rect = this.canvas.getBoundingClientRect()
    const cw = cssWidth ?? rect.width
    const ch = cssHeight ?? rect.height
    const dpr = Math.min(window.devicePixelRatio || 1, this.opts.maxDpr)
    const w = Math.max(1, Math.round(cw * dpr))
    const h = Math.max(1, Math.round(ch * dpr))
    if (w === this.width && h === this.height && dpr === this.dpr) return
    this.width = w
    this.height = h
    this.dpr = dpr
    this.canvas.width = w
    this.canvas.height = h
    this.rebuildTargets()
    if (!this.running) this.draw()
  }

  private rebuildTargets() {
    const { scene, bright, blurA, blurB } = this.targets
    ;[scene, bright, blurA, blurB].forEach((t) => this.deleteTarget(t))
    this.targets = {}
    if (!this.opts.bloom) return
    const w = this.width
    const h = this.height
    this.targets.scene = this.createTarget(w, h)
    const bw = Math.max(1, Math.round(w / 4))
    const bh = Math.max(1, Math.round(h / 4))
    this.targets.bright = this.createTarget(bw, bh)
    this.targets.blurA = this.createTarget(bw, bh)
    this.targets.blurB = this.createTarget(bw, bh)
  }

  /** Pointer position in client (CSS) coordinates. */
  pointerMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    const aspect = rect.width / Math.max(rect.height, 1)
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    const wx = x * aspect
    const now = performance.now() / 1000
    const p = this.pointer
    const dt = Math.max(now - p.lastT, 1 / 120)
    if (p.inside) {
      p.vx = p.vx * 0.7 + ((wx - p.x) / dt) * 0.3
      p.vy = p.vy * 0.7 + ((y - p.y) / dt) * 0.3
    }
    p.x = wx
    p.y = y
    p.lastT = now
    p.inside = true

    const head = this.trail[0]
    const radius = 0.16
    if (!head || Math.hypot(head.x - wx, head.y - y) > 0.06 || now - head.born > 0.08) {
      this.trail.unshift({ x: wx, y, strength: 1, radius, born: now })
      if (this.trail.length > TRAIL_LENGTH) this.trail.length = TRAIL_LENGTH
    } else {
      head.x = wx
      head.y = y
      head.strength = 1
    }
    this.lightTarget = [
      this.opts.composition.light[0] + x * 0.45,
      this.opts.composition.light[1] + y * 0.18,
      this.opts.composition.light[2],
    ]
  }

  pointerLeave() {
    this.pointer.inside = false
    this.lightTarget = [...this.opts.composition.light]
  }

  /** Vertical parallax offset in world units (scroll-linked). */
  setOffset(y: number) {
    this.yOffset = y
  }

  /** 0 = frozen pose, 1 = full sway (reduced motion uses 0). */
  setMotion(m: number) {
    this.motion = m
  }

  /**
   * Placement of the composition: x offset (fraction of the half-width),
   * y offset (world units), scale, rotation. Lets the host adapt per breakpoint.
   */
  setFrame(frame: [number, number, number, number]) {
    this.frame = frame
    if (!this.running) this.draw()
  }

  playReveal(duration = 2.2) {
    this.revealDuration = duration
    this.revealElapsed = 0
    this.reveal = 0
  }

  skipReveal() {
    this.reveal = 1
    this.revealElapsed = this.revealDuration
  }

  start() {
    if (this.running || this.disposed) return
    this.running = true
    this.lastFrame = performance.now()
    if (!this.startTime) this.startTime = this.lastFrame
    const loop = (now: number) => {
      if (!this.running) return
      // Animation uses a clamped step; the quality monitor needs the real one.
      const raw = (now - this.lastFrame) / 1000
      const dt = Math.min(raw, 0.1)
      this.lastFrame = now
      this.step(dt)
      this.draw()
      this.monitor(raw)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  /**
   * Measures how long the GPU takes to finish one frame, without blocking the
   * main thread (WebGL2 fence polled asynchronously). Lets the host skip the
   * animated effect entirely on devices that cannot render it, before any
   * backlog of frames builds up.
   */
  probe(limitMs = 1500): Promise<number> {
    const gl = this.gl
    const t0 = performance.now()
    this.draw()
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
    gl.flush()
    if (!sync) return Promise.resolve(0)
    return new Promise((resolve) => {
      const poll = () => {
        if (this.disposed) {
          gl.deleteSync(sync)
          return resolve(Infinity)
        }
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS)
        const elapsed = performance.now() - t0
        if (status === gl.SIGNALED || elapsed > limitMs) {
          gl.deleteSync(sync)
          resolve(elapsed)
        } else {
          setTimeout(poll, 8)
        }
      }
      setTimeout(poll, 0)
    })
  }

  /** Renders one frame at a given time without animating (stills, reduced motion). */
  renderStill(time = 6) {
    this.time = time
    this.skipReveal()
    this.draw()
  }

  private step(dt: number) {
    this.time += dt * this.motion
    if (this.reveal < 1) {
      this.revealElapsed += dt
      const k = Math.min(1, this.revealElapsed / this.revealDuration)
      this.reveal = 1 - Math.pow(1 - k, 3)
    }
    const decay = Math.exp(-dt / 0.6)
    this.trail.forEach((p, i) => {
      const floor = i === 0 && this.pointer.inside ? 0.55 : 0
      p.strength = Math.max(floor, p.strength * decay)
    })
    this.trail = this.trail.filter((p) => p.strength > 0.01)
    this.pointer.vx *= Math.exp(-dt / 0.25)
    this.pointer.vy *= Math.exp(-dt / 0.25)
    const lk = 1 - Math.exp(-dt / 0.5)
    for (let i = 0; i < 3; i++) this.light[i] += (this.lightTarget[i] - this.light[i]) * lk
  }

  /**
   * Time-based quality guard. Judged over ~1.2 s (not a frame count, which on
   * a very slow device would take far too long): first drop bloom, resolution
   * and strand count; if that is still too slow, stop and let the host fall
   * back to its static image so the page stays responsive.
   */
  private monitor(dt: number) {
    // Hopeless device (under ~4 fps twice in a row): bail out at once.
    this.slowStreak = dt > 0.25 ? this.slowStreak + 1 : 0
    if (this.slowStreak >= 2) {
      this.stop()
      this.opts.onTooSlow?.()
      return
    }
    this.frameTimes.push(dt)
    this.monitorElapsed += dt
    if (this.frameTimes.length < 40 && (this.monitorElapsed < 1.2 || this.frameTimes.length < 4)) return
    // Skip the first frames (shader warm-up) when the sample allows it.
    const sample = this.frameTimes.length > 8 ? this.frameTimes.slice(4) : this.frameTimes.slice(1)
    const avg = sample.reduce((a, b) => a + b, 0) / sample.length
    this.frameTimes = []
    this.monitorElapsed = 0
    if (avg <= 0.026) return
    if (this.degradeLevel === 0 && avg < 0.06) {
      this.degradeLevel = 1
      this.opts.bloom = false
      this.opts.maxDpr = 1
      this.opts.strandScale *= 0.55
      this.rebuildStrands()
      this.width = 0
      this.resize()
      return
    }
    this.stop()
    this.opts.onTooSlow?.()
  }

  private bindTarget(t: Target | null) {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null)
    gl.viewport(0, 0, t ? t.w : this.width, t ? t.h : this.height)
  }

  private drawQuad() {
    const gl = this.gl
    gl.bindVertexArray(this.quadVao)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  private draw() {
    if (this.disposed) return
    const gl = this.gl
    const c = this.opts.composition
    const pal = this.opts.palette
    const aspect = this.width / this.height
    const bloom = this.opts.bloom && this.targets.scene

    this.bindTarget(bloom ? this.targets.scene! : null)
    gl.disable(gl.BLEND)

    // Backdrop
    const bg = this.bgProg
    gl.useProgram(bg.program)
    gl.uniform3fv(bg.uniforms.get('uBg')!, hexToRgb(pal.background))
    gl.uniform3fv(bg.uniforms.get('uGlow')!, hexToRgb(pal.glow))
    gl.uniform2fv(bg.uniforms.get('uGlowPos')!, c.glowPos)
    gl.uniform1f(bg.uniforms.get('uAspect')!, aspect)
    this.drawQuad()

    // Strands
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const s = this.strandProg
    const u = (n: string) => s.uniforms.get(n)!
    gl.useProgram(s.program)
    gl.uniform1f(u('uTime'), this.time)
    gl.uniform1f(u('uMotion'), 1)
    gl.uniform1i(u('uMode'), modeIndex(c.mode))
    gl.uniform4fv(u('uShape'), c.shape)
    gl.uniform4fv(u('uShape2'), c.shape2 ?? [0, 0, 0, 0])
    const [fx, fy, fs, fr] = this.frame
    gl.uniform4f(u('uFrame'), fx * aspect, fy + this.yOffset, fs, fr)
    gl.uniform2f(u('uRes'), this.width, this.height)
    gl.uniform1f(u('uAspect'), aspect)
    gl.uniform1f(u('uDpr'), this.dpr)
    gl.uniform1f(u('uWidth'), c.width)
    gl.uniform1f(u('uReveal'), this.reveal)
    this.trailData.fill(0)
    this.trail.forEach((p, i) => this.trailData.set([p.x, p.y, p.strength, p.radius], i * 4))
    gl.uniform4fv(u('uTrail'), this.trailData)
    gl.uniform2f(u('uVel'), this.pointer.vx, this.pointer.vy)
    gl.uniform3fv(u('uLight'), this.light)
    gl.uniform3fv(u('uRoot'), hexToRgb(pal.root))
    gl.uniform3fv(u('uMid'), hexToRgb(pal.mid))
    gl.uniform3fv(u('uTip'), hexToRgb(pal.tip))
    gl.uniform3fv(u('uSheen'), hexToRgb(pal.sheen))
    gl.uniform2fv(u('uBlend'), pal.blend)
    gl.uniform1f(u('uAlpha'), c.alpha)
    gl.uniform1f(u('uSpecular'), c.specular)
    gl.uniform1f(u('uTipFade'), c.tipFade ?? 0.86)
    gl.bindVertexArray(this.strandVao)
    gl.drawElementsInstanced(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0, this.instanceCount)
    gl.disable(gl.BLEND)

    if (bloom) {
      const { scene, bright, blurA, blurB } = this.targets as Required<typeof this.targets>
      // Bright pass (quarter resolution)
      this.bindTarget(bright)
      gl.useProgram(this.brightProg.program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, scene.tex)
      gl.uniform1i(this.brightProg.uniforms.get('uTex')!, 0)
      gl.uniform1f(this.brightProg.uniforms.get('uThreshold')!, 0.42)
      this.drawQuad()
      // Separable blur, two iterations
      let src = bright
      for (let i = 0; i < 2; i++) {
        for (const [dst, dir] of [
          [blurA, [1 / bright.w, 0]],
          [blurB, [0, 1 / bright.h]],
        ] as const) {
          this.bindTarget(dst)
          gl.useProgram(this.blurProg.program)
          gl.bindTexture(gl.TEXTURE_2D, src.tex)
          gl.uniform1i(this.blurProg.uniforms.get('uTex')!, 0)
          gl.uniform2f(this.blurProg.uniforms.get('uDir')!, dir[0] * (i + 1), dir[1] * (i + 1))
          this.drawQuad()
          src = dst
        }
      }
      // Composite to screen
      this.bindTarget(null)
      const cp = this.compProg
      gl.useProgram(cp.program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, scene.tex)
      gl.uniform1i(cp.uniforms.get('uScene')!, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, src.tex)
      gl.uniform1i(cp.uniforms.get('uBloom')!, 1)
      gl.uniform1f(cp.uniforms.get('uBloomStrength')!, c.bloom)
      gl.uniform1f(cp.uniforms.get('uGrain')!, this.opts.grain)
      gl.uniform1f(cp.uniforms.get('uTime')!, this.time)
      gl.uniform1f(cp.uniforms.get('uVignette')!, 0.55)
      this.drawQuad()
      gl.activeTexture(gl.TEXTURE0)
    }

    if (!this.readyFired) {
      this.readyFired = true
      this.opts.onReady?.()
    }
  }

  dispose() {
    if (this.disposed) return
    this.stop()
    this.disposed = true
    const gl = this.gl
    const { scene, bright, blurA, blurB } = this.targets
    ;[scene, bright, blurA, blurB].forEach((t) => this.deleteTarget(t))
    ;[...this.buffers, ...this.strandBuffers].forEach((b) => gl.deleteBuffer(b))
    gl.deleteVertexArray(this.strandVao)
    gl.deleteVertexArray(this.quadVao)
    ;[this.strandProg, this.bgProg, this.brightProg, this.blurProg, this.compProg].forEach((p) =>
      gl.deleteProgram(p.program),
    )
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost)
  }
}
