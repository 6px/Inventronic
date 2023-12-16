<template>
  <div class="w-full my-2">
    <UContainer>
      <UBreadcrumb divider=">"
        :links="[{ label: 'Dashboard', to: '/' }, { label: 'Locations', to: '/locations' }, { label: location.name, to: '/locations/'+location.id }]" />
    </UContainer>
    <h1 class="mt-6 text-4xl font-bold u-text-white text-center">
      {{ location.name }}
      <UButton class="ml-4" icon="i-heroicons-outline-qr-code" @click="qrcode = true" />
    </h1>
    
    <div class="mb-6 text-sm text-slate-500 text-center">{{ location.description }}</div>

    <UContainer>
      <div class="md:grid md:grid-cols-2 md:gap-x-2">

        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h2>Modify location <strong>{{ location.name }}</strong></h2>
          </template>
          <UForm class="space-y-4" @submit="save" :validate="validate" :state="location">
            <UFormGroup label="Name" name="name">
              <UInput v-model=location.name color="white" variant="outline" placeholder="Location name" />
            </UFormGroup>
            <UFormGroup label="Description" name="description">
              <UInput v-model=location.description color="white" variant="outline" placeholder="Description" />
            </UFormGroup>
          </UForm>
          <template #footer>
            <UButton class="mr-4" @click="save" :loading="saving">
              <div v-if="saving">
                Saving...
              </div>
              <span v-else>Save</span>
            </UButton>
          </template>
        </UCard>

        <UCard class="mt-2 md:mt-0" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h2>Locations in <strong>{{ location.name }}</strong></h2>
          </template>
          <LocationsTree v-if="location.locations && location.locations.length > 0" :locations="location.locations"
            :depth="0" @refresh="refresh" />
          <div v-else class="text-center text-slate-500 text-lg my-6">
            No locations here
          </div>
          <UButton class="mt-6" icon="i-heroicons-outline-plus" label="Create location here" @click="create = true" />
        </UCard>

      </div>

      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h2>Parts in <strong>{{ location.name }}</strong></h2>
        </template>
        <PartsTable :parts="parts" :location="location" @refresh="refresh" />
      </UCard>
    </UContainer>

    <LocationsCreate :open="create" :parent="location" @close="create = false" @refresh="refresh" />
    <LocationsQRCodeModal :open="qrcode" :location="location" @close="qrcode = false" />
  </div>
</template>

<script lang="ts" setup>
import { loadRouteLocation } from 'vue-router';
import Locations from '~/pages/locations.vue';


const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()


const create = ref(false)
const qrcode = ref(false)
const saving = ref(false)
const locationFields = `id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()})), locations(id, name, description, location_parts(parts(${partFields()}))))))))`

const { data: location, refresh } = await useAsyncData(`location-${route.params.id}`, async () => {
  const { data } = await client.from('locations').select(locationFields).eq('id', b64uuid(route.params.id)).order('created_at')

  return data[0]
})

if (!location.value) {
  showError({
    statusCode: 404,
    statusMessage: 'Page Not Found'
  })
}

const parts = computed(() => {
  return location.value.location_parts.map((lp: LocationPart) => lp.parts)
})

useHead({
  title: location.value ? location.value.name : 'Not found',
})


const save = async () => {
  saving.value = true
  const p = { ...location.value }

  delete p.locations
  delete p.parts

  console.log('saving', p)

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('locations').update({ ...p }).eq('id', p.id).select('id, name')
    if (r.error) {
      alert(r.error.message)
    } else {
      // TODO trigger refresh
      refresh()
    }
    saving.value = false
  }
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  if (!state.quantity) errors.push({ path: 'quantity', message: 'Required' })
  return errors
}


</script>

<style></style>

