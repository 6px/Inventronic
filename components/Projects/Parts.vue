<template>
  <UCard>
    <template #header>
      <div class="flex flex-row justify-between">
        <h2 class="text-xl font-bold u-text-white">{{ project.project_parts.length }} project parts</h2>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton color="white" label="Add parts" trailing-icon="i-heroicons-chevron-down-20-solid" />
          <ProjectsUploadModal @change="kicadCSV($event)" :open="uploadModal" @close="uploadModal = false" />
          <ProjectsProjectPartModal :open="newppModal" :projectPart="newppPart" @close="newppModal = false"
            @refresh="refresh" />
        </UDropdown>
      </div>
    </template>
    <div>
      <div :class="selected.length ? '' : 'h-8'">
        <UButtonGroup size="sm" orientation="horizontal" v-if="selected.length">

          <UButton icon="i-heroicons-outline-qr-code" label="Print labels" color="white" @click="printTags" />
          <UButton :loading="deletingAll" icon="i-heroicons-outline-trash" color="red" label="Delete"
            @click="deleteParts" />

        </UButtonGroup>
      </div>
      <UTable v-model="selected" :rows="rows" :columns="columns" :ui="{ td: { base: '' } }">
        <template #id-data="{ row }">
          <div class="flex flex-row">
            <div v-if="row.id">
              <UTooltip text="Print project part label">
                <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="printTag(row)" />
              </UTooltip>
            </div>
            <div v-if="row.id">
              <UTooltip text="Edit project part">
                <UButton class="mr-2" label="" icon="i-heroicons-outline-pencil" @click="editProjectPart(row)" />
              </UTooltip>
            </div>
            <div v-if="row.id">
              <UTooltip text="Remove part from this project">
                <UButton class="mr-2" :loading="deleting === row.id" label="" color="red"
                  :icon="deleting === row.id ? '' : 'i-heroicons-outline-trash'" @click="removeProjectPart(row)" />
              </UTooltip>
            </div>

            <div v-else-if="row.parts.id">
              <UTooltip text="Add to this project">
                <UButton class="mr-2" label=""
                  :icon="adding[row.parts.part + row.parts.value] ? '' : 'i-heroicons-outline-plus'"
                  :loading="adding[row.parts.part + row.parts.value]" @click="addPart(row)" />
              </UTooltip>
            </div>
            <div v-else>

              <UTooltip text="Create this part and add it to this project">
                <UButton class="mr-2" label=""
                  :icon="creating[row.parts.part + row.parts.value] ? '' : 'i-heroicons-outline-plus'"
                  @click="createPart(row)" :loading="creating[row.parts.part + row.parts.value]" />
              </UTooltip>
            </div>
          </div>
        </template>

        <template #parts.part-data="{ row }">
          <div v-if="row.parts.id">
            <UButton class="p-0" variant="link" @click="editPart(row.parts)">
              {{ row.parts.part }}
            </UButton>
            <UButton size="xs" class="text-xs px-0" variant="link" v-if="row.parts.parent"
              @click="editPart(row.parts.parent)">
              {{ row.parts.quantity_of }} × {{ row.parts.parent.part === row.parts.parent.value ? '' :
                row.parts.parent.part }} {{ row.parts.parent.value }}
            </UButton>
          </div>
          <div v-else>
            {{ row.parts.part }}
          </div>

          <div>
            <strong>
              {{ row.part }}
            </strong>
          </div>


        </template>

        <template #parts.value-data="{ row }">
          <UTooltip :text="row.parts.value">
            <UButton class="p-0 " v-if="row.parts.id" variant="link" @click="editPart(row.parts)">
              <div class="max-w-[100px] truncate overflow-hidden">
                {{ row.parts.value }}
              </div>
            </UButton>
            <div v-else class="max-w-[100px] truncate overflow-hidden">
              {{ row.parts.value }}
            </div>
          </UTooltip>
        </template>

        <template #parts.footprint-data="{ row }">
          <UTooltip :text="row.parts.footprint">
            <div class="max-w-[100px] truncate overflow-hidden">

              {{ row.parts.footprint }}

            </div>
          </UTooltip>
        </template>

        <template #quantity-data="{ row }">
          <div
            class="shrink flex flex-row space-between form-input relative w-18 disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm p-0 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
            <UInput v-model="row.quantity" variant="none" class="w-20" />
            <UButton class="rounded-s-none m-0" @click="saveQuantity(row)"
              :icon="saveQty[row.id] ? '' : 'i-heroicons-outline-arrow-down-on-square'" :loading="saveQty[row.id]" />
          </div>
        </template>



        <template #parts.quantity-data="{ row }">
          <UBadge v-if="row.id && row.parts.id" size="xs" :color="row.quantity > qty(row) ? 'red' : 'green'"
            class="ml-2 shrink">
            {{ qty(row) }}
          </UBadge>
          <UBadge v-else size="xs" color="red"
            class="ml-2 shrink">
            0
          </UBadge>
        </template>

        <template #locations-data="{ row }">
          <div v-if="row.parts.parent && row.parts.parent.location_parts && row.parts.parent.location_parts.length">
            <div class="max-w-[150px] truncate overflow-hidden">
              <UTooltip v-for="lp in row.parts.parent.location_parts"
                :text="`${lp.quantity} items of ${row.parts.parent.part === row.parts.parent.value ? '' : row.parts.parent.part} ${row.parts.parent.value} in ${lp.locations.name}`">
                <UButton class="p-0 mr-2" variant="link" :to="`/locations/${uuidb64(lp.locations.id)}`">
                  {{ lp.locations.name }}
                </UButton>

              </UTooltip>
            </div>
          </div>
          <div v-else-if="row.parts.location_parts && row.parts.location_parts.length">
            <div class="max-w-[150px] truncate overflow-hidden">
              <UTooltip v-for="lp in row.parts.location_parts" :text="`${lp.quantity} items in ${lp.locations.name}`">
                <UButton class="p-0 mr-2" variant="link" :to="`/locations/${uuidb64(lp.locations.id)}`">
                  {{ lp.locations.name }}
                </UButton>

              </UTooltip>
            </div>
          </div>

          <div v-else>
            None
          </div>
        </template>
      </UTable>
      <div class="text-right" v-if="newParts">
        <UButton @click="addAll">Add all</UButton>
      </div>
    </div>

    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-if="pageCount < project.project_parts.length" v-model="page" :page-count="pageCount"
        :total="project.project_parts.length" />
    </div>
    <ProjectsPartQRCodeModal :open="qrModal" :projectPart="qrPart" @close="qrModal = false" />
    <ProjectsProjectPartModal :open="ppModal" :projectPart="ppPart" @close="ppModal = false" @refresh="emit('refresh')" />

    <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" :saving="saving" @close="partModal = false"
      @save="savePart" @setParent="setParent" @refresh="refresh" />
  </UCard>
</template>

<script lang="ts" setup>
import type { UButton, UTooltip } from '#ui-colors/components';


const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  },
  parts: {
    type: Array<Part>,
    required: true,
  },
})

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits(['refresh', 'setParts'])

const creating = ref({})
const qrModal = ref(false)
const selectedPart = ref({})
const saving = ref(false)
const partModal = ref(false)

const qrPart = ref({})
const adding = ref({})
const saveQty = ref({})
const projectParts = ref(props.project.project_parts)
const uploadModal = ref(false)
const deleting = ref(0)

const ppModal = ref(false)
const ppPart = ref({})

const newppModal = ref(false)
const newppPart = ref({ project_id: props.project.id })

const selected = ref([])
const deletingAll = ref(false)

const newParts = computed(() => {
  return projectParts.value.find(pp => !pp.id)
})

const page = ref(1)
const pageCount = 20

const rows = computed(() => {
  return props.project.project_parts.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})

const refresh = () => {
  emit('refresh')
}

const setParent = () => {
  console.log('table setting parent')
  partModal.value = false
  selectedPart.value = selectedPart.value.parent
  partModal.value = true
}




const qty = (row) => {
  if (row.parts.parent) {
    return Math.round(100 * row.parts.parent.location_parts.reduce((acc, lp) => acc + lp.quantity, 0) / row.parts.quantity_of) / 100
  }
  return Math.round(100 * row.parts.location_parts.reduce((acc, lp) => acc + lp.quantity, 0)) / 100
}


watch(
  () => props.project,
  () => {
    projectParts.value = props.project.project_parts;
  }
)

const deleteParts = async () => {
  deletingAll.value = true
  await client.from('project_parts').delete().in('id', selected.value.map(p => p.id))
  emit('refresh')
  deletingAll.value = false
}

const printTags = () => {
  const routeData = router.resolve({ path: `/projects/${props.project.id}/print`, query: { ids: selected.value.map(p => p.id) } });
  window.open(routeData.href, '_blank');
}


const printTag = (row: ProjectPart) => {
  qrPart.value = row
  qrModal.value = true
}

const saveQuantity = async (row: ProjectPart) => {
  saveQty.value[row.id] = true
  await client.from('project_parts').update({ quantity: row.quantity }).eq('id', row.id)
  saveQty.value[row.id] = false
}

const editPart = (part: Part) => {
  selectedPart.value = part
  partModal.value = true
}

const editProjectPart = (row) => {
  ppPart.value = row
  ppModal.value = true
}

const removeProjectPart = async (row) => {
  deleting.value = row.id
  await client.from('project_parts').delete().eq('id', row.id)
  projectParts.value = projectParts.value.filter((pp: ProjectPart) => pp.id !== row.id)
  refresh()
  deleting.value = 0
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
    const r = await client.from('parts').update({ ...p }).eq('id', p.id).select(partFields())
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
    const r = await client.from('parts').insert({ ...p }).select(partFields())
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
      props.project.project_parts.push(np)

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
    references: row.references,
  }).select('id, parts(id, part, value, footprint, description, quantity, locations(id, name)), quantity')

  if (r2.error) {
    alert(r2.error.message)
  } else {
    row.id = r2.data[0].id
    //refresh()
  }
  adding.value[row.parts.part + row.parts.value] = false
  return r2.data[0]
}

const createPart = async (row: ProjectPart) => {
  creating.value[row.parts.part + row.parts.value] = true

  const p = { ...row.parts }
  p.owner_id = user.value.id
  delete p.id
  const r = await client.from('parts').insert({ ...p }).select(partFields())
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
      references: row.references,
    }).select()

    if (r2.error) {
      alert(r2.error.message)
    } else {
      row.id = r2.data[0].id
      //refresh()
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
  [{
    label: 'Add existing part',
    icon: 'i-heroicons-outline-plus',
    click: () => {
      newppModal.value = true
    }
  }],
]

const columns = [
  {
    key: "parts.part",
    label: "Part",
    sortable: true,
  },
  {
    key: "parts.value",
    label: "Value",
    sortable: true,
  },
  {
    key: "parts.footprint",
    label: "Footprint",
    class: "max-w-xs",
    sortable: true,
  },
  {
    key: "parts.description",
    label: "Description",
    class: "max-w-md",
    sortable: true,
  },
  {
    key: "locations",
    label: "Locations",
    sortable: true,
  },
  {
    key: "quantity",
    label: "Quantity per PCB",
    sortable: true,
  },
  {
    key: "parts.quantity",
    label: "Available",
    sortable: true,
  },
  {
    key: "references",
    label: "References",
    sortable: true,
  },
  {
    key: "id",
    label: "Tools"
  },
]

const kicadCSV = async (files: Array<File>) => {
  const projectParts = await kicadImporter(files, props.parts, props.project)

  props.project.project_parts = projectParts
}

</script>

<style></style>