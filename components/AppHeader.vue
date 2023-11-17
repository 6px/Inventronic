<template>
<div>
    <Title>Inventronic</Title>
    <div class="flex items-center md:justify-between justify-center">
      <div class="hidden md:block">
        <UButton
          label="INVENTRONIC"
          variant="transparent"
          target="_blank"
          to="/"
          icon="i-heroicons-outline"
        />
        <UButton
          label="Hosted on Netlify"
          variant="transparent"
          target="_blank"
          to="https://netlify.com"
          icon="i-heroicons-outline-external-link"
        />
      </div>
      <div class="flex items-center">
        <UButton
          :icon="colorModeIcon"
          @click="toggleDark"
        />
        <UButton
          v-if="user"
          class="u-text-white"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()

const toggleDark = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const colorModeIcon = computed(() => colorMode.preference === 'dark' ? 'i-heroicons-outline-moon' : 'i-heroicons-outline-sun')

const logout = async () => {
await client.auth.signOut()
navigateTo('/')
}
</script>

<style>

</style>

