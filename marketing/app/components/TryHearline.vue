<template>
  <section class="py-16 sm:py-32 bg-transparent relative z-30 overflow-hidden">
    <!-- Subtle background grid/glow for the dark section -->
    <div class="absolute inset-0 bg-[#0A7FFF]/5 mix-blend-color-dodge pointer-events-none"></div>
    
    <div class="max-w-5xl mx-auto px-6 relative flex flex-col items-center z-10">
      <!-- Section Header -->
      <div class="text-center mb-12 sm:mb-16">
        <h2 class="text-3xl md:text-5xl font-sans font-medium tracking-tight text-white mb-4 drop-shadow-sm px-4">See Hearline in Action</h2>
        <p class="text-[16px] sm:text-[18px] text-blue-100/80 font-sans tracking-wide font-light">Try it instantly, no install needed.</p>
      </div>

      <!-- Browser Mockup -->
      <div class="relative w-full perspective-2000">
        <!-- Deep Blue Glow Behind Mockup for maximum POP -->
        <div class="absolute inset-x-4 -inset-y-4 md:inset-x-10 md:-inset-y-10 bg-blue-400/30 blur-[60px] md:blur-[120px] rounded-[40px] -z-10 pointer-events-none"></div>
        
        <!-- Main Window -->
        <div class="w-full bg-white rounded-[16px] md:rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden flex flex-col relative z-0">
        <!-- Top bar (Fake macOS UI) -->
        <div class="h-10 sm:h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 sm:px-5 gap-2 relative">
          <div class="flex gap-1.5 sm:gap-2">
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56]"></div>
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]"></div>
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
            <span class="text-[10px] sm:text-xs font-semibold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 truncate max-w-full">
              hearline.groundwork.co.ke/demo
            </span>
          </div>
        </div>
        
        <!-- Main Panel -->
        <div class="p-5 sm:p-8 md:p-10 flex flex-col gap-8 sm:gap-10 min-h-[350px] sm:min-h-[400px]">
          
          <!-- Input Area -->
          <div class="flex flex-col gap-3">
             <div class="flex justify-between items-center">
                <span class="text-[11px] sm:text-[13px] font-bold text-slate-400 uppercase tracking-wider">Source Text</span>
                <button @click="loadSample" class="text-[13px] sm:text-[14px] text-[#0A7FFF] hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors">
                  <FileText class="w-4 h-4" /> Load Sample
                </button>
             </div>
             <textarea 
               v-model="text"
               placeholder="Paste or type anything here to see how Hearline highlights text in real-time..."
               class="w-full h-32 px-4 sm:px-5 py-4 rounded-[12px] bg-slate-50 border border-slate-200 text-slate-700 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0A7FFF]/20 focus:border-[#0A7FFF] transition-all resize-none shadow-inner font-sans"
             ></textarea>
          </div>

          <!-- Controls panel (Matches Extension Design Style exactly) -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
             <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
               <button @click="readAloud" :disabled="!text.trim() || (isPlaying && !isPaused)" class="hl-btn flex-1 sm:flex-none" :class="{ 'opacity-50 cursor-not-allowed': !text.trim() || (isPlaying && !isPaused) }">
                 <Play v-if="!isPlaying || isPaused" class="w-[18px] h-[18px] fill-current" />
                 <Volume2 v-else class="w-[18px] h-[18px]" />
                 <span class="font-semibold">{{ isPlaying && !isPaused ? 'Reading...' : (isPaused ? 'Resume' : 'Read Aloud') }}</span>
               </button>
               
               <button @click="pause" :disabled="!isPlaying || isPaused" class="hl-btn-icon" :class="{ 'opacity-50 cursor-not-allowed': !isPlaying || isPaused }" title="Pause">
                 <Pause class="w-[18px] h-[18px] fill-current" />
               </button>

               <button @click="reset" :disabled="!isPlaying && isPaused === false && activeCharIndex === -1" class="hl-btn-icon" :class="{ 'opacity-50 cursor-not-allowed': !isPlaying && activeCharIndex === -1 }" title="Reset">
                 <RotateCcw class="w-[18px] h-[18px]" />
               </button>
             </div>
             
             <div class="flex items-center gap-2">
                  <span v-if="isPlaying" class="flex h-2 w-2 relative">
                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A7FFF] opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-2 w-2 bg-[#0A7FFF]"></span>
                 </span>
                <span class="text-[12px] sm:text-[13px] font-medium text-slate-400">
                  {{ isPlaying && !isPaused ? 'Synthesizing voice' : 'Audio engine ready' }}
                </span>
             </div>
          </div>

          <!-- Output Panel -->
          <div class="flex-grow">
             <div class="text-[18px] sm:text-[20px] md:text-[24px] leading-[1.6] sm:leading-[1.7] font-sans text-slate-400 selection:bg-[#E7F3FF] selection:text-[#0A7FFF]">
                <template v-for="word in words" :key="word.id">
                   <span v-if="word.isSpace" class="whitespace-pre-wrap">{{ word.text }}</span>
                   <span v-else 
                         class="transition-all duration-100 ease-in-out px-[2px] -mx-[2px] py-[2px] rounded-[6px]"
                         :class="{ 
                           'text-[#0A7FFF] bg-[#E7F3FF] font-medium scale-[1.02] inline-block shadow-sm': isWordActive(word), 
                           'text-slate-900': hasPassedWord(word) && !isWordActive(word),
                           'text-slate-600': !hasPassedWord(word) && !isWordActive(word)
                         }">
                     {{ word.text }}
                   </span>
                </template>
                <div v-if="words.length === 0 || (words.length === 1 && !words[0].text)" class="text-slate-300 font-light mt-2">
                  <span class="text-[24px] sm:text-[28px] opacity-30 block mb-2">“</span>
                  Type or paste text above, then click Read Aloud to watch Hearline sync the spoken words beautifully to the text on screen. This simulates our clean, non-intrusive injection layer.
                </div>
             </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Play, Pause, RotateCcw, FileText, Volume2 } from 'lucide-vue-next'

const text = ref('')
const isPlaying = ref(false)
const isPaused = ref(false)
const activeCharIndex = ref(-1)

const words = computed(() => {
  let offset = 0;
  return text.value.split(/(\s+)/).map((part, index) => {
    const info = { id: index, text: part, start: offset, end: offset + part.length, isSpace: /^\s+$/.test(part) }
    offset += part.length;
    return info;
  })
})

function getVoice() {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices()
  return voices.find(v => v.name === 'Microsoft David - English (United States)')
    || voices.find(v => v.name.includes('David'))
    || voices.find(v => v.lang === 'en-US')
    || voices[0]
}

function loadSample() {
  text.value = "Hearline is a lightweight browser extension that reads any webpage out loud for you. It features real-time word highlighting and works completely offline, with no tracking. Try pausing, resuming, or resetting the audio to see how it flows naturally."
  reset()
}

let currentUtterance = null;

function readAloud() {
  if (typeof window === 'undefined') return;
  if (isPlaying.value && !isPaused.value) return;

  if (isPaused.value) {
    window.speechSynthesis.resume()
    isPaused.value = false
    return;
  }

  if (!text.value.trim()) return;

  window.speechSynthesis.cancel()
  activeCharIndex.value = -1;
  
  currentUtterance = new SpeechSynthesisUtterance(text.value)
  currentUtterance.voice = getVoice() || null;
  currentUtterance.rate = 1.0

  currentUtterance.onboundary = (e) => {
    if (e.name === 'word') {
      activeCharIndex.value = e.charIndex
    }
  }

  currentUtterance.onend = () => {
    isPlaying.value = false
    isPaused.value = false
    activeCharIndex.value = -1
  }

  currentUtterance.onerror = (e) => {
    // Fired gracefully when cancelled.
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
       isPlaying.value = false
       isPaused.value = false
       activeCharIndex.value = -1
    }
  }

  window.speechSynthesis.speak(currentUtterance)
  isPlaying.value = true
  isPaused.value = false
}

function pause() {
  if (typeof window === 'undefined') return;
  if (isPlaying.value && !isPaused.value) {
    window.speechSynthesis.pause()
    isPaused.value = true
  }
}

function reset() {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel()
  isPlaying.value = false
  isPaused.value = false
  activeCharIndex.value = -1
}

function isWordActive(word) {
  if (activeCharIndex.value === -1) return false;
  return word.start <= activeCharIndex.value && word.end > activeCharIndex.value;
}

function hasPassedWord(word) {
  if (activeCharIndex.value === -1) return false;
  return word.end <= activeCharIndex.value;
}

// Clean up speech synthesis when component is destroyed
onUnmounted(() => {
  reset()
})
</script>

<style scoped>
/* Copied directly from extension styling */
.hl-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  height: 44px !important;
  padding: 0 20px 0 16px !important;
  border-radius: 100px !important;
  background: rgba(10, 127, 255, 0.12) !important;
  border: none !important;
  cursor: pointer !important;
  color: #0A7FFF !important;
  font-size: 14.5px !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s cubic-bezier(0.2, 0, 0.2, 1) !important;
}

.hl-btn:hover:not(:disabled) {
  background: rgba(10, 127, 255, 0.2) !important;
  transform: scale(1.03) !important;
}

.hl-btn-icon {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  background: rgba(10, 127, 255, 0.12) !important;
  border: none !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #0A7FFF !important;
  transition: all 0.2s cubic-bezier(0.2, 0, 0.2, 1) !important;
  padding: 0 !important;
}

.hl-btn-icon:hover:not(:disabled) {
  background: rgba(10, 127, 255, 0.2) !important;
  transform: scale(1.06) !important;
}
</style>
