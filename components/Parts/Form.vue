<template>
  <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 v-if="selectedPart.id">
          Editing <strong>{{ part_type.label }} {{ selectedPart.value }}</strong>
        </h2>
        <h2 v-else>Create new part</h2>
        <UButton v-if="modal" color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
          @click="emit('close')" />
      </div>
    </template>

    <UForm class="space-y-4" @submit="save" :validate="validate" :state="selectedPart">
      <div class="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-4">
        <UFormGroup label="Part" name="part">
          <USelectMenu v-model="part_type" :options="part_types" searchable creatable>
          </USelectMenu>
          <!-- <UInput v-model=selectedPart.part color="white" variant="outline" placeholder="Part type" /> -->
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

        <UFormGroup label="Minimum quantity" name="min_quantity">
          <UInput v-model=selectedPart.min_quantity color="white" variant="outline" placeholder="0" />
        </UFormGroup>
        <UFormGroup label="Price" name="price">
          <UInput v-model=selectedPart.price step="0.01" color="white" type="number" variant="outline" placeholder="" />
        </UFormGroup>
        <UFormGroup label="Ordering URL" name="ordering_url">
          <UInput v-model=selectedPart.ordering_url color="white" variant="outline" placeholder="" />
        </UFormGroup>

      </div>
      <div>
        <UFormGroup label="Locations" name="locations">
          <div v-for="lp in selectedLocations" class="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-4 mb-4">
            <UFormGroup label="Location">
              <USelectMenu v-model="lp.locations" :options="locations">
                <template #label>
                  {{ lp.locations.name ? lp.locations.name : 'None' }}
                </template>
                <template #option="{ option: location }">
                  {{ location.name }}
                </template>
              </USelectMenu>
            </UFormGroup>
            <UFormGroup label="Quantity">
              <UInput type="number" step="0.05" v-model="lp.quantity" />
            </UFormGroup>
          </div>


        </UFormGroup>
      </div>
      <UButton icon="i-heroicons-outline-plus" label="Add location"
        @click="selectedLocations.push({ quantity: 0, locations: {} })" />
      <UButton type="submit" class="hidden" @click="emit('save')" />
    </UForm>

    <template #footer>
      <UButton class="mr-4" @click="save" :loading="saving">
        <span v-if="saving">Saving...</span>
        <span v-else>Save</span>
      </UButton>
      <span v-if="modal !== false">or</span>
      <UButton v-if="modal !== false" variant="link" color="white" class="ml-0" label="Cancel" @click="$emit('close')" />
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { UButton } from '#build/components';

const toast = useToast()

const user = useSupabaseUser()
const client = useSupabaseClient()
const emit = defineEmits()


const props = defineProps({
  selectedPart: {
    type: Object as Part,
    required: true,
  },
  modal: {
    type: Boolean,
    required: false,
  },
});



const saving = ref(false)
const part_type = ref({label: props.selectedPart.part})

const { data: parts } = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select().order('created_at')

  return data
})

const { data: locations } = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})

const selectedLocations = ref(props.selectedPart.location_parts.map((lp: LocationPart) => { return { id: lp.id, quantity: lp.quantity, locations: lp.locations } }))

const part_types = computed(() => {
  return parts.value.map((p: Part) => {return {label: p.part}})
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  if (!state.quantity) errors.push({ path: 'quantity', message: 'Required' })
  return errors
}


const save = async () => {
  saving.value = true
  const p = { ...props.selectedPart }
  p.part = part_type.value.label
  delete p.location_parts
  delete p.project_parts

  let part_id = p.id

  console.log('saving part', p)

  if (part_id) {
    p.owner_id = user.value.id
    const r = await client.from('parts').update({ ...p }).eq('id', part_id)
    if (r.error) {
      toast.add({
        id: 'part_save_error',
        title: 'Part save failed.',
        description: r.error.message,
        icon: 'i-heroicons-outline-ecxclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
    }
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('parts').insert({ ...p }).select('id')
    if (r.error) {
      toast.add({
        id: 'part_save_error',
        title: 'Could not save part.',
        description: r.error.message,
        icon: 'i-heroicons-outline-ecxclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
      return;
    } else {
      part_id = r.data[0].id
    }
  }
  // Create of update location_parts
  for await (const loc of selectedLocations.value) {
    console.log('saving ', loc)
    let r
    if (loc.id) {
      r = await client.from('location_parts').update({ part_id: part_id, location_id: loc.locations.id, quantity: loc.quantity }).eq('id', loc.id)
    } else {
      r = await client.from('location_parts').insert({ part_id: part_id, location_id: loc.locations.id, quantity: loc.quantity })
    }

    if (r.error) {
      let msg = r.error.message
      if (r.error.code === "23505") {
        msg = 'This part already exists at this location'
      } else if (r.error.code === "23502") {
        msg = 'Please choose a valid location for this part'
      }
      toast.add({
        id: 'part_save_error_duplicate' + loc.locations.id,
        title: 'Could not save part location.',
        description: msg,
        icon: 'i-heroicons-outline-ecxclamation-triangle',
        timeout: 10000,
        color: 'red'
      })
      return;
    }
  }
  saving.value = false
  emit('close')
  emit('refresh')
  
}

</script>

<style></style>