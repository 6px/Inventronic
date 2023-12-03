<template>
  <nav>
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden" v-if="user">
          <!-- Mobile menu button-->
          <UButton @click="showNav=!showNav" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white" aria-controls="mobile-menu" :aria-expanded="showNav">
            <span class="absolute -inset-0.5"></span>
            <span class="sr-only">Open main menu</span>
            <svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path v-if="showNav" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </UButton>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex flex-shrink-0 items-center">
            <NuxtLink
              to="/"
              class="text-primary-600 pr-3 py-2 flex items-center text-monaspace"
            >
              <UIcon name="i-heroicons-outline-bolt" class="text-2xl" />
              <strong>INVENTRONIC</strong>
            </NuxtLink>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <NavMenu :mobile="false" v-if="user" />
          </div>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-0 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

          <div class="flex items m-1" v-if="user">
            <UPopover :popper="{ arrow: true, placement: 'bottom-end' }">
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
          <div class="flex items m-1" v-else>
            <UButton
              class="u-text-white"
              color="white"
              to="/login"
            >
              Sign in
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div v-if="showNav" class="sm:hidden" id="mobile-menu">
      <NavMenu :mobile="true" v-if="user" />
    </div>
  </nav>
</template>

<script lang="ts" setup>
import sha256 from 'crypto-js/sha256';

const client = useSupabaseClient()
const user = useSupabaseUser()
const hash = ref('')

const showNav = ref(false)

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

