<template>
  <UCard>
    <template #header>
      <div class="flex flex-row justify-between">
        <h2 class="text-xl font-bold u-text-white">Project parts</h2>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton color="white" label="Add parts" trailing-icon="i-heroicons-chevron-down-20-solid" />
          <ProjectsUploadModal @change="changed($event)" :open="uploadModal" @close="uploadModal = false" />
        </UDropdown>
      </div>
    </template>
    <UTable :rows="projectParts" :columns="columns" :ui="{td:{base:''}}">
      <template #id-data="{ row }">
        <div class="flex flex-row">
          <UTooltip v-if="row.id" text="Print part label">
            <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="printTag(row)" />
          </UTooltip>
          <UTooltip v-if="row.id" text="Remove part from this project">
            <UButton class="mr-2" label="" color="red" icon="i-heroicons-outline-trash" @click="removeProjectPart(row)" />
          </UTooltip>
          
          <UTooltip v-else-if="row.parts.id" text="Add to this project">
            <UButton
            class="mr-2"
            label=""
            :icon="adding[row.parts.part + row.parts.value] ? '' : 'i-heroicons-outline-plus'"
            :loading="adding[row.parts.part + row.parts.value]"
            @click="addPart(row)"
          />
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
        </div>
      </template>

      <template #parts.part-data="{ row }">
        <UButton class="p-0" v-if="row.parts.id" variant="link" @click="editPart(row.parts)">
          {{ row.parts.part }}
        </UButton>
      </template>
      
      <template #parts.value-data="{ row }">
        <UButton class="p-0"  v-if="row.parts.id" variant="link" @click="editPart(row.parts)">
          {{ row.parts.value }}
        </UButton>
      </template>

      <template #parts.footprint-data="{ row }">
        <UTooltip :text="row.parts.footprint">
          <div class="max-w-[100px] truncate overflow-hidden">
          
            {{ row.parts.footprint }}
            
          </div>
        </UTooltip>
      </template>

      <template #quantity-data="{ row }">
          <div class="shrink flex flex-row space-between form-input relative w-18 disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm p-0 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
            <UInput v-model="row.quantity" variant="none" class="w-20" />
            <UButton
              class="rounded-s-none m-0"
              @click="saveQuantity(row)"
              :icon="saveQty[row.id] ? '' : 'i-heroicons-outline-arrow-down-on-square'"
              :loading="saveQty[row.id]"
            />
          </div>
      </template>

      

      <template #parts.quantity-data="{ row }">
        <UBadge v-if="row.id && row.parts.id" size="xs" :color="row.quantity > row.parts.quantity ? 'red' : 'green'" class="ml-2 shrink">{{ row.parts.quantity }}</UBadge>
      </template>

      <template #parts.locations-data="{ row }">
        <UButton v-if="row.parts.locations && row.parts.locations.name" variant="link" :to="`/locations/${row.parts.locations.id}`">
          {{ row.parts.locations.name }}
        </UButton>
        <div v-else>
          <USelect @change="saveLocation(row)" :options="locations" option-attribute="name" value-attribute="id" v-model="row.parts.location_id" />
        </div>
      </template>
    </UTable>
    <div class="text-right" v-if="newParts">
      <UButton @click="addAll">Add all</UButton>
    </div>
    <PartsQRCodeModal :partModal="qrModal" :selectedPart="qrPart" @close="qrModal=false" />
    <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" :saving="saving" @close="partModal=false" @save="savePart" />
  </UCard>
</template>

<script lang="ts" setup>
import type { UButton, UTooltip } from '#ui-colors/components';
import Papa from 'papaparse';
import { popScopeId } from 'vue';

const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  }
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits(['refresh'])

const creating=ref({})
const qrModal = ref(false)
const selectedPart = ref({})
const saving = ref(false)
const partModal = ref(false)

const qrPart = ref({})
const adding=ref({})
const saveQty = ref({})
const projectParts = ref(props.project.project_parts)
const uploadModal = ref(false)

const newParts = computed(() => {
  return projectParts.value.find(pp => !pp.id)
})

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})

const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`


const refresh = () => {
  emit('refresh')
}

watch(
    () => props.project,
    () => {
      projectParts.value = props.project.project_parts;
    }
  )

const printTag = (row: ProjectPart) => {
  console.log(row.parts)
  qrPart.value = row.parts
  qrModal.value = true
}

const saveQuantity = async (row: ProjectPart) => {
  saveQty.value[row.id] = true
  await client.from('project_parts').update({quantity: row.quantity}).eq('id', row.id)
  saveQty.value[row.id] = false
}

const saveLocation = async (row: ProjectPart) => {
  // TODO update part location in table
  await client.from('parts').update({location_id: row.parts.location_id}).eq('id', row.id)
  refresh()
}

const editPart = (part: Part) => {
  selectedPart.value = part
  partModal.value = true
}

const removeProjectPart = async (row) => {
  await client.from('project_parts').delete().eq('id', row.id)
  projectParts.value = projectParts.value.filter((pp: ProjectPart) => pp.id !== row.id)
  refresh()
}

const addAll = () => {
  projectParts.value.forEach((pp: ProjectPart) => {
    if (!pp.id && pp.parts && pp.parts.id) {
      addPart(pp)
    } else if (!pp.id && !pp.parts.id) {
      createPart(pp)
    }
  })
}


const savePart = async () => {
  saving.value = true
  const p: Part = { ...selectedPart.value }

  delete p.locations
  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('parts').update({ ...p }).eq('id', p.id).select(partFields)
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;

      refresh()
    }
    saving.value = false
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('parts').insert({ ...p }).select(partFields)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      const part = r.data[0]
      const pp: ProjectPart = {
        part_id: part.id,
        parts: part,
        project_id: props.project.id,
        quantity: 0,
      } 
      const np = await addPart(pp)
      projectParts.value.push(np)
      
      refresh()
    }
  }
  saving.value = false
}

const addPart = async (row) => {
  adding.value[row.parts.part + row.parts.value] = true
  const r2 = await client.from('project_parts').insert({
      project_id: props.project.id,
      part_id: row.parts.id,
      quantity: row.quantity,
    }).select('id, parts(id, part, value, footprint, description, quantity, locations(id, name)), quantity')

  if (r2.error) {
    alert(r2.error.message)
  } else {
    row.id = r2.data[0].id
    refresh()
  }
  adding.value[row.parts.part + row.parts.value] = false
  return r2.data[0]
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
      refresh()
    }
    
  }
  creating.value[row.parts.part + row.parts.value] = false
}

const items = [
  [{
    label: 'KiCAD BOM',
    avatar: {
      src: 'https://user-images.githubusercontent.com/352202/53980744-60746100-4111-11e9-9f8c-17ca6b50efd8.png'
    },
    click: () => {
      console.log('Add from kicad BOM')
      uploadModal.value = true
    }
  }],
  [{
    label: 'Create part',
    icon: 'i-heroicons-outline-plus-circle',
    click: () => {
      console.log('Manually create part')
      partModal.value = true
    }
  }],
]

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
    class: "max-w-xs",
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
    label: "Quantity per PCB"
  },
  {
    key: "parts.quantity",
    label: "Available"
  },
  {
    key: "id",
    label: "Tools"
  },
]

const changed = (files: Array<File>) => {
  console.log('files changed', files)
  if (files.length && files[0].type === 'text/csv') {
    const file = files[0]
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
          const existingPart = props.parts.find(p => p.part === line[partCol] && p.value === line[valCol])
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

            newParts.value = true
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

            projectParts.value.push(pp)
          }
          
        }
      }

      console.log('project parts', projectParts.value)

      emit('setParts', projectParts.value)

    };
    reader.readAsText(file);


  } else {
    alert('Please upload BOM in CSV format')
  }
}

</script>

<style>

</style>