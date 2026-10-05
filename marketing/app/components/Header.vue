<template>
  <header class="sticky top-0 left-0 right-0 z-50 bg-[#1258FD] border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
      <!-- Brand -->
      <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
         <img src="/logo.svg" alt="Hearline" class="h-8 w-auto brightness-0 invert" />
         <span class="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-wider mt-0.5">v1.0.0</span>
      </NuxtLink>

      <!-- Menu Items (Desktop) -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink 
          v-for="item in menuItems" 
          :key="item.label" 
          :to="item.to" 
          :target="item.to.startsWith('http') ? '_blank' : undefined"
          class="text-[15px] font-medium text-white/90 hover:text-white transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Utilities -->
      <div class="flex items-center gap-2 sm:gap-4">
        <a 
          href="https://github.com/abdisamadjoe/Hearline" 
          target="_blank" 
          class="hidden md:flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-slate-900 text-[14px] sm:text-[15px] font-semibold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 border border-transparent shadow-sm"
        >
          <GithubMark class="w-5 h-5" />
          <span class="hidden sm:inline">Star on GitHub</span>
          <span class="sm:hidden">Star</span>
        </a>

        <!-- Mobile Menu Toggle -->
        <button 
          class="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          @click="isMenuOpen = !isMenuOpen"
          aria-label="Toggle menu"
        >
          <Menu v-if="!isMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMenuOpen" class="md:hidden bg-[#1258FD] border-b border-white/10 pb-6 px-6">
        <nav class="flex flex-col gap-4">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.label" 
            :to="item.to" 
            @click="isMenuOpen = false"
            :target="item.to.startsWith('http') ? '_blank' : undefined"
            class="text-[16px] font-medium text-white/90 hover:text-white transition-colors py-2"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import GithubMark from './GithubMark.vue'

const isMenuOpen = ref(false)

const menuItems = [
  { label: "Docs", to: "/docs" },
  { label: "The Creator", to: "https://abdisamadjoe.com/" },
  { label: "Privacy Policy", to: "/docs#privacy" },
]
</script>
