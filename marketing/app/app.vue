<template>
  <div class="min-h-screen w-full relative font-sans text-slate-900 bg-[#1258FD] overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
    <NuxtRouteAnnouncer />

    <!-- Architectural Grid Lines (Subtle) - Hidden on mobile -->
    <div class="fixed inset-0 pointer-events-none z-30 hidden md:flex justify-center">
      <div class="w-full max-w-7xl h-full border-x border-white/20 mix-blend-overlay"></div>
    </div>
    
    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow">
        <NuxtPage />
      </main>
      
      <!-- Footer Component -->
      <Footer />
    </div>
  </div>
</template>

<script setup>
// SEO and Meta
useHead({
  title: 'Hearline - Listen to any webpage',
  meta: [
    { name: 'description', content: 'Hearline reads any webpage, article or blog out loud with real-time word highlighting. Completely free and private.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/icon.png' }
  ]
})
</script>

<style>
/* Global resets and base styles */
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: white;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
