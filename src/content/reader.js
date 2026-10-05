(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const POS_KEY = 'positions'
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

  let R = null // the single active reader session

  const pageKey = () => location.origin + location.pathname + location.search

  async function store(key, fallback, fn) {
    try {
      const data = await chrome.storage.local.get(key)
      const next = fn(data[key] === undefined ? fallback : data[key])
      await chrome.storage.local.set({ [key]: next })
      return next
    } catch (e) {
      return fallback
    }
  }

  async function open({ autoplay = false, selection = false } = {}) {
    if (R) {
      const existing = R.api
      if (!existing) return null // still loading
      if (selection) await existing.readSelection()
      else if (autoplay) existing.play()
      return existing
    }
    const settings = await HL.settings.load()
    HL.host.applyAppearance(settings)

    const s = {
      settings,
      blocks: [],
      all: [],
      chunks: [],
      elToBlock: new Map(),
      lang: 'en',
      webVoices: [],
      idx: 0,
      status: 'idle', // idle | playing | paused
      engineActive: false,
      activeEngine: null,
      token: 0,
      rulesVersion: 0,
      kokoroFailed: false,
      userScrollAt: 0,
      wordRange: null,
      sleepTimer: null,
      sleepSetting: '0',
      stopAfterBlock: -1,
      rsvp: null,
      summaryK: 5,
      summaryIdx: [],
      chunkStarted: 0,
      cleanups: [],
    }
    R = s

    const web = HL.engines.WebEngine()
    const kokoro = HL.engines.KokoroEngine({
      onMedia: (action) => {
        if (action === 'play') play()
        else if (action === 'pause') pause()
        else if (action === 'next') jump(s.idx + 1)
        else if (action === 'prev') jump(s.idx - 1)
      },
    })

    // ---- highlight css (adopted stylesheet: immune to page CSP) -----------
    const sheet = new CSSStyleSheet()
    function applyHighlightCss() {
      const a = s.settings.accent
      const mode = s.settings.highlight
      const sentence = mode === 'sentence' || mode === 'sentence-word'
      let css = ''
      if (sentence) css += `::highlight(hl-sentence){background-color:color-mix(in srgb, ${a} 20%, transparent);}`
      if (mode === 'pill') css += `::highlight(hl-word){color:${a};}`
      if (mode === 'underline') css += `::highlight(hl-word){text-decoration:underline 2px ${a};text-underline-offset:3px;}`
      if (mode === 'sentence-word') css += `::highlight(hl-word){background-color:color-mix(in srgb, ${a} 40%, transparent);}`
      try { sheet.replaceSync(css) } catch (e) { /* ignore */ }
    }
    try { document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet] } catch (e) { /* ignore */ }
    applyHighlightCss()

    // ---- scan -------------------------------------------------------------
    function scan() {
      s.blocks = HL.extract.extractBlocks(s.settings)
      s.all = HL.extract.buildChunks(s.blocks)
      s.chunks = s.all
      s.elToBlock = new Map(s.blocks.map((b) => [b.el, b.id]))
      s.lang = HL.lang.detectLang({
        htmlLang: document.documentElement.lang,
        sample: HL.extract.sampleText(s.blocks),
        navLang: navigator.language,
      })
      s.rulesVersion++
    }

    function spokenFor(c) {
      if (!c.tf || c.tfv !== s.rulesVersion) {
        c.tf = HL.text.transform(c.text, HL.text.buildRules(s.settings))
        c.tfv = s.rulesVersion
      }
      return c.tf
    }

    // ---- voices -------------------------------------------------------------
    const baseLang = HL.lang.baseLang
    function kokoroUsable() {
      return s.settings.kokoro.installed && HL.kokoroVoices.supports(s.lang) && !s.kokoroFailed
    }

    function resolveVoice() {
      const saved = s.settings.voices[baseLang(s.lang)]
      if (saved && saved.engine === 'kokoro' && kokoroUsable()) return { engine: 'kokoro', id: saved.id }
      if (saved && saved.engine === 'web') {
        const v = HL.voices.pickVoice(s.webVoices, { saved, lang: s.lang })
        if (v) return { engine: 'web', voice: v, saved: true }
      }
      // Default to HQ only when the device can keep up (speed test), otherwise stay on system voices.
      const slow = s.settings.kokoro.rtf != null && s.settings.kokoro.rtf > 1.1
      if (!saved && kokoroUsable() && !slow) return { engine: 'kokoro', id: HL.kokoroVoices.defaultFor(s.lang) }
      return { engine: 'web', voice: HL.voices.pickVoice(s.webVoices, { lang: s.lang }) }
    }

    function voiceLabel(rv) {
      if (rv.engine === 'kokoro') {
        const v = HL.kokoroVoices.VOICES.find((x) => x.id === rv.id)
        return v ? v.name : 'HQ'
      }
      if (!rv.voice) return 'No voice'
      return rv.voice.name.replace(/^(Microsoft|Google)\s+/i, '').replace(/\s*\(.*?\)/g, '').replace(/\s+-\s+.*$/, '').replace(/\s+Online$/i, '') || 'Voice'
    }

    function refreshVoiceLabel() { ui.setVoiceLabel(voiceLabel(resolveVoice())) }

    // ---- highlighting ---------------------------------------------------------
    const mode = () => s.settings.highlight
    const hl = CSS.highlights

    function clearHighlights() {
      if (hl) { hl.delete('hl-sentence'); hl.delete('hl-word') }
      ui.moveMarker(null)
      s.wordRange = null
    }

    function follow(range) {
      if (!s.settings.autoScroll || Date.now() - s.userScrollAt < 3500) return
      const rect = range.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.top >= vh * 0.12 && rect.bottom <= vh * 0.78) return
      const behavior = reducedMotion() ? 'auto' : 'smooth'
      const scroller = document.scrollingElement
      if (scroller && scroller.scrollHeight > vh + 2) {
        window.scrollTo({ top: window.scrollY + rect.top - vh * 0.35, behavior })
      } else {
        const el = range.startContainer.parentElement
        if (el) el.scrollIntoView({ block: 'center', behavior })
      }
    }

    function showSentence(c) {
      clearHighlights()
      const block = s.blocks[c.b]
      const range = block && HL.extract.rangeFor(block, c.start, c.end)
      if (!range) return
      if (hl && (mode() === 'sentence' || mode() === 'sentence-word')) hl.set('hl-sentence', new Highlight(range))
      follow(range)
    }

    function showWord(c, origIdx) {
      const block = s.blocks[c.b]
      if (!block) return
      const w = HL.text.wordAt(c.text, Math.min(origIdx, Math.max(0, c.text.length - 1)))
      const range = HL.extract.rangeFor(block, c.start + w.start, c.start + Math.max(w.end, w.start + 1))
      if (!range) return
      s.wordRange = range
      if (hl) hl.set('hl-word', new Highlight(range))
      updateMarker()
      const rect = range.getBoundingClientRect()
      if (rect.top < 0 || rect.bottom > window.innerHeight) follow(range)
    }

    function updateMarker() {
      if (!s.wordRange || mode() !== 'pill') { ui.moveMarker(null); return }
      const r = s.wordRange.getClientRects()[0]
      ui.moveMarker(r && r.width > 0 ? r : null)
    }

    // ---- playback ---------------------------------------------------------------
    function engineFor(rv) { return rv.engine === 'kokoro' ? kokoro : web }

    function setStatus(st) {
      s.status = st
      ui.setPlaying(st === 'playing')
      if (st !== 'playing') ui.setBusy(false)
    }

    function savePosition() {
      if (s.chunks !== s.all || s.idx < 1) return
      clearTimeout(savePosition.t)
      savePosition.t = setTimeout(() => {
        store(POS_KEY, {}, (map) => {
          map[pageKey()] = { idx: s.idx, total: s.all.length, ts: Date.now() }
          const keys = Object.keys(map)
          if (keys.length > 50) {
            keys.sort((a, b) => map[a].ts - map[b].ts).slice(0, keys.length - 50).forEach((k) => delete map[k])
          }
          return map
        })
      }, 1200)
    }

    function recordStats(c) {
      const words = (c.text.match(/\S+/g) || []).length
      const seconds = Math.max(0, (Date.now() - s.chunkStarted) / 1000)
      store('stats', { words: 0, seconds: 0 }, (st) => ({ words: (st.words || 0) + words, seconds: (st.seconds || 0) + Math.min(seconds, 120) }))
    }

    function speakCurrent() {
      const c = s.chunks[s.idx]
      if (!c) { finish(); return }
      const block = s.blocks[c.b]
      const seg = block && block.segs.find((x) => x.node)
      if (seg && !seg.node.isConnected) { rescan(true); return }

      const spoken = spokenFor(c)
      if (!/[\p{L}\p{N}]/u.test(spoken.text)) { s.idx++; speakCurrent(); return }

      const rv = resolveVoice()
      const engine = engineFor(rv)
      if (s.activeEngine && s.activeEngine !== engine) s.activeEngine.cancel()
      s.activeEngine = engine

      const myToken = ++s.token
      s.engineActive = true
      s.chunkStarted = Date.now()
      showSentence(c)
      ui.setProgress({ idx: s.idx, total: s.chunks.length })
      savePosition()

      const guard = (fn) => (...a) => { if (myToken === s.token && R === s) fn(...a) }
      engine.speak(spoken.text, { voice: rv.engine === 'kokoro' ? rv.id : rv.voice, rate: s.settings.rate, lang: s.lang, title: document.title }, {
        onStatus: guard((st) => ui.setBusy(st === 'loading')),
        onWord: guard((i) => { ui.setBusy(false); showWord(c, spoken.toOriginal(i)) }),
        onEnd: guard(() => {
          s.engineActive = false
          recordStats(c)
          const next = s.chunks[s.idx + 1]
          if (s.stopAfterBlock >= 0 && (!next || next.b !== s.stopAfterBlock)) {
            s.stopAfterBlock = -1
            s.idx++
            setStatus('paused')
            ui.toast('Sleep timer: stopped after this paragraph')
            return
          }
          s.idx++
          if (s.idx >= s.chunks.length) finish()
          else speakCurrent()
        }),
        onError: guard((err) => onSpeechError(err, rv)),
      })

      if (rv.engine === 'kokoro') {
        const upcoming = []
        for (let k = 1; k <= 2; k++) {
          const n = s.chunks[s.idx + k]
          if (n) upcoming.push(spokenFor(n).text)
        }
        kokoro.prefetch(upcoming, rv.id)
      }
    }

    function onSpeechError(err, rv) {
      s.engineActive = false
      setStatus('paused')
      if (rv.engine === 'kokoro') {
        s.kokoroFailed = true
        refreshVoiceLabel()
        ui.toast('HQ voice unavailable — switched to a system voice. Press play to continue.', 4500)
        return
      }
      if (err === 'not-allowed') ui.toast('Your browser needs a click first — press play.', 4000)
      else ui.toast(`Speech error: ${err}`, 3500)
    }

    async function play() {
      if (!s.chunks.length) { ui.toast('Nothing readable found on this page.'); return }
      if (s.status === 'playing') return
      chrome.runtime.sendMessage({ type: 'reading-started' }).catch(() => {})
      const wasPaused = s.status === 'paused'
      setStatus('playing')
      if (wasPaused && s.engineActive && s.activeEngine) s.activeEngine.resume()
      else speakCurrent()
    }

    function pause() {
      if (s.status !== 'playing') return
      setStatus('paused')
      if (s.activeEngine) s.activeEngine.pause()
    }

    const toggle = () => (s.status === 'playing' ? pause() : play())

    function jump(i, { play: autoplay = s.status === 'playing' } = {}) {
      const n = s.chunks.length
      if (!n) return
      if (s.activeEngine) s.activeEngine.cancel()
      s.token++
      s.engineActive = false
      s.idx = Math.max(0, Math.min(n - 1, i))
      if (autoplay) { setStatus('playing'); speakCurrent() }
      else {
        if (s.status === 'idle') setStatus('paused')
        showSentence(s.chunks[s.idx])
        ui.setProgress({ idx: s.idx, total: n })
        savePosition()
      }
    }

    function paraJump(dir) {
      const cur = s.chunks[s.idx]
      if (!cur) return
      if (dir > 0) {
        const i = s.chunks.findIndex((c, k) => k > s.idx && c.b !== cur.b)
        jump(i < 0 ? s.chunks.length - 1 : i)
      } else {
        let start = s.idx
        while (start > 0 && s.chunks[start - 1].b === cur.b) start--
        if (start < s.idx) jump(start)
        else {
          let k = start - 1
          if (k < 0) return jump(0)
          const b = s.chunks[k].b
          while (k > 0 && s.chunks[k - 1].b === b) k--
          jump(k)
        }
      }
    }

    function finish() {
      s.token++
      s.engineActive = false
      if (s.activeEngine) s.activeEngine.cancel()
      clearHighlights()
      const wasSubset = s.chunks !== s.all
      if (wasSubset) restoreAll()
      s.idx = 0
      setStatus('idle')
      ui.setProgress({ idx: 0, total: s.chunks.length })
      store(POS_KEY, {}, (map) => { delete map[pageKey()]; return map })
      ui.toast('Finished')
    }

    function restoreAll() {
      s.chunks = s.all
      s.stopAfterBlock = -1
    }

    function rescan(keepPlaying) {
      const text = s.chunks[s.idx] && s.chunks[s.idx].text
      const wasPlaying = keepPlaying || s.status === 'playing'
      if (s.activeEngine) s.activeEngine.cancel()
      s.token++
      clearHighlights()
      scan()
      const found = text ? s.chunks.findIndex((c) => c.text === text) : -1
      s.idx = found >= 0 ? found : Math.min(s.idx, Math.max(0, s.chunks.length - 1))
      ui.setProgress({ idx: s.idx, total: s.chunks.length })
      refreshVoiceLabel()
      if (wasPlaying && s.chunks.length) { setStatus('playing'); speakCurrent() }
      else ui.toast(`Found ${s.chunks.length} sentences`)
    }

    // ---- selection ---------------------------------------------------------------
    async function readSelection() {
      const sel = window.getSelection()
      const text = sel ? sel.toString().trim() : ''
      if (!sel || sel.isCollapsed || !text) { ui.toast('Select some text first.'); return }
      const sr = sel.getRangeAt(0)
      const blockIds = new Set()
      for (const b of s.blocks) if (b.segs.some((x) => x.node && sr.intersectsNode(x.node))) blockIds.add(b.id)
      let picked = s.all.filter((c) => {
        if (!blockIds.has(c.b)) return false
        const r = HL.extract.rangeFor(s.blocks[c.b], c.start, c.end)
        return !!r && sr.compareBoundaryPoints(Range.END_TO_START, r) < 0 && sr.compareBoundaryPoints(Range.START_TO_END, r) > 0
      })
      if (!picked.length) {
        // Selection is in an area we normally skip: read the raw text without highlighting.
        const block = { id: s.blocks.length, el: null, text, segs: [] }
        s.blocks.push(block)
        picked = HL.text.splitSentences(text).flatMap((r) => HL.text.splitLong(text, r)).map((r, i) => ({ i, b: block.id, start: r.start, end: r.end, text: text.slice(r.start, r.end) }))
      }
      if (s.activeEngine) s.activeEngine.cancel()
      s.token++
      s.chunks = picked
      s.idx = 0
      setStatus('idle')
      ui.setProgress({ idx: 0, total: picked.length })
      ui.toast(`Reading selection (${picked.length} sentence${picked.length === 1 ? '' : 's'})`)
      play()
    }

    // ---- voices / rate ------------------------------------------------------------
    function applyRate() {
      ui.setRate(s.settings.rate)
      if (s.activeEngine && s.engineActive) s.activeEngine.setRate(s.settings.rate)
    }

    function setRate(rate) {
      rate = Math.max(0.5, Math.min(4, Math.round(rate * 100) / 100))
      s.settings.rate = rate
      HL.settings.save({ rate })
      applyRate()
    }

    function pickVoiceEntry(entry) {
      const saved = entry.engine === 'kokoro' ? { engine: 'kokoro', id: entry.id } : HL.voices.serialize(entry.voice)
      s.settings.voices[baseLang(s.lang)] = saved
      HL.settings.save({ voices: { [baseLang(s.lang)]: saved } })
      refreshVoiceLabel()
      // Selecting a voice plays the current sentence with it.
      if (s.chunks.length) { s.status = 'idle'; jump(s.idx, { play: true }) }
    }

    function voiceModel() {
      const rv = resolveVoice()
      const pref = String(s.lang).toLowerCase() === 'en-gb' ? 'en-GB' : 'en-US'
      const catalog = HL.kokoroVoices.VOICES.slice().sort((a, b) => (b.lang === pref) - (a.lang === pref))
      return {
        lang: s.lang,
        kokoroSupported: HL.kokoroVoices.supports(s.lang),
        kokoroInstalled: s.settings.kokoro.installed && !s.kokoroFailed,
        kokoroSlow: s.settings.kokoro.rtf != null && s.settings.kokoro.rtf > 1.1,
        kokoro: catalog,
        web: HL.voices.groupVoices(s.webVoices, s.lang),
        current: rv.engine === 'kokoro' ? { engine: 'kokoro', id: rv.id } : { engine: 'web', uri: rv.voice && rv.voice.voiceURI },
      }
    }

    // ---- summary / rsvp / misc ----------------------------------------------------------
    function showSummary(k = s.summaryK) {
      s.summaryK = k
      s.summaryIdx = HL.summarize.summarize(s.all.map((c) => c.text), { k, title: document.title })
      ui.showSummary({
        items: s.summaryIdx.map((i) => ({ chunk: i, text: s.all[i].text })),
        k,
        onPick: (i) => { if (s.chunks !== s.all) restoreAll(); jump(i, { play: s.status === 'playing' }) },
        onRead: () => {
          if (!s.summaryIdx.length) return
          if (s.activeEngine) s.activeEngine.cancel()
          s.token++
          s.chunks = s.summaryIdx.map((i) => s.all[i])
          s.idx = 0
          setStatus('idle')
          play()
        },
        onK: (n) => showSummary(n),
        onClose: () => ui.closeSummary(),
      })
    }

    function startRsvp() {
      if (!s.chunks.length) return
      pause()
      ui.hide(true)
      const words = []
      for (let i = s.idx; i < s.chunks.length && words.length < 200000; i++) {
        const parts = s.chunks[i].text.split(/\s+/).filter(Boolean)
        const last = !s.chunks[i + 1] || s.chunks[i + 1].b !== s.chunks[i].b
        parts.forEach((w, k) => words.push({ w, chunk: i, endOfBlock: last && k === parts.length - 1 }))
      }
      s.rsvp = HL.rsvp.open({
        words,
        wpm: s.settings.rsvpWpm,
        onWpm: (wpm) => { s.settings.rsvpWpm = wpm; HL.settings.save({ rsvpWpm: wpm }) },
        onClose: (chunkIdx) => {
          s.rsvp = null
          ui.hide(false)
          jump(chunkIdx, { play: false })
        },
      })
    }

    function setSleep(v) {
      clearTimeout(s.sleepTimer)
      s.sleepSetting = v
      s.stopAfterBlock = -1
      if (v === 'end') {
        const c = s.chunks[s.idx]
        s.stopAfterBlock = c ? c.b : -1
        ui.toast('Will stop after this paragraph')
      } else if (+v > 0) {
        s.sleepTimer = setTimeout(() => { pause(); s.sleepSetting = '0'; ui.toast('Sleep timer: paused') }, +v * 60000)
        ui.toast(`Sleep timer: ${v} min`)
      } else ui.toast('Sleep timer off')
    }

    async function bookmark() {
      const c = s.chunks[s.idx]
      if (!c) return
      await store('bookmarks', [], (list) => {
        list.unshift({ url: location.href, title: document.title, text: c.text.slice(0, 400), ts: Date.now() })
        return list.slice(0, 200)
      })
      ui.toast('Bookmarked')
    }

    async function exportAudio() {
      const rv = resolveVoice()
      if (rv.engine !== 'kokoro') { ui.toast('Pick an HQ voice first (Voice menu).'); return }
      const texts = s.chunks.map((c) => spokenFor(c).text).filter((t) => /[\p{L}\p{N}]/u.test(t))
      if (!texts.length) return
      if (texts.length > 1500) { ui.toast('Page is too long to export in one go.'); return }
      try {
        const port = await kokoro.exportAudio(texts, rv.id, document.title)
        const onMsg = (m) => {
          if (m.t === 'export-progress') ui.toast(`Creating audio… ${m.done} / ${m.total}`, 4000)
          else if (m.t === 'export-done') { ui.toast('Audio saved to your downloads.'); port.onMessage.removeListener(onMsg) }
          else if (m.t === 'export-error') { ui.toast(`Export failed: ${m.message}`, 5000); port.onMessage.removeListener(onMsg) }
        }
        port.onMessage.addListener(onMsg)
      } catch (e) {
        ui.toast('Export failed.')
      }
    }

    function setSetting(patch) {
      Object.assign(s.settings, patch)
      HL.settings.save(patch)
      onSettingsApplied()
    }

    function onSettingsApplied() {
      HL.host.applyAppearance(s.settings)
      applyHighlightCss()
      s.rulesVersion++
      const c = s.chunks[s.idx]
      if (c && s.status !== 'idle') { clearHighlights(); showSentence(c); if (s.wordRange) updateMarker() }
    }

    // ---- ui wiring -----------------------------------------------------------------------
    const ui = HL.player.create({
      action(name, arg) {
        switch (name) {
          case 'toggle': return toggle()
          case 'prev': return jump(s.idx - 1)
          case 'next': return jump(s.idx + 1)
          case 'prevPara': return paraJump(-1)
          case 'nextPara': return paraJump(1)
          case 'seekFraction': return jump(Math.round(arg * (s.chunks.length - 1)))
          case 'setRate': return setRate(arg)
          case 'pickVoice': return pickVoiceEntry(arg)
          case 'installVoices': return chrome.runtime.sendMessage({ type: 'open-options', hash: 'voices' })
          case 'setSetting': return setSetting(arg)
          case 'summary': return showSummary()
          case 'rsvp': return startRsvp()
          case 'bookmark': return bookmark()
          case 'export': return exportAudio()
          case 'rescan': return rescan(false)
          case 'sleep': return setSleep(arg)
          case 'settings': return chrome.runtime.sendMessage({ type: 'open-options' })
          case 'savePos': s.settings.playerPos = arg; return HL.settings.save({ playerPos: arg })
          case 'playFromBlock': {
            const i = s.chunks.findIndex((c) => c.b === arg)
            if (i >= 0) jump(i, { play: true })
            return
          }
          case 'close': return close()
        }
      },
      voiceModel,
      menuState: () => ({
        highlight: s.settings.highlight,
        theme: s.settings.theme,
        autoScroll: s.settings.autoScroll,
        sleep: s.sleepSetting,
        kokoroInstalled: s.settings.kokoro.installed && HL.kokoroVoices.supports(s.lang),
      }),
    }, () => s.settings)

    // ---- page listeners --------------------------------------------------------------------
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts)
      s.cleanups.push(() => target.removeEventListener(type, fn, opts))
    }

    const markScroll = () => { s.userScrollAt = Date.now() }
    on(window, 'wheel', markScroll, { passive: true })
    on(window, 'touchmove', markScroll, { passive: true })
    on(window, 'keydown', (e) => { if (['PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) markScroll() }, { passive: true })
    let scrollRaf = 0
    on(window, 'scroll', () => {
      ui.hideHover()
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; updateMarker() })
    }, { passive: true })
    on(window, 'resize', updateMarker, { passive: true })

    let moveRaf = 0
    on(document, 'mousemove', (e) => {
      if (moveRaf || s.rsvp) return
      moveRaf = requestAnimationFrame(() => {
        moveRaf = 0
        if (ui.isOverUi(e)) return
        let el = e.target instanceof Element ? e.target : null
        for (let d = 0; el && d < 14; d++, el = el.parentElement) {
          const id = s.elToBlock.get(el)
          if (id !== undefined) {
            const rect = el.getBoundingClientRect()
            if (rect.bottom > 0 && rect.top < window.innerHeight && s.chunks.some((c) => c.b === id)) return ui.showHover(rect, id)
            break
          }
        }
        ui.hideHover()
      })
    }, { passive: true })

    on(document, 'click', (e) => {
      if (!e.altKey || ui.isOverUi(e) || s.rsvp) return
      let node = null
      let offset = 0
      if (document.caretPositionFromPoint) {
        const p = document.caretPositionFromPoint(e.clientX, e.clientY)
        if (p) { node = p.offsetNode; offset = p.offset }
      } else if (document.caretRangeFromPoint) {
        const r = document.caretRangeFromPoint(e.clientX, e.clientY)
        if (r) { node = r.startContainer; offset = r.startOffset }
      }
      const c = node && HL.extract.chunkAt(s.blocks, s.chunks, node, offset)
      if (!c) return
      e.preventDefault()
      e.stopPropagation()
      jump(s.chunks.indexOf(c), { play: true })
    }, true)

    on(document, 'keydown', (e) => {
      if (s.rsvp) return
      const path = e.composedPath()
      const t = path[0]
      const inUi = path.includes(HL.host.get().host)
      if (e.key === 'Escape') {
        if (ui.hasPopup()) ui.closePopup()
        else if (ui.hasSummary()) ui.closeSummary()
        else close()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (!(inUi || t === document.body || t === document.documentElement)) return
      const onButton = t && /^(BUTTON|A|SUMMARY)$/.test(t.tagName)
      const stop = () => { e.preventDefault(); e.stopPropagation() }
      if (e.key === ' ' && !onButton) { stop(); toggle() }
      else if (e.key === 'ArrowRight') { stop(); e.shiftKey ? paraJump(1) : jump(s.idx + 1) }
      else if (e.key === 'ArrowLeft') { stop(); e.shiftKey ? paraJump(-1) : jump(s.idx - 1) }
      else if (e.key === '+' || e.key === '=') { stop(); setRate(s.settings.rate + 0.25); ui.toast(`Speed ${s.settings.rate}×`, 1200) }
      else if (e.key === '-' || e.key === '_') { stop(); setRate(s.settings.rate - 0.25); ui.toast(`Speed ${s.settings.rate}×`, 1200) }
    }, true)

    on(window, 'pagehide', () => { if (s.activeEngine) s.activeEngine.cancel() })

    s.cleanups.push(HL.settings.subscribe((next) => {
      const old = s.settings
      s.settings = next
      const lb = baseLang(s.lang)
      onSettingsApplied()
      if (next.rate !== old.rate) applyRate()
      if (JSON.stringify(next.voices[lb]) !== JSON.stringify(old.voices[lb]) || next.kokoro.installed !== old.kokoro.installed) {
        refreshVoiceLabel()
        if (s.status === 'playing') jump(s.idx, { play: true })
      }
    }))

    const voiceListener = () => { s.webVoices = speechSynthesis.getVoices(); refreshVoiceLabel() }
    try {
      speechSynthesis.addEventListener('voiceschanged', voiceListener)
      s.cleanups.push(() => speechSynthesis.removeEventListener('voiceschanged', voiceListener))
    } catch (e) { /* no speech synthesis */ }

    // ---- close ----------------------------------------------------------------------------------
    function close() {
      if (R !== s) return
      R = null
      s.token++
      clearTimeout(s.sleepTimer)
      clearTimeout(savePosition.t)
      if (s.status !== 'idle' && s.chunks === s.all && s.idx > 0) {
        store(POS_KEY, {}, (map) => { map[pageKey()] = { idx: s.idx, total: s.all.length, ts: Date.now() }; return map })
      }
      web.cancel()
      kokoro.cancel()
      if (s.rsvp) s.rsvp.close()
      clearHighlights()
      s.cleanups.forEach((fn) => { try { fn() } catch (e) { /* ignore */ } })
      try { document.adoptedStyleSheets = document.adoptedStyleSheets.filter((x) => x !== sheet) } catch (e) { /* ignore */ }
      ui.destroy()
      HL.host.destroy()
    }

    // ---- start ------------------------------------------------------------------------------------
    scan()
    ui.setRate(s.settings.rate)
    ui.setProgress({ idx: 0, total: s.chunks.length })
    ui.setPosition(s.settings.playerPos)
    s.webVoices = await HL.voices.loadVoices()
    refreshVoiceLabel()
    if (!s.chunks.length) ui.toast('Nothing readable found on this page. Try selecting text instead.', 4500)

    const api = { play, pause, toggle, close, readSelection, status: () => s.status, isOpen: () => R === s }
    s.api = api

    if (selection) await readSelection()
    else if (autoplay) {
      let saved = null
      try { saved = ((await chrome.storage.local.get(POS_KEY))[POS_KEY] || {})[pageKey()] } catch (e) { /* ignore */ }
      const canSpeakNow = resolveVoice().engine === 'kokoro' || (navigator.userActivation && navigator.userActivation.hasBeenActive) || !navigator.userActivation
      if (saved && saved.idx > 2 && saved.idx < s.all.length - 2 && Math.abs(saved.total - s.all.length) <= Math.max(5, saved.total * 0.1)) {
        ui.showBanner(`Resume from sentence ${saved.idx + 1} of ${s.all.length}?`, [['Resume', () => jump(saved.idx, { play: true })], ['Dismiss', () => {}]])
      }
      if (canSpeakNow) play()
      else ui.toast('Press play to start (the browser needs a click on the page first).', 5000)
    }
    return api
  }

  const api = {
    open,
    isOpen: () => !!R,
    current: () => (R ? R.api : null),
    close: () => { if (R && R.api) R.api.close() },
  }
  HL.reader = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
