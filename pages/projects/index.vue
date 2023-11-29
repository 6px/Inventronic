<template>
    <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white">
      Projects
    </h1>
    <UContainer
      body-class="overflow-hidden"
    >
      <UTable :rows="projects" :columns="columns" @select="(row) => router.push(`/projects/${row.id}`)">
        <template #id-data="{row}">
          <UButton :to="`/projects/${row.id}`" icon="i-heroicons-outline-eye"></UButton>
          <UButton class="ml-2" color="red" icon="i-heroicons-outline-trash" @click="deleteProject(row)"></UButton>
        </template>
        <template #created_at-data="{row}">
          {{ (new Date(row.created_at)).toLocaleString() }}
        </template>
        <template #buildable-data="{row}">
          <UBadge color="white">{{ nparts(row) }} PCBs</UBadge>
        </template>

        <template #project_parts-data="{row}">
          <UBadge color="white">{{ row.project_parts.length }}</UBadge>
        </template>
      </UTable>
      <ProjectsNew :open="newModal" @close="newModal=false && refresh()" />
      <UButton label="New project" @click="newModal=true" />
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const client = useSupabaseClient()

const newModal = ref(false)

const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

const {data: parts} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const projectFields = `id, name, description, created_at, project_parts(id, parts(id, part, value), quantity)`


const {data: projects, refresh} = await useAsyncData(`projects`, async () => {
  const { data } = await client.from('projects').select(projectFields).order('created_at')

  return data
})

const deleteProject = async (row) => {
  await client.from('projects').delete().eq('id', row.id)
  refresh()
}

const nparts = (row) => {
  // For each project parts, get current inventory, 
  // and divide by the quantity required by the project
  let nparts = Infinity;
  console.log(row.project_parts)
  row.project_parts.forEach((pp: ProjectPart) => {
    const part = parts.value.find(p => p.id === pp.parts.id)
    if (!part) {
      nparts = 0
    } else if (Math.floor(part.quantity / pp.quantity) < nparts) {
      nparts = Math.floor(part.quantity / pp.quantity)
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

<style>

</style>

