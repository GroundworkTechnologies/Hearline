(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const STOP = new Set(
    ('a about above after again all also am an and any are as at be because been before being below between both but by can ' +
      'could did do does doing down during each few for from further had has have having he her here hers him his how i if in ' +
      'into is it its itself just me more most my no nor not now of off on once only or other our out over own same she should ' +
      'so some such than that the their them then there these they this those through to too under until up very was we were ' +
      'what when where which while who whom why will with would you your').split(' ')
  )

  const words = (s) => (s.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || []).filter((w) => w.length > 2 && !STOP.has(w))

  /**
   * Extractive summary: TF-IDF style sentence scoring + position boost + title overlap.
   * sentences: string[]; returns indices (ascending) of the k best sentences.
   */
  function summarize(sentences, { k = 5, title = '' } = {}) {
    const n = sentences.length
    if (n <= k) return sentences.map((_, i) => i)
    const tokens = sentences.map(words)
    const tf = new Map()
    const df = new Map()
    tokens.forEach((ws) => {
      for (const w of ws) tf.set(w, (tf.get(w) || 0) + 1)
      for (const w of new Set(ws)) df.set(w, (df.get(w) || 0) + 1)
    })
    const titleWords = new Set(words(title))
    const scored = sentences.map((s, i) => {
      const ws = tokens[i]
      if (s.length < 40 || s.length > 400 || ws.length < 4) return { i, score: -1 }
      let sum = 0
      for (const w of ws) sum += tf.get(w) * Math.log(1 + n / df.get(w))
      let score = sum / Math.pow(ws.length, 0.7)
      score *= 1 + 0.4 * Math.max(0, 1 - i / Math.max(10, n * 0.3)) // lead sentences matter
      const overlap = ws.filter((w) => titleWords.has(w)).length
      score *= 1 + Math.min(0.5, overlap * 0.15)
      return { i, score }
    })
    return scored
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((x) => x.i)
      .sort((a, b) => a - b)
  }

  const api = { summarize }
  HL.summarize = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
