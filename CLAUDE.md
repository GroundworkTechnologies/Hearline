# Hearline

Chrome MV3 extension that reads any webpage aloud with word-level highlighting. Free, no accounts, no analytics, no servers. Roadmap and scope for v1.2: [plan.md](plan.md).

## Rules that must not be broken
- **Privacy:** never send page text to any server. The only network use is the optional one-time Kokoro model download from Hugging Face, which the user starts by clicking "Install". No cloud TTS, no API keys, no analytics.
- **Permissions:** keep to `activeTab`, `scripting`, `storage`, `contextMenus`, `offscreen`. No `<all_urls>` content script and no host permissions. Content scripts are injected on demand by the background worker.
- **No remote code (MV3):** all JS and WASM ship inside the extension. Only model weights are downloaded.
- **Do not mutate the host page** beyond the single `#hearline-root` shadow host and an adopted stylesheet for `::highlight()` rules. No injected buttons, no forced `position` on page elements.
- **No hard-coded voice names.** Voices are picked by language, saved choice and quality score (`src/shared/voices.js`).
- The README must only describe features that exist.

## Layout
```
src/                  extension root (what gets built)
  manifest.json
  background.js       injection, commands, context menu, offscreen lifecycle
  shared/             pure modules, unit-tested (settings, text, lang, voices, kokoro-voices)
  content/            injected scripts (extract, engines, summarize, rsvp, player, reader, index)
  popup/  options/    extension pages
  offscreen/          Kokoro engine host (bundled by esbuild)
test/                 node:test unit tests for shared/ and summarize
build.mjs             copies src -> dist, bundles offscreen, copies ORT wasm, optional zip
```
Content and shared files are plain scripts (no modules). Each attaches to `globalThis.__HL` and also exports via `module.exports` when run under Node so tests can import it. Injection order is the `CONTENT_FILES` list in `src/background.js`; add new files there.

## Commands
- `npm install`
- `npm run build` -> `dist/` (load this folder via chrome://extensions -> Load unpacked)
- `npm test` -> unit tests
- `npm run package` -> `hearline-<version>.zip`

## Conventions
- Vanilla JS, 2-space indent, single quotes, no semicolons, no frameworks.
- Settings live in `chrome.storage.local` under `settings`; defaults and merge in `src/shared/settings.js`. Wrap every storage call in try/catch.
- Engines implement `speak(text, opts, cb)`, `pause()`, `resume()`, `cancel()`, `setRate()`; callbacks are `onWord(charIndex)`, `onEnd()`, `onError(err)`.
- Text offsets: chunk offsets refer to the original block text; spoken text may be transformed (`transform()` in `text.js`), so always map back with `toOriginal`.
- Pure logic goes in `shared/` with a test; DOM code stays in `content/`.

## Testing notes
- Unit tests cover pure logic only. Voice playback, highlighting and the Kokoro model need manual checks in a real browser (Chrome on Ubuntu, plus Edge and macOS when possible).
- Reload the extension at chrome://extensions after each `npm run build`.
