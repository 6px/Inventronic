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
        >
          <span v-if="saving">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
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

