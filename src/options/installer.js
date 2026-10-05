// Bundled entry for the options page: installs/removes the optional HQ voice model.
// Runs in the options page (not the offscreen document) because Chrome closes audio-only
// offscreen documents after 30 s without sound, which would interrupt a large download.
import { install, isInstalled, removeModel } from '../offscreen/kokoro-core.js'

const SENTENCE = 'The quick brown fox jumps over the lazy dog, and then it takes a short rest.'

async function benchOnce(threads) {
  const worker = new Worker(chrome.runtime.getURL('offscreen/worker.js'), { type: 'module' })
  const run = (text) => new Promise((resolve, reject) => {
    worker.onmessage = (e) => (e.data.error ? reject(new Error(e.data.error)) : resolve(e.data))
    worker.onerror = (e) => reject(new Error(e.message || 'worker-failed'))
    worker.postMessage({ id: 1, text, voice: 'af_heart', threads })
  })
  try {
    await run('Hello.') // warm-up: loads the model
    const t = performance.now()
    const out = await run(SENTENCE)
    const seconds = (performance.now() - t) / 1000
    const audio = out.samples.length / out.sr
    return { threads, seconds, audio, rtf: seconds / audio }
  } finally {
    worker.terminate()
  }
}

/** Measures generation speed. rtf < 1 means faster than real time (smooth playback). */
async function benchmark(onStep) {
  const cores = navigator.hardwareConcurrency || 1
  const multi = Math.max(1, Math.min(4, cores - 1))
  const results = []
  for (const n of multi > 1 ? [1, multi] : [1]) {
    onStep && onStep(`Testing with ${n} thread${n > 1 ? 's' : ''}…`)
    results.push(await benchOnce(n))
  }
  let gpu = false
  try { gpu = !!(navigator.gpu && (await navigator.gpu.requestAdapter())) } catch (e) { /* none */ }
  return { cores, isolated: self.crossOriginIsolated, gpu, results }
}

window.HLInstaller = { install, isInstalled, removeModel, benchmark }
window.dispatchEvent(new Event('hl-installer-ready'))
