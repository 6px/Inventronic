// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.includes('svg:')
    }
  },
  modules: ['jfoucher-nuxt-supabase', '@nuxt/ui', '@nuxtjs/color-mode'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      supabase: {
        url: process.env.SUPABASE_URL,
        serverUrl: process.env.SERVER_URL || process.env.SUPABASE_URL,
        redirectOptions: {
          login: '/',
          callback: '/confirm',
          exclude: ['/login']
        },
      },
    },
  },
  css: ['~/assets/css/main.css'],
  ssr: true,

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

