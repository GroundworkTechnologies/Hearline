(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const ABBR = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'inc', 'ltd', 'co', 'no', 'fig', 'eq',
    'e.g', 'i.e', 'u.s', 'u.k', 'a.m', 'p.m', 'approx', 'dept', 'est', 'vol', 'pp', 'al', 'cf', 'ca', 'mt',
    'gen', 'col', 'lt', 'sgt', 'rev', 'hon', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept',
    'oct', 'nov', 'dec',
  ])

  // Terminators followed by whitespace, or CJK terminators that need none.
  const BOUNDARY = /([.!?…؟।]+["'”’)\]]*)\s+|([。！？]+["'”’)\]]*)\s*/gu

  /** Split text into sentence ranges [{start, end}] (offsets into text, trimmed). */
  function splitSentences(text) {
    const ranges = []
    let cursor = 0
    BOUNDARY.lastIndex = 0
    let m
    while ((m = BOUNDARY.exec(text))) {
      const end = m.index + m[0].length
      const punctEnd = m.index + (m[1] || m[2]).length
      if (m[1] && m[1].replace(/["'”’)\]]+$/, '').endsWith('.') && !isRealStop(text, m.index, end)) continue
      ranges.push([cursor, punctEnd])
      cursor = end
    }
    ranges.push([cursor, text.length])
    return ranges.map(([s, e]) => trimRange(text, s, e)).filter((r) => r && /[\p{L}\p{N}]/u.test(text.slice(r.start, r.end)))
  }

  function isRealStop(text, idx, end) {
    const before = text.slice(0, idx)
    const word = (before.match(/([\p{L}.]+)$/u) || [])[1]
    if (word) {
      const w = word.toLowerCase().replace(/^\./, '')
      if (ABBR.has(w)) return false
      // Single capital letter (initials such as "J. Smith").
      if (/^\p{Lu}$/u.test(word)) return false
    }
    const next = text[end]
    if (next && /\p{Ll}/u.test(next)) return false
    return true
  }

  function trimRange(text, s, e) {
    while (s < e && /\s/.test(text[s])) s++
    while (e > s && /\s/.test(text[e - 1])) e--
    return e > s ? { start: s, end: e } : null
  }

  /** Break overly long ranges (Web Speech cuts off long utterances) at clause boundaries. */
  function splitLong(text, range, max = 220) {
    const out = []
    let { start, end } = range
    while (end - start > max) {
      const slice = text.slice(start, start + max)
      let cut = Math.max(slice.lastIndexOf(', '), slice.lastIndexOf('; '), slice.lastIndexOf(': '), slice.lastIndexOf(' — '))
      if (cut < max * 0.4) cut = slice.lastIndexOf(' ')
      if (cut < 1) cut = max
      const piece = trimRange(text, start, start + cut + 1)
      if (piece) out.push(piece)
      start = start + cut + 1
    }
    const last = trimRange(text, start, end)
    if (last) out.push(last)
    return out
  }

  const WORD_RE = /[\p{L}\p{N}_]+(?:['’-][\p{L}\p{N}_]+)*/uy
  let segmenter = null
  try { segmenter = new Intl.Segmenter(undefined, { granularity: 'word' }) } catch (e) { /* older engines */ }

  /** Word containing (or starting at) idx: {start, end}. */
  function wordAt(text, idx) {
    if (idx >= text.length) return { start: text.length, end: text.length }
    if (segmenter) {
      const seg = segmenter.segment(text).containing(idx)
      if (seg) return { start: seg.index, end: seg.index + seg.segment.length }
    }
    WORD_RE.lastIndex = idx
    const m = WORD_RE.exec(text)
    return m ? { start: idx, end: idx + m[0].length } : { start: idx, end: idx + 1 }
  }

  /**
   * Single-pass text transformation that records how to map offsets back.
   * rules: [{ re: RegExp, to: string | (match) => string }]
   * Returns { text, toOriginal(indexInNewText) -> indexInOriginalText }.
   */
  function transform(text, rules) {
    const hits = []
    for (const r of rules) {
      const flags = r.re.flags.includes('g') ? r.re.flags : r.re.flags + 'g'
      const re = new RegExp(r.re.source, flags)
      let m
      while ((m = re.exec(text))) {
        if (m[0] === '') { re.lastIndex++; continue }
        hits.push({ s: m.index, e: m.index + m[0].length, to: typeof r.to === 'function' ? r.to(m) : r.to })
      }
    }
    hits.sort((a, b) => a.s - b.s || b.e - a.e)
    let out = ''
    let pos = 0
    const spans = []
    for (const h of hits) {
      if (h.s < pos) continue
      out += text.slice(pos, h.s)
      const os = out.length
      out += h.to
      spans.push({ os, oe: out.length, s: h.s, e: h.e })
      pos = h.e
    }
    out += text.slice(pos)

    function toOriginal(i) {
      let lastE = 0
      let lastOe = 0
      for (const sp of spans) {
        if (i < sp.os) break
        if (i < sp.oe) return sp.s
        lastE = sp.e
        lastOe = sp.oe
      }
      return lastE + (i - lastOe)
    }
    return { text: out, toOriginal }
  }

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  /** Rules applied to everything before speaking. */
  function buildRules(settings) {
    const skip = (settings && settings.skip) || {}
    const rules = [{ re: /[ \t\r\n ]*[\t\r\n ][ \t\r\n ]*|  +/, to: ' ' }]
    for (const p of (settings && settings.pronunciations) || []) {
      if (!p || !p.from) continue
      rules.push({ re: new RegExp('(?<![\\p{L}\\p{N}])' + escapeRe(p.from) + '(?![\\p{L}\\p{N}])', 'giu'), to: p.to || '' })
    }
    if (skip.citations) rules.push({ re: /[ \t]?\[(?:\d+|[a-z])(?:\s*[,–-]\s*\d+)*\]/gi, to: '' })
    if (skip.urls) rules.push({ re: /\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+/gi, to: 'link' })
    if (skip.emoji) rules.push({ re: /\p{Extended_Pictographic}[‍️\p{Extended_Pictographic}]*/gu, to: '' })
    return rules
  }

  const api = { splitSentences, splitLong, wordAt, transform, buildRules }
  HL.text = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
