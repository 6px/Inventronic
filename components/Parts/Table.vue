<template>
  <div>
    <UTable :rows="parts" :columns="columns">
      <template #quantity-data="{ row }">
        <UBadge
          :color="row.quantity <= row.min_quantity ? 'red': 'primary'"
          :variant="row.quantity <= row.min_quantity ? 'solid': 'outline'"
        >
        {{ row.quantity }}
      </UBadge>

      </template>
      <template #name-data="{ row }">
        <strong>{{ row.name }}</strong>
      </template>
      <template #id-data="{ row }">
        <UButton class="mr-2" label="" icon="i-heroicons-outline-tag" @click="printTag(row)" />
        <UButton label="" icon="i-heroicons-outline-pencil" @click="editPart(row)" />
      </template>
    </UTable>
    <UButton
      class="mt-6"
      label="Create part"
      @click="createPart"
    />
  </div>
  <PartsPartModal :saving="saving" :partModal="partModal" :selectedPart="selectedPart" @close="partModal=false" @save="savePart" />
  <PartsQRCodeModal :partModal="qrModal" :selectedPart="qrPart" @close="qrModal=false" />

</template>

<script lang="ts" setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const props = defineProps({
  parts: {
    type: Array,
    required: true,
  },
})

const columns = [
  {
    key: "name",
    label: "Name"
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "Locations.name",
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

const partFields = `id, name, description, footprint,quantity, min_quantity, Locations(id, name), location_id`

const partModal = ref(false)
const qrModal = ref(false)
const qrPart = ref()
const saving = ref(false)


let selectedPart: Part = reactive({
  name: '',
  description: '',
  footprint: '',
  quantity: 0,
  min_quantity: 0,
  location_id: null,
  id:null,
  owner_id: null,
})



const createPart = () => {
  partModal.value = true;
}

const editPart = (row: Part) => {
  selectedPart = row
  console.log(selectedPart)
  partModal.value = true
}

const printTag = (row: Part) => {
  qrPart.value = row
  qrModal.value = true
}

const savePart = async () => {
  saving.value = true
  const p = { ...selectedPart }

  delete p.Locations

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('Parts').update({ ...p }).select(partFields)
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      console.log(r)
      const newPart = r.data[0]

      const np = props.parts.findIndex((p) => p.id === newPart.id)

      props.parts[np] = newPart
    }
    saving.value = false
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('Parts').insert({ ...p }).select(partFields)
    if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      props.parts.push(r.data[0])
      
    }
    saving.value = false
  }
}
</script>

<style>

</style>

