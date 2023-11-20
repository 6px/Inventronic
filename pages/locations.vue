<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">
      Locations
    </h1>
    <UContainer
      v-if="locations?.length > 0"
      body-class="overflow-hidden"
    >

    <LocationsTree :locations="locations" :depth="0" />

    </UContainer>
    <UButton
      class="mt-6"
      label="Create location"
      @click="create"
    />
  </div>
</template>

<script lang="ts" setup>

const client = useSupabaseClient()
const user = useSupabaseUser()
const locationModal = ref(false)

let selectedLocation: Location = reactive({
  name: '',
  description: '',
  parent_id: null,
  id:null,
  owner_id: null,
})


const locationFields = `id, name, description, Parts(id), Locations(id, name, description, Locations(id, name, description, Locations(id, name, description, Locations(id, name, description, Locations(id, name, description, Locations(id, name, description ))))))`

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('Locations').select(locationFields).is('parent_id', null).order('created_at')

  return data
})

const create = () => {
  locationModal.value = true;
}

const edit = (row: Part) => {
  selectedLocation = row
  console.log(selectedLocation)
  locationModal.value = true
}

const savePart = async () => {
  console.log("selectedLocation", selectedLocation)
  const p = { ...selectedLocation }

  delete p.Locations

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('Locations').update({ ...p }).select(locationFields)
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      locationModal.value = false;
      console.log(r)
      const newPart = r.data[0]

      const np = locations.value.findIndex((p) => p.id === newPart.id)

      locations.value[np] = newPart
    }
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('Parts').insert({ ...p }).select(locationFields)
    if (r.error) {
      alert(r.error.message)
    } else {
      locationModal.value = false;
      locations.value.push(r.data[0])
    }
  }
}




</script>

<style>

</style>

