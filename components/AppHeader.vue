<template>
<div>
    <Title>Inventronic</Title>
    <div class="flex items-center md:justify-between justify-center">
      <div class="hidden md:block">
        <UButton
          label="INVENTRONIC"
          variant="link"
          to="/"
          icon="i-heroicons-outline-bolt"
        />
        <UButton
          label="Parts"
          variant="link"
          to="/parts"
          icon="i-heroicons-outline-cpu-chip"
        />

        <UButton
          label="Locations"
          variant="link"
          to="/locations"
          icon="i-heroicons-outline-map-pin"
        />
      </div>
      <div class="flex items">
        <UButton
          :icon="colorModeIcon"
          @click="toggleDark"
        />
        
        <UButton
          v-if="user"
          class="u-text-white ml-2"
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

