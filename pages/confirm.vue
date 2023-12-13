<template>
  <div>
    <p class="u-text-black text-center mt-16">
      Redirecting...
    </p>
  </div>
</template>

<script lang="ts" setup>
const user = useSupabaseUser()

watch(user, () => {
  if (user.value) {
    return navigateTo('/parts/')
  }
}, { immediate: true })
</script>

<style>

</style>

