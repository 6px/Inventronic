<template>
  <div class="w-full my-2">
    <h1 class="mb-8 text-4xl font-bold u-text-white text-center">
      {{ project.name }}
    </h1>
    <UContainer>
      <div class="grid grid-cols-2 gap-x-2">
        <ProjectsForm :project="project" @refresh="refresh" />
        <ProjectsDetails :project="project" :parts="parts" @editPart="editPart($event)" @refresh="refresh" />
      </div>
      
      <ProjectsParts class="mt-8" :project="project" @refresh="refresh" />

    </UContainer>
    <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" :saving="saving" @close="partModal=false" @save="savePart" />

  </div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const selectedPart = ref({})
  const saving = ref(false)
  const partModal = ref(false)

  const projectFields = `id, name, created_at, description, project_parts(id, parts(id, part, value, footprint, description, quantity, locations(id, name)), quantity)`

  const {data: project, refresh: refreshProject} = await useAsyncData(`project-${route.params.id}`, async () => {
    const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

  const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

  const {data: parts, refresh: refreshParts} = await useAsyncData(`parts`, async () => {
    const { data } = await client.from('parts').select(partFields).order('created_at')

    return data
  })

  const refresh = () => {
    refreshParts()
    refreshProject()
  }

  const editPart = (part: Part) => {
    selectedPart.value = part
    partModal.value = true
  }

  
const savePart = async () => {
  saving.value = true
  const p: Part = { ...selectedPart.value }

  delete p.locations
  let r
  if (p.id) {
    p.owner_id = user.value.id
    r = await client.from('parts').update({ ...p }).select(partFields)
    .eq('id', p.id)
  } else {
    p.owner_id = user.value.id
    delete p.id
    r = await client.from('parts').insert({ ...p }).select(partFields)
  }
  if (r.error) {
      alert(r.error.message)
    } else {
      partModal.value = false;
      
      refresh()
    }
  saving.value = false
}

</script>

<style>

</style>

