import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { summarize } = require('../src/content/summarize.js')

test('returns everything when short', () => {
  assert.deepEqual(summarize(['a', 'b'], { k: 5 }), [0, 1])
})

test('picks topical sentences in document order', () => {
  const s = [
    'Solar panels convert sunlight into electricity using photovoltaic cells efficiently.',
    'My cousin visited yesterday and we had some quite ordinary lunch together.',
    'Photovoltaic cells in solar panels have become cheaper as manufacturing scales up.',
    'Weather was mild and nothing particularly interesting happened that afternoon either.',
    'Falling solar panels prices drive adoption of photovoltaic electricity worldwide.',
    'Anyway that is all for now so please remember to bring snacks next time.',
  ]
  const idx = summarize(s, { k: 3, title: 'Solar panels' })
  assert.equal(idx.length, 3)
  assert.deepEqual(idx, [...idx].sort((a, b) => a - b))
  assert.ok(idx.includes(0) && idx.includes(2) && idx.includes(4))
})
