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
        <UFormGroup label="Part of" name="parent_id">
          <USelectMenu v-model="selectedPart.parent" :options="parts" searchable
            :uiMenu="{ option: { container: 'w-full block' } }">
            <template #label>
              <span v-if="selectedPart.parent && selectedPart.parent.part" class="truncate">
                {{ selectedPart.parent.part === selectedPart.parent.value ? selectedPart.parent.part : selectedPart.parent.part + ' ' + selectedPart.parent.value }}

              </span>
              <span v-else>None</span>
            </template>
            <template #option="{ option: part, selected: sel }">
              <div class="flex flex-row justify-between px-1">
                <div class="grow">
                  <div class="flex flex-row justify-between">
                    <div class="truncate grow">
                      {{ part.part === part.value ? part.part : part.part + ' ' + part.value }}
                    </div>


                    <div v-if="part.location_parts && part.location_parts.length > 0"
                      class="truncate shrink text-slate-600 dark:text-slate-200">
                      <UBadge color="white" v-for="lp in part.location_parts" size="sm" class="text-xs">
                        {{ lp.locations.name }}
                      </UBadge>                    
                    </div>

                    <div v-else class="truncate shrink text-slate-600 dark:text-slate-200"></div>
                  </div>
                  <div class="text-xs text-slate-400 ">
                    {{ part.footprint}}
                  </div>
                </div>


                <div class="w-5 pe-2" v-if="!sel"></div>
              </div>
            </template>
          </USelectMenu>
        </UFormGroup>
        <UFormGroup label="Quantity of" name="qty_of">
          <UInput type="number" step="0.05" v-model=selectedPart.quantity_of color="white" variant="outline"
            placeholder="Quantity of referenced part" />
        </UFormGroup>
        <UFormGroup label="Part" name="part">
          <USelectMenu v-model="part_type" :options="part_types" searchable creatable>
          </USelectMenu>
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
      <div v-if="selectedPart.parent && selectedPart.parent.id">
        <h2>Locations</h2>
        <UTable v-if="selectedPart.parent && selectedPart.parent.location_parts && selectedPart.parent.location_parts.length" :rows="[...selectedPart.parent.location_parts.map((lp:LocationPart) => { return {name: lp.locations.name, quantity: lp.quantity + ' ' + selectedPart.parent.part + ' ' + selectedPart.parent.value}}), {name: 'TOTAL', quantity: selectedPart.parent.location_parts.reduce((acc: number, lp: LocationPart) => acc + lp.quantity, 0)}]" />
        <div v-else class="text-center py-4 text-slate-400 text-sm">
          No stock.
          <UButton class="px-0" variant="link" label="Edit parent part" @click="setParent" /> 
          to add stock at selected locations
        </div>
        </div>
      <div v-else>
        <UFormGroup label="Locations" name="locations">
          <div v-for="lp in selectedLocations" class="flex flex-row items-end mb-4">
            <UFormGroup label="Location" class="grow">
              <USelectMenu v-model="lp.locations" :options="locations">
                <template #label>
                  {{ lp.locations.name ? lp.locations.name : 'None' }}
                </template>
                <template #option="{ option: location }">
                  {{ location.name }}
                </template>
              </USelectMenu>
            </UFormGroup>
            <UFormGroup label="Quantity" class="grow ml-4">
              <UInput type="number" step="0.05" v-model="lp.quantity" />
            </UFormGroup>
            <UButton class="shrink ml-4 h-8 w-8 mb-1" icon="i-heroicons-outline-trash" color="red" @click="deleteLocation(lp)" />
          </div>


        </UFormGroup>
      
        <UButton icon="i-heroicons-outline-plus" label="Add location"
        @click="selectedLocations.push({key: Math.random()*1000000, quantity: 0, locations: {} })" />
      </div>
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
const part_type = ref({ label: props.selectedPart.part ? props.selectedPart.part : 'Select or create' })

const { data: parts } = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields()).order('created_at')

  return data
})

const setParent = () => {
  console.log('form setting parent')
  emit('setParent')
}

watch(
  () => props.selectedPart,
  () => {part_type.value = { label: props.selectedPart.part }}
)

const { data: locations } = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})

const selectedLocations = ref(props.selectedPart.location_parts ? props.selectedPart.location_parts.map((lp: LocationPart) => { return { id: lp.id, quantity: lp.quantity, locations: lp.locations } }) : [])

const part_types = computed(() => {
  return parts.value.map((p: Part) => { return { label: p.part } })
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  if (!state.quantity) errors.push({ path: 'quantity', message: 'Required' })
  return errors
}

const deleteLocation = async (lp: LocationPart) => {
  if (lp.id) {
    selectedLocations.value = selectedLocations.value.filter(ll => lp.id !== ll.id)
  } else if (lp.key) {
    selectedLocations.value = selectedLocations.value.filter(ll => lp.key !== ll.key)
  }
}


const save = async () => {
  saving.value = true
  const p = { ...props.selectedPart }
  p.part = part_type.value.label
  delete p.location_parts
  delete p.project_parts
  delete p.quantity

  if (p.parent && p.parent.id) {
    p.parent_id = p.parent.id
  }

  delete p.parent

  let part_id = p.id

  console.log('saving part', p)

  if (part_id) {
    p.owner_id = user.value.id
    const r = await client.from('parts').update({ ...p }).eq('id', part_id).select(partFields())
    if (r.error) {
      toast.add({
        id: 'part_save_error',
        title: 'Part save failed.',
        description: r.error.message,
        icon: 'i-heroicons-outline-exclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
      saving.value = false
      return
    }
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('parts').insert({ ...p }).select(partFields())
    if (r.error) {
      toast.add({
        id: 'part_save_error',
        title: 'Could not save part.',
        description: r.error.message,
        icon: 'i-heroicons-outline-exclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
      saving.value = false
      return;
    } else {
      part_id = r.data[0].id
    }
  }

  // Delete all locations_parts for this part

  await client.from('location_parts').delete().eq('part_id', part_id)
  // Create of update location_parts
  for await (const loc of selectedLocations.value) {
    console.log('saving ', loc)
    const r = await client.from('location_parts').insert({ part_id: part_id, location_id: loc.locations.id, quantity: loc.quantity })
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
        icon: 'i-heroicons-outline-exclamation-triangle',
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