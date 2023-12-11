<template>
  <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white text-center">
      Projects
    </h1>
    <UContainer body-class="overflow-hidden">
      <UTable :rows="projects" :columns="columns">
        <template #id-data="{ row }">
          <UButton :to="`/projects/${row.id}`" icon="i-heroicons-outline-eye"></UButton>
          <UButton class="ml-2" icon="i-heroicons-outline-qr-code" @click="printLabel(row)"></UButton>
          <UButton class="ml-2" color="red" icon="i-heroicons-outline-trash" @click="deleteProject(row)"></UButton>
        </template>
        <template #created_at-data="{ row }">
          {{ (new Date(row.created_at)).toLocaleString() }}
        </template>
        <template #name-data="{ row }">
          <UButton :to="`/projects/${row.id}`" variant="link">
            {{ row.name }}
          </UButton>

        </template>
        <template #buildable-data="{ row }">
          <UBadge v-if="nparts(row) < Infinity" color="white">{{ nparts(row) }} PCBs</UBadge>
          <UBadge v-else color="white">Unknown</UBadge>
        </template>

        <template #project_parts-data="{ row }">
          <UBadge color="white">{{ row.project_parts.length }}</UBadge>
        </template>
      </UTable>
      <ProjectsNew :open="newModal" @close="closedNew" />
      <UButton label="New project" @click="newModal = true" />
    </UContainer>
    <ProjectsQRCodeModal :open="qrModal" :project="qrProject" @close="qrModal = false" />

  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const client = useSupabaseClient()

const newModal = ref(false)

const qrModal = ref(false)

const qrProject = ref({})

useHead({
  title: 'Projects',
})

const { data: parts } = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields()).order('created_at')

  return data
})

const projectFields = `id, name, description, url, created_at, project_parts(id, parts(id, part, value), quantity, references)`


const { data: projects, refresh } = await useAsyncData(`projects`, async () => {
  const { data } = await client.from('projects').select(projectFields).order('created_at')

  return data
})

const printLabel = (row) => {
  qrProject.value = row
  qrModal.value = true
}
const closedNew = () => {
  newModal.value = false
  refresh()
}

const deleteProject = async (row) => {
  await client.from('projects').delete().eq('id', row.id)
  refresh()
}



const nparts = (row) => {
  // For each project parts, get current inventory, 
  // and divide by the quantity required by the project
  let nparts = Infinity;

  const m: Array<Part> = []

  row.project_parts.forEach((pp: ProjectPart) => {
    const part = parts.value.find(p => p.id === pp.parts.id)
    let qty = 0
    if (part && !part.parent) {
      qty = part.location_parts.reduce((acc: number, lp: LocationPart) => {
        return acc + lp.quantity
      }, 0)
    } else if (part.parent) {
      //TODO handle case where part is made up of another part
      qty = part.parent.location_parts.reduce((acc: number, lp: LocationPart) => {
        return acc + lp.quantity
      }, 0) / part.quantity_of
    }
    if (qty == 0) {
      nparts = 0
    } else if (Math.floor(qty / pp.quantity) < nparts) {
      nparts = Math.floor(qty / pp.quantity)
    }
    if (part && Math.floor(qty / pp.quantity) === 0) {
      nparts = 0
    }
  });
  return nparts
}

const columns = [
  {
    key: 'name',
    label: "Name",
  },
  {
    key: 'description',
    label: "Description",
  },
  {
    key: 'created_at',
    label: "Creation date",
  },
  {
    key: 'project_parts',
    label: "Parts used",
  },
  {
    key: 'buildable',
    label: "Buildable",
  },
  {
    key: 'id',
    label: "Tools",
  },
]

</script>

<style></style>

