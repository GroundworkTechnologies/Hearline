<template>
  <section class="relative pt-12 sm:pt-24 pb-0 overflow-hidden min-h-[auto] md:min-h-screen flex flex-col justify-between bg-transparent">
    <!-- Main Content Container centered -->
    <div class="max-w-7xl mx-auto px-6 relative z-10 w-full mb-8 sm:mb-10 text-center flex flex-col items-center">
      
      <!-- Badge -->
      <div class="inline-flex items-center px-4 py-1.5 rounded-full bg-transparent border-[1.5px] border-white/30 mb-6 shadow-sm">
        <span class="text-[12px] font-medium text-white flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Version 1.0.0 is live now
        </span>
      </div>

      <!-- Headline -->
      <h1 class="max-w-4xl text-[32px] sm:text-5xl lg:text-5xl font-sans font-medium tracking-tight text-white mb-6 leading-[1.2] sm:leading-tight">
        Hearline reads any <br class="hidden md:block" /> webpage out loud.
      </h1>

      <!-- Subheadline -->
      <p class="text-[15px] sm:text-base lg:text-lg text-white/90 font-sans tracking-tight mb-8 leading-relaxed font-medium max-w-2xl mx-auto px-4 sm:px-0">
        Hearline reads any webpage, article or blog out loud with real-time word highlighting. Completely free and private.
      </p>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
        <a 
          href="#"
          class="w-full sm:w-auto px-6 py-3 rounded-full bg-transparent border-[1.5px] border-white/30 text-white font-medium text-[14px] hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
        >
          See how it works
        </a>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <a 
            href="https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-slate-900 font-medium text-[14px] hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer shadow-md"
          >
            Add to Chrome, Free
          </a>
          <span class="text-[12px] font-medium text-white/80 whitespace-nowrap hidden sm:block">Completely free.</span>
        </div>
      </div>
    </div>

    <!-- Video Mockup Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-10 sm:mt-12 relative z-10 flex justify-center pb-12 sm:pb-20">
      <div class="relative w-full group max-w-5xl">
        
        <!-- Outer container - Full Frame (No Mask) -->
        <div class="w-full relative rounded-[16px] md:rounded-[32px] overflow-hidden bg-slate-900/50 backdrop-blur-sm shadow-2xl">
           <video 
             src="https://pub-e6ce39229d0546d7893736a30291f13e.r2.dev/mockupvideo.mp4" 
             autoplay 
             loop 
             muted 
             playsinline
             class="w-full h-auto block"
           ></video>


        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
// Simplifed to static display with no perspective animation
</script>

<style scoped>
/* Optional subtle entrance animations */
</style>
