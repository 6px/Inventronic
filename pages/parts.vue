<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">
      Parts
    </h1>
    <UContainer
      v-if="parts?.length > 0"
      body-class="overflow-hidden"
    >
    <UTable
      :rows="parts"
      :columns="columns"
      @select="editPart"
    />
    </UContainer>
    <UButton
      class="mt-6"
      label="Create part"
      @click="createPart"
    />
  </div>
  <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" @close="partModal=false" @save="savePart" />
</template>

<script lang="ts" setup>

import type { FormError, FormSubmitEvent } from '#ui/types'


const client = useSupabaseClient()
const user = useSupabaseUser()
const partModal = ref(false)
let selectedPart: Part = reactive({
  name: '',
  description: '',
  footprint: '',
  quantity: 0,
  min_quantity: 0,
  location_id: null,
  id:null,
  owner_id: null,
})

const columns = [
  {
    key: "name",
    label: "Name"
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "Locations.name",
    label: "Location",
  },
  {
    key: "footprint",
    label: "Footprint",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "min_quantity",
    label: "Min Quantity",
  },
]

const partFields = `id, name, description, footprint,quantity, min_quantity, Locations(id, name), location_id`

const {data: parts} = await useAsyncData('parts', async () => {
  const { data } = await client.from('Parts').select(partFields).order('created_at')

  return data
})

const createPart = () => {
  partModal.value = true;
}

const editPart = (row: Part) => {
  selectedPart = row
  console.log(selectedPart)
  partModal.value = true
}

const savePart = async () => {
  console.log("saving part", selectedPart)
  const p = { ...selectedPart }

  delete p.Locations

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('Parts').update({ ...p }).select(partFields)
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      console.log(r)
      const newPart = r.data[0]

      const np = parts.value.findIndex((p) => p.id === newPart.id)

      parts.value[np] = newPart
    }
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('Parts').insert({ ...p }).select(partFields)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      parts.value.push(r.data[0])
    }
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

