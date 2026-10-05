// Installs HQ voices (if needed) and prints the Settings speed-test result. Needs network on first run.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const root = path.resolve(new URL('../..', import.meta.url).pathname)
const exe = process.env.CHROME || path.join(os.homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
const extDir = process.env.HL_EXT || fs.mkdtempSync(path.join(os.tmpdir(), 'hl-ext-'))
fs.rmSync(extDir, { recursive: true, force: true })
fs.cpSync(path.join(root, 'dist'), extDir, { recursive: true })
const ctx = await chromium.launchPersistentContext(process.env.HL_PROFILE || fs.mkdtempSync(path.join(os.tmpdir(), 'hl-')), {
  executablePath: exe, headless: false,
  args: ['--headless=new', '--no-sandbox', `--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
})
try {
  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'))
  const page = await ctx.newPage()
  await page.goto(`chrome-extension://${new URL(sw.url()).host}/options/options.html`)
  await page.waitForFunction(() => /Not installed|Installed/.test(document.getElementById('hq-status').textContent))
  if (!/✓ Installed/.test(await page.locator('#hq-status').textContent())) {
    await page.click('#hq-install')
    await page.waitForFunction(() => /✓ Installed|failed/.test(document.getElementById('hq-status').textContent), null, { timeout: 480000 })
  }
  await page.click('#hq-bench')
  await page.waitForFunction(() => /real time|failed/.test(document.getElementById('hq-bench-out').textContent), null, { timeout: 240000 })
  console.log(await page.locator('#hq-bench-out').textContent())
} finally {
  await ctx.close()
}
