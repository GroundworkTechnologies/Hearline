(function (root) {
  const HL = root.__HL
  if (HL.loaded) return
  HL.loaded = true

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg && msg.type) {
      case 'ping':
        sendResponse({ ok: true, open: HL.reader.isOpen(), lang: document.documentElement.lang || '' })
        return false
      case 'toggle':
        if (HL.reader.isOpen()) { HL.reader.close(); sendResponse({ ok: true, open: false }) }
        else HL.reader.open({ autoplay: true }).then(() => sendResponse({ ok: true, open: true }))
        return true
      case 'readPage':
        HL.reader.open({ autoplay: true }).then(() => sendResponse({ ok: true }))
        return true
      case 'readSelection':
        HL.reader.open({ selection: true }).then(() => sendResponse({ ok: true }))
        return true
      case 'close':
        HL.reader.close()
        sendResponse({ ok: true })
        return false
      case 'pause-other': {
        const r = HL.reader.current()
        if (r) r.pause()
        sendResponse({ ok: true })
        return false
      }
    }
    return false
  })
})(typeof globalThis !== 'undefined' ? globalThis : this)
