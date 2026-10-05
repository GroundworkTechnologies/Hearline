(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const CSS = `
    .rsvp { position: fixed; inset: 0; pointer-events: auto; background: var(--bg); color: var(--fg);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; }
    .rsvp .x { position: absolute; top: 18px; right: 18px; width: 40px; height: 40px; border-radius: 50%; color: var(--muted); }
    .rsvp .x:hover { background: var(--soft); color: var(--fg); }
    .stage { width: min(900px, 92vw); display: grid; grid-template-columns: 1fr auto 1fr; align-items: baseline;
      font: 600 clamp(36px, 8vw, 72px)/1.2 Georgia, "Times New Roman", serif; position: relative; padding: 18px 0; }
    .stage::before, .stage::after { content: ""; position: absolute; left: 50%; width: 2px; height: 14px; background: var(--accent); opacity: .5; transform: translateX(-1px); }
    .stage::before { top: 0; } .stage::after { bottom: 0; }
    .l { text-align: right; white-space: pre; } .r { text-align: left; white-space: pre; } .p { color: var(--accent); }
    .info { color: var(--muted); font-size: 13px; }
    .scrub { width: min(640px, 86vw); accent-color: var(--accent); }
    .ctl { display: flex; align-items: center; gap: 10px; }
    .ctl button { min-width: 44px; height: 44px; border-radius: 22px; padding: 0 12px; background: var(--soft); color: var(--accent); font-weight: 600; }
    .ctl button:hover { background: color-mix(in srgb, var(--accent) 24%, transparent); }
    .ctl .big { width: 56px; height: 56px; border-radius: 50%; background: var(--accent); color: #fff; }
    .wpm { min-width: 84px; text-align: center; color: var(--fg); font-variant-numeric: tabular-nums; }
    .hint { color: var(--muted); font-size: 12px; }
  `
  let styled = false

  const ORP = (len) => (len <= 1 ? 0 : len <= 5 ? 1 : len <= 9 ? 2 : len <= 13 ? 3 : 4)

  function delayFor(word, wpm) {
    let d = 60000 / wpm
    const w = word.w
    if (w.length > 8) d *= 1.2
    if (/[,;:]["')\]]?$/.test(w)) d *= 1.6
    if (/[.!?…]["')\]]?$/.test(w)) d *= 2.3
    if (word.endOfBlock) d *= 1.6
    return d
  }

  /** words: [{ w, chunk, endOfBlock }] -> controller. */
  function open({ words, start = 0, wpm = 300, onWpm, onClose }) {
    const { root: shadow } = HL.host.get()
    if (!styled) { HL.host.addStyle(CSS); styled = true }
    let idx = Math.max(0, Math.min(start, words.length - 1))
    let playing = true
    let timer = null

    const el = document.createElement('div')
    el.className = 'rsvp'
    el.setAttribute('role', 'dialog')
    el.setAttribute('aria-modal', 'true')
    el.setAttribute('aria-label', 'Speed reading')
    el.innerHTML = `
      <button class="x" aria-label="Close speed reading" data-a="close">✕</button>
      <div class="stage" aria-live="off"><span class="l"></span><span class="p"></span><span class="r"></span></div>
      <div class="info"></div>
      <input class="scrub" type="range" min="0" aria-label="Position">
      <div class="ctl">
        <button data-a="back" aria-label="Back 10 words">−10</button>
        <button class="big" data-a="toggle" aria-label="Play or pause">❚❚</button>
        <button data-a="fwd" aria-label="Forward 10 words">+10</button>
        <button data-a="slower" aria-label="Slower">−</button>
        <span class="wpm"></span>
        <button data-a="faster" aria-label="Faster">+</button>
      </div>
      <div class="hint">Space play/pause · ←/→ words · ↑/↓ speed · Esc close</div>`
    shadow.appendChild(el)
    const $ = (s) => el.querySelector(s)
    const [l, p, r] = [$('.l'), $('.p'), $('.r')]
    const scrub = $('.scrub')
    scrub.max = String(words.length - 1)

    function render() {
      const w = words[idx].w
      const chars = [...w]
      const o = Math.min(ORP(chars.length), chars.length - 1)
      l.textContent = chars.slice(0, o).join('')
      p.textContent = chars[o] || ''
      r.textContent = chars.slice(o + 1).join('')
      $('.info').textContent = `${idx + 1} / ${words.length} words · about ${Math.max(1, Math.round((words.length - idx) / wpm))} min left`
      $('.wpm').textContent = `${wpm} wpm`
      scrub.value = String(idx)
      $('[data-a="toggle"]').textContent = playing ? '❚❚' : '▶'
    }

    function tick() {
      clearTimeout(timer)
      if (!playing) return
      timer = setTimeout(() => {
        if (idx >= words.length - 1) { playing = false; render(); return }
        idx++
        render()
        tick()
      }, delayFor(words[idx], wpm))
    }

    function go(i) { idx = Math.max(0, Math.min(words.length - 1, i)); render(); tick() }
    function setWpm(v) { wpm = Math.max(100, Math.min(1000, v)); onWpm && onWpm(wpm); render() }
    function toggle() { playing = !playing; render(); tick() }

    function close() {
      clearTimeout(timer)
      document.removeEventListener('keydown', onKey, true)
      el.remove()
      onClose && onClose(words[idx].chunk)
    }

    function onKey(e) {
      const k = e.key
      if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
      else if (k === ' ') { e.preventDefault(); e.stopPropagation(); toggle() }
      else if (k === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(idx - (e.shiftKey ? 10 : 1)) }
      else if (k === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(idx + (e.shiftKey ? 10 : 1)) }
      else if (k === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); setWpm(wpm + 25) }
      else if (k === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); setWpm(wpm - 25) }
    }

    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')
      if (!a) return
      const act = a.dataset.a
      if (act === 'close') close()
      else if (act === 'toggle') toggle()
      else if (act === 'back') go(idx - 10)
      else if (act === 'fwd') go(idx + 10)
      else if (act === 'slower') setWpm(wpm - 25)
      else if (act === 'faster') setWpm(wpm + 25)
    })
    scrub.addEventListener('input', () => go(parseInt(scrub.value, 10)))
    document.addEventListener('keydown', onKey, true)

    render()
    tick()
    $('[data-a="toggle"]').focus()
    return { close }
  }

  const api = { open, delayFor, ORP }
  HL.rsvp = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
