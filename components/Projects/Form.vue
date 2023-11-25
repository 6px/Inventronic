<template>
  <div>
    <UForm :validate="validate" :state="state" @submit="save" class="space-y-4">
      <UFormGroup label="Project name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="Description">
        <UInput v-model="state.description" />
      </UFormGroup>
      <UFormGroup label="KiCAD BOM CSV file">
        <UInput type="file" v-model="state.file" icon="i-heroicons-outline-document-text" @change="changed" />
      </UFormGroup>

      Parts
      <UTable :rows="projectParts" :columns="columns" :ui="{td:{base:''}}">
        <template #id-data="{ row }">
          <UTooltip v-if="row.id" text="Remove part from this project">
            <UButton class="mr-2" label="" color="red" icon="i-heroicons-outline-trash" @click="removeProjectPart(row)" />
          </UTooltip>
          
          <UTooltip v-else-if="row.parts.id" text="Add to this project">
            <UButton class="mr-2" label="" icon="i-heroicons-outline-plus" />
          </UTooltip>
          <UTooltip v-else text="Create this part and add it to this project">
            <UButton
              class="mr-2"
              label=""
              :icon="creating[row.parts.part + row.parts.value] ? '' : 'i-heroicons-outline-plus'"
              @click="createPart(row)"
              :loading="creating[row.parts.part + row.parts.value]"
            />
          </UTooltip>
        </template>

        <template #parts.part-data="{ row }">
          <UButton v-if="row.parts.id" variant="link" :to="`/parts/${row.parts.id}`">
            {{ row.parts.part }}
          </UButton>
        </template>
        
        <template #parts.value-data="{ row }">
          <UButton v-if="row.parts.id" variant="link" :to="`/parts/${row.parts.id}`">
            {{ row.parts.value }}
          </UButton>
        </template>

        <template #quantity-data="{ row }">
          <div class="flex flex-row form-input relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm p-0 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
            <UInput v-model="row.quantity" variant="none" />
            <UButton
              class="rounded-s-none"
              @click="saveQuantity(row)"
              :icon="saveQty[row.id] ? '' : 'i-heroicons-outline-arrow-down-on-square'"
              :loading="saveQty[row.id]"
            />
          </div>
        </template>

        <template #parts.locations-data="{ row }">
          <UButton v-if="row.parts.locations && row.parts.locations.name" variant="link" :to="`/locations/${row.parts.locations.id}`">
            {{ row.parts.locations.name }}
          </UButton>
          <div v-else>
            <USelect :options="locations" option-attribute="name" value-attribute="id" v-model="row.parts.location_id" />
          </div>
        </template>
      </UTable>

      <UButton type="submit" :loading="saving" class="mr-2">
        Save
      </UButton>
      <span class="pl-2 text-slate-400">or</span>
      <UButton to="/projects" variant="link" color="white">
        Back to list
      </UButton>
    </UForm>
    
  </div>
</template>

<script lang="ts" setup>

import type { UInput } from '#ui-colors/components';
import Papa from 'papaparse';

const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits()

const columns = [
  {
    key: "parts.part",
    label: "Part"
  },
  {
    key: "parts.value",
    label: "Value"
  },
  {
    key: "parts.footprint",
    label: "Footprint",
    class: "max-w-md",
  },
  {
    key: "parts.description",
    label: "Description",
    class: "max-w-md",
  },
  {
    key: "parts.locations",
    label: "Location"
  },
  {
    key: "quantity",
    label: "Quantity"
  },
  {
    key: "id",
    label: "Tools"
  },
]

const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  },
})

const creating=ref({})

const saving = ref(false)
const newParts = ref([])
const projectParts = ref(props.project.project_parts)

const saveQty = ref({})

const state = reactive({
  file: null,
  name: props.project.name,
  description: props.project.description,
})

const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

const {data: parts, refresh} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})

const saveQuantity = async (row: ProjectPart) => {
  saveQty.value[row.id] = true
  await client.from('project_parts').update({quantity: row.quantity}).eq('id', row.id)
  saveQty.value[row.id] = false
}

const removeProjectPart = async (row) => {
  await client.from('project_parts').delete().eq('id', row.id)
  projectParts.value= projectParts.value.filter((pp: ProjectPart) => pp.id !== row.id)
  emit('refresh')
}

const createPart = async (row: ProjectPart) => {
  creating.value[row.parts.part + row.parts.value] = true

  const p = {...row.parts}
  p.location_id = parseInt(p.location_id, 10)
  p.owner_id = user.value.id
  delete p.id
  const r = await client.from('parts').insert({ ...p }).select(partFields)
  console.log('saving part', p)
  if (r.error) {
    alert(r.error.message)
  } else {
    const newPart = r.data[0]
    row.parts = newPart
    const r2 = await client.from('project_parts').insert({
      project_id: props.project.id,
      part_id: newPart.id,
      quantity: row.quantity,
    }).select()

    if (r2.error) {
      alert(r2.error.message)
    } else {
      row.id = r2.data[0].id
      emit('refresh')
    }
    
  }
  creating.value[row.parts.part + row.parts.value] = false
}

const changed = (ev) => {
  if (ev.target.files.length && ev.target.files[0].type === 'text/csv') {
    const file = ev.target.files[0]
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target.result as String)
      console.log(lines)
      const csv = Papa.parse(lines)
      if (csv.errors.length > 0) {
        alert('could not parse CSV file')
        return;
      }
      const data = csv.data
      console.log(data)
      // parse header line
      let partCol = 0
      let valCol = 0
      let descCol = 0
      let qtyCol = 0
      let fpCol = 0
      data[0].forEach((el: String, i) => {
        if (el.toLowerCase() === 'part') {
          partCol = i
        } else if (el.toLowerCase() === 'description') {
          descCol = i
        } else if (el.toLowerCase() === 'value') {
          valCol = i
        } else if (el.toLowerCase() === 'quantity per pcb') {
          qtyCol = i
        } else if (el.toLowerCase() === 'footprint') {
          fpCol = i
        }
      })

      let i = 1;
      for (i=1; i < data.length;i++) {
        const line = data[i]
        const row = parseInt(line[0], 10)
        if (!Number.isNaN(row)) {
          const existingPart = parts.value.find(p => p.part === line[partCol] && p.value === line[valCol])
          if (existingPart){
            if (!props.project.project_parts.find((pp: ProjectPart) => pp.parts.id === existingPart.id)) {
              const pp: ProjectPart = {
                part_id: existingPart.id,
                parts: existingPart,
                project_id: props.project.id,
                quantity: line[qtyCol],
              } 
              projectParts.value.push(pp)
            }
            
          } else {
            const part: Part = {
              id: null,
              part: line[partCol],
              description: line[descCol],
              value: line[valCol],
              footprint: line[fpCol],
              quantity: 0,
              location_id: null,
            }

            const pp: ProjectPart = {
              parts: part,
              project_id: props.project.id,
              part_id: null,
              quantity: line[qtyCol],
            } 

            newParts.value.push(part)
            projectParts.value.push(pp)
          }
          
        }
      }

      console.log('new parts', newParts.value)
      console.log('project parts', projectParts.value)

    };
    reader.readAsText(file);


  } else {
    alert('Please upload BOM in CSV format')
  }
  
}

const save = () => {
  console.log(state)
}
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  return errors
}
</script>

<style>

</style>