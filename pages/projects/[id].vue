<template>
  <div class="w-full my-2">
    <h1 class="mb-8 text-4xl font-bold u-text-white text-center">
      {{ project.name }}
    </h1>
    <UContainer>
      <div class="grid grid-cols-2 gap-x-2">
        <ProjectsForm :project="project" @refresh="refresh" @setParts="projectParts=$event" />
        <ProjectsDetails :project="project" />
      </div>
      
      <ProjectsParts class="mt-8" :project="project" :projectParts="projectParts" @refresh="refresh" />

    </UContainer>

    <div class=" w-full mb-8">
    </div>

</div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const projectFields = `id, name, created_at, description, project_parts(id, parts(id, part, value, footprint, description, quantity, locations(id, name)), quantity)`

  const {data: project, refresh} = await useAsyncData(`project-${route.params.id}`, async () => {
    const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

  const projectParts = ref(project.value.project_parts)




</script>

<style>

</style>

