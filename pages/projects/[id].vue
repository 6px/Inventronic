<template>
  <div class="w-full my-2">
    <h1 class="mb-1 text-4xl font-bold u-text-white">
      {{ project.name }}
    </h1>
    <ProjectsForm :project="project" @refresh="refresh" />
</div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const projectFields = `id, name, description, project_parts(id, parts(id, part, value, footprint, description, locations(id, name)), quantity)`

  const {data: project, refresh} = await useAsyncData(`project-${route.params.id}`, async () => {
    const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

</script>

<style>

</style>

