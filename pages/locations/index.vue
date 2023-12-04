<template>
  <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white text-center">
      Locations
    </h1>
    <UContainer body-class="overflow-hidden" class="px-2 md:px-4 lg:px-6">
      <LocationsTree v-if="locations?.length > 0" :locations="locations" :depth="0" @refresh="refresh" />
      <UButton class="mt-6" label="Create location" @click="create" />
    </UContainer>
    <LocationsCreate :open="locationModal" @refresh="refresh" @close="locationModal = false" />
  </div>
</template>

<script lang="ts" setup>

const client = useSupabaseClient()
const locationModal = ref(false)

useHead({
  title: 'Locations',
})


const locationFields = `id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value)))))))`

const { data: locations, refresh } = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select(locationFields).is('parent_id', null).order('created_at')

  return data
})

const create = () => {
  locationModal.value = true;
}





</script>

<style></style>

