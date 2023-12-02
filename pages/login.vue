<template>
<div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-auto">
    <h2 class="my-6 text-center text-3xl font-extrabold u-text-white">
      Sign in to your account
    </h2>
    <AuthLogin>
      <UButton
        class="mt-3"
        icon="i-mdi-github"
        block
        label="Github"
        color="black"
        @click="auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })"
      />

      <hr class="mt-8 border-slate-300 dark:border-slate-700" />
      
      <div v-if="emailSignInOk===false" class="mt-8">
        <UForm @submit="onSubmit" :validate="validate" :state="state">
          <UFormGroup>
            <UInput
              v-model="state.email"
              color="white"
              type="email"
              placeholder="email@domain.com"
              class="mb-2"
            />
          </UFormGroup>
          <UButton
            type="submit"
            class="mt-3"
            icon="i-mdi-email"
            block
            label="E-mail"
            color="black"
            :loading="emailLoading"
            :disabled="emailLoading"
          />
        </UForm>
        
      </div>
      <div v-else class="mt-8">
        Please check your inbox for a login link, or input the OTP you received below
        <UFormGroup>
            <UInput
              v-model="otp"
              color="white"
              type="email"
              placeholder="email@domain.com"
              class="mb-2"
            />
          </UFormGroup>
          <UButton
            class="mt-3"
            block
            label="Login"
            color="black"
            :loading="otpLoading"
            :disabled="otpLoading"
            @click="checkOtp"
          />
      </div>
    </AuthLogin>
  </div>
</template>

<script lang="ts" setup>
import type { FormError, FormSubmitEvent } from '#ui/types'

const user = useSupabaseUser()
const { auth } = useSupabaseClient()

useHead({
  title: 'Login', 
})


const emailSignInOk = ref(false)
const emailLoading = ref(false)
const otp=ref('')
const otpLoading=ref(false)

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`

watchEffect(() => {
  console.log('user',user.value)
  if (user.value && user.value.id) {
    //navigateTo('/')
    window.location='/'
  }
})

const state = reactive({
  email: undefined
})

const checkOtp = async () => {
  otpLoading.value = true
  const { data, error } = await auth.verifyOtp({ email: state.email, token: otp.value, type: 'email'})
  otpLoading.value = false;
}

async function onSubmit (event: FormSubmitEvent<any>) {
  emailLoading.value = true
  const { error } = await auth.signInWithOtp({
    email: state.email,
    options: {
      emailRedirectTo: redirectTo,
    }
  })
  if (error){
    alert(error)
  } else {
    emailSignInOk.value = true
  }
  emailLoading.value = false
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Required' })
  return errors
}
</script>

<style>

</style>