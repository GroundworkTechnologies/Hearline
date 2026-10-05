(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const BASE_CSS = `
    :host { all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;
      font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --accent: #0A7FFF; --bg: #ffffff; --fg: #14181f; --muted: #667085; --line: rgba(20,24,31,.12);
      --soft: color-mix(in srgb, var(--accent) 14%, transparent); --shadow: 0 8px 32px rgba(0,0,0,.18); }
    :host([data-theme="dark"]) { --bg: #1b1f27; --fg: #eef1f6; --muted: #a2abbb; --line: rgba(255,255,255,.14); --shadow: 0 8px 32px rgba(0,0,0,.5); }
    @media (prefers-color-scheme: dark) {
      :host([data-theme="auto"]) { --bg: #1b1f27; --fg: #eef1f6; --muted: #a2abbb; --line: rgba(255,255,255,.14); --shadow: 0 8px 32px rgba(0,0,0,.5); }
    }
    *, *::before, *::after { box-sizing: border-box; }
    button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; padding: 0; }
    button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    svg { display: block; }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
  `

  let host = null
  let shadow = null
  let extra = null

  function get() {
    if (host && host.isConnected) return { host, root: shadow }
    host = document.createElement('div')
    host.id = 'hearline-root'
    shadow = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = BASE_CSS
    shadow.appendChild(style)
    document.documentElement.appendChild(host)
    extra = null
    return { host, root: shadow }
  }

  function addStyle(css) {
    const { root: r } = get()
    const s = document.createElement('style')
    s.textContent = css
    r.appendChild(s)
  }

  function applyAppearance(settings) {
    const { host: h } = get()
    h.setAttribute('data-theme', settings.theme || 'auto')
    h.style.setProperty('--accent', settings.accent || '#0A7FFF')
  }

  function destroy() {
    if (host) host.remove()
    host = shadow = extra = null
  }

  const isOpen = () => !!(host && host.isConnected)

  const api = { get, addStyle, applyAppearance, destroy, isOpen }
  HL.host = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
