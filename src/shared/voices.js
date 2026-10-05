(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const normLang = (l) => String(l || '').toLowerCase().replace('_', '-')
  const base = (l) => normLang(l).split('-')[0]
  const isNatural = (v) => /natural|neural|premium|enhanced|siri/i.test(v.name)

  // Higher is better. Never refers to a specific vendor voice by name.
  function scoreVoice(v, lang) {
    let s = 0
    const vl = normLang(v.lang)
    const want = normLang(lang)
    if (base(vl) === base(want)) s += 50
    if (vl === want) s += 10
    if (isNatural(v)) s += 20
    if (/google/i.test(v.name)) s += 8
    if (v.localService) s += 5
    if (v.default) s += 3
    return s
  }

  function rankVoices(voices, lang) {
    return voices
      .map((v) => ({ v, s: scoreVoice(v, lang) }))
      .sort((a, b) => b.s - a.s || a.v.name.localeCompare(b.v.name))
      .map((x) => x.v)
  }

  function matchSaved(voices, saved) {
    if (!saved || saved.engine !== 'web') return null
    return (
      voices.find((v) => v.voiceURI === saved.uri) ||
      voices.find((v) => v.name === saved.name && v.lang === saved.lang) ||
      null
    )
  }

  // Saved choice if still installed, otherwise best match for the language.
  function pickVoice(voices, { saved, lang }) {
    if (!voices || !voices.length) return null
    return matchSaved(voices, saved) || rankVoices(voices, lang)[0] || null
  }

  function groupVoices(voices, lang) {
    const ranked = rankVoices(voices, lang)
    return {
      match: ranked.filter((v) => base(v.lang) === base(lang)),
      other: ranked.filter((v) => base(v.lang) !== base(lang)),
    }
  }

  function serialize(v) {
    return { engine: 'web', uri: v.voiceURI, name: v.name, lang: v.lang }
  }

  // Voices load asynchronously in Chrome; resolve once available or after the timeout.
  function loadVoices(timeout = 2500) {
    return new Promise((resolve) => {
      const synth = root.speechSynthesis
      if (!synth) return resolve([])
      const done = () => {
        clearInterval(timer)
        clearTimeout(limit)
        synth.removeEventListener && synth.removeEventListener('voiceschanged', check)
        resolve(synth.getVoices())
      }
      const check = () => { if (synth.getVoices().length) done() }
      const timer = setInterval(check, 200)
      const limit = setTimeout(done, timeout)
      synth.addEventListener && synth.addEventListener('voiceschanged', check)
      check()
    })
  }

  const api = { isNatural, scoreVoice, rankVoices, pickVoice, groupVoices, serialize, loadVoices }
  HL.voices = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
