<template>
  <div class="w-full bg-white min-h-screen pt-8 md:pt-16 pb-24 relative z-10">
    <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 md:gap-20">
      
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 flex-shrink-0">
        <div class="sticky top-28 flex flex-col gap-8">
          
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-3">Documentation</h3>
            <nav class="flex flex-col gap-1">
              <button 
                @click="activeTab = 'intro'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'intro' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                Introduction
              </button>
              <button 
                @click="activeTab = 'features'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'features' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                Features
              </button>
              <button 
                @click="activeTab = 'install'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'install' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                Installation
              </button>
              <button 
                @click="activeTab = 'usage'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'usage' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                How to Use
              </button>
              <button 
                @click="activeTab = 'tech'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'tech' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                Tech Stack
              </button>
            </nav>
          </div>

          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-3">Legal</h3>
            <nav class="flex flex-col gap-1">
              <button 
                @click="activeTab = 'privacy'" 
                :class="['text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors', activeTab === 'privacy' ? 'bg-blue-50 text-[#0A7FFF]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
              >
                Privacy Policy
              </button>
            </nav>
          </div>

        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-grow max-w-3xl prose prose-slate prose-headings:font-sans prose-headings:tracking-tight prose-headings:font-medium prose-a:text-[#0A7FFF] prose-a:no-underline hover:prose-a:underline">
        
        <!-- Standard Docs Content -->
        <div v-if="activeTab !== 'privacy'">
          <div class="mb-12 border-b border-slate-100 pb-8">
            <h1 class="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">Hearline — Listen to any webpage</h1>
            <p class="text-xl text-slate-500 tracking-tight leading-relaxed">Hearline reads any webpage, article or blog out loud with real-time word highlighting.</p>
            <div class="flex items-center gap-3 mt-6">
              <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold tracking-wider rounded-md">Chrome Web Store</span>
              <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold tracking-wider rounded-md">License: MIT Version</span>
            </div>
          </div>

          <!-- Intro -->
          <section v-show="activeTab === 'intro'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-2xl font-semibold mb-4 text-slate-900">What is Hearline?</h2>
            <p class="text-[16px] leading-relaxed text-slate-600 mb-6">
              Hearline is a free Chrome Extension that reads any webpage out loud while highlighting each word in real time. Think of it like a karaoke cursor for the web. It was built for students, professionals, and anyone who learns better by listening.
            </p>
            <p class="text-[16px] leading-relaxed text-slate-600 mb-8 font-medium">
              No account required. No data sent anywhere.
            </p>
            
            <figure class="relative rounded-xl overflow-hidden border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] mb-10">
               <div class="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                 <div class="flex gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div><div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div><div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div></div>
                 <div class="mx-auto text-[10px] font-semibold text-slate-400">Chrome - Browsers White Mode</div>
               </div>
               <img src="/docs.png" alt="Hearline Chrome Extension in action" class="w-full h-auto bg-white" />
            </figure>
            
            <button @click="activeTab = 'features'" class="px-6 py-2.5 bg-[#1B57EB] text-white rounded-lg font-medium hover:bg-blue-700 transition">Explore Features →</button>
          </section>

          <!-- Features -->
          <section v-show="activeTab === 'features'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-2xl font-semibold mb-6 text-slate-900">Features</h2>
            <ul class="space-y-4 text-[16px] text-slate-600 list-none p-0">
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">Read aloud</strong> — reads any page or selected text out loud using your browser's built-in voice</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">Real-time highlighting</strong> — follows along and highlights each word as it is spoken</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">RSVP speed reading</strong> — flashes one word at a time on screen, up to 3x faster than normal reading</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">Smart summarizer</strong> — pulls out the key points from any page instantly, no AI or internet needed</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">100% private</strong> — everything runs inside your browser, nothing is sent to any server</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-6 h-6 rounded bg-blue-50 text-[#0A7FFF] flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                <div><strong class="text-slate-900">Works everywhere</strong> — articles, blogs, Wikipedia, course pages, and documentation sites</div>
              </li>
            </ul>
          </section>

          <!-- Installation -->
          <section v-show="activeTab === 'install'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-2xl font-semibold mb-6 text-slate-900">How to Install</h2>
            
            <div class="mb-8">
              <h3 class="text-lg font-medium text-slate-800 mb-3">Option 1: Chrome Web Store (Recommended)</h3>
              <a 
                href="https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb" 
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Click here to install Hearline
              </a>
            </div>

            <div>
              <h3 class="text-lg font-medium text-slate-800 mb-3">Option 2: Manual Install</h3>
              <p class="text-slate-600 mb-4">Download or clone this repository</p>
              
              <div class="bg-slate-800 text-slate-50 p-4 rounded-lg font-mono text-[13px] mb-6 shadow-inner">
                git clone https://github.com/abdisamadjoe/hearline.git
              </div>

              <ol class="space-y-3 text-[16px] text-slate-600 ml-5 list-decimal marker:text-slate-400">
                <li>Open Chrome and go to <code class="px-1.5 py-0.5 bg-slate-100 rounded text-sm text-slate-800">chrome://extensions/</code></li>
                <li>Turn on <strong>Developer mode</strong> using the toggle in the top right corner</li>
                <li>Click <strong>Load unpacked</strong></li>
                <li>Select the <code class="px-1.5 py-0.5 bg-slate-100 rounded text-sm text-slate-800">hearline</code> folder</li>
                <li>The Hearline icon will appear in your Chrome toolbar</li>
              </ol>
            </div>
          </section>

          <!-- Usage -->
          <section v-show="activeTab === 'usage'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-2xl font-semibold mb-6 text-slate-900">How to Use</h2>
            
            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-left text-[15px]">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th class="px-5 py-3 font-medium">What you want to do</th>
                    <th class="px-5 py-3 font-medium">How to do it</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Read the full page</td>
                    <td class="px-5 py-3">Click the Hearline icon and it starts reading immediately</td>
                  </tr>
                  <tr class="bg-slate-50/50">
                    <td class="px-5 py-3 font-medium text-slate-800">Jump to a paragraph</td>
                    <td class="px-5 py-3">Hover over any paragraph and click the play button that appears</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Change reading speed</td>
                    <td class="px-5 py-3">Use the speed selector in the floating player</td>
                  </tr>
                  <tr class="bg-slate-50/50">
                    <td class="px-5 py-3 font-medium text-slate-800">Pause or resume</td>
                    <td class="px-5 py-3">Click the pause button in the floating player</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Stop at any time</td>
                    <td class="px-5 py-3">Click the close button or press the Escape key</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Tech Stack -->
          <section v-show="activeTab === 'tech'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 class="text-2xl font-semibold mb-4 text-slate-900">Privacy & Architecture</h2>
            
            <p class="text-[16px] leading-relaxed text-slate-600 mb-6">
              Hearline runs entirely on your device. It uses your browser's built-in Web Speech API to generate voice, so no text is ever sent to any server. There is no account to create, no data collected, and no analytics of any kind.
            </p>
            <p class="text-[16px] leading-relaxed text-slate-900 font-medium mb-10 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
              Your reading stays completely private.
            </p>

            <h3 class="text-xl font-semibold mb-4 text-slate-900">Tech Stack</h3>
            <div class="overflow-x-auto rounded-xl border border-slate-200 mb-10">
              <table class="w-full text-left text-[15px]">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th class="px-5 py-3 font-medium">Layer</th>
                    <th class="px-5 py-3 font-medium">Technology used</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Extension platform</td>
                    <td class="px-5 py-3">Chrome Manifest V3</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Text to speech</td>
                    <td class="px-5 py-3">Web Speech API (SpeechSynthesisUtterance)</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Highlighting</td>
                    <td class="px-5 py-3">Real-time word-level span injection</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Settings storage</td>
                    <td class="px-5 py-3">chrome.storage.local</td>
                  </tr>
                  <tr>
                    <td class="px-5 py-3 font-medium text-slate-800">Frameworks</td>
                    <td class="px-5 py-3">None, pure Vanilla JavaScript</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="text-xl font-semibold mb-4 text-slate-900">File Structure</h3>
            <pre class="bg-slate-800 text-slate-300 p-5 rounded-lg font-mono text-[13px] overflow-x-auto shadow-inner leading-relaxed"><code>hearline/
├── manifest.json       <span class="text-slate-500"># Extension configuration</span>
├── background.js       <span class="text-slate-500"># Service worker</span>
├── content.js          <span class="text-slate-500"># Core engine (extract, chunk, speak, highlight)</span>
├── injected.css        <span class="text-slate-500"># Highlight and player styles</span>
├── popup.html          <span class="text-slate-500"># Extension popup interface</span>
├── popup.css           <span class="text-slate-500"># Popup styles</span>
└── popup.js            <span class="text-slate-500"># Popup controls and messaging</span></code></pre>
            
            <div class="mt-10 pt-8 border-t border-slate-100 text-[15px] text-slate-600">
              <h3 class="text-lg font-semibold text-slate-900 mb-3">Contributing</h3>
               <p class="mb-4">Contributions are welcome. If you have a feature idea or find a bug, please open an issue first before submitting a pull request.</p>
               <ol class="space-y-1 ml-5 list-decimal marker:text-slate-400 mb-6">
                 <li>Fork the repository</li>
                 <li>Create your branch: <code class="px-1.5 bg-slate-100 rounded text-[13px]">git checkout -b feature/your-feature</code></li>
                 <li>Commit your changes: <code class="px-1.5 bg-slate-100 rounded text-[13px]">git commit -m 'Add your feature'</code></li>
                 <li>Push to your branch: <code class="px-1.5 bg-slate-100 rounded text-[13px]">git push origin feature/your-feature</code></li>
                 <li>Open a Pull Request</li>
               </ol>

               <h3 class="text-lg font-semibold text-slate-900 mb-2">Author</h3>
               <p>Built by <a href="https://github.com/abdisamadjoe" target="_blank" class="font-medium text-[#0A7FFF] hover:underline">@abdisamadjoe</a></p>
               <p class="mt-3 p-4 bg-blue-50 text-blue-900 rounded-lg">If Hearline helped you, please leave a star on GitHub and a review on the Chrome Web Store. It helps more people find the extension.</p>
            </div>
          </section>
        </div>

        <!-- Privacy Policy Content -->
        <div v-if="activeTab === 'privacy'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div class="mb-10 border-b border-slate-100 pb-8">
            <h1 class="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">Privacy Policy</h1>
            <p class="text-lg text-slate-500">Last updated: April 2026</p>
          </div>

          <section class="space-y-8">
            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">The short version</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">Hearline does not collect, store, or transmit any of your data. Everything runs locally inside your browser. Nothing ever leaves your device.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">What data we collect</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed"><strong>None.</strong> Hearline does not collect any personal information, browsing history, reading habits, or any other data about you or your device.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">How the extension works</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">Hearline reads the text on your screen using your browser's built-in Web Speech API. This runs entirely on your device. No text from any webpage is ever sent to any external server.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Local storage</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">Hearline does not use <code>chrome.storage</code> or any storage API. Your preferences are not saved between sessions. Nothing is stored on your device beyond what your browser handles natively.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Third parties</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">Hearline does not share any data with third parties because it does not collect any data in the first place. We have no advertising partners, analytics providers, or data brokers.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Children's privacy</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">Hearline is safe for users of all ages. Because we collect no data whatsoever, there is no personal information at risk regardless of the age of the user.</p>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Changes to this policy</h3>
              <p class="text-[16px] text-slate-600 leading-relaxed">If this policy ever changes, the updated version will be posted here with a new date. Any future changes will maintain our core commitment to collecting zero user data.</p>
            </div>

            <div class="p-6 bg-slate-50 border border-slate-100 rounded-xl mt-12">
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Contact</h3>
              <p class="text-[15px] text-slate-600">Questions about this privacy policy? Reach us at <a href="mailto:hello@abdisamadjoe.com" class="text-[#0A7FFF] font-medium hover:underline">hello@abdisamadjoe.com</a></p>
            </div>
          </section>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeTab = ref('intro')

onMounted(() => {
  // Respect hash anchor if present (e.g. /docs#privacy)
  if (route.hash === '#privacy') {
    activeTab.value = 'privacy'
  }
})
</script>
