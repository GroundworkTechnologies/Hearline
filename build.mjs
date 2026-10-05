// Builds the loadable extension into dist/ (and optionally a store zip with --zip).
import { build } from 'esbuild'
import { cp, rm, mkdir, readFile, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const root = path.dirname(new URL(import.meta.url).pathname)
const src = path.join(root, 'src')
const dist = path.join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
const bundled = ['offscreen/offscreen.js', 'offscreen/worker.js', 'offscreen/kokoro-core.js', 'options/installer.js'].map((f) => path.join(src, f))
await cp(src, dist, { recursive: true, filter: (p) => !bundled.includes(p) })

await build({
  entryPoints: { 'offscreen/offscreen': path.join(src, 'offscreen', 'offscreen.js'), 'offscreen/worker': path.join(src, 'offscreen', 'worker.js'), 'options/installer': path.join(src, 'options', 'installer.js') },
  outdir: dist,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'chrome120',
  minify: true,
  logLevel: 'info',
  define: { 'process.env.NODE_ENV': '"production"' },
})

const ort = path.join(root, 'node_modules', 'onnxruntime-web', 'dist')
await mkdir(path.join(dist, 'ort'), { recursive: true })
for (const f of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  await cp(path.join(ort, f), path.join(dist, 'ort', f))
}

if (process.argv.includes('--zip')) {
  const { version } = JSON.parse(await readFile(path.join(src, 'manifest.json'), 'utf8'))
  const out = path.join(root, `hearline-${version}.zip`)
  await rm(out, { force: true })
  execFileSync('zip', ['-qr', out, '.'], { cwd: dist })
  console.log('wrote', out)
}
console.log('built', dist, (await readdir(dist)).join(', '))
