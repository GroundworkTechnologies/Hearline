(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const SCRIPTS = [
    ['ar', /[؀-ۿ]/g],
    ['he', /[֐-׿]/g],
    ['ru', /[Ѐ-ӿ]/g],
    ['el', /[Ͱ-Ͽ]/g],
    ['hi', /[ऀ-ॿ]/g],
    ['th', /[฀-๿]/g],
    ['ko', /[가-힯]/g],
    ['ja', /[぀-ヿ]/g],
    ['zh', /[一-鿿]/g],
  ]

  function baseLang(tag) {
    return String(tag || '').toLowerCase().split(/[-_]/)[0]
  }

  function detectScript(sample) {
    const letters = (sample.match(/\p{L}/gu) || []).length
    if (!letters) return null
    let best = null
    let bestCount = 0
    for (const [lang, re] of SCRIPTS) {
      const n = (sample.match(re) || []).length
      if (n > bestCount) { best = lang; bestCount = n }
    }
    return best && bestCount / letters > 0.3 ? best : null
  }

  // htmlLang wins, then script detection, then the browser language.
  function detectLang({ htmlLang, sample, navLang }) {
    const tag = String(htmlLang || '').trim().toLowerCase().replace('_', '-')
    if (/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(tag) && tag !== 'x-default') return tag
    return detectScript(sample || '') || String(navLang || 'en').toLowerCase().replace('_', '-')
  }

  const api = { baseLang, detectScript, detectLang }
  HL.lang = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
