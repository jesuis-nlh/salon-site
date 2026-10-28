/**
 * Renders the provisional "études de matière" used in image slots, with the
 * same WebGL engine as the hero. Requires the dev server (`npm run dev`) and
 * Playwright with Chromium available (`npx playwright install chromium`).
 *
 *   BASE_URL=http://localhost:3000 node scripts/render-etudes.mjs [name…]
 */
import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT = new URL('../src/assets/etudes/', import.meta.url)

// name: [composition, palette, width, height, extra query]
const ETUDES = {
  'hero-desktop': ['cascade', 'miel', 2400, 1350, 'frame=0.44,0.04,1.02,-0.14&bscale=0.9'],
  'hero-mobile': ['cascade', 'miel', 1080, 1920, 'frame=0.05,0.12,0.78,-0.12'],
  'carre-expresso': ['carre', 'expresso', 1600, 2000, ''],
  'ondes-miel': ['ondes', 'miel', 1600, 2000, ''],
  'lisse-chatain': ['lisse', 'chatain', 1600, 2000, 'seed=11&bscale=1.3'],
  'torsade-chatain': ['torsade', 'chatain', 1600, 2000, ''],
  'boucles-cuivre': ['boucles', 'cuivre', 1600, 2000, ''],
  'lisse-platine': ['lisse', 'platine', 1600, 2000, 'seed=5'],
  'carre-platine': ['carre', 'platine', 1600, 2000, 'seed=3'],
  'ondes-cuivre': ['ondes', 'cuivre', 2400, 1600, 'frame=0,0,1.7,1.5708&seed=9'],
  'cascade-chatain': ['cascade', 'chatain', 1600, 2000, 'frame=0.12,0.05,0.92,-0.12&seed=21'],
  'torsade-cuivre': ['torsade', 'cuivre', 1600, 1600, 'seed=4'],
  'ondes-ebene': ['ondes', 'ebene', 1600, 2000, 'seed=13'],
}

const only = process.argv.slice(2)
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
await mkdir(OUT, { recursive: true })
for (const [name, [comp, pal, w, h, extra]] of Object.entries(ETUDES)) {
  if (only.length && !only.includes(name)) continue
  // Denser strands on large canvases so the texture matches the on-screen look.
  const scale = Math.min(3, Math.max(1.4, (w * h) / (1440 * 900)))
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const q = `comp=${comp}&pal=${pal}&still=1&time=6&dpr=1&scale=${scale.toFixed(2)}&wscale=1.25&${extra}`
  await page.goto(`${BASE}/lab?${q}`, { waitUntil: 'networkidle', timeout: 180000 })
  await page.waitForFunction(() => window.__silkReady === true, null, { timeout: 180000 })
  const data = await page.evaluate(() => window.__silkExport('image/webp', 0.86))
  const buf = Buffer.from(data.split(',')[1], 'base64')
  await writeFile(new URL(`${name}.webp`, OUT), buf)
  console.log(`${name}.webp  ${w}×${h}  ${(buf.length / 1024).toFixed(0)} kB`)
  await page.close()
}
await browser.close()
