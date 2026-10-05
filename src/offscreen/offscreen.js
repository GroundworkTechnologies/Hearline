// Runs Kokoro-82M locally (WASM), plays the audio, and reports progress to the page that asked.
import { wavBlob } from './kokoro-core.js'

// Inference runs in a worker so this page keeps handling messages while a sentence is generated.
let worker = null
let modelReady = false
let rpcId = 0
const pendingRpc = new Map()
const modelLoaded = () => modelReady

function getWorker() {
  if (!worker) {
    worker = new Worker(chrome.runtime.getURL('offscreen/worker.js'), { type: 'module' })
    worker.onmessage = (e) => {
      const m = e.data
      const p = pendingRpc.get(m.id)
      if (!p) return
      pendingRpc.delete(m.id)
      if (m.error) p.reject(new Error(m.error))
      else { modelReady = true; p.resolve({ samples: m.samples, sr: m.sr }) }
    }
    worker.onerror = (e) => {
      const err = new Error(e.message || 'worker-failed')
      for (const p of pendingRpc.values()) p.reject(err)
      pendingRpc.clear()
      worker = null
    }
  }
  return worker
}

function generate(text, voice) {
  return new Promise((resolve, reject) => {
    const id = ++rpcId
    pendingRpc.set(id, { resolve, reject })
    getWorker().postMessage({ id, text, voice })
  })
}

// One generation at a time; stale prefetches are dropped before they reach the worker.
let chain = Promise.resolve()
function enqueue(fn) {
  const run = chain.then(fn)
  chain = run.catch(() => {})
  return run
}

// ---- audio cache ---------------------------------------------------------
const cache = new Map() // key -> Promise<{ samples: Float32Array, sr: number } | null>
let epoch = 0

function getAudio(text, voice, { prefetch = false, speakId = 0 } = {}) {
  const key = `${voice}|${text}`
  if (cache.has(key)) {
    const hit = cache.get(key)
    cache.delete(key)
    cache.set(key, hit) // refresh LRU position
    return hit
  }
  const myEpoch = epoch
  const p = enqueue(async () => {
    // Superseded by a newer request: skip the expensive work.
    if (prefetch ? myEpoch !== epoch : speakId && current.id !== speakId) { cache.delete(key); return null }
    const out = await generate(text, voice)
    return out
  })
  p.catch(() => cache.delete(key))
  cache.set(key, p)
  while (cache.size > 12) cache.delete(cache.keys().next().value)
  return p
}

async function fetchAudio(text, voice, speakId) {
  const first = await getAudio(text, voice, { speakId })
  if (first) return first
  if (speakId && current.id !== speakId) return null // cancelled meanwhile
  return getAudio(text, voice, { speakId }) // a dropped prefetch left a hole: generate for real
}

// ---- playback --------------------------------------------------------------
let playing = null // { port, id, el, url, timer }

function stopPlayback() {
  if (!playing) return
  clearInterval(playing.timer)
  playing.el.onended = playing.el.onerror = null
  playing.el.pause()
  URL.revokeObjectURL(playing.url)
  playing = null
}

function post(port, msg) {
  try { port.postMessage(msg) } catch (e) { /* port closed */ }
}

function setMediaSession(port, title) {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({ title: title || 'Hearline', artist: 'Hearline' })
  const relay = (action) => () => post(port, { t: 'media', action })
  navigator.mediaSession.setActionHandler('play', relay('play'))
  navigator.mediaSession.setActionHandler('pause', relay('pause'))
  navigator.mediaSession.setActionHandler('nexttrack', relay('next'))
  navigator.mediaSession.setActionHandler('previoustrack', relay('prev'))
}

async function speak(port, { id, text, voice, rate, title }) {
  epoch++
  stopPlayback()
  try {
    const pending = cache.has(`${voice}|${text}`)
    if (!pending && !modelLoaded()) post(port, { t: 'loading', id })
    const audio = await fetchAudio(text, voice, id)
    if (!audio || current.id !== id) return // a newer request arrived while generating
    const url = URL.createObjectURL(wavBlob([audio.samples], audio.sr))
    const el = new Audio(url)
    el.preservesPitch = true
    el.playbackRate = rate || 1
    const state = { port, id, el, url, timer: 0 }
    playing = state
    el.onended = () => { if (playing === state) { stopPlayback(); post(port, { t: 'end', id }) } }
    el.onerror = () => { if (playing === state) { stopPlayback(); post(port, { t: 'error', id, message: 'audio-playback-failed' }) } }
    await el.play()
    setMediaSession(port, title)
    post(port, { t: 'start', id, dur: el.duration })
    state.timer = setInterval(() => {
      if (el.duration > 0) post(port, { t: 'progress', id, p: Math.min(1, el.currentTime / el.duration) })
    }, 60)
  } catch (e) {
    if (current.id === id) post(port, { t: 'error', id, message: String((e && e.message) || e) })
  }
}

const current = { id: 0 }

// ---- export ---------------------------------------------------------------
async function exportAudio(port, { texts, voice, title }) {
  try {
    const parts = []
    let sr = 24000
    for (let i = 0; i < texts.length; i++) {
      const a = await fetchAudio(texts[i], voice, 0)
      sr = a.sr
      parts.push(a.samples, new Float32Array(Math.round(sr * 0.2)))
      post(port, { t: 'export-progress', done: i + 1, total: texts.length })
    }
    const blob = wavBlob(parts, sr)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'hearline').replace(/[^\p{L}\p{N}\s-]+/gu, '').trim().slice(0, 60) || 'hearline'}.wav`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    post(port, { t: 'export-done' })
  } catch (e) {
    post(port, { t: 'export-error', message: String((e && e.message) || e) })
  }
}

// ---- ports --------------------------------------------------------------------
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'hearline-kokoro') return
  port.onMessage.addListener((msg) => {
    switch (msg.t) {
      case 'speak':
        current.id = msg.id
        speak(port, msg)
        break
      case 'prefetch':
        for (const text of msg.texts || []) getAudio(text, msg.voice, { prefetch: true }).catch(() => {})
        break
      case 'pause':
        if (playing) playing.el.pause()
        break
      case 'resume':
        if (playing) playing.el.play().catch(() => {})
        break
      case 'cancel':
        current.id = 0
        epoch++
        stopPlayback()
        break
      case 'rate':
        if (playing) playing.el.playbackRate = msg.rate
        break
      case 'export':
        exportAudio(port, msg)
        break
    }
  })
  port.onDisconnect.addListener(() => {
    if (playing && playing.port === port) { current.id = 0; stopPlayback() }
  })
})
