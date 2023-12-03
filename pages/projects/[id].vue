<template>
  <div class="w-full my-2">
    <h1 class="mb-8 text-4xl font-bold u-text-white text-center">
      {{ project.name }} 
      <UButton class="ml-4" icon="i-heroicons-outline-qr-code" @click="qrModal=true"/>
    </h1>
    <UContainer>
      <div class="md:grid md:grid-cols-2 md:gap-x-2">
        <ProjectsForm :project="project" @refresh="refresh" />
        <ProjectsDetails class="mt-2 md:mt-0" :project="project" :parts="parts" @editPart="editPart($event)" @refresh="refresh" />
      </div>
      
      <ProjectsParts class="mt-8" :project="project" :parts="parts" @refresh="refresh" />

    </UContainer>
    <PartsPartModal :partModal="partModal" :selectedPart="selectedPart" :saving="saving" @close="partModal=false" @save="savePart" />
    <ProjectsQrCodeModal :project="project" :open="qrModal"  @close="qrModal=false" />
  </div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const router = useRouter()
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const selectedPart = ref({})
  const saving = ref(false)
  const partModal = ref(false)

  const qrModal = ref(false)

  const projectFields = `id, name, created_at, description, url, project_parts(id, parts(id, part, value, footprint, description, quantity, price, ordering_url, locations(id, name)), quantity, references)`

  const {data: project, refresh: refreshProject} = await useAsyncData(`project-${route.params.id}`, async () => {
    const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

  const partFields = `id, part, value, description, footprint, quantity, min_quantity, price, ordering_url, locations(id, name), location_id`

  const {data: parts, refresh: refreshParts} = await useAsyncData(`parts`, async () => {
    const { data } = await client.from('parts').select(partFields).order('created_at')

    return data
  })

  if (!project.value) {
    showError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

useHead({
  title: project.value ? project.value.name : '', 
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

