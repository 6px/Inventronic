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
          v-if="user"
          label="Parts"
          variant="link"
          to="/"
          icon="i-heroicons-outline-cpu-chip"
        />

        <UButton
          v-if="user"
          label="Locations"
          variant="link"
          to="/locations"
          icon="i-heroicons-outline-map-pin"
        />
        <UButton
          v-if="user"
          label="Projects"
          variant="link"
          to="/projects"
          icon="i-heroicons-outline-light-bulb"
        />
      </div>
      <div class="flex items m-1" v-if="user">
        <UPopover :popper="{ arrow: true }">
          <UButton color="white" variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid">
            <img
              :src="`https://gravatar.com/avatar/${hash}`"
              alt="user avatar"
              class="w-8 h-8 rounded-full"
            />
              
          </UButton>

          <template #panel="{ open }">
            <div class="p-4 flex flex-col">
              <div class="mb-4">
                {{ user.email }}
              </div>
              <UButton
                class="u-text-white"
                color="white"
                variant="soft"
                @click="logout"
              >
                Logout
              </UButton>
            </div>
          </template>
        </UPopover>
        
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import sha256 from 'crypto-js/sha256';

const client = useSupabaseClient()
const user = useSupabaseUser()
const hash = ref('')

function digestMessage(message: String) {
  const hashDigest = sha256(message);
  console.log(hashDigest)
  return hashDigest
}

const setHash = async () => {
  if (user && user.value && user.value.email) {
    hash.value = digestMessage(user.value.email.toLowerCase())
  } else {
    hash.value = ''
  }
}

onMounted(setHash)

onUpdated(setHash)


const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<style>

</style>

