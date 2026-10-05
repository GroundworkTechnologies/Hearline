// Hearline background worker: on-demand injection, shortcuts, context menu, offscreen audio host.

const CONTENT_FILES = [
  'shared/settings.js',
  'shared/text.js',
  'shared/lang.js',
  'shared/voices.js',
  'shared/kokoro-voices.js',
  'content/extract.js',
  'content/engines.js',
  'content/summarize.js',
  'content/host.js',
  'content/rsvp.js',
  'content/player.js',
  'content/reader.js',
  'content/index.js',
]

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'hl-selection', title: 'Read selection with Hearline', contexts: ['selection'] })
    chrome.contextMenus.create({ id: 'hl-page', title: 'Read this page with Hearline', contexts: ['page'] })
  })
}

chrome.runtime.onInstalled.addListener((details) => {
  createMenus()
  if (details.reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#welcome') })
})

async function ensureContent(tabId) {
  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: 'ping' })
    if (res && res.ok) return
  } catch (e) {
    // not injected yet
  }
  await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES })
}

async function run(tabId, type) {
  try {
    await ensureContent(tabId)
    const res = await chrome.tabs.sendMessage(tabId, { type })
    return { ok: true, res }
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) }
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab || tab.id == null) return
  if (command === 'toggle-hearline') run(tab.id, 'toggle')
  else if (command === 'read-selection') run(tab.id, 'readSelection')
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || tab.id == null) return
  if (info.menuItemId === 'hl-selection') run(tab.id, 'readSelection')
  else if (info.menuItemId === 'hl-page') run(tab.id, 'readPage')
})

let offscreenPromise = null
async function ensureOffscreen() {
  const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })
  if (existing.length) return
  if (!offscreenPromise) {
    offscreenPromise = chrome.offscreen
      .createDocument({
        url: 'offscreen/offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play speech audio generated on-device by the optional HQ voices.',
      })
      .finally(() => { offscreenPromise = null })
  }
  await offscreenPromise
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return false
  if (msg.type === 'ensure-offscreen') {
    ensureOffscreen().then(() => sendResponse({ ok: true }), (e) => sendResponse({ ok: false, error: String(e) }))
    return true
  }
  if (msg.type === 'run') {
    run(msg.tabId, msg.action).then(sendResponse)
    return true
  }
  if (msg.type === 'open-options') {
    const url = chrome.runtime.getURL('options/options.html') + (msg.hash ? '#' + msg.hash : '')
    chrome.tabs.create({ url })
    sendResponse({ ok: true })
    return false
  }
  if (msg.type === 'reading-started') {
    // Only one tab reads at a time.
    chrome.tabs.query({}).then((tabs) => {
      for (const t of tabs) {
        if (t.id != null && (!sender.tab || t.id !== sender.tab.id)) chrome.tabs.sendMessage(t.id, { type: 'pause-other' }).catch(() => {})
      }
    })
    sendResponse({ ok: true })
    return false
  }
  return false
})
