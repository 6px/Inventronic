<template>
    <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white">
      Projects
    </h1>
    <UContainer
      body-class="overflow-hidden"
    >
      <UTable :rows="projects">

      </UTable>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>

const client = useSupabaseClient()

const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

const {data: parts, refresh} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const projectFields = `id, name, description, project_parts(id, parts(id, part, value), quantity)`


const {data: projects} = await useAsyncData(`projects`, async () => {
  const { data } = await client.from('projects').select(projectFields).order('created_at')

  return data
})
</script>

<style>

</style>

