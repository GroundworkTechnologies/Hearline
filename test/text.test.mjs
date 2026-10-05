import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const T = require('../src/shared/text.js')

const sentences = (s) => T.splitSentences(s).map((r) => s.slice(r.start, r.end))

test('splits simple sentences', () => {
  assert.deepEqual(sentences('Hello world. How are you? Fine!'), ['Hello world.', 'How are you?', 'Fine!'])
})

test('does not split on abbreviations, initials or decimals', () => {
  assert.deepEqual(sentences('Dr. Smith paid $5.20 to J. Doe for e.g. tea. Then he left.'), [
    'Dr. Smith paid $5.20 to J. Doe for e.g. tea.',
    'Then he left.',
  ])
})

test('does not split when next word is lowercase', () => {
  assert.deepEqual(sentences('See fig. 3 for details. Done.'), ['See fig. 3 for details.', 'Done.'])
})

test('handles CJK and Arabic terminators', () => {
  assert.equal(sentences('今日は晴れです。明日は雨です。').length, 2)
  assert.equal(sentences('كيف حالك؟ أنا بخير.').length, 2)
})

test('offsets are exact with irregular whitespace', () => {
  const s = 'First   one.\n\n  Second   one.'
  const r = T.splitSentences(s)
  assert.equal(s.slice(r[0].start, r[0].end), 'First   one.')
  assert.equal(s.slice(r[1].start, r[1].end), 'Second   one.')
})

test('splitLong breaks long text at clauses within max', () => {
  const s = ('word '.repeat(30) + ', ').repeat(4).trim()
  const pieces = T.splitLong(s, { start: 0, end: s.length }, 100)
  assert.ok(pieces.length > 1)
  assert.ok(pieces.every((p) => p.end - p.start <= 100))
})

test('wordAt handles unicode', () => {
  const s = 'café naïve'
  const w = T.wordAt(s, 0)
  assert.equal(s.slice(w.start, w.end), 'café')
  const w2 = T.wordAt(s, 5)
  assert.equal(s.slice(w2.start, w2.end), 'naïve')
})

test('transform maps offsets back to the original text', () => {
  const orig = 'See [1] the   docs at https://x.io/a now'
  const rules = T.buildRules({ skip: { citations: true, urls: true } })
  const t = T.transform(orig, rules)
  assert.equal(t.text, 'See the docs at link now')
  assert.equal(orig.slice(t.toOriginal(t.text.indexOf('docs'))).startsWith('docs'), true)
  assert.equal(orig.slice(t.toOriginal(t.text.indexOf('now'))).startsWith('now'), true)
})

test('pronunciation rules are whole-word and case-insensitive', () => {
  const t = T.transform('The GIF and gifted', T.buildRules({ pronunciations: [{ from: 'gif', to: 'jif' }] }))
  assert.equal(t.text, 'The jif and gifted')
})
