(function (root) {
  const HL = (root.__HL = root.__HL || {})

  // kokoro-js currently supports English phonemes only (American and British).
  const VOICES = [
    ['af_heart', 'Heart', 'en-US', 'F'], ['af_alloy', 'Alloy', 'en-US', 'F'],
    ['af_aoede', 'Aoede', 'en-US', 'F'], ['af_bella', 'Bella', 'en-US', 'F'],
    ['af_jessica', 'Jessica', 'en-US', 'F'], ['af_kore', 'Kore', 'en-US', 'F'],
    ['af_nicole', 'Nicole', 'en-US', 'F'], ['af_nova', 'Nova', 'en-US', 'F'],
    ['af_river', 'River', 'en-US', 'F'], ['af_sarah', 'Sarah', 'en-US', 'F'],
    ['af_sky', 'Sky', 'en-US', 'F'],
    ['am_adam', 'Adam', 'en-US', 'M'], ['am_echo', 'Echo', 'en-US', 'M'],
    ['am_eric', 'Eric', 'en-US', 'M'], ['am_fenrir', 'Fenrir', 'en-US', 'M'],
    ['am_liam', 'Liam', 'en-US', 'M'], ['am_michael', 'Michael', 'en-US', 'M'],
    ['am_onyx', 'Onyx', 'en-US', 'M'], ['am_puck', 'Puck', 'en-US', 'M'],
    ['am_santa', 'Santa', 'en-US', 'M'],
    ['bf_alice', 'Alice', 'en-GB', 'F'], ['bf_emma', 'Emma', 'en-GB', 'F'],
    ['bf_isabella', 'Isabella', 'en-GB', 'F'], ['bf_lily', 'Lily', 'en-GB', 'F'],
    ['bm_daniel', 'Daniel', 'en-GB', 'M'], ['bm_fable', 'Fable', 'en-GB', 'M'],
    ['bm_george', 'George', 'en-GB', 'M'], ['bm_lewis', 'Lewis', 'en-GB', 'M'],
  ].map(([id, name, lang, gender]) => ({ id, name, lang, gender }))

  // Downloaded together with the model; the rest are fetched (~0.5 MB each) on first use.
  const INSTALL_DEFAULT = ['af_heart', 'af_bella', 'af_nicole', 'am_michael', 'bf_emma', 'bm_george']

  function defaultFor(lang) {
    return String(lang || '').toLowerCase() === 'en-gb' ? 'bf_emma' : 'af_heart'
  }

  function supports(lang) {
    return String(lang || '').toLowerCase().split('-')[0] === 'en'
  }

  const api = { VOICES, INSTALL_DEFAULT, defaultFor, supports }
  HL.kokoroVoices = api
  if (typeof module !== 'undefined') module.exports = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
