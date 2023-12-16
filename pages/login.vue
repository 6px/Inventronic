<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-auto">
    <h2 class="my-6 text-center text-3xl font-extrabold u-text-white">
      Sign in or create your account
    </h2>
    <AuthLogin>
      <UButton v-if="emailSignUpOk===false && emailSignInOk===false" class="mt-3" icon="i-mdi-github" block label="Github" color="black"
        @click="auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })" />

      <UDivider v-if="emailSignUpOk===false && emailSignInOk===false" class="my-8">OR</UDivider>


      <UForm v-if="emailSignUpOk===false && emailSignInOk===false" @submit="signin" :validate="loginvalidate" :state="loginstate">
        <UFormGroup label="Email">
          <UInput v-model="loginstate.email" color="white" type="email" name="loginemail" placeholder="email@domain.com"
            class="mb-2" />
        </UFormGroup>
        <UFormGroup label="Password">
          <UInput v-model="loginstate.password" color="white" name="loginpassword" type="password" placeholder="password"
            class="mb-2" />
        </UFormGroup>
        <UButton type="submit" class="mt-3" icon="i-heroicons-outline-lock-open" block label="E-mail" color="black" :loading="signinLoading"
          :disabled="signinLoading" />
      </UForm>
      <div v-if="emailSignUpOk === true">
        <div class="mb-2">
          Please check your inbox for a confirmation link, or input the code you received below
        </div>
        <UForm @submit="checkOtp" :validate="validate" :state="state">
        <UFormGroup label="Code">
          <UInput v-model="otp" color="white" placeholder="a six digit number" class="mb-2" />
        </UFormGroup>
        <UButton type="submit" class="mt-3" block label="Login" color="black" :loading="otpLoading" :disabled="otpLoading"
          @click="checkOtp" />
        </UForm>
      </div>
      <UDivider v-if="emailSignUpOk===false && emailSignInOk===false" class="my-8">OR</UDivider>
      <div v-if="emailSignUpOk===false && emailSignInOk===false">
        <UForm @submit="onSubmit" :validate="validate" :state="state">
          <UFormGroup label="Sign in with OTP">
            <UInput name="email" v-model="state.email" color="white" type="email" placeholder="email@domain.com"
              class="mb-2" />
          </UFormGroup>
          <UButton type="submit" class="mt-3" icon="i-heroicons-outline-envelope" block label="E-mail" color="black"
            :loading="emailLoading" :disabled="emailLoading" />
        </UForm>

      </div>
      <div v-if="emailSignInOk===true">
        <div class="mb-2">
          Please check your inbox for a login link, or input the OTP you received below
        </div>
        <UForm @submit="checkOtp" :validate="validate" :state="state">
          <UFormGroup label="Code">
            <UInput v-model="otp" color="white" placeholder="a six digit number" class="mb-2" />
          </UFormGroup>
          <UButton type="submit" class="mt-3" block label="Login" color="black" :loading="otpLoading" :disabled="otpLoading"
            @click="checkOtp" />
        </UForm>
      </div>
    </AuthLogin>
  </div>
</template>

<script lang="ts" setup>
import type { FormError, FormSubmitEvent } from '#ui/types'

const user = useSupabaseUser()
const { auth } = useSupabaseClient()
const toast = useToast()

useHead({
  title: 'Login',
})


const emailSignInOk = ref(false)
const emailLoading = ref(false)
const signinLoading = ref(false)
const emailSignUpOk = ref(false)
const otp = ref('')
const otpLoading = ref(false)

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`

watchEffect(() => {
  if (user.value && user.value.id) {
    navigateTo('/')
  }
})
const loginstate = reactive({
  email: undefined,
  password: undefined,
})

const state = reactive({
  email: undefined,
})

const checkOtp = async () => {
  const mail = loginstate.email ? loginstate.email : state.email
  otpLoading.value = true
  const { data, error } = await auth.verifyOtp({ email: mail, token: otp.value, type: 'email' })
  otpLoading.value = false;
}

async function signin(event: FormSubmitEvent<any>) {
  signinLoading.value = true
  const { data, error } = await auth.signInWithPassword({
    email: loginstate.email,
    password: loginstate.password,
  })
  console.log('sign in result', data, error)
  if (error) {
    const { data, error } = await auth.signUp({
      email: loginstate.email,
      password: loginstate.password,
    })
    if (data) {
      if (data.session === null) {
        toast.add({
          id: 'signup_email_confirm',
          title: 'Sign up successful',
          description: 'Please click the link in the email we sent you to confirm your email address',
          icon: 'i-heroicons-outline-check-circle',
          timeout: 10000,
          color: 'green'
        })
        emailSignUpOk.value = true
      }
    }
  }
  signinLoading.value = false
}

async function onSubmit(event: FormSubmitEvent<any>) {
  emailLoading.value = true
  const { error } = await auth.signInWithOtp({
    email: state.email,
    options: {
      emailRedirectTo: redirectTo,
    }
  })
  if (error) {
    toast.add({
      id: 'signin_email_error',
      title: 'Could not sign you in',
      description: error.message,
      icon: 'i-heroicons-outline-exclamation-triangle',
      timeout: 10000,
      color: 'red'
    })
  } else {
    emailSignInOk.value = true
    toast.add({
      id: 'signin_email_confirm',
      title: 'Sign in successful',
      description: 'Please click the link in the email we sent you to confirm your email address',
      icon: 'i-heroicons-outline-check-circle',
      timeout: 10000,
      color: 'green'
    })
  }
  emailLoading.value = false
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Required' })
  return errors
}
const loginvalidate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'loginemail', message: 'Required' })
  if (!state.password) errors.push({ path: 'loginpassword', message: 'Required' })
  return errors
}
</script>

<style></style>