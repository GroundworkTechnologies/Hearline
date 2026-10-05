<template>
  <footer class="relative bg-transparent pt-12 sm:pt-20 pb-10 overflow-hidden text-white/90 font-sans">
    <!-- Background Accents -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-white/[0.03] blur-[120px] rounded-full pointer-events-none -z-0"></div>
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-[#2D6AFF] opacity-30 blur-[100px] rounded-full pointer-events-none -z-0"></div>

    <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      
      <!-- Pre-footer CTA -->
      <div class="flex flex-col items-center text-center pb-12 sm:pb-20 pt-8 border-b border-white/10 mb-12 sm:mb-16">
         <h2 class="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6">Ready to hear the web?</h2>
         <p class="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 tracking-tight">Join thousands of users who are transforming the way they consume internet articles, privately and free.</p>
         <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <a 
              href="https://chromewebstore.google.com/detail/hearline-%E2%80%94-listen-to-any/nnmhcmenlidkfjnhnlmppfkppefeepkb" 
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-900 text-[15px] font-semibold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex justify-center items-center gap-2"
            >
              Add to Chrome — Free
            </a>
         </div>
      </div>

      <!-- Main Footer Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
        <!-- Brand Area -->
        <div class="md:col-span-4 flex flex-col items-start gap-6">
          <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
             <img src="/logo.svg" alt="Hearline" class="h-8 w-auto brightness-0 invert" />
             <span class="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-wider mt-0.5">v1.0.0</span>
          </NuxtLink>
          <p class="text-[15px] text-white/70 max-w-sm leading-relaxed">
            The lightweight, private, and free browser extension that reads any webpage out loud for you.
          </p>
          <div class="flex items-center gap-4 mt-2">
            <a href="https://github.com/abdisamadjoe/Hearline" target="_blank" title="GitHub" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <GithubMark class="w-4 h-4 text-white fill-current" />
            </a>
            <a href="https://facebook.com/hearlineweb" target="_blank" title="Facebook" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <FacebookLogo class="w-4 h-4 text-white" />
            </a>
            <a href="https://linkedin.com/company/hearlineweb" target="_blank" title="LinkedIn" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <LinkedInLogo class="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        <!-- Links Area -->
        <div class="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:pl-16">
          <div class="flex flex-col gap-5">
            <h4 class="text-white font-semibold tracking-wide text-[15px]">Product</h4>
            <ul class="flex flex-col gap-3">
              <li><NuxtLink to="/docs" class="text-white/70 hover:text-white transition-colors text-[14px]">Overview</NuxtLink></li>
              <li><NuxtLink to="/docs#install" class="text-white/70 hover:text-white transition-colors text-[14px]">Installation</NuxtLink></li>
              <li><NuxtLink to="/docs" class="text-white/70 hover:text-white transition-colors text-[14px]">Documentation</NuxtLink></li>
            </ul>
          </div>
          
          <div class="flex flex-col gap-5">
            <h4 class="text-white font-semibold tracking-wide text-[15px]">Legal</h4>
            <ul class="flex flex-col gap-3">
              <li><NuxtLink to="/docs#privacy" class="text-white/70 hover:text-white transition-colors text-[14px]">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="#" class="text-white/70 hover:text-white transition-colors text-[14px]">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="#" class="text-white/70 hover:text-white transition-colors text-[14px]">Cookie Policy</NuxtLink></li>
            </ul>
          </div>

          <div class="flex flex-col gap-5 col-span-2 md:col-span-1">
            <h4 class="text-white font-semibold tracking-wide text-[15px]">The Creator</h4>
            <ul class="flex flex-col gap-3">
               <li><a href="https://github.com/abdisamadjoe" target="_blank" class="text-white/70 hover:text-white transition-colors text-[14px]">GitHub Profile</a></li>
               <li><a href="#" class="text-white/70 hover:text-white transition-colors text-[14px]">Contact</a></li>
               <li><a href="#" class="text-white/70 hover:text-white transition-colors text-[14px]">Support the project</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[13px] text-white/50 gap-4 md:gap-0">
        <p class="text-center md:text-left">&copy; 2026 Hearline. An open-source experiment.</p>
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>All systems operational</span>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import FacebookLogo from './FacebookLogo.vue'
import LinkedInLogo from './LinkedInLogo.vue'
import GithubMark from './GithubMark.vue'
</script>
