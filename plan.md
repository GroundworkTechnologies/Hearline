# Hearline v1.2 — Plan

Goal: make the extension do what the README promises, fix the structural bugs, and add the controls users expect from a read-aloud tool. Everything stays local and private. No servers, no analytics.

Current version: 1.0.0. Target: 1.2.0 (ship as 1.1.0 for Phase 1–2 if desired, then 1.2.0).

---

## 1. Permanent fix: voice selection

### Problem
- `#hl-voice-btn` has no click handler ([content.js:328-346](content.js#L328-L346)). It is a static US flag.
- `getVoice()` hard-codes "Microsoft David" ([content.js:24-30](content.js#L24-L30)). On Linux/macOS it silently falls to the first `en-US` voice, or `voices[0]`.
- Language is hard-coded to `en-US`, ignoring the page language.
- Voice list on Chrome loads asynchronously and can be empty at first call.

### Design
1. **Voice manager module** (`voices.js`, shared by content script and popup):
   - `loadVoices()` returns a Promise that resolves when `getVoices()` is non-empty (listen for `voiceschanged`, with a 2 s timeout fallback and retry).
   - `pickVoice({ savedURI, pageLang })` priority:
     1. Saved voice (match by `voiceURI`, then by `name`+`lang`) if still installed.
     2. Best voice matching page language (`<html lang>`, then text-detected), preferring `localService: true`, then "natural/neural/premium/enhanced" names, then default flagged.
     3. Voice matching `navigator.language`.
     4. Default voice, then `voices[0]`.
   - Never reference a platform-specific voice name.
2. **Voice picker UI** in the player: clicking the voice button opens a popover listing voices grouped by language (page language first), with a local/online badge and a "Preview" button. Selecting saves it.
3. **Button face** shows the language code/flag of the *selected* voice, not a fixed image. Remove `voice_usa.png` (also drop it from `web_accessible_resources`).
4. **Persist** `voiceURI`, `lang`, `rate` per language in `chrome.storage.local` (re-add the `storage` permission, which the README already documents). Fall back to in-memory state if storage fails.
5. **Empty-voice state**: if no voices exist (common on minimal Ubuntu without `speech-dispatcher`), show an inline message: "No system voices found. On Linux install `speech-dispatcher` + `espeak-ng` (or use Chrome with network voices) and reload." Link to a help section in the README.
6. Apply voice change live: restart the current chunk from the current character offset with the new voice.

### Acceptance
- Clicking the voice button opens the list on Windows, macOS and Ubuntu.
- Choosing a voice changes audio within one sentence and survives page reload and new tabs.
- If the saved voice is uninstalled, Hearline falls back automatically without errors.
- No hard-coded voice names in the codebase.

---

## 2. Bug fixes (Phase 1)

| # | Bug | Fix |
|---|---|---|
| 1 | Alt+H sends `play`, which has no handler; `tabs[0]` may be undefined | Implement `toggle`/`play` message handling; guard tab lookup; toggle player on/off |
| 2 | Repeated "show" duplicates buttons, listeners, keep-alive timer, click handler | Make `show` idempotent: tear down previous state before rebuilding; register global listeners once |
| 3 | Escape stops audio but leaves the player | Escape closes player and cleans up |
| 4 | `return true` in `onMessage` with no async response | Return `true` only where a response is sent asynchronously |
| 5 | "Rewind/Forward 10s" actually skips one chunk | Rename to "Previous / Next sentence" or implement real time-based seek (see §3) |
| 6 | Offset math `s.length + 1` misaligns highlight when whitespace is not a single space | Compute offsets with `matchAll` / `RegExp` indices on the raw string |
| 7 | `/^\w+/` breaks highlighting for non-ASCII | Use `Intl.Segmenter` (word granularity) with `/^[\p{L}\p{N}_'’-]+/u` fallback |
| 8 | Pause = `cancel()` + restart from char offset, plus 10 s pause/resume hack | Use native `pause()`/`resume()` for pause; apply keep-alive only on Chrome for long utterances; chunk to ≤ ~200 chars to avoid the 15 s cutoff entirely and drop the hack |
| 9 | Popup silently fails on `chrome://`, Web Store, PDFs | Show a real popup message: "Hearline can't run on this page" |
| 10 | Smooth `scrollTo` on every word boundary | Scroll only when the word leaves the comfort zone; pause auto-follow when the user scrolls manually; honor `prefers-reduced-motion` |

---

## 3. Features for v1.2

### 3.1 Playback controls (must-have)
- **Speed control**: 0.5x–3x, step 0.25, in player popover and popup. Persisted. Changing speed applies live.
- **Progress bar** with sentence/paragraph markers; click to seek; shows "paragraph 12 / 48" and estimated time remaining.
- **Previous / Next sentence** and **Previous / Next paragraph**.
- **Keyboard shortcuts** (active only when focus is not in an input/textarea/contenteditable):
  `Space` play/pause · `←/→` sentence · `Shift+←/→` paragraph · `+/-` speed · `Esc` close.
- **Alt+H** toggles player and starts reading (fixed).

### 3.2 Reading sources
- **Read selection**: highlight text, press the shortcut or right-click → "Read selection with Hearline" (adds `contextMenus` permission).
- **Read from here**: single floating play button that follows the hovered block (replaces injected per-paragraph buttons).
- **Smart main-content detection** (Readability-style scoring: text density, paragraph count, link density) instead of blanket exclusion of `header`/`aside`. Keep the page title and `h1`.
- **Skip lists** the user can toggle: references/citations `[1]`, code blocks, footnotes, URLs, emojis.
- Support **same-origin iframes** (`all_frames`) and open **shadow DOM**.

### 3.3 Language
- Detect language from `<html lang>` then content sample; choose a matching voice (ties into §1).
- Per-language saved voice and speed.
- Fix sentence splitting for abbreviations (`Dr.`, `e.g.`, `U.S.`, decimals) and non-Latin punctuation (`。`, `؟`, `।`).

### 3.4 Highlighting and appearance
- Block-based chunking (p, li, h1–h6, blockquote, td) so inline links/bold don't fragment sentences; map word positions back to text nodes.
- Highlight modes: word pill (current) · word underline · sentence background · sentence + word.
- Themes: light, dark, auto (`prefers-color-scheme`); accent colour; font-size of the RSVP overlay.
- Player: draggable, collapsible to a small handle, remembers position, horizontal layout on narrow screens. Stop forcing `position: relative` on host-page elements.

### 3.5 RSVP speed reading (README feature)
- Full-screen/overlay mode showing one word at a time with optimal-recognition-point (ORP) letter in accent colour.
- WPM control 150–900, pause on punctuation, back/forward by word, scrub bar.
- Reuses the same chunk/word tokenizer as audio mode. Can run silent or with audio muted.

### 3.6 Summarizer (README feature)
- Offline extractive summary: sentence scoring by TF-IDF + position weighting + title-word overlap, stopword lists for the top languages.
- Output: 3 / 5 / 8 key sentences in a side panel; click a sentence to jump to it on the page; "Read summary aloud" button.
- No network, no AI service — keep the README's privacy statement true.

### 3.7 Resume and history
- Remember last position per URL (hash of URL without fragment, last 50 pages, stored locally) and offer "Resume from paragraph N".
- Option to clear all saved data.

### 3.8 Popup (replace the invisible popup)
- Real popup: Play/Pause, Read selection, Speed, Voice, Mode (Read / RSVP / Summary), link to Settings.
- Shows a clear message on unsupported pages.

### 3.9 Options page
- Defaults: voice per language, speed, theme, highlight mode, skip lists, shortcuts hint, RSVP WPM, data clearing.

### 3.10 Accessibility
- `aria-label` on all player buttons, `role="toolbar"`, visible focus rings, `aria-live` status for "Reading paragraph N".
- Full keyboard operability of the voice popover and settings.
- Respect `prefers-reduced-motion` and high-contrast mode.

---

## 4. Architecture and permissions

- **On-demand injection**: drop the always-on `<all_urls>` content script. Use `chrome.scripting.executeScript` + `insertCSS` from the popup/command/context menu with `activeTab`. Removes the broad "read all sites" warning and the per-page cost.
  - Permissions v1.2: `activeTab`, `scripting`, `storage`, `contextMenus`. No host permissions.
- **Module layout** (bundler-free; plain scripts injected in order, or a single small build step):
  ```
  src/
    content/  extract.js  chunk.js  tts.js  highlight.js  player.js  rsvp.js  summarize.js  index.js
    shared/   voices.js  storage.js  lang.js  messages.js
    popup/    popup.html  popup.js  popup.css
    options/  options.html  options.js  options.css
    background.js
  ```
- **Single state object + small event bus** instead of scattered globals; one teardown function that removes every listener, timer, and DOM node.
- **Shadow DOM for the player** so host-page CSS can't break it and we can drop most `!important`.
- **Messages**: typed message names in `messages.js`; background only routes.

---

## 5. Quality

- **Unit tests** (Vitest or plain Node) for pure functions: sentence splitter, offset mapping, voice picker, language detection, summarizer scoring, ORP calculation.
- **Manual test matrix**: Chrome on Windows, macOS, Ubuntu (with and without `speech-dispatcher`); Edge; sites: Wikipedia, Medium, a docs site, a news site with sticky header, a non-English article (Arabic, Somali, French), a React SPA.
- **Lint/format**: ESLint + Prettier config; `npm run build` produces `hearline-1.2.0.zip`.
- **CHANGELOG.md** and tagged GitHub release.
- Remove dead files (`popup.css` blue body, `voice_usa.png`) and unused CSS.

---

## 6. Release plan

| Phase | Scope | Version |
|---|---|---|
| 1 | Bug fixes §2 (1–4, 6–10), idempotent show, Alt+H, Escape, popup error state | 1.0.1 |
| 2 | Voice manager + picker + storage + speed control (§1, §3.1 partial) | 1.1.0 |
| 3 | Block-based chunking, Shadow DOM player, single hover button, main-content detection (§3.2, §3.4, §4) | 1.1.x |
| 4 | Progress bar, shortcuts, read selection, language detection, resume (§3.1, 3.2, 3.3, 3.7) | 1.2.0-rc |
| 5 | Kokoro offline engine + engine abstraction + voice switching (§1B) | 1.2.0-rc2 |
| 6 | RSVP, summarizer, options page, real popup, Speechify-inspired features (§8), accessibility pass, tests, docs (§3.5, 3.6, 3.8–3.10, §5) | **1.2.0** |

### Definition of done for 1.2.0
- Every feature listed in the README exists and works.
- Voice button opens a picker on all three OSes and the choice persists.
- No permission beyond `activeTab`, `scripting`, `storage`, `contextMenus`.
- Page DOM is not mutated except by one shadow-root host and temporary highlight overlays.
- Unit tests pass; manual matrix signed off; README, store listing and screenshots updated.

---

## 7. Decisions made
- **No cloud TTS, no API keys.** Free forever and private is the product promise.
- **Engines:** system voices (default, zero download) + optional Kokoro offline voices (one-time ~80 MB download on user request).

## 7b. Open questions
1. Is `contextMenus` acceptable, or keep permissions minimal?
2. Should RSVP and the summarizer ship in 1.2.0, or move to 1.3?
3. Ship Kokoro in 1.2.0, or hold it for 1.3 to keep 1.2 smaller? (Plan assumes 1.2.0.)

---

## 1B. Kokoro offline engine (optional)

### Voices and switching
Yes, users can switch voices. Kokoro-82M ships dozens of preset voices (`kokoro-js` exposes them by ID), for example:
- American English: `af_heart`, `af_bella`, `af_nicole`, `am_michael`, `am_adam`, ...
- British English: `bf_emma`, `bf_isabella`, `bm_george`, `bm_lewis`, ...
- Other languages in the model family (Spanish, French, Hindi, Italian, Portuguese, Japanese, Mandarin) with varying quality.

Switching is just a different voice ID passed to the same loaded model. **No extra download per voice**; the voice packs are tiny (a few hundred KB each) and included with the model.
Gaps: no Arabic or Somali. Those users stay on system voices, and the picker must make that clear.

### Engine abstraction
```
engine = { id, listVoices(), speak(text, {voice, rate}, onWord, onEnd), pause(), resume(), cancel() }
engines: webSpeech, kokoro
```
- The picker lists voices from both engines in one list, tagged "System" / "Hearline HQ".
- `onWord(charIndex)` is real for Web Speech; for Kokoro it is estimated from audio duration split by character count within each sentence.

### Implementation
- Download the model on explicit click ("Install HQ voices, 80 MB"), with progress bar, cancel, and retry. Store in Cache Storage / IndexedDB. Show size and a "Remove voices" button in options.
- Run `kokoro-js` in an **offscreen document**; `'wasm-unsafe-eval'` in the extension-pages CSP. Prefer WebGPU, fall back to WASM.
- **Pre-generate the next 1–2 sentences** while the current one plays to hide latency. Cache generated audio for the current page.
- Speed control uses `playbackRate` with `preservesPitch`, or the model's speed parameter.
- If a device is too slow (real-time factor > 1), warn and suggest a system voice.
- Model files fetched from a pinned URL (Hugging Face) with a hash check. Bundle nothing in the extension zip, so the store package stays tiny.

### Acceptance
- User can install, preview, switch between voices, and remove the model.
- Playback is gapless on a mid-range laptop, and the highlight tracks within about one word.
- Works offline after install. Extension still works fully with no model installed.

---

## 8. Learning from Speechify and similar extensions

### Worth copying
| Feature | Plan |
|---|---|
| Sleek floating mini-player that stays out of the way | Collapsible/draggable player (§3.4) |
| Click any text to start reading from there | Click-to-seek on words, not only paragraphs |
| Skip headers, footnotes, citations, ads | Skip lists (§3.2) |
| Speeds up to 4.5x | Allow up to 4x, with a warning that quality drops |
| Hardware media keys / lock-screen controls | **Media Session API**: play/pause/next/prev from keyboard media keys and OS widgets |
| Reading queue / playlist of articles | "Add page to queue", read several pages in a row |
| Sleep timer | Stop after 10/20/30/60 min or end of article |
| Bookmarks / highlights | Save a sentence with the page title; list in options |
| Pronunciation dictionary | User rules ("GIF" → "jif", acronyms, names) applied before speaking |
| Dyslexia-friendly reading aids | OpenDyslexic font toggle, line focus/ruler, adjustable spacing, bionic-style bolding |
| PDF reading | Open PDFs in a Hearline viewer (pdf.js) since Chrome's PDF viewer blocks content scripts |
| Export to audio | Kokoro output saved as WAV/MP3 ("Download this article as audio") |
| Listening stats | Local-only: words read, time listened, streak. No upload |
| Onboarding | First-run tour: pick voice, speed, install HQ voices |

### Deliberately not copying
- Account, subscription and paywall for "premium voices". Hearline stays free.
- Cloud sync and analytics.
- OCR from photos and mobile app (out of scope).

---

## 9. Other gaps found

- **Background playback**: keep reading when the tab is hidden. Timers throttle, so drive playback by audio/`onend` events, not `setInterval`.
- **One reader at a time**: if two tabs are reading, pause the other (broadcast via background).
- **Pause when a video or audio element on the page plays** (optional setting).
- **SPA navigation and infinite scroll**: detect URL or DOM changes, offer "re-scan page", and append new content to the queue.
- **Google Docs / canvas-rendered text**: not extractable by DOM walking; document as unsupported, or use selection fallback.
- **Cookie banners and popups**: extend the skip heuristics.
- **Numbers, dates, URLs, units, emoji**: normalise before speaking (e.g. "$5.2M", "3/4", "Dr.", "2024-05-01").
- **Long-text safety**: pages with 100k+ words should chunk lazily rather than building every chunk upfront.
- **Error handling and diagnostics**: friendly errors, plus a "Copy debug info" button in options for bug reports.
- **UI language**: `_locales` for the extension UI (English first, then French, Arabic, Somali if there is demand).
- **Cross-browser**: test Edge (store listing), Brave, and Firefox (needs MV3 differences handled via `webextension-polyfill`; Firefox has its own voice quirks).
- **Store and project hygiene**: privacy policy page (state the one-time model download clearly), refreshed screenshots and a short demo video, GitHub issue templates, support/donate link, CHANGELOG.
- **Performance budget**: no work on pages until the user triggers Hearline; idle memory near zero.
