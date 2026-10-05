// Dedicated worker: runs Kokoro inference off the page's main thread.
import { loadModel, setThreads } from './kokoro-core.js'

self.onmessage = async (e) => {
  const m = e.data
  try {
    if (m.threads) setThreads(m.threads) // only the first message matters (benchmarking)
    const tts = await loadModel()
    const out = await tts.generate(m.text, { voice: m.voice, speed: 1 })
    self.postMessage({ id: m.id, samples: out.audio, sr: out.sampling_rate }, [out.audio.buffer])
  } catch (err) {
    self.postMessage({ id: m.id, error: String((err && err.message) || err) })
  }
}
