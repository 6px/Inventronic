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
          to="/parts"
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
const client = useSupabaseClient()
const user = useSupabaseUser()
const hash = ref('')

async function digestMessage(message: String) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

const setHash = async () => {
  hash.value = await digestMessage(user.value.email.toLowerCase())
}

onMounted(setHash)

onUpdated(setHash)


const logout = async () => {
  await client.auth.signOut()
  navigateTo('/')
}
</script>

<style>

</style>

