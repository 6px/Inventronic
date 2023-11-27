// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxtjs/color-mode'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
  },
  ssr: false,
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: []
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
  ui: {
    colors: {
      primary: 'green'
    },
    icons: ['mdi', 'heroicons', 'heroicons-outline']
  },
})

