// Generates the static share/icon images in public/ from HTML templates:
//   public/og-image.png          1200×630  Open Graph / Twitter card
//   public/apple-touch-icon.png  180×180
//   public/icon-192.png, public/icon-512.png  (web app manifest; maskable-safe padding)
//
// Run once after changing the name, title or tagline in src/data/profile.ts:
//   node scripts/generate-assets.mjs
//
// Needs Node 22.18+ (it imports profile.ts directly) and Google Chrome installed. Playwright is
// installed into a temporary folder for the run, so it never becomes a project dependency.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { profile } from '../src/data/profile.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const file = (...p) => pathToFileURL(join(root, ...p)).href

// Site tokens (dark theme), as in src/index.css.
const C = { bg: '#0a0b0d', line: '#1f232b', text: '#e6e8eb', muted: '#8a93a3', accent: '#7cffb2', accent2: '#5cc8ff' }

const fonts = `
  @font-face { font-family: 'Inter'; font-weight: 100 900;
    src: url('${file('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'JetBrains Mono'; font-weight: 100 800;
    src: url('${file('node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  html, body { background: ${C.bg}; }`

// Deterministic "network" lines (seeded PRNG), like the hero canvas, so reruns give the same image.
function network(width, height, count, seed = 7) {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  const nodes = Array.from({ length: count }, () => ({ x: rand() * width, y: rand() * height }))
  const lines = []
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
      if (d < 150) lines.push(`<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke-opacity="${(0.16 * (1 - d / 150)).toFixed(3)}"/>`)
    }
  const dots = nodes.map((n) => `<circle cx="${n.x}" cy="${n.y}" r="1.8"/>`).join('')
  return `<svg width="${width}" height="${height}" style="position:absolute;inset:0">
    <g stroke="${C.muted}" stroke-width="1">${lines.join('')}</g><g fill="${C.muted}" fill-opacity="0.4">${dots}</g></svg>`
}

const host = new URL(profile.meta.url).host

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  .card { position: relative; width: 1200px; height: 630px; overflow: hidden; background: ${C.bg}; }
  .glow { position: absolute; right: 70px; top: 40px; width: 520px; height: 420px; border-radius: 50%;
    background: radial-gradient(closest-side, ${C.accent}, color-mix(in oklab, ${C.accent2} 70%, transparent) 55%, transparent);
    opacity: 0.34; filter: blur(48px); }
  /* No silhouette drop-shadow here: in a screenshot Chrome tints the photo's whole box with it.
     The radial glow carries the look. */
  .figure { position: absolute; right: 100px; bottom: 0; height: 600px; }
  .photo { display: block; height: 100%;
    -webkit-mask-image: linear-gradient(to bottom, #000 74%, transparent); mask-image: linear-gradient(to bottom, #000 74%, transparent); }
  .copy { position: absolute; left: 80px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; }
  .path { font: 500 22px 'JetBrains Mono'; color: ${C.accent2}; letter-spacing: 0.04em; }
  h1 { margin-top: 18px; font: 700 104px/1 'Inter'; letter-spacing: -0.03em; color: ${C.text}; }
  .title { margin-top: 26px; font: 500 27px 'JetBrains Mono'; color: ${C.accent}; white-space: nowrap; }
  .tagline { margin-top: 18px; font: 400 28px/1.35 'Inter'; color: ${C.muted}; }
  .url { position: absolute; left: 80px; bottom: 48px; font: 400 20px 'JetBrains Mono'; color: ${C.muted}; }
  .url b { color: ${C.accent}; font-weight: 400; }
  .rule { position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, ${C.accent}, ${C.accent2}); opacity: 0.8; }
</style></head><body><div class="card">
  ${network(1200, 630, 46)}
  <div class="rule"></div>
  <div class="glow"></div>
  <div class="figure"><img class="photo" src="${file('public/images/ajay-cutout-1200.webp')}" alt=""></div>
  <div class="copy">
    <p class="path">~/${profile.name.toLowerCase().replace(/\s+/g, '-')}</p>
    <h1>${profile.name}</h1>
    <p class="title">${profile.title}</p>
    <p class="tagline">${profile.meta.ogTagline}</p>
  </div>
  <p class="url"><b>$</b> open ${host}</p>
</div></body></html>`

// The favicon glyph (a chevron prompt and an underscore), on a solid background. `pad` keeps it
// inside the maskable safe zone for manifest icons.
const iconHtml = (size, pad) => `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  body { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: ${C.bg}; }
</style></head><body>
  <svg width="${size * (1 - 2 * pad)}" height="${size * (1 - 2 * pad)}" viewBox="0 0 32 32">
    <path d="M8 10l6 6-6 6" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 22h8" stroke="${C.accent2}" stroke-width="2.5" stroke-linecap="round"/>
  </svg></body></html>`

const tmp = mkdtempSync(join(tmpdir(), 'portfolio-assets-'))
try {
  console.log('Installing playwright-core into a temporary folder…')
  execFileSync('npm', ['install', '--silent', '--no-audit', '--no-fund', '--prefix', tmp, 'playwright-core'], { stdio: 'inherit' })
  const { chromium } = await import(pathToFileURL(join(tmp, 'node_modules/playwright-core/index.mjs')).href)
  const browser = await chromium.launch({ channel: 'chrome' })

  const render = async (html, width, height, out) => {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    const path = join(tmp, 'page.html')
    writeFileSync(path, html)
    await page.goto(pathToFileURL(path).href, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: join(root, 'public', out), type: 'png' })
    await page.close()
    console.log(`  public/${out}  ${width}×${height}`)
  }

  await render(ogHtml, 1200, 630, 'og-image.png')
  await render(iconHtml(180, 0.14), 180, 180, 'apple-touch-icon.png')
  await render(iconHtml(192, 0.2), 192, 192, 'icon-192.png')
  await render(iconHtml(512, 0.2), 512, 512, 'icon-512.png')
  await browser.close()
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
