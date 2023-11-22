<template>
  <ul :class="`list-none border-0 ${depth === 0 ? 'border-t ml-0' : 'ml-4 '}`">
    <li v-for="location in locations" class="">
      <div class="px-3 py-2 flex flex-row justify-between content-center items-center border-0 border-b border-r border-l border-t-2" style="margin-top: -1px;">
        <div :class="`grow leading-8 ${location.Locations.length > 0 ? 'cursor-pointer' : ''}`" @click="open(location)">
          <strong>{{ location.name }}</strong>
          <UBadge color="teal" class="ml-3">{{ location.Locations ? location.Locations.length : '0' }} <span class="hidden md:inline ml-1"> location{{ location.Locations.length > 1 ? 's' : '' }}</span></UBadge>
          <UBadge color="yellow" class="ml-3">
            {{ partsCount(location) }}<span class="hidden md:inline ml-1"> part{{ partsCount(location) > 1 ? 's' : '' }} </span>
            <!-- <span class="text-xs ml-1" v-if="location.Locations && location.Locations.length > 0">
              (total)
            </span> -->
          </UBadge>
        </div>
        <div class="shrink flex items-center content-center">
          <UPopover class="block md:hidden">
            <UButton color="white" variant="ghost" icon="i-heroicons-outline-bars-3" />

            <template #panel>
              <div class="p-4">
                <UButton variant="solid" icon="i-heroicons-outline-eye" :to="`/locations/${location.id}`" />
                <UButton class="ml-2" variant="solid" icon="i-heroicons-outline-folder-plus" @click="createModal=location.id" />
                <UButton class="ml-2" label="" icon="i-heroicons-outline-qr-code" @click="qrModal=location.id" />
                <UButton class="ml-3" variant="solid" color="red" label="" icon="i-heroicons-outline-trash" @click="remove(location)" />
              </div>
            </template>
          </UPopover>
          <div class="hidden md:block">
            <UButton variant="solid" icon="i-heroicons-outline-eye" :to="`/locations/${location.id}`" />
            <UButton class="ml-2" variant="solid" icon="i-heroicons-outline-folder-plus" @click="createModal=location.id" />
            <UButton class="ml-2" label="" icon="i-heroicons-outline-qr-code" @click="qrModal=location.id" />
            <UButton class="ml-3" variant="solid" color="red" label="" icon="i-heroicons-outline-trash" @click="remove(location)" />
          </div>
        </div>
        <div class="shrink h-5" v-if="location.Locations.length > 0">
          <UIcon v-if="opened" name="i-heroicons-chevron-down-20-solid" class="shrink w-5 h-5 ml-2 leading-8" @click="open" />
          <UIcon v-else name="i-heroicons-chevron-right-20-solid" class="shrink w-5 h-5 ml-2 leading-8" @click="open" />
        </div>
        <div v-else class="w-7 h-5"></div>
      </div>
      <LocationsQRCodeModal :open="qrModal===location.id" :location="location" @close="qrModal=0" />
      <LocationsCreate :open="createModal===location.id" :parent="location" @close="createModal=0" @refresh="refresh" />
      <LocationsTree :locations="location.Locations" v-if="opened[location.id]" :depth="depth+1" @refresh="refresh" />
    </li>
  </ul>


</template>

<script lang="ts" setup>
const emit = defineEmits()
const client = useSupabaseClient()

const props = defineProps({
  locations: {
    type: Array<Location>,
    required: true,
  },
  depth: {
    type: Number,
    required: true
  }
});

const opened = ref({})

const qrModal = ref(0)
const createModal = ref(0)

const open = (location: Location) => {
  if (typeof  opened.value[location.id] === 'undefined') {
    opened.value[location.id] = true
  } else {
    opened.value[location.id] = !opened.value[location.id]
  }
  console.log(opened)
}

const refresh = () => {
  emit('refresh')
}

const partsCount = (location: Location) => {
  // if (typeof location.Locations === undefined) {
    return location.Parts ? location.Parts.length : 0
  // }
  // return location.Parts.length + location.Locations.reduce((acc, l) => {
  //   return partsCount(l) + acc
  // }, 0)
}

const remove = async (location: Location) => {
  // check if location contains children or parts, and warn if so
  if (location.Locations.length > 0) {
    if (!confirm('This location has children, are you sure you want to remove it and all it\'s children?')) {
      return
    }
  }
  if (location.Parts.length > 0) {
    if (!confirm('This location contains parts, are you sure you want to remove it and all the parts it contains?')) {
      return
    }
  }
  const { error } = await client
  .from('Locations')
  .delete()
  .eq('id', location.id)
  emit('refresh')
  if (error) {
    alert(error.message)
  }
}

</script>

<style>
</style>

