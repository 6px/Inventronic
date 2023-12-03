<template>
  <div class="w-full my-2">
    <h1 class="mb-1 text-4xl font-bold u-text-white">
      {{ location.name }} 
        <UButton
          class="ml-3 sm"
          label="Print label"
          icon="i-heroicons-outline-qr-code"
          @click="qrcode=true"
        />
    </h1>
    <div class="mb-6 text-sm text-slate-500">{{ location.description }}</div>
    
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Parts in <strong>{{ location.name }}</strong></h2>
      </template>
      <PartsTable :parts="parts" :location="location" @refresh="refreshParts" />
    </UCard>
    <div class="lg:flex lg:flex-row mt-4">
      <UCard class="w-full lg:w-1/2 mr-2" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h2>Locations in <strong>{{ location.name }}</strong></h2>
        </template>
        <LocationsTree v-if="location.locations && location.locations.length > 0" :locations="location.locations" :depth="0" @refresh="refresh" />
        <div v-else class="text-center text-slate-500 text-lg my-6">
          No locations here
        </div>
        <UButton
          class="mt-6"
          icon="i-heroicons-outline-plus"
          label="Create location here"
          @click="create=true"
        />
      </UCard>
    
      <UCard class="w-full lg:w-1/2 ml-2" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
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
          <UButton
            class="mr-4"
            @click="save"
            :loading="saving"
          >
            <div v-if="saving">
              Saving...
            </div>
            <span v-else>Save</span>
          </UButton>
        </template>
      </UCard>
    </div>

    <LocationsCreate :open="create" :parent="location" @close="create=false" @refresh="refresh" />
    <LocationsQrCodeModal :open="qrcode" :location="location" @close="qrcode=false" />
  </div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const user = useSupabaseUser()


  const create = ref(false)
  const qrcode = ref(false)
  const saving = ref(false)
  const partFields = `id, part, value, description, footprint, quantity, min_quantity, price, ordering_url, locations(id, name), location_id`
  const locationFields = `id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value), locations(id, name, description, parts(id, part, value) ))))))`

  const {data: parts, refresh: refreshParts} = await useAsyncData(`location-${route.params.id}-parts`, async () => {
    const { data } = await client.from('parts').select(partFields).eq('location_id', route.params.id).order('created_at')

    return data
  })

  const {data: location, refresh} = await useAsyncData(`location-${route.params.id}`, async () => {
    const { data } = await client.from('locations').select(locationFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

  if (!location.value) {
    showError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

useHead({
  title: location.value.name,
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

<style>

</style>

