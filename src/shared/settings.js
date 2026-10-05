(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const DEFAULTS = {
    rate: 1,
    voices: {}, // per base language: { engine: 'web', uri, name, lang } | { engine: 'kokoro', id }
    theme: 'auto', // auto | light | dark
    accent: '#0A7FFF',
    highlight: 'pill', // pill | underline | sentence | sentence-word
    autoScroll: true,
    skip: { citations: true, code: true, urls: true, emoji: true },
    rsvpWpm: 300,
    pronunciations: [], // { from, to }
    playerPos: null, // { x, y } in px from top-left
    kokoro: { installed: false, rtf: null }, // rtf = seconds to generate 1 s of speech (speed test)
  }

  const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v)

  function merge(base, patch) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base)
    if (!isPlain(patch)) return out
    for (const key of Object.keys(patch)) {
      out[key] = isPlain(patch[key]) && isPlain(out[key]) ? merge(out[key], patch[key]) : patch[key]
    }
    return out
  }

  const clone = (v) => JSON.parse(JSON.stringify(v))

  async function load() {
    try {
      const data = await chrome.storage.local.get('settings')
      return merge(clone(DEFAULTS), data.settings || {})
    } catch (e) {
      return clone(DEFAULTS)
    }
  }

  async function save(patch) {
    try {
      const current = await load()
      const next = merge(current, patch)
      await chrome.storage.local.set({ settings: next })
      return next
    } catch (e) {
      return merge(clone(DEFAULTS), patch)
    }
  }

  function subscribe(cb) {
    try {
      const handler = (changes, area) => {
        if (area === 'local' && changes.settings) cb(merge(clone(DEFAULTS), changes.settings.newValue || {}))
      }
      chrome.storage.onChanged.addListener(handler)
      return () => chrome.storage.onChanged.removeListener(handler)
    } catch (e) {
      return () => {}
    }
  }

  const api = { DEFAULTS, merge, load, save, subscribe }
  HL.settings = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
