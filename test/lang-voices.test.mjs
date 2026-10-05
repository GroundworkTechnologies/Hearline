import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const L = require('../src/shared/lang.js')
const V = require('../src/shared/voices.js')
const S = require('../src/shared/settings.js')
const K = require('../src/shared/kokoro-voices.js')

const voice = (name, lang, extra = {}) => ({ name, lang, voiceURI: name, localService: true, default: false, ...extra })

test('detectLang prefers html lang, then script, then navigator', () => {
  assert.equal(L.detectLang({ htmlLang: 'en-GB', sample: 'x', navLang: 'fr' }), 'en-gb')
  assert.equal(L.detectLang({ htmlLang: '', sample: 'مرحبا بكم في موقعنا', navLang: 'en' }), 'ar')
  assert.equal(L.detectLang({ htmlLang: 'x-default', sample: 'plain latin text', navLang: 'fr-FR' }), 'fr-fr')
})

test('pickVoice honours the saved voice when installed', () => {
  const voices = [voice('A', 'en-US'), voice('B', 'en-US')]
  const saved = { engine: 'web', uri: 'B', name: 'B', lang: 'en-US' }
  assert.equal(V.pickVoice(voices, { saved, lang: 'en-US' }).name, 'B')
})

test('pickVoice falls back when the saved voice is gone', () => {
  const voices = [voice('A', 'fr-FR'), voice('B', 'en-US')]
  const saved = { engine: 'web', uri: 'gone', name: 'gone', lang: 'en-US' }
  assert.equal(V.pickVoice(voices, { saved, lang: 'en-US' }).name, 'B')
})

test('pickVoice prefers language, region and natural voices without vendor names', () => {
  const voices = [
    voice('Basic', 'en-GB'),
    voice('Basic US', 'en-US'),
    voice('Some Neural US', 'en-US', { localService: false }),
    voice('French', 'fr-FR'),
  ]
  assert.equal(V.pickVoice(voices, { lang: 'en-US' }).name, 'Some Neural US')
  assert.equal(V.pickVoice(voices, { lang: 'fr' }).name, 'French')
  assert.equal(V.pickVoice([], { lang: 'en' }), null)
})

test('groupVoices separates matching language', () => {
  const g = V.groupVoices([voice('A', 'en-US'), voice('B', 'de-DE')], 'en')
  assert.equal(g.match.length, 1)
  assert.equal(g.other.length, 1)
})

test('settings merge is deep for objects and replaces arrays', () => {
  const m = S.merge(S.DEFAULTS, { skip: { code: false }, pronunciations: [{ from: 'a', to: 'b' }] })
  assert.equal(m.skip.code, false)
  assert.equal(m.skip.urls, true)
  assert.equal(m.pronunciations.length, 1)
})

test('kokoro catalog has unique ids and valid defaults', () => {
  const ids = K.VOICES.map((v) => v.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(K.INSTALL_DEFAULT.every((id) => ids.includes(id)))
  assert.equal(K.defaultFor('en-GB'), 'bf_emma')
  assert.ok(K.supports('en-AU') && !K.supports('fr'))
})
