<template>
  <div :class="`${mobile ? 'space-y-1 px-2 pb-3 pt-2' : 'flex space-x-4 items-center'}`">
    <NuxtLink
      to="/"
      active-class="font-bold text-primary-600"
      class="hover:text-primary-600 px-3 py-2 flex items-center"
    >
      <UIcon class="p-2" name="i-heroicons-outline-cpu-chip" />
      <span class="pl-1">Parts</span>
    </NuxtLink>
    <NuxtLink
      to="/locations/"
      active-class="font-bold text-primary-600"
      class="hover:text-primary-600 px-3 py-2 flex items-center"
    >
      <UIcon class="p-2" name="i-heroicons-outline-map-pin" />
      <span class="pl-1">Locations</span>
    </NuxtLink>
    <NuxtLink
      to="/projects/"
      active-class="font-bold text-primary-600"
      class="hover:text-primary-600 px-3 py-2 flex items-center"
    >
      <UIcon class="p-2" name="i-heroicons-outline-light-bulb" />
      <span class="pl-1">Projects</span>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  mobile: {
    type: Boolean,
    required: true,
  },
})
</script>

<style>

</style>