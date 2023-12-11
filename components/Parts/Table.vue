<template>
  <div>
    <div class="flex justify-between items-end">

      <div :class="selected.length ? '' : 'h-8'">
        <UButtonGroup size="sm" orientation="horizontal" v-if="selected.length">

          <UButton icon="i-heroicons-outline-qr-code" label="Print labels" color="white" @click="printTags" />
          <UButton :loading="deletingAll" icon="i-heroicons-outline-trash" color="red" label="Delete"
            @click="deleteParts" />

        </UButtonGroup>
      </div>

      <UFormGroup label="Parts per page">
        <USelect class="mr-4" :options="['10', '20', '50', '100', 'All']" v-model="pageCount" />
      </UFormGroup>
    </div>
    <UDivider class="mt-4 mb-0" />
    <UTable v-model:sort="sort" :rows="rows" :columns="columns" :ui="{ td: { base: '' } }" v-model="selected">
      <template #part-data="{ row }">
        <div>
          <UButton variant="link" :label="row.part" @click="editPart(row)" />
        </div>
        <UButton size="xs" class="text-xs px-0" variant="link" v-if="row.parent" @click="editPart(row.parent)">
          {{ row.quantity_of }} × {{ row.parent.part === row.parent.value ? '' :  row.parent.part }} {{ row.parent.value }}
        </UButton>
      </template>

      <template #value-data="{ row }">
        <UTooltip :text="row.value">
          <div class="max-w-[150px] truncate overflow-hidden">
            {{ row.value }}
          </div>
        </UTooltip>
      </template>

      <template #quantity-data="{ row }">
        <UBadge :color="qty(row) <= row.min_quantity ? 'red' : 'primary'"
          :variant="qty(row) <= row.min_quantity ? 'solid' : 'outline'">
          {{ qty(row) }}
        </UBadge>
      </template>

      <template #locations-data="{ row }">
        <div v-if="row.location_parts && row.location_parts.length">
          <div class="max-w-[150px] truncate overflow-hidden">
            <UTooltip v-for="lp in row.location_parts" :text="`${lp.quantity} items in ${lp.locations.name}`">

              <UButton class="p-0 mr-2" variant="link" :to="`/locations/${uuidb64(lp.locations.id)}`">
                {{ lp.locations.name }}
              </UButton>

            </UTooltip>
          </div>
        </div>
        <div v-else-if="row.parent && row.parent.location_parts && row.parent.location_parts.length">
          <div class="max-w-[150px] truncate overflow-hidden">
            <UTooltip v-for="lp in row.parent.location_parts" :text="`${lp.quantity} items of ${row.parent.part === row.parent.value ? '' : row.parent.part} ${row.parent.value} in ${lp.locations.name}`">
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


      <template #footprint-data="{ row }">
        <UTooltip :text="row.footprint">
          <div class="max-w-[150px] truncate overflow-hidden">
            {{ row.footprint }}
          </div>
        </UTooltip>
      </template>

      <template #project_parts-data="{ row }">
        <div v-if="row.project_parts">
          <div class="max-w-[150px] truncate overflow-hidden">
            <UButton v-for="pp in row.project_parts" :to="`/projects/${pp.projects.id}`" variant="link" class="p-0 mr-2">
              {{ pp.projects.name }}
            </UButton>
          </div>
        </div>
      </template>


      <template #id-data="{ row }">
        <div class="whitespace-nowrap">
          <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="printTag(row)" />
          <UButton label="" icon="i-heroicons-outline-pencil" @click="editPart(row)" />
          <UButton class="ml-2" label="" :loading="deleting === row.id"
            :icon="deleting === row.id ? '' : 'i-heroicons-outline-trash'" color="red" @click="deletePart(row)" />
        </div>
      </template>
    </UTable>

    <UDivider />

    <div class="flex justify-between px-3 py-3.5">
      <div :class="selected.length ? '' : 'h-8'">
        <UButtonGroup size="sm" orientation="horizontal" v-if="selected.length">
          <UButton icon="i-heroicons-outline-qr-code" label="Print labels" color="white" @click="printTags" />
          <UButton :loading="deletingAll" icon="i-heroicons-outline-trash" color="red" label="Delete"
            @click="deleteParts" />
        </UButtonGroup>
      </div>
      <div>
        <UPagination v-if="pageCount !== 'All' && parts.length > parseInt(pageCount, 10)" v-model="page"
          :page-count="parseInt(pageCount, 10)" :total="parts.length" />
      </div>
    </div>

    <UButton icon="i-heroicons-outline-plus" class="mt-6" :label="`Create part ${location ? 'here' : ''}`"
      @click="createPart" />
    <UButton v-if="location" icon="i-heroicons-outline-arrow-top-right-on-square" class="mt-6 ml-2" label="Move part here"
      @click="moveModal = true" />
    <PartsMove v-if="location" :open="moveModal" :location="location" @close="moveModal = false"
      @refresh="emit('refresh')" />

    <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" @close="partModal = false" @refresh="emit('refresh')" @setParent="setParent" />
    <PartsQRCodeModal :open="qrModal" :part="qrPart" @close="qrModal = false" />

  </div>
</template>

<script lang="ts" setup>
import type { NuxtLink, UDivider } from '#build/components';
import type { UButton } from '#ui-colors/components';

const client = useSupabaseClient()
const user = useSupabaseUser()

const router = useRouter()

const config = useRuntimeConfig()

const props = defineProps({
  parts: {
    type: Array,
    required: true,
  },
  location: {
    type: Object as Location,
    required: false,
  },
})

// TODO Allow printing many labels at once on single piece of paper

const page = ref(1)
const pageCount = ref('20')

const selected = ref([])

const sort = ref({
  column: 'part',
  direction: 'asc'
})



const qty = (row: Part) => {
  if (row.parent) {
    return row.parent.location_parts.reduce((acc, lp) => lp.quantity + acc, 0) / row.quantity_of
  }
  return row.location_parts ? row.location_parts.reduce((acc, lp) => lp.quantity + acc, 0) : 0
}

const sorted = computed(() => {
  return props.parts.sort((a: Part, b: Part) => {
    let cmp = 0
    switch (sort.value.column) {
      case 'part':
        cmp = a.part.localeCompare(b.part)
        break;
      case 'value':
        cmp = a.value.localeCompare(b.value)
        break;
      case 'footprint':
        cmp = a.footprint.localeCompare(b.footprint)
        break;
      case 'locations.name':
        if (a.locations && b.locations) {
          cmp = a.locations.name.localeCompare(b.locations.name)
          break;
        }
        if (a.locations) {
          cmp = 1
          break;
        }
        if (b.locations) {
          cmp = -1
          break;
        }

      case 'quantity':
        cmp = a.quantity - b.quantity
        break;
      case 'min_quantity':
        cmp = a.min_quantity - b.min_quantity
        break;
      default:
        break;

    }

    return sort.value.direction === 'asc' ? cmp : -cmp
  })
})

const rows = computed(() => {
  if (pageCount.value === 'All') {
    return sorted.value
  }

  const pc = parseInt(pageCount.value, 10)

  return sorted.value.slice((page.value - 1) * pc, (page.value) * pc)
})

const columns = [
  {
    key: "part",
    label: "Part",
    sortable: true,
  },
  {
    key: "value",
    label: "Value",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
    sortable: true,
  },
  {
    key: "locations",
    label: "Locations",
    sortable: true,
  },
  {
    key: "footprint",
    label: "Footprint",
    sortable: true,
  },
  {
    key: "quantity",
    label: "Qty",
    sortable: true,
  },
  {
    key: "min_quantity",
    label: "Min Qty",
    sortable: true,
  },

  {
    key: "project_parts",
    label: "Projects",
  },
  {
    key: "id",
    label: "Tools",
  },
]

const partModal = ref(false)
const qrModal = ref(false)
const moveModal = ref(false)
const qrPart = ref({})

const deleting = ref(0)
const deletingAll = ref(false)
const emit = defineEmits(['refresh'])

const { data: locations } = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})


let selectedPart: Part = ref({
})

const setParent = () => {
  console.log('table setting parent')
  partModal.value = false
  selectedPart.value = selectedPart.value.parent
  partModal.value = true
}

const createPart = () => {
  partModal.value = true;
}

const editPart = (row: Part) => {
  selectedPart.value = row
  partModal.value = true
}

const deletePart = async (row: Part) => {
  deleting.value = row.id
  await client.from('parts').delete().eq('id', row.id)
  emit('refresh')
  deleting.value = 0
}

const deleteParts = async () => {
  deletingAll.value = true
  await client.from('parts').delete().in('id', selected.value.map(p => p.id))
  emit('refresh')
  deletingAll.value = false
}

const printTag = (row: Part) => {
  qrPart.value = row
  qrModal.value = true
}

const printTags = () => {
  const routeData = router.resolve({ path: '/parts/print', query: { ids: selected.value.map(p => p.id) } });
  window.open(routeData.href, '_blank');
}

</script>

<style></style>

