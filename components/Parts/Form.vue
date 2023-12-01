<template>
  <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <h2 v-if="selectedPart.id">Editing <strong>{{ selectedPart.part }} {{ selectedPart.value }}</strong></h2>
      <h2 v-else>Create new part</h2>
    </template>

    <UForm class="space-y-4" @submit="emit('save')" :validate="validate" :state="selectedPart">
      <UFormGroup label="Part" name="part">
        <UInput v-model=selectedPart.part color="white" variant="outline" placeholder="Part type" />
      </UFormGroup>
      <UFormGroup label="Value" name="value">
        <UInput v-model=selectedPart.value color="white" variant="outline" placeholder="Part value" />
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
        <USelectMenu
          v-model="selectedPart.location_id"
          :options="locations"
          value-attribute="id"
          option-attribute="name">
          <template #label>
            {{ current ? current.name : 'None' }}
          </template>
        </USelectMenu>
        <UButton type="submit" class="hidden" @click="emit('save')" />
      </UFormGroup>
    </UForm>

    <template #footer>
      <UButton
        class="mr-4"
        @click="emit('save')"
        :loading="saving"
      >
        <span v-if="saving">Saving...</span>
        <span v-else>Save</span>
      </UButton>
      <span v-if="modal!==false">or</span>
      <UButton
        v-if="modal!==false"
        variant="link"
        color="white"
        class="ml-0"
        label="Cancel"
        @click="$emit('close')"
      />
    </template>
  </UCard>
</template>

<script lang="ts" setup>

const client = useSupabaseClient()
const emit = defineEmits()

const props = defineProps({
  saving: {
    type: Boolean,
    required: true,
  },
  selectedPart: {
    type: Object as Part,
    required: true,
  },
  modal: {
    type: Boolean,
    required: false,
  },
});

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})

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