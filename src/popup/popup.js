const HL = globalThis.__HL
const $ = (id) => document.getElementById(id)

const UNSUPPORTED = /^(chrome|edge|about|chrome-extension|moz-extension|view-source|devtools):|^https:\/\/(chrome\.google\.com\/webstore|chromewebstore\.google\.com)/i

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const settings = await HL.settings.load()

  $('settings').addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); window.close() })

  const url = (tab && tab.url) || ''
  if (!tab || UNSUPPORTED.test(url)) return block('Hearline can’t run on this kind of page. Open an article or any regular website.')
  if (/\.pdf($|[?#])/i.test(url)) return block('PDF files aren’t supported yet. Open the page version of the document, or select text and use the context menu.')

  // speed
  const rate = $('rate')
  const showRate = () => { $('rate-val').textContent = `${(+rate.value).toFixed(2).replace(/0$/, '').replace(/\.0$/, '')}×` }
  rate.value = settings.rate
  showRate()
  rate.addEventListener('input', () => { showRate(); HL.settings.save({ rate: +rate.value }) })

  // voice
  let lang = navigator.language || 'en'
  try {
    const detected = await chrome.tabs.detectLanguage(tab.id)
    if (detected && detected !== 'und') lang = detected
  } catch (e) { /* keep browser language */ }
  const base = HL.lang.baseLang(lang)
  const web = await HL.voices.loadVoices()
  const select = $('voice')
  const kokoroOk = settings.kokoro.installed && HL.kokoroVoices.supports(lang)
  const kokoroDefault = kokoroOk && !(settings.kokoro.rtf != null && settings.kokoro.rtf > 1.1)
  const saved = settings.voices[base]

  const group = (label, items) => {
    if (!items.length) return
    const g = document.createElement('optgroup')
    g.label = label
    items.forEach(([value, text, selected]) => {
      const o = new Option(text, value, false, selected)
      g.appendChild(o)
    })
    select.appendChild(g)
  }
  const groups = HL.voices.groupVoices(web, lang)
  const current = HL.voices.pickVoice(web, { saved, lang })
  if (kokoroOk) {
    group('Hearline HQ (offline)', HL.kokoroVoices.VOICES.map((v) => [`k:${v.id}`, `${v.name} (${v.lang === 'en-GB' ? 'UK' : 'US'})`, saved ? saved.engine === 'kokoro' && saved.id === v.id : kokoroDefault && v.id === HL.kokoroVoices.defaultFor(lang)]))
  }
  group(`System voices (${lang})`, groups.match.map((v) => [`w:${v.voiceURI}`, v.name, !((kokoroDefault && !saved) || (saved && saved.engine === 'kokoro' && kokoroOk)) && current && current.voiceURI === v.voiceURI]))
  group('Other languages', groups.other.map((v) => [`w:${v.voiceURI}`, `${v.name} · ${v.lang}`, false]))

  if (!select.options.length) {
    select.disabled = true
    $('voice-note').hidden = false
    $('voice-note').textContent = 'No system voices found. Open Settings for help or to install free HQ voices.'
  } else if (!kokoroOk && HL.kokoroVoices.supports(lang)) {
    $('voice-note').hidden = false
    $('voice-note').innerHTML = 'Want a more natural voice? <a href="#" id="get-hq">Get free HQ voices</a>'
    $('get-hq').addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.sendMessage({ type: 'open-options', hash: 'voices' }); window.close() })
  }

  select.addEventListener('change', () => {
    const v = select.value
    const entry = v.startsWith('k:') ? { engine: 'kokoro', id: v.slice(2) } : HL.voices.serialize(web.find((x) => x.voiceURI === v.slice(2)))
    HL.settings.save({ voices: { [base]: entry } })
  })

  const run = async (action) => {
    const res = await chrome.runtime.sendMessage({ type: 'run', tabId: tab.id, action })
    if (res && res.ok) window.close()
    else block('Hearline can’t run on this page. (Some pages, like the Web Store or local files, block extensions.)')
  }
  $('read-page').addEventListener('click', () => run('readPage'))
  $('read-sel').addEventListener('click', () => run('readSelection'))
}

function block(text) {
  $('main').hidden = true
  $('msg').hidden = false
  $('msg').textContent = text
}

main()
