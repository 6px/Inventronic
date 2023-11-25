<template>
  <div>
    <UTable :rows="parts" :columns="columns" :ui="{td: {base:''}}">
      <template #quantity-data="{ row }">
        <UBadge
          :color="row.quantity <= row.min_quantity ? 'red': 'primary'"
          :variant="row.quantity <= row.min_quantity ? 'solid': 'outline'"
        >
        {{ row.quantity }}
      </UBadge>

      </template>
      <template #part-data="{ row }">
        <strong>{{ row.part }}</strong>
      </template>
      <template #locations.name-data="{ row }">
        <UButton v-if="row.locations && row.locations.name" variant="link" :to="`/locations/${row.locations.id}`">{{ row.locations.name }}</UButton>
        <span v-else></span>
      </template>
      <template #id-data="{ row }">
        <div class="whitespace-nowrap">
          <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="printTag(row)" />
          <UButton label="" icon="i-heroicons-outline-pencil" @click="editPart(row)" />
          <UButton class="ml-2" label="" icon="i-heroicons-outline-trash" color="red" @click="deletePart(row)" />
        </div>
      </template>
    </UTable>
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
  </div>
  <PartsMove v-if="location" :open="moveModal" :location="location" @close="moveModal=false" @refresh="emit('refresh')" />
  <PartsPartModal :saving="saving" :partModal="partModal" :selectedPart="selectedPart" @close="partModal=false" @save="savePart" />
  <PartsQRCodeModal :partModal="qrModal" :selectedPart="qrPart" @close="qrModal=false" />

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

const columns = [
  {
    key: "part",
    label: "Part"
  },
  {
    key: "value",
    label: "Value"
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "locations.name",
    label: "Location",
  },
  {
    key: "footprint",
    label: "Footprint",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "min_quantity",
    label: "Min Quantity",
  },
  {
    key: "id",
    label: "Tools",
  },
]

const partFields = `id, part, value, description, footprint,quantity, min_quantity, locations(id, name), location_id`

const partModal = ref(false)
const qrModal = ref(false)
const moveModal = ref(false)
const qrPart = ref(null)
const saving = ref(false)
const emit = defineEmits()


let selectedPart: Part = reactive({
  part: '',
  value: '',
  description: '',
  footprint: '',
  quantity: 0,
  min_quantity: 0,
  location_id: props.location ? props.location.id : null,
  id:null,
  owner_id: null,
})



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

