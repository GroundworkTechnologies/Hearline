(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const svg = (inner, fill) =>
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
  const I = {
    play: svg('<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>', true),
    pause: svg('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>', true),
    prev: svg('<path d="M6 5v14"/><path d="M19 5.5 9.5 12l9.5 6.5z" fill="currentColor"/>'),
    next: svg('<path d="M18 5v14"/><path d="M5 5.5 14.5 12 5 18.5z" fill="currentColor"/>'),
    prevPara: svg('<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>'),
    nextPara: svg('<path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/>'),
    voice: svg('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
    more: svg('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    grip: svg('<circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/>'),
  }

  const CSS = `
    .bar { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); width: min(760px, calc(100vw - 24px));
      background: var(--bg); color: var(--fg); border-radius: 18px; box-shadow: var(--shadow); border: 1px solid var(--line);
      pointer-events: auto; overflow: visible; }
    .bar.free { transform: none; bottom: auto; }
    .bar.hidden { display: none; }
    .progress { height: 8px; margin: 0 14px; position: relative; cursor: pointer; display: flex; align-items: center; }
    .progress::before { content: ""; position: absolute; left: 0; right: 0; height: 4px; border-radius: 2px; background: var(--line); }
    .fill { position: relative; height: 4px; border-radius: 2px; background: var(--accent); width: 0; transition: width .15s linear; }
    .row { display: flex; align-items: center; gap: 4px; padding: 8px 10px 10px; flex-wrap: wrap; justify-content: center; }
    .ib { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--fg); }
    .ib:hover { background: var(--soft); }
    .ib.primary { width: 48px; height: 48px; background: var(--accent); color: #fff; }
    .ib.primary:hover { background: color-mix(in srgb, var(--accent) 86%, #000); }
    .ib.primary.busy { animation: pulse 1s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .55; } }
    .grip { cursor: grab; color: var(--muted); width: 28px; touch-action: none; }
    .grip:active { cursor: grabbing; }
    .pill { height: 34px; padding: 0 12px; border-radius: 17px; background: var(--soft); color: var(--accent); font-weight: 600;
      display: inline-flex; align-items: center; gap: 6px; max-width: 170px; }
    .pill span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pill:hover { background: color-mix(in srgb, var(--accent) 24%, transparent); }
    .count { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; min-width: 64px; text-align: center; }
    .sp { flex: 1; min-width: 4px; }
    .pop { position: absolute; bottom: calc(100% + 10px); right: 8px; width: min(340px, calc(100vw - 32px)); max-height: min(60vh, 460px); overflow: auto;
      background: var(--bg); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); padding: 10px; pointer-events: auto; }
    .pop.below { bottom: auto; top: calc(100% + 10px); }
    .pop h4 { margin: 8px 6px 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .opt { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; border-radius: 10px; text-align: left; }
    .opt:hover { background: var(--soft); }
    .opt[aria-checked="true"] { background: var(--soft); color: var(--accent); font-weight: 600; }
    .opt .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tag { font-size: 11px; color: var(--muted); border: 1px solid var(--line); border-radius: 8px; padding: 0 6px; }
    .note { color: var(--muted); font-size: 12.5px; padding: 6px 10px; }
    .cta { display: block; width: 100%; background: var(--soft); color: var(--accent); border-radius: 10px; padding: 10px; font-weight: 600; text-align: left; margin-bottom: 6px; }
    .presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .presets button { flex: 1; min-width: 48px; height: 32px; border-radius: 16px; background: var(--soft); color: var(--accent); font-weight: 600; }
    .presets button[aria-pressed="true"] { background: var(--accent); color: #fff; }
    .speedval { font-size: 22px; font-weight: 700; text-align: center; margin: 4px 0 8px; font-variant-numeric: tabular-nums; }
    input[type=range] { width: 100%; accent-color: var(--accent); }
    .field { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 10px; }
    select { background: var(--bg); color: var(--fg); border: 1px solid var(--line); border-radius: 8px; padding: 4px 6px; font: inherit; }
    .toast { position: fixed; left: 50%; bottom: 100px; transform: translateX(-50%); background: var(--fg); color: var(--bg);
      padding: 8px 14px; border-radius: 10px; font-size: 13px; opacity: 0; transition: opacity .2s; max-width: min(520px, 90vw); pointer-events: none; text-align: center; }
    .toast.on { opacity: .95; }
    .banner { display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-bottom: 1px solid var(--line); font-size: 13px; flex-wrap: wrap; }
    .banner .sp { flex: 1; }
    .banner button { color: var(--accent); font-weight: 600; padding: 4px 8px; border-radius: 8px; }
    .banner button:hover { background: var(--soft); }
    .marker { position: fixed; left: 0; top: 0; background: var(--soft); border-radius: 100px; pointer-events: none; opacity: 0;
      transition: transform .1s cubic-bezier(.2,0,.2,1), width .1s, height .1s, opacity .2s; box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent); }
    .hover { position: fixed; width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: #fff; display: none;
      place-items: center; pointer-events: auto; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
    .hover svg { width: 18px; height: 18px; }
    .side { position: fixed; top: 16px; right: 16px; bottom: 100px; width: min(360px, calc(100vw - 32px)); background: var(--bg); color: var(--fg);
      border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow); display: flex; flex-direction: column; pointer-events: auto; }
    .side header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--line); font-weight: 700; }
    .side .list { overflow: auto; padding: 8px; flex: 1; }
    .side .item { display: block; width: 100%; text-align: left; padding: 10px; border-radius: 10px; line-height: 1.45; }
    .side .item:hover { background: var(--soft); }
    .side footer { padding: 10px 14px; border-top: 1px solid var(--line); display: flex; gap: 8px; align-items: center; }
    .side footer .cta { margin: 0; text-align: center; flex: 1; }
    @media (max-width: 520px) { .count, .grip { display: none; } .pill { max-width: 110px; } }
  `
  let styled = false

  const h = (tag, attrs = {}, html) => {
    const e = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
    if (html != null) e.innerHTML = html
    return e
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

  function create(handlers, getSettings) {
    const { root: shadow } = HL.host.get()
    if (!styled) { HL.host.addStyle(CSS); styled = true }
    let toastTimer = null
    let popKind = null

    const bar = h('div', { class: 'bar', role: 'toolbar', 'aria-label': 'Hearline reader' })
    bar.innerHTML = `
      <div class="banner" hidden></div>
      <div class="progress" role="slider" tabindex="0" aria-label="Reading position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="fill"></div></div>
      <div class="row">
        <button class="ib grip" aria-label="Drag player" title="Drag">${I.grip}</button>
        <button class="ib" data-a="prevPara" aria-label="Previous paragraph" title="Previous paragraph (Shift+←)">${I.prevPara}</button>
        <button class="ib" data-a="prev" aria-label="Previous sentence" title="Previous sentence (←)">${I.prev}</button>
        <button class="ib primary" data-a="toggle" aria-label="Play" title="Play / pause (Space)">${I.play}</button>
        <button class="ib" data-a="next" aria-label="Next sentence" title="Next sentence (→)">${I.next}</button>
        <button class="ib" data-a="nextPara" aria-label="Next paragraph" title="Next paragraph (Shift+→)">${I.nextPara}</button>
        <span class="count" aria-live="off">0 / 0</span>
        <span class="sp"></span>
        <button class="pill" data-a="speed" aria-haspopup="true" aria-label="Speed"><span class="speedlbl">1×</span></button>
        <button class="pill" data-a="voice" aria-haspopup="true" aria-label="Voice">${I.voice.replace('width="22" height="22"', 'width="16" height="16"')}<span class="vlabel">Voice</span></button>
        <button class="ib" data-a="menu" aria-haspopup="true" aria-label="More options" title="More">${I.more}</button>
        <button class="ib" data-a="close" aria-label="Close Hearline" title="Close (Esc)">${I.close}</button>
      </div>`
    shadow.appendChild(bar)

    const marker = h('div', { class: 'marker' })
    const hover = h('button', { class: 'hover', 'aria-label': 'Read from here', title: 'Read from here' }, I.play.replace('width="22" height="22"', 'width="18" height="18"'))
    const toast = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' })
    shadow.append(marker, hover, toast)

    const $ = (s) => bar.querySelector(s)
    const playBtn = $('[data-a="toggle"]')
    const progress = $('.progress')
    const banner = $('.banner')
    let hoverBlock = -1

    // ---- popovers --------------------------------------------------------
    function closePop() {
      const p = bar.querySelector('.pop')
      if (p) p.remove()
      popKind = null
    }

    function openPop(kind, build) {
      if (popKind === kind) { closePop(); return }
      closePop()
      const pop = h('div', { class: 'pop', role: 'dialog', 'aria-label': kind })
      build(pop)
      bar.appendChild(pop)
      if (bar.getBoundingClientRect().top < 360) pop.classList.add('below')
      popKind = kind
      const first = pop.querySelector('button,select,input')
      if (first) first.focus({ preventScroll: true })
    }

    function speedPop(pop) {
      const s = getSettings()
      pop.innerHTML = `<div class="speedval"></div><input type="range" min="0.5" max="4" step="0.05" aria-label="Speed">
        <div class="presets">${[0.75, 1, 1.25, 1.5, 2, 3].map((v) => `<button data-v="${v}">${v}×</button>`).join('')}</div>`
      const val = pop.querySelector('.speedval')
      const range = pop.querySelector('input')
      const sync = (v) => {
        val.textContent = `${(+v).toFixed(2).replace(/0$/, '')}×`
        range.value = v
        pop.querySelectorAll('.presets button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === +v)))
      }
      sync(s.rate)
      range.addEventListener('input', () => { sync(range.value); handlers.action('setRate', +range.value) })
      pop.querySelector('.presets').addEventListener('click', (e) => {
        const b = e.target.closest('button')
        if (b) { sync(+b.dataset.v); handlers.action('setRate', +b.dataset.v) }
      })
    }

    function voicePop(pop) {
      const m = handlers.voiceModel()
      const row = (label, tag, checked, onPick) => {
        const b = h('button', { class: 'opt', role: 'menuitemradio', 'aria-checked': String(!!checked) })
        b.innerHTML = `<span class="nm">${esc(label)}</span>${tag ? `<span class="tag">${esc(tag)}</span>` : ''}`
        b.addEventListener('click', () => { onPick(); closePop() })
        return b
      }
      if (m.kokoroSupported) {
        if (!m.kokoroInstalled) {
          const cta = h('button', { class: 'cta' }, 'Get free HQ voices (one-time ~90 MB, works offline)')
          cta.addEventListener('click', () => { closePop(); handlers.action('installVoices') })
          pop.appendChild(cta)
        } else {
          pop.appendChild(h('h4', {}, 'Hearline HQ · offline'))
          if (m.kokoroSlow) pop.appendChild(h('div', { class: 'note' }, 'Heads-up: the speed test found these voices slower than real time on this computer, so expect pauses.'))
          for (const v of m.kokoro) {
            pop.appendChild(row(`${v.name} (${v.lang === 'en-GB' ? 'UK' : 'US'}, ${v.gender === 'F' ? 'female' : 'male'})`, '', m.current.engine === 'kokoro' && m.current.id === v.id, () => handlers.action('pickVoice', { engine: 'kokoro', id: v.id })))
          }
        }
      }
      if (m.web.match.length) {
        pop.appendChild(h('h4', {}, `System voices · ${m.lang}`))
        for (const v of m.web.match) pop.appendChild(row(v.name, v.localService ? '' : 'online', m.current.engine === 'web' && m.current.uri === v.voiceURI, () => handlers.action('pickVoice', { engine: 'web', voice: v })))
      }
      if (m.web.other.length) {
        const det = h('details', {})
        det.innerHTML = '<summary class="note" style="cursor:pointer">Other languages</summary>'
        for (const v of m.web.other) det.appendChild(row(`${v.name} · ${v.lang}`, v.localService ? '' : 'online', m.current.engine === 'web' && m.current.uri === v.voiceURI, () => handlers.action('pickVoice', { engine: 'web', voice: v })))
        pop.appendChild(det)
      }
      if (!m.web.match.length && !m.web.other.length && !(m.kokoroSupported && m.kokoroInstalled)) {
        pop.appendChild(h('div', { class: 'note' }, 'No system voices found. On Ubuntu install speech-dispatcher and espeak-ng (sudo apt install speech-dispatcher espeak-ng) and restart Chrome, or install the free HQ voices.'))
      } else if (!m.web.match.length) {
        pop.appendChild(h('div', { class: 'note' }, `No system voice for “${m.lang}”.`))
      }
    }

    function menuPop(pop) {
      const st = handlers.menuState()
      const item = (label, act, arg) => {
        const b = h('button', { class: 'opt', role: 'menuitem' }, `<span class="nm">${esc(label)}</span>`)
        b.addEventListener('click', () => { closePop(); handlers.action(act, arg) })
        return b
      }
      const select = (label, key, options, value) => {
        const f = h('label', { class: 'field' }, `<span>${esc(label)}</span>`)
        const s = h('select', {})
        s.innerHTML = options.map(([v, t]) => `<option value="${v}"${String(v) === String(value) ? ' selected' : ''}>${esc(t)}</option>`).join('')
        s.addEventListener('change', () => handlers.action('setSetting', { [key]: s.value }))
        f.appendChild(s)
        return f
      }
      pop.appendChild(item('Summary of this page', 'summary'))
      pop.appendChild(item('Speed reading (one word at a time)', 'rsvp'))
      pop.appendChild(item('Bookmark this sentence', 'bookmark'))
      if (st.kokoroInstalled) pop.appendChild(item('Download page as audio (HQ voice)', 'export'))
      pop.appendChild(item('Rescan page', 'rescan'))
      pop.appendChild(h('h4', {}, 'Appearance'))
      pop.appendChild(select('Highlight', 'highlight', [['pill', 'Word pill'], ['underline', 'Word underline'], ['sentence', 'Sentence'], ['sentence-word', 'Sentence + word']], st.highlight))
      pop.appendChild(select('Theme', 'theme', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], st.theme))
      const f = h('label', { class: 'field' }, '<span>Follow with scroll</span>')
      const cb = h('input', { type: 'checkbox' })
      cb.checked = st.autoScroll
      cb.addEventListener('change', () => handlers.action('setSetting', { autoScroll: cb.checked }))
      f.appendChild(cb)
      pop.appendChild(f)
      pop.appendChild(h('h4', {}, 'Sleep timer'))
      const sleep = h('label', { class: 'field' }, '<span>Stop reading</span>')
      const ss = h('select', {})
      ss.innerHTML = [['0', 'Off'], ['15', 'In 15 min'], ['30', 'In 30 min'], ['60', 'In 60 min'], ['end', 'After this paragraph']].map(([v, t]) => `<option value="${v}"${v === String(st.sleep) ? ' selected' : ''}>${t}</option>`).join('')
      ss.addEventListener('change', () => handlers.action('sleep', ss.value))
      sleep.appendChild(ss)
      pop.appendChild(sleep)
      pop.appendChild(item('Settings…', 'settings'))
    }

    bar.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')
      if (!a) return
      const act = a.dataset.a
      if (act === 'speed') openPop('speed', speedPop)
      else if (act === 'voice') openPop('voice', voicePop)
      else if (act === 'menu') openPop('menu', menuPop)
      else { closePop(); handlers.action(act) }
    })

    shadow.addEventListener('pointerdown', (e) => {
      if (popKind && !e.composedPath().some((n) => n.classList && (n.classList.contains('pop') || (n.dataset && ['speed', 'voice', 'menu'].includes(n.dataset.a))))) closePop()
    })
    document.addEventListener('pointerdown', onDocPointer, true)
    function onDocPointer(e) {
      if (popKind && !e.composedPath().includes(bar)) closePop()
    }

    // ---- progress bar ----------------------------------------------------
    function seekFromPointer(e) {
      const r = progress.getBoundingClientRect()
      handlers.action('seekFraction', Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
    }
    progress.addEventListener('click', seekFromPointer)

    // ---- dragging --------------------------------------------------------
    const grip = $('.grip')
    let drag = null
    grip.addEventListener('pointerdown', (e) => {
      const r = bar.getBoundingClientRect()
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }
      grip.setPointerCapture(e.pointerId)
      e.preventDefault()
    })
    grip.addEventListener('pointermove', (e) => {
      if (!drag) return
      place(e.clientX - drag.dx, e.clientY - drag.dy)
    })
    grip.addEventListener('pointerup', () => {
      if (!drag) return
      drag = null
      const r = bar.getBoundingClientRect()
      handlers.action('savePos', { x: r.left, y: r.top })
    })
    function place(x, y) {
      const r = bar.getBoundingClientRect()
      bar.classList.add('free')
      bar.style.left = Math.max(4, Math.min(window.innerWidth - r.width - 4, x)) + 'px'
      bar.style.top = Math.max(4, Math.min(window.innerHeight - r.height - 4, y)) + 'px'
    }
    const onResize = () => {
      if (!bar.classList.contains('free')) return
      const r = bar.getBoundingClientRect()
      place(r.left, r.top)
    }
    window.addEventListener('resize', onResize)

    // ---- hover "read from here" ------------------------------------------
    hover.addEventListener('click', () => { if (hoverBlock >= 0) handlers.action('playFromBlock', hoverBlock) })

    // ---- public API ------------------------------------------------------
    const ui = {
      bar,
      setPlaying(p) {
        playBtn.innerHTML = p ? I.pause : I.play
        playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play')
      },
      setBusy(b) { playBtn.classList.toggle('busy', !!b) },
      setProgress({ idx, total }) {
        const pct = total > 1 ? (idx / (total - 1)) * 100 : 0
        bar.querySelector('.fill').style.width = pct + '%'
        progress.setAttribute('aria-valuenow', String(Math.round(pct)))
        $('.count').textContent = `${Math.min(idx + 1, total)} / ${total}`
      },
      setRate(rate) { $('.speedlbl').textContent = `${(+rate).toFixed(2).replace(/0$/, '').replace(/\.0$/, '')}×` },
      setVoiceLabel(t) { $('.vlabel').textContent = t },
      toast(msg, ms = 2600) {
        toast.textContent = msg
        toast.classList.add('on')
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => toast.classList.remove('on'), ms)
      },
      showBanner(html, buttons) {
        banner.innerHTML = `<span>${html}</span><span class="sp"></span>`
        for (const [label, fn] of buttons) {
          const b = h('button', {}, esc(label))
          b.addEventListener('click', () => { banner.hidden = true; fn() })
          banner.appendChild(b)
        }
        banner.hidden = false
      },
      hideBanner() { banner.hidden = true },
      moveMarker(rect) {
        if (!rect) { marker.style.opacity = '0'; return }
        const px = 6
        const py = 3
        marker.style.transform = `translate3d(${rect.left - px}px, ${rect.top - py}px, 0)`
        marker.style.width = rect.width + px * 2 + 'px'
        marker.style.height = rect.height + py * 2 + 'px'
        marker.style.opacity = '1'
      },
      showHover(rect, blockId) {
        hoverBlock = blockId
        hover.style.display = 'grid'
        hover.style.left = Math.max(4, rect.left - 40) + 'px'
        hover.style.top = Math.max(4, Math.min(window.innerHeight - 40, rect.top)) + 'px'
      },
      hideHover() { hoverBlock = -1; hover.style.display = 'none' },
      isOverUi(e) { return e.composedPath().includes(hover) || e.composedPath().includes(bar) },
      setPosition(pos) { if (pos) place(pos.x, pos.y) },
      showSummary({ items, k, onPick, onRead, onK, onClose }) {
        ui.closeSummary()
        const side = h('aside', { class: 'side', 'aria-label': 'Summary' })
        side.innerHTML = `<header><span style="flex:1">Summary</span>
          <select aria-label="Length">${[3, 5, 8].map((n) => `<option value="${n}"${n === k ? ' selected' : ''}>${n} sentences</option>`).join('')}</select>
          <button class="ib" aria-label="Close summary" style="width:32px;height:32px">${I.close}</button></header>
          <div class="list"></div><footer><button class="cta">Read summary aloud</button></footer>`
        const list = side.querySelector('.list')
        items.forEach(({ chunk, text }) => {
          const b = h('button', { class: 'item' }, esc(text))
          b.addEventListener('click', () => onPick(chunk))
          list.appendChild(b)
        })
        if (!items.length) list.innerHTML = '<div class="note">Not enough text to summarize.</div>'
        side.querySelector('select').addEventListener('change', (e) => onK(+e.target.value))
        side.querySelector('header button').addEventListener('click', onClose)
        side.querySelector('footer .cta').addEventListener('click', onRead)
        shadow.appendChild(side)
        ui._side = side
      },
      closeSummary() { if (ui._side) { ui._side.remove(); ui._side = null } },
      hasPopup() { return !!popKind },
      closePopup: closePop,
      hasSummary() { return !!ui._side },
      hide(hidden) { bar.classList.toggle('hidden', hidden) },
      destroy() {
        document.removeEventListener('pointerdown', onDocPointer, true)
        window.removeEventListener('resize', onResize)
        ui.closeSummary()
        bar.remove(); marker.remove(); hover.remove(); toast.remove()
      },
    }
    return ui
  }

  const api = { create }
  HL.player = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
