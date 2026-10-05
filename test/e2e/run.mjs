// Real-browser smoke test: loads dist/ in Chromium and drives the content script.
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

const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hl-'))
// activeTab can't be granted without a real user gesture, so test a copy with a localhost host permission.
const extDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hl-ext-'))
fs.cpSync(path.join(root, 'dist'), extDir, { recursive: true })
const manifest = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'))
manifest.host_permissions = ['http://127.0.0.1/*']
fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify(manifest))
const ctx = await chromium.launchPersistentContext(userDir, {
  executablePath: exe,
  headless: false,
  args: ['--headless=new', '--no-sandbox', `--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
})
let failed = 0
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) failed++ }

try {
  let sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker', { timeout: 10000 }))
  check('service worker started', !!sw)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(url)
  await page.bringToFront()
  const before = await page.evaluate(() => document.body.innerHTML)

  // Inject + open the reader (selection-free) through the background worker, like the popup does.
  const res = await sw.evaluate(async (u) => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return run(tab.id, 'readPage')
  }, url)
  check('background injected content scripts', res && res.ok, JSON.stringify(res))
  await page.waitForSelector('#hearline-root', { state: 'attached', timeout: 8000 })
  check('player host attached', true)

  const count = await page.locator('#hearline-root >> .count').textContent()
  console.log('      progress label:', count)
  const total = parseInt(count.split('/')[1])
  check('sentences extracted (nav/footer/code skipped)', total >= 9 && total <= 14, `total=${total}`)

  const after = await page.evaluate(() => document.body.innerHTML)
  check('page body not mutated (only shadow host added)', after.replace(/<div id="hearline-root"><\/div>/, '') === before)

  // Controls
  await page.locator('#hearline-root >> [data-a="next"]').click()
  const c2 = await page.locator('#hearline-root >> .count').textContent()
  check('next sentence moves position', c2.startsWith('2'), c2)
  await page.locator('#hearline-root >> [data-a="nextPara"]').click()
  const c3 = await page.locator('#hearline-root >> .count').textContent()
  console.log('      after next paragraph:', c3)

  // Speed + voice popovers
  await page.locator('#hearline-root >> [data-a="speed"]').click()
  check('speed popover opens', await page.locator('#hearline-root >> .speedval').isVisible())
  await page.locator('#hearline-root >> .presets button[data-v="1.5"]').click()
  const lbl = await page.locator('#hearline-root >> .speedlbl').textContent()
  check('speed preset applies', lbl === '1.5×', lbl)
  await page.locator('#hearline-root >> [data-a="voice"]').click()
  check('voice popover opens', await page.locator('#hearline-root >> .pop').isVisible())
  const popText = await page.locator('#hearline-root >> .pop').innerText()
  console.log('      voice popover:', popText.replace(/\n+/g, ' | ').slice(0, 200))
  check('voice popover offers HQ install or voices', /HQ voices|System voices|No system voices/i.test(popText))
  await page.keyboard.press('Escape')

  // Summary
  await page.locator('#hearline-root >> [data-a="menu"]').click()
  await page.getByText('Summary of this page', { exact: false }).click()
  await page.waitForSelector('#hearline-root >> .side')
  const items = await page.locator('#hearline-root >> .side .item').count()
  check('summary lists sentences', items >= 3, `items=${items}`)
  await page.locator('#hearline-root >> .side header button').click()

  // RSVP
  await page.locator('#hearline-root >> [data-a="menu"]').click()
  await page.getByText('Speed reading', { exact: false }).click()
  await page.waitForSelector('#hearline-root >> .rsvp')
  const w1 = (await page.locator('#hearline-root >> .stage').innerText()).replace(/\s+/g, '')
  await page.waitForTimeout(900)
  const w2 = (await page.locator('#hearline-root >> .stage').innerText()).replace(/\s+/g, '')
  check('RSVP advances words', w1 !== w2, `${w1} -> ${w2}`)
  await page.keyboard.press('Escape')
  check('RSVP closes with Escape', (await page.locator('#hearline-root >> .rsvp').count()) === 0)

  // Highlight on the page when a sentence is current
  const hlCount = await page.evaluate(() => 'highlights' in CSS)
  check('CSS Highlight API available', hlCount)

  // Escape closes the player
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  check('Escape closes the player', (await page.locator('#hearline-root').count()) === 0)

  // Second open works (idempotent)
  await sw.evaluate(async (u) => { const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); return run(tab.id, 'toggle') }, url)
  await page.waitForSelector('#hearline-root', { state: 'attached' })
  check('toggle reopens player', true)
  const roots = await page.locator('#hearline-root').count()
  check('only one player host', roots === 1)

  // Options page loads
  const opt = await ctx.newPage()
  const extId = new URL(sw.url()).host
  await opt.goto(`chrome-extension://${extId}/options/options.html#welcome`)
  await opt.waitForSelector('#hq-status')
  await opt.waitForFunction(() => /Not installed|Installed/.test(document.getElementById('hq-status').textContent), null, { timeout: 8000 })
  check('options page renders HQ status', true, await opt.locator('#hq-status').textContent())

  // Popup page loads
  const pop = await ctx.newPage()
  await pop.goto(`chrome-extension://${extId}/popup/popup.html`)
  await pop.waitForSelector('#read-page, #msg:not([hidden])')
  check('popup renders', true)

  console.log('\nconsole/page errors:', errors.length ? errors : 'none')
  if (errors.length) failed++
} catch (e) {
  console.error('ERROR', e)
  failed++
} finally {
  await ctx.close()
  server.close()
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
process.exit(failed ? 1 : 0)
