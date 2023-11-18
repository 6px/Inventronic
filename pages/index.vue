<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <h2 class="my-6 text-center text-3xl font-extrabold u-text-white">
      Sign in to your account
    </h2>
    <LoginCard>
      <UButton
        class="mt-3"
        icon="i-mdi-github"
        block
        label="Github"
        variant="black"
        @click="auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })"
      />
      
    <div>
      <input
      v-model="email"
      type="email"
    />
      <UButton
        class="mt-3"
        icon="i-mdi-email"
        block
        label="E-mail"
        variant="black"
        @click="signInWithOtp"
      />
    
  </div>
    </LoginCard>
  </div>
</template>

<script lang="ts" setup>
const user = useSupabaseUser()
const { auth } = useSupabaseClient()

const email = ref('')

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`

watchEffect(() => {
  if (user.value) {
    navigateTo('/parts')
  }
})

const signInWithOtp = async () => {
  const { error } = await auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:3000/confirm',
    }
  })
  if (error) console.log(error)}
</script>

<style>

</style>

