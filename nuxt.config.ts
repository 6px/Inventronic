// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  target: 'static',
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxtjs/color-mode'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
  },
  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/confirm'
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

