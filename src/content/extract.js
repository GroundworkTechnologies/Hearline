(function (root) {
  const HL = (root.__HL = root.__HL || {})

  const HARD_EXCLUDE =
    'script,style,noscript,template,svg,canvas,iframe,object,embed,select,option,textarea,input,button,' +
    'nav,footer,aside,form,[hidden],[aria-hidden="true"],[contenteditable="true"],[role="navigation"],' +
    '[role="contentinfo"],[role="complementary"],[role="search"],[role="menu"],[role="menubar"],[role="tablist"],' +
    '[role="button"],[role="dialog"],[aria-modal="true"],[id*="cookie" i],[class*="cookie" i],[id*="consent" i],' +
    '[class*="consent" i],[class*="gdpr" i],[class*="newsletter" i],#hearline-root'
  const CITATION = 'sup.reference,sup[id^="fnref"],[role="doc-noteref"],.mw-editsection,.reference'
  const CODE = 'pre,code,kbd,samp'

  const styleCache = new WeakMap()
  const displayOf = (el) => {
    let d = styleCache.get(el)
    if (d === undefined) {
      d = getComputedStyle(el).display
      styleCache.set(el, d)
    }
    return d
  }
  const isInline = (el) => /^(inline|inline-block|inline-flex|inline-grid|contents|ruby|none)/.test(displayOf(el)) && !/^(table|list-item)/.test(displayOf(el))

  function blockContainer(node, stop) {
    let el = node.parentElement
    while (el && el !== stop && isInline(el)) el = el.parentElement
    return el || node.parentElement
  }

  function visible(el) {
    try {
      return el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true, opacityProperty: true })
    } catch (e) {
      return el.offsetParent !== null || getComputedStyle(el).position === 'fixed'
    }
  }

  function findRoot() {
    const textLen = (el) => (el.innerText || '').length
    const mains = [...document.querySelectorAll('main,[role="main"]')].filter((m) => textLen(m) > 400)
    if (mains.length) return mains.sort((a, b) => textLen(b) - textLen(a))[0]
    const articles = [...document.querySelectorAll('article')].filter((a) => textLen(a) > 400)
    if (articles.length === 1) return articles[0]
    return document.body
  }

  function precededByBreak(node, container) {
    let n = node
    while (n && n !== container) {
      let p = n.previousSibling
      while (p && p.nodeType === 3 && !p.nodeValue.trim()) p = p.previousSibling
      if (p) return p.nodeName === 'BR'
      n = n.parentNode
    }
    return false
  }

  /** Read the page into blocks: { el, text, segs: [{ node, ns, bs, len }] }. */
  function extractBlocks(settings) {
    const skip = (settings && settings.skip) || {}
    const rootEl = findRoot()
    const titleH1 = rootEl === document.body ? null : [...document.querySelectorAll('h1')].find((h) => !rootEl.contains(h) && !h.closest('nav,footer,aside') && visible(h))
    const excludeSel = HARD_EXCLUDE + (skip.code ? ',' + CODE : '') + (skip.citations ? ',' + CITATION : '')
    const okCache = new WeakMap()
    const blocks = []
    const byEl = new Map()

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        if (!(rootEl.contains(node) || (titleH1 && titleH1.contains(node)))) return NodeFilter.FILTER_REJECT
        let ok = okCache.get(parent)
        if (ok === undefined) {
          ok = !parent.closest(excludeSel) && visible(parent)
          if (ok) {
            // Page chrome: <header> outside an article, except its headings.
            const header = parent.closest('header')
            if (header && !header.closest('article,main,[role="main"]') && !parent.closest('h1')) ok = false
          }
          okCache.set(parent, ok)
        }
        return ok ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })

    let node
    while ((node = walker.nextNode())) {
      const container = blockContainer(node, document.body)
      let block = byEl.get(container)
      if (!block) {
        block = { id: blocks.length, el: container, text: '', segs: [], links: 0 }
        byEl.set(container, block)
        blocks.push(block)
      }
      if (block.segs.length && precededByBreak(node, container)) {
        block.segs.push({ node: null, ns: 0, bs: block.text.length, len: 1 })
        block.text += ' '
      }
      const value = node.nodeValue
      block.segs.push({ node, ns: 0, bs: block.text.length, len: value.length })
      block.text += value
      if (node.parentElement.closest('a')) block.links += value.length
    }

    const menuLike = rootEl === document.body
    const kept = blocks.filter((b) => {
      const t = b.text.trim()
      if (!/[\p{L}\p{N}]/u.test(t)) return false
      if (menuLike && t.length < 80 && b.links / Math.max(1, b.text.length) > 0.9) return false
      return true
    })
    kept.forEach((b, i) => (b.id = i))
    return kept
  }

  /** Sentence chunks over all blocks: { i, b, start, end, text } (offsets into block.text). */
  function buildChunks(blocks) {
    const T = HL.text
    const chunks = []
    for (const block of blocks) {
      for (const sentence of T.splitSentences(block.text)) {
        for (const piece of T.splitLong(block.text, sentence)) {
          chunks.push({ i: chunks.length, b: block.id, start: piece.start, end: piece.end, text: block.text.slice(piece.start, piece.end) })
        }
      }
    }
    return chunks
  }

  /** DOM Range for [s, e) offsets of a block's text, or null when the nodes are gone. */
  function rangeFor(block, s, e) {
    if (!block || !block.segs) return null
    let startSeg = null
    let endSeg = null
    for (const seg of block.segs) {
      if (seg.node && s >= seg.bs && s < seg.bs + seg.len) startSeg = seg
      if (seg.node && e - 1 >= seg.bs && e - 1 < seg.bs + seg.len) endSeg = seg
      if (startSeg && endSeg) break
    }
    if (!startSeg || !endSeg || !startSeg.node.isConnected || !endSeg.node.isConnected) return null
    try {
      const range = document.createRange()
      range.setStart(startSeg.node, startSeg.ns + (s - startSeg.bs))
      range.setEnd(endSeg.node, endSeg.ns + (e - endSeg.bs))
      return range
    } catch (err) {
      return null
    }
  }

  /** Chunk containing a DOM position (for Alt+click seeking). */
  function chunkAt(blocks, chunks, node, offset) {
    for (const block of blocks) {
      const seg = block.segs.find((x) => x.node === node)
      if (!seg) continue
      const pos = seg.bs + offset
      return chunks.find((c) => c.b === block.id && pos >= c.start && pos < c.end + 1) || null
    }
    return null
  }

  function sampleText(blocks, max = 600) {
    let out = ''
    for (const b of blocks) {
      out += b.text.slice(0, max - out.length) + ' '
      if (out.length >= max) break
    }
    return out
  }

  const api = { extractBlocks, buildChunks, rangeFor, chunkAt, sampleText }
  HL.extract = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
