<template>
  <div>
    <UTable :rows="rows" :columns="columns" :ui="{td: {base:''}}">
      <template #quantity-data="{ row }">
        <UBadge
          :color="row.quantity <= row.min_quantity ? 'red': 'primary'"
          :variant="row.quantity <= row.min_quantity ? 'solid': 'outline'"
        >
        {{ row.quantity }}
      </UBadge>

      </template>

      <template #locations.name-data="{ row }">
        <UButton v-if="row.locations && row.locations.name" variant="link" :to="`/locations/${row.locations.id}`">
          {{ row.locations.name }}
        </UButton>
        <div v-else>
          <USelect :options="locations" option-attribute="name" value-attribute="id" v-model="row.location_id" @change="changeLocation(row)" />
        </div>
      </template>


      <template #footprint-data="{ row }">
        <UTooltip :text="row.footprint">
          <div class="max-w-[200px] truncate overflow-hidden">
          
            {{ row.footprint }}
            
          </div>
        </UTooltip>
      </template>

      <template #part-data="{ row }">
        <strong>{{ row.part }}</strong>
      </template>
      <template #id-data="{ row }">
        <div class="whitespace-nowrap">
          <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="printTag(row)" />
          <UButton label="" icon="i-heroicons-outline-pencil" @click="editPart(row)" />
          <UButton class="ml-2" label="" icon="i-heroicons-outline-trash" color="red" @click="deletePart(row)" />
        </div>
      </template>
    </UTable>

    <div v-if="parts.length > pageCount" class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="pageCount" :total="parts.length" />
    </div>

    <UButton
      icon="i-heroicons-outline-plus"
      class="mt-6"
      :label="`Create part ${location ? 'here' : ''}`"
      @click="createPart"
    />
    <UButton
      v-if="location"
      icon="i-heroicons-outline-arrow-top-right-on-square"
      class="mt-6 ml-2"
      label="Move part here"
      @click="moveModal=true"
    />
    <PartsMove v-if="location" :open="moveModal" :location="location" @close="moveModal=false" @refresh="emit('refresh')" />
    
    <PartsPartModal :saving="saving" :partModal="partModal" :selectedPart="selectedPart" @close="partModal=false" @save="savePart" />
    <PartsQRCodeModal :open="qrModal" :part="qrPart" @close="qrModal=false" />

  </div>

</template>

<script lang="ts" setup>
import type { UButton } from '#ui-colors/components';

const client = useSupabaseClient()
const user = useSupabaseUser()

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

const page = ref(1)
const pageCount = 20

const rows = computed(() => {
  return props.parts.slice((page.value - 1) * pageCount, (page.value) * pageCount)
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
    key: "locations.name",
    label: "Location",
    sortable: true,
  },
  {
    key: "footprint",
    label: "Footprint",
    sortable: true,
  },
  {
    key: "quantity",
    label: "Quantity",
    sortable: true,
  },
  {
    key: "min_quantity",
    label: "Min Quantity",
    sortable: true,
  },
  {
    key: "id",
    label: "Tools",
  },
]

const partFields = `id, part, value, description, footprint, quantity, price, ordering_url, min_quantity, locations(id, name), location_id`

const partModal = ref(false)
const qrModal = ref(false)
const moveModal = ref(false)
const qrPart = ref({})
const saving = ref(false)
const emit = defineEmits(['refresh'])

const {data: locations} = await useAsyncData('locations', async () => {
  const { data } = await client.from('locations').select().order('created_at')

  return data
})


let selectedPart: Part = reactive({
  part: '',
  value: '',
  description: '',
  footprint: '',
  quantity: 0,
  min_quantity: 0,
  price: 0,
  ordering_url: '',
  location_id: props.location ? props.location.id : null,
  id:null,
  owner_id: null,
  locations: {...props.location}
})

const changeLocation = async (row) => {
  console.log(row.location_id)
  await client.from('parts').update({'location_id': row.location_id}).eq('id', row.id)
  emit('refresh')
}

const createPart = () => {
  partModal.value = true;
}

const editPart = (row: Part) => {
  selectedPart = row
  partModal.value = true
}

const deletePart = async (row: Part) => {
  await client.from('parts').delete().eq('id', row.id)
  emit('refresh')
}

const printTag = (row: Part) => {
  qrPart.value = row
  qrModal.value = true
}

const savePart = async () => {
  saving.value = true
  const p = { ...selectedPart }

  delete p.locations

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('parts').update({ ...p }).select(partFields)
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      console.log(r)
      const newPart = r.data[0]

      const np = props.parts.findIndex((p) => p.id === newPart.id)

      props.parts[np] = newPart
      emit('refresh')
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
      props.parts.push(r.data[0])
      emit('refresh')
    }
    saving.value = false
  }
}
</script>

<style>

</style>

