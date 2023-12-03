// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.includes('svg:')
    }
  },
  modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxtjs/color-mode'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
  },
  css: ['~/assets/css/main.css'],
  ssr: true,
  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/confirm',
      exclude: ['/login']
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
  ui: {
    colors: {
      primary: 'blue'
    },
    icons: ['mdi', 'heroicons', 'heroicons-outline']
  },
})

