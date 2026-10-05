<template>
  <section class="py-8 relative overflow-hidden bg-transparent">
    
    <div class="max-w-7xl mx-auto relative w-full flex overflow-hidden group">
      <!-- Gradient masks for smooth fade on edges -->
      <div class="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#1258FD] to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#1258FD] to-transparent z-10 pointer-events-none"></div>

      <!-- Marquee Track Wrapper -->
      <div class="flex w-full overflow-hidden">
        
        <!-- Exact Duplicate Track 1 -->
        <div class="flex shrink-0 animate-marquee items-center gap-12 md:gap-24 pr-12 md:pr-24 min-w-max">
          <div v-for="browser in browsers" :key="`t1-${browser.name}`" class="logo-group shrink-0 flex items-center gap-3 cursor-default">
             <img :src="browser.icon" :alt="browser.name" class="logo-svg w-8 h-8 md:w-10 md:h-10 drop-shadow-sm transition-all duration-300" />
             <span class="logo-name text-[16px] md:text-[18px] font-semibold tracking-tight text-white">{{ browser.name }}</span>
          </div>
        </div>

        <!-- Exact Duplicate Track 2 -->
        <div class="flex shrink-0 animate-marquee items-center gap-12 md:gap-24 pr-12 md:pr-24 min-w-max" aria-hidden="true">
          <div v-for="browser in browsers" :key="`t2-${browser.name}`" class="logo-group shrink-0 flex items-center gap-3 cursor-default">
             <img :src="browser.icon" :alt="browser.name" class="logo-svg w-8 h-8 md:w-10 md:h-10 drop-shadow-sm transition-all duration-300" />
             <span class="logo-name text-[16px] md:text-[18px] font-semibold tracking-tight text-white">{{ browser.name }}</span>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup>
const browsers = [
  { name: 'Google Chrome', icon: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome.svg' },
  { name: 'Brave', icon: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave.svg' },
  { name: 'Microsoft Edge', icon: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge.svg' },
  { name: 'Opera', icon: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera.svg' },
  { name: 'Vivaldi', icon: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/vivaldi/vivaldi.svg' }
]
</script>

<style scoped>
/* Infinite Marquee */
.animate-marquee {
  animation: marquee 25s linear infinite;
}
.group:hover .animate-marquee {
  animation-play-state: paused;
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* Hover Interactivity */
.logo-group {
  transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
}

.logo-group:hover {
  transform: scale(1.1);
}
</style>
