// Optional, needs network (~90 MB download): installs Kokoro in a real browser and speaks a page with it.
import { chromium } from 'playwright-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const root = path.resolve(new URL('../..', import.meta.url).pathname)
const exe = process.env.CHROME || path.join(os.homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
const html = fs.readFileSync(path.join(root, 'test/e2e/article.html'))
const server = http.createServer((req, res) => { res.setHeader('content-type', 'text/html'); res.end(html) })
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${server.address().port}/`

const extDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hl-ext-'))
fs.cpSync(path.join(root, 'dist'), extDir, { recursive: true })
const manifest = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'))
manifest.host_permissions = ['http://127.0.0.1/*']
fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify(manifest))

const profile = process.env.HL_PROFILE || fs.mkdtempSync(path.join(os.tmpdir(), 'hl-'))
const ctx = await chromium.launchPersistentContext(profile, {
  executablePath: exe,
  headless: false,
  args: ['--headless=new', '--no-sandbox', '--autoplay-policy=no-user-gesture-required', `--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
})
let failed = 0
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) failed++ }
const t0 = Date.now()
const since = () => `${Math.round((Date.now() - t0) / 1000)}s`

try {
  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'))
  const extId = new URL(sw.url()).host
  const opt = await ctx.newPage()
  const errors = []
  opt.on('pageerror', (e) => errors.push('options: ' + e))
  opt.on('console', (m) => { if (m.type() === 'error') errors.push('options console: ' + m.text()) })
  await opt.goto(`chrome-extension://${extId}/options/options.html#voices`)
  await opt.waitForFunction(() => /Not installed|Installed/.test(document.getElementById('hq-status').textContent))
  ctx.on('page', (p) => { if (p.url().includes('offscreen')) { p.on('console', (m) => console.log('      [offscreen]', m.text().slice(0, 300))); p.on('pageerror', (e) => console.log('      [offscreen error]', String(e).slice(0, 300))) } })
  if (!/✓ Installed/.test(await opt.locator('#hq-status').textContent())) await opt.click('#hq-install')
  let last = ''
  const deadline = Date.now() + 8 * 60 * 1000
  while (Date.now() < deadline) {
    const status = await opt.locator('#hq-status').textContent()
    const label = (await opt.locator('#hq-progress .label').textContent().catch(() => '')) || ''
    if (label !== last) { console.log(`      [${since()}] ${label}`); last = label }
    if (/✓ Installed/.test(status) || /failed/i.test(status)) { console.log(`      [${since()}] ${status}`); break }
    await opt.waitForTimeout(1500)
  }
  const installed = /✓ Installed/.test(await opt.locator('#hq-status').textContent())
  check('model installed from options page', installed)
  if (!installed) throw new Error('install failed; errors: ' + errors.join(' | '))

  const stored = await opt.evaluate(async () => (await chrome.storage.local.get('settings')).settings.kokoro.installed)
  check('installed flag saved', stored === true)

  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push('page: ' + e))
  await page.goto(url)
  await page.bringToFront()
  const res = await sw.evaluate(async () => { const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); return run(tab.id, 'readPage') })
  check('reader opened', res.ok, JSON.stringify(res))
  console.log(`      [${since()}] reading started, waiting for audio + word highlight…`)

  const voiceLabel = await page.locator('#hearline-root >> .vlabel').textContent()
  check('HQ voice chosen by default', /Heart/.test(voiceLabel), voiceLabel)

  let sawWord = false
  let sawNext = false
  for (let i = 0; i < 90 && !(sawWord && sawNext); i++) {
    await page.waitForTimeout(1000)
    sawWord = sawWord || (await page.evaluate(() => CSS.highlights.has('hl-word')))
    const count = await page.locator('#hearline-root >> .count').textContent()
    sawNext = parseInt(count) >= 2
  }
  check('word highlight driven by Kokoro progress', sawWord)
  check('advanced to the next sentence after audio ended', sawNext)

  // switch voice live
  await page.locator('#hearline-root >> [data-a="voice"]').click()
  await page.locator('#hearline-root >> .pop .opt', { hasText: 'George' }).click()
  await page.waitForTimeout(500)
  const label2 = await page.locator('#hearline-root >> .vlabel').textContent()
  check('voice switch works (George)', /George/.test(label2), label2)
  let ok2 = false
  for (let i = 0; i < 100 && !ok2; i++) {
    await page.waitForTimeout(1000)
    ok2 = await page.evaluate(() => CSS.highlights.has('hl-word'))
    if (i % 5 === 0) {
      const toast = await page.locator('#hearline-root >> .toast').textContent()
      const play = await page.locator('#hearline-root >> [data-a="toggle"]').getAttribute('aria-label')
      const busy = await page.locator('#hearline-root >> [data-a="toggle"]').getAttribute('class')
      console.log(`      [${since()}] after switch: toast="${toast}" play="${play}" class="${busy}" count=${await page.locator('#hearline-root >> .count').textContent()} word=${ok2}`)
    }
  }
  check('speaks with newly selected voice (a not-preinstalled voice may need network)', ok2)

  console.log('\nerrors:', errors.length ? errors : 'none')
} catch (e) {
  console.error('ERROR', e)
  failed++
} finally {
  await ctx.close()
  server.close()
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
process.exit(failed ? 1 : 0)
