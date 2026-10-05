// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
    'motion-v/nuxt'
  ],

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      Outfit: [400, 500, 600, 700, 800]
    }
  }
})
