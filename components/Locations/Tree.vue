<template>
  <ul :class="`ml-4 list-none border-0 ${depth === 0 ? 'border-t' : ''}`">
    <li v-for="location in locations" class="">
      <div class="px-3 py-2 flex flex-row justify-between content-center items-center border-0 border-b border-r border-l">
        <div :class="`grow leading-8 ${location.Locations.length > 0 ? 'cursor-pointer' : ''}`" @click="open">
          <strong>{{ location.name }}</strong>
          <UBadge color="yellow" class="ml-3">{{ location.Parts ? location.Parts.length : '0' }} parts</UBadge>
        </div>
        <UButton variant="solid" label="Edit" class="shrink" />
        <div class="shrink h-5" v-if="location.Locations.length > 0">
          <UIcon v-if="opened" name="i-heroicons-chevron-down-20-solid" class="shrink w-5 h-5 ml-2 leading-8" @click="open" />
          <UIcon v-else name="i-heroicons-chevron-right-20-solid" class="shrink w-5 h-5 ml-2 leading-8" @click="open" />
        </div>
        <div v-else class="w-7 h-5"></div>
      </div>
      <LocationsTree :locations="location.Locations" v-if="opened" :depth="depth+1" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
const props = defineProps({
  locations: {
    type: Array,
    required: true,
  },
  depth: {
    type: Number,
    required: true
  }
});

const opened = ref(false)

const open = () => {
  opened.value = !opened.value
}

</script>

<style>
</style>

