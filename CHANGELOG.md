# Changelog

## 1.2.0
- New: voice picker (system voices by language) with saved choice per language; no hard-coded voice names
- New: optional offline HQ voices (Kokoro-82M, 28 English voices) installed from Settings, with live voice switching
- New: speed 0.5x–4x, progress bar, sentence/paragraph navigation, keyboard shortcuts, draggable player
- New: read selection (context menu / shortcut), read-from-here hover button, Alt+click to seek
- New: speed reading (RSVP), offline summary, pronunciation dictionary, bookmarks, sleep timer, resume position, listening stats
- New: highlight styles, light/dark themes, accent colour; options page and a real popup
- New: download page as WAV audio (HQ voices)
- Changed: on-demand injection (`activeTab` + `scripting`) instead of an always-on `<all_urls>` content script
- Changed: block/sentence based reading with accurate offsets, Unicode-aware word highlighting; page DOM is no longer modified
- Fixed: Alt+H shortcut, duplicate listeners/buttons on repeated opens, Escape now closes the player, dead voice button, README claims that did not exist

## 1.0.0
- Initial release
