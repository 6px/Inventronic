<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">
      Parts
    </h1>
    <UContainer
      v-if="parts?.length > 0"
      body-class="overflow-hidden"
    >
    <UTable :rows="parts" @select="editPart" />
    </UContainer>
    <UButton
      class="mt-6"
      label="Create part"
      @click="createPart"
    />
  </div>
  <UModal v-model="partModal">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Create new part</h2>
      </template>

      <UForm class="space-y-4" @submit="savePart" :validate="validate" :state="selectedPart">
        <UFormGroup label="Name" name="name">
          <UInput v-model=selectedPart.name color="white" variant="outline" placeholder="Part name" />
        </UFormGroup>
        <UFormGroup label="Description" name="description">
          <UInput v-model=selectedPart.description color="white" variant="outline" placeholder="Description" />
        </UFormGroup>
        <UFormGroup label="Footprint" name="footprint">
          <UInput v-model=selectedPart.footprint color="white" variant="outline" placeholder="Footprint" />
        </UFormGroup>
        <UFormGroup label="Quantity" name="quantity">
          <UInput v-model=selectedPart.quantity color="white" variant="outline" placeholder="1000" />
        </UFormGroup>
        <UFormGroup label="Minimum quantity" name="min_quantity">
          <UInput v-model=selectedPart.min_quantity color="white" variant="outline" placeholder="0" />
        </UFormGroup>
      </UForm>

      <template #footer>
        <UButton
          class="mx-4"
          label="Save"
          @click="savePart"
        />
        <UButton
          class="mx-4"
          label="Cancel"
          @click="partModal = false"
        />
      </template>
    </UCard>
  </UModal>
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
  id:null,
  owner_id: null,
})


const {data: parts} = await useAsyncData('parts', async () => {
  const { data } = await client.from('Parts').select().order('created_at')

  return data
})

const createPart = () => {
  partModal.value = true;
}

const editPart = (row: Part) => {
  selectedPart = row
  partModal.value = true
}

const savePart = async () => {
  console.log("saving part", selectedPart)
  const p = { ...selectedPart }
  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('Parts').update({ ...p })
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      parts.value.push(r.data[0])
    }
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('Parts').insert({ ...p }).select()
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

