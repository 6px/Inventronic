<template>
  <div>
    <div v-if="route.query.ids" class="bg-white">
      <CommonQrCode v-for="projectPart in parts"
        :title="projectPart.parts.part === projectPart.parts.value ? projectPart.parts.part : projectPart.parts.part + ' ' + projectPart.parts.value"
        :subtitle="projectPart.references" :description="projectPart.parts.footprint" :description-size="2"
        :subtitle-size="2.5" :url="`${config.public.baseUrl}/parts/${uuidb64(projectPart.parts.id)}`" @ready="ready" />
    </div>
    <div v-else>
      <UTable :rows="rows" :ui="{ tr: { base: 'divide-x print:divide-black' }, td: { base: '' }, tbody: 'divide-y divide-black  dark:divide-white print:divide-black', divide: 'divide-y-2 divide-black dark:divide-white print:divide-black print:divide-y-2', }">
      </UTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'print'
})
const config = useRuntimeConfig()
const route = useRoute()

const cnt = ref(0)

const client = useSupabaseClient()

const projectFields = `id, name, created_at, description, url, project_parts(id, parts(${partFields()}), quantity, references)`

const { data: project } = await useAsyncData(`project-${route.params.id}`, async () => {
  const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

  return data[0]
})

const parts = computed(() => {
  return project.value.project_parts.filter((p: ProjectPart) => route.query.ids.indexOf(p.id) >= 0)
})

const rows = computed(() => {
  return project.value.project_parts.map((pp: ProjectPart) => {
    return {
      part: pp.parts.part,
      value: pp.parts.value,
      use: pp.parts.parent ? pp.parts.quantity_of + ' × ' + pp.parts.parent.part + ' ' + pp.parts.parent.value : '',
      footprint: pp.parts.footprint,
      quantity: pp.quantity,
      references: pp.references,
    
    }
  })
})

const ready = () => {
  cnt.value += 1
  if (cnt.value >= parts.value.length) {
    window.print()
  }
}


</script>

<style scoped>
svg {
  width: 54mm;
  display: inline;
  margin: 0;
}

body,
html {
  background: white;
}
</style>