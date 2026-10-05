# 🎧 Hearline — Listen to any webpage

**Hearline reads any webpage, article or blog out loud with real-time word highlighting.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-yellow?logo=googlechrome)](https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.2.0-green)]()

---

## What is Hearline?

Hearline is a free Chrome Extension that reads any webpage out loud while highlighting each word in real time. Think of it like a karaoke cursor for the web. It was built for students, professionals, and anyone who learns better by listening.

No account required. No data sent anywhere.

<img width="1920" height="1080" alt="Chrome - Browsers White Mode" src="https://github.com/user-attachments/assets/3d3e4ac4-3e50-44b2-8071-da9b05814c17" />

---

## Features

- **Read aloud** any page or just the text you select, with word-by-word highlighting that follows along
- **Voice picker** — choose any system voice, grouped by language, or install the optional free **HQ voices** (see below)
- **Speed 0.5x–4x**, previous/next sentence and paragraph, a draggable player with a progress bar, and keyboard shortcuts
- **Speed reading (RSVP)** — one word at a time with the focus letter marked, 100–1000 wpm
- **Summary** — an offline extractive summary of the page; click a sentence to jump to it, or have it read aloud
- **Read from here** — hover a paragraph and click the play button, or Alt+click any sentence
- **Smart extraction** — skips menus, footers, cookie banners, code blocks, citations like [1], URLs and emoji (each configurable)
- **Pronunciation dictionary**, bookmarks, sleep timer, resume where you left off, and listening stats
- **Highlight styles** (word pill, underline, sentence, sentence + word), light/dark themes and an accent colour
- **Download as audio** (WAV) when using an HQ voice
- **100% private** — no account, no analytics, no servers

### HQ voices (optional, offline)

Hearline can install [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) (Apache-2.0), a natural-sounding open model that runs entirely on your device. It is a one-time download of about 90 MB from Hugging Face that you start yourself in Settings; after that it works offline. English only (28 US/UK voices). Generation speed depends on your CPU; if it is too slow, use a system voice.

---

## How to Install

### Option 1: Chrome Web Store (Recommended)

[Click here to install Hearline](https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb)

### Option 2: Build from source

```bash
git clone https://github.com/abdisamadjoe/hearline.git
cd hearline
npm install
npm run build
```
Then open `chrome://extensions/`, turn on **Developer mode**, click **Load unpacked** and select the `dist` folder.

---

## How to Use

| What you want to do | How to do it |
|---|---|
| Read the page | Click the Hearline icon then **Read this page**, or press `Alt+H` |
| Read only some text | Select it, then right-click → **Read selection with Hearline** |
| Jump to a paragraph | Hover it and click the play button, or `Alt`+click a sentence |
| Pause / resume | `Space` or the play button |
| Previous / next sentence | `←` / `→` (hold `Shift` for paragraphs) |
| Change speed | The speed button, or `+` / `-` |
| Change voice | The voice button in the player |
| Summary, speed reading, sleep timer, bookmarks | The `⋯` menu |
| Close | `Esc` or the ✕ button |

**No voices on Ubuntu/Linux?** Install the system speech service (`sudo apt install speech-dispatcher espeak-ng`) and restart Chrome, or install the HQ voices from Settings.

---

## Privacy

Hearline has no account, no analytics and no servers. Page text is spoken only by your browser or by the on-device HQ voices and never leaves your device. The only network request is the optional one-time voice download from Hugging Face, which starts only when you click **Install HQ voices**. Settings, bookmarks and reading positions stay in `chrome.storage.local`.

Permissions: `activeTab` and `scripting` (inject the reader only when you ask), `storage`, `contextMenus` (right-click reading), and `offscreen` (plays HQ voice audio). Hearline requests no access to websites in advance.

---

## Tech Stack

| Layer | Technology used |
|---|---|
| Extension platform | Chrome Manifest V3, on-demand injection |
| System voices | Web Speech API |
| HQ voices | Kokoro-82M via `kokoro-js` / ONNX Runtime Web (WASM), in an offscreen document + worker |
| Highlighting | CSS Custom Highlight API and a shadow-DOM overlay (the page is not modified) |
| Storage | `chrome.storage.local` |
| Build | esbuild (only for the HQ voice bundle); everything else is plain JavaScript |

## Development

```bash
npm install
npm run build     # -> dist/
npm test          # unit tests
node test/e2e/run.mjs      # real-browser smoke test (needs Chromium)
node test/e2e/kokoro.mjs   # installs HQ voices and speaks (needs network, ~90 MB)
npm run package   # -> hearline-<version>.zip
```

---|---|
| Extension platform | Chrome Manifest V3 |
| Text to speech | Web Speech API (SpeechSynthesisUtterance) |
| Highlighting | Real-time word-level span injection |
| Settings storage | chrome.storage.local |
| Frameworks | None, pure Vanilla JavaScript |

---

## File Structure

```
hearline/
├── src/
│   ├── manifest.json, background.js   # injection, shortcuts, context menu
│   ├── shared/     # settings, text splitting, language, voices (unit-tested)
│   ├── content/    # extract, engines, reader, player UI, RSVP, summary
│   ├── popup/      # toolbar popup
│   ├── options/    # settings page + HQ voice installer
│   └── offscreen/  # HQ voice playback + inference worker
├── test/           # unit tests and real-browser tests
├── build.mjs       # builds dist/ (and the store zip)
├── plan.md         # roadmap
└── CHANGELOG.md
```

---

## Contributing

Contributions are welcome. If you have a feature idea or find a bug, please open an issue first before submitting a pull request.

1. Fork the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.

---

## Author

Built by [@abdisamadjoe](https://github.com/abdisamadjoe)

---

If Hearline helped you, please leave a star on GitHub and a review on the Chrome Web Store. It helps more people find the extension.
