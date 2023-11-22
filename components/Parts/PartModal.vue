<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2 v-if="selectedPart.id">Editing {{ selectedPart.name }}</h2>
        <h2 v-else>Create new part</h2>
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
        <UFormGroup label="Location" name="location">
          <USelectMenu v-model="selectedPart.location_id" :options="locations" value-attribute="id"
    option-attribute="name">
    <template #label>
      {{ current ? current.name : 'None' }}
    </template>
          </USelectMenu>
        </UFormGroup>
      </UForm>

      <template #footer>
        <UButton
          class="mr-4"
          @click="$emit('save')"
          :loading="saving"
        >
          <span v-if="saving">Saving...</span>
          <span v-else>Save</span>
        </UButton>
        or
        <UButton
          variant="link"
          color="white"
          class="ml-0"
          label="Cancel"
          @click="$emit('close')"
        />
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>

const props = defineProps({
  partModal: {
    type: Boolean,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  selectedPart: {
    type: Object as Part,
    required: true,
  },
});

const client = useSupabaseClient()

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('Locations').select().order('created_at')

  console.log(data)
  return data
})

const open = ref(false)

watch(
  () => props.partModal,
  () => {open.value = props.partModal}
)

const current = computed(() => locations.value.find(l => l.id === props.selectedPart.location_id))

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  if (!state.quantity) errors.push({ path: 'quantity', message: 'Required' })
  return errors
}

</script>

<style>

</style>

