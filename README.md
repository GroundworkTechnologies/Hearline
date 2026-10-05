<div align="center">

<img src="src/icons/icon128.png" alt="Hearline logo" width="96" height="96">

# Hearline

**Listen to any webpage.**

Reads articles, blogs and documentation aloud with real-time word highlighting.<br>
Free, private, no account.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-0A7FFF?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.2.0-8b5cf6?style=for-the-badge)](CHANGELOG.md)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-f59e0b?style=for-the-badge&logo=googlechrome&logoColor=white)](#tech-stack)

[Features](#features) · [Installation](#installation) · [Usage](#usage) · [HQ voices](#hq-voices) · [Privacy](#privacy) · [Development](#development)

<img width="900" alt="Hearline reading a webpage with word highlighting" src="https://github.com/user-attachments/assets/3d3e4ac4-3e50-44b2-8071-da9b05814c17">

</div>

## Overview

Hearline is a free browser extension that reads a webpage aloud while highlighting each word as it is spoken. It is built for students, professionals and anyone who learns better by listening. Open a page, press `Alt+H`, and start listening.

- **Private by design.** No account, no analytics, no servers. Page text never leaves your device.
- **Lightweight.** The reader is injected only when you ask for it, so pages you do not read are untouched.
- **Open source.** Released under the MIT License.

## Features

| Feature | Description |
|---|---|
| Read aloud | Read a full page or only the selected text, at 0.5x to 4x speed |
| Word highlighting | A highlight follows the voice and the page scrolls along with it |
| Voice picker | Choose any system voice, grouped by page language. Your choice is remembered per language |
| HQ voices | Optional natural sounding voices that run offline after a one-time download |
| Speed reading | Shows one word at a time with the focus letter marked, from 100 to 1000 words per minute |
| Summary | An offline key-points summary. Click a sentence to jump to it, or have it read aloud |
| Smart extraction | Skips menus, footers, cookie banners, code blocks, citations such as [1], URLs and emoji. Each rule is configurable |
| Read from here | Hover a paragraph and press play, or Alt+click any sentence |
| Appearance | Four highlight styles, light and dark themes, custom accent colour |
| Extras | Pronunciation dictionary, bookmarks, sleep timer, resume where you left off, listening stats |
| Audio export | Save a page as a WAV file when using an HQ voice |

## Installation

### Chrome Web Store (recommended)

[Install Hearline](https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb). Updates are applied automatically.

### Build from source

Works in Chrome, Brave and Edge.

```bash
git clone https://github.com/abdisamadjoe/hearline.git
cd hearline
npm install
npm run build
```

Then open `chrome://extensions` (or `brave://extensions`), enable **Developer mode**, click **Load unpacked** and select the `dist` folder.

## Usage

| Action | How |
|---|---|
| Read the page | Click the Hearline icon and choose **Read this page**, or press `Alt+H` |
| Read selected text | Select the text, right-click and choose **Read selection with Hearline** |
| Start from a paragraph | Hover it and press play, or `Alt`+click a sentence |
| Pause or resume | `Space` or the play button |
| Previous or next sentence | `←` and `→` (hold `Shift` to move by paragraph) |
| Change speed | The speed button, or `+` and `-` |
| Change voice | The voice button in the player |
| Summary, speed reading, sleep timer, bookmarks | The `⋯` menu |
| Close | `Esc` or the close button |

**No voices on Ubuntu or Linux?** Install the system speech service and restart your browser:

```bash
sudo apt install speech-dispatcher espeak-ng
```

Alternatively, install the HQ voices from Settings, which need no system speech service.

## HQ voices

HQ voices are optional. They are powered by [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) (Apache-2.0) and run entirely on your device.

| | |
|---|---|
| Voices | 28 US and UK English voices |
| Download | About 90 MB, once, from Hugging Face. It starts only when you click **Install HQ voices** in Settings |
| After install | Works offline |
| Languages | English only. Other languages use system voices |

After installation Hearline runs a short speed test. If your computer cannot generate speech faster than it plays, your system voice stays the default and you can still pick an HQ voice manually. You can repeat the test at any time from Settings.

> **Note:** HQ voices run on the CPU and need a reasonably fast processor. On slower machines expect pauses between sentences and prefer a system voice.

## Privacy

- No account, analytics or telemetry.
- Page text is spoken only by your browser's speech service or by the on-device HQ voices.
- The only network request is the optional one-time HQ voice model download.
- Settings, bookmarks and reading positions are stored locally in `chrome.storage.local`.

### Permissions

| Permission | Purpose |
|---|---|
| `activeTab`, `scripting` | Run the reader on a page only when you ask |
| `storage` | Save settings, bookmarks and reading position |
| `contextMenus` | The right-click "Read selection" option |
| `offscreen` | Play HQ voice audio |

No access to any website is requested in advance.

## Tech stack

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-f59e0b?style=for-the-badge&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Speech API](https://img.shields.io/badge/Web%20Speech%20API-0A7FFF?style=for-the-badge&logo=googlechrome&logoColor=white)
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)
![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-005CED?style=for-the-badge&logo=onnx&logoColor=white)
![Kokoro 82M](https://img.shields.io/badge/Kokoro-82M-8b5cf6?style=for-the-badge)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![esbuild](https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

| Layer | Technology |
|---|---|
| Platform | Chrome Manifest V3 with on-demand injection |
| System voices | Web Speech API |
| HQ voices | Kokoro-82M with ONNX Runtime Web (WASM), run in an offscreen document and a worker |
| Highlighting | CSS Custom Highlight API and a shadow DOM overlay. The page itself is not modified |
| Storage | `chrome.storage.local` |
| Code | Plain JavaScript. esbuild is used only to bundle the HQ voice engine |

## Development

```bash
npm install
npm run build              # build into dist/
npm test                   # unit tests
node test/e2e/run.mjs      # real browser smoke test (requires Chromium)
node test/e2e/kokoro.mjs   # installs HQ voices and speaks (network, about 90 MB)
npm run package            # create hearline-<version>.zip
```

### Project structure

```
hearline/
├── src/
│   ├── manifest.json, background.js   injection, shortcuts, context menu
│   ├── shared/                        settings, text, language, voices (unit tested)
│   ├── content/                       extract, engines, reader, player, speed reading, summary
│   ├── popup/                         toolbar popup
│   ├── options/                       settings page and HQ voice installer
│   └── offscreen/                     HQ voice playback and inference worker
├── test/                              unit and real browser tests
├── build.mjs                          builds dist/ and the store zip
├── plan.md                            roadmap
└── CHANGELOG.md
```

## Contributing

Contributions are welcome. Please open an issue to discuss a feature or bug before submitting a pull request.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push the branch and open a pull request

## License

Released under the [MIT License](LICENSE).

## Author

Built by [@abdisamadjoe](https://github.com/abdisamadjoe). If Hearline helps you, please star the repository and leave a review on the Chrome Web Store.
