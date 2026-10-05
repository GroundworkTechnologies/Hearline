<template>
  <section class="py-24 bg-transparent relative z-20">
    <div class="max-w-4xl mx-auto px-6 relative z-10">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-sans font-medium tracking-tight text-white mb-4">Frequently Asked Questions</h2>
        <p class="text-[17px] text-white/80 font-sans tracking-tight">Everything you need to know about Hearline.</p>
      </div>

      <div class="flex flex-col gap-3">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="bg-white/10 border border-white/20 rounded-2xl overflow-hidden transition-all duration-300"
        >
          <button 
            @click="toggleFaq(index)"
            class="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
          >
            <span class="text-[16px] md:text-[17px] font-medium text-white tracking-tight pr-8">
              {{ faq.question }}
            </span>
            <div 
              class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300"
              :class="{ 'rotate-45': activeIndex === index }"
            >
              <PlusIcon class="w-4 h-4 text-white" />
            </div>
          </button>
          
          <div 
            v-show="activeIndex === index"
            class="px-5 md:px-6 pb-6 pt-0 text-white/70 text-[15px] leading-relaxed select-text"
          >
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
      
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { PlusIcon } from 'lucide-vue-next'

const activeIndex = ref(null)

const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const faqs = [
  {
    question: "Is Hearline really free?",
    answer: "Yes, 100% free. There are no hidden fees, subscriptions, or premium tiers. Hearline is an open-source project designed to be accessible to everyone."
  },
  {
    question: "Does it work on every website?",
    answer: "Yes! Hearline injects directly into the DOM of the page you are viewing. It will natively read and highlight text on blogs, articles, Wikipedia, and almost any text-heavy webpage."
  },
  {
    question: "Is my data private and safe?",
    answer: "Absolutely. Hearline runs entirely on your local device. It utilizes your browser's built-in Web Speech API, meaning no text or data is ever sent to an external server."
  },
  {
    question: "What permissions does Hearline need?",
    answer: "It requires minimal permissions (like 'activeTab'). This simply allows the extension to read the text of the specific tab you currently have open when you click it. It does not monitor your broader web history."
  },
  {
    question: "Does it work on Chrome, Brave and other browsers?",
    answer: "Yes, Hearline supports all Chromium-based browsers including Google Chrome, Brave, Microsoft Edge, Opera, and Vivaldi."
  },
  {
    question: "Why can I only hear one voice?",
    answer: "Hearline utilizes the Text-to-Speech engine built directly into your operating system (Windows/Mac/Linux). To change the voice, you can install new voice packs within your computer's OS accessibility settings."
  },
  {
    question: "Can I choose where to start reading on a page?",
    answer: "Yes! You can either highlight a specific section of text before pressing play, or simply hover over a paragraph and click the contextual play button to start reading exactly from that point."
  },
  {
    question: "Does Hearline work offline?",
    answer: "Yes! Because it relies entirely on your browser's local Web Speech API and does not need to send text to a cloud AI, it will function perfectly without an active internet connection."
  },
  {
    question: "Why is the floating player not showing up?",
    answer: "Extensions are restricted from running on special browser system pages (like the Chrome Web Store, or chrome:// settings pages). Try opening a standard webpage or blog to see the player."
  },
  {
    question: "Will there be more voices and features added?",
    answer: "We are always looking to improve based on user feedback. Hearline is open source, so anyone can contribute! Let us know what features you want to see via our GitHub repository."
  }
]
</script>
