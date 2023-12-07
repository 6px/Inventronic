<template>
  <div>
      <CommonQrCode
          v-for="projectPart in parts"
          :title="projectPart.parts.part === projectPart.parts.value ? projectPart.parts.part : projectPart.parts.part + ' ' + projectPart.parts.value"
          :subtitle="projectPart.references"
          :description="projectPart.parts.footprint"
          :description-size="2"
          :subtitle-size="2.5"
          :url="`${config.public.baseUrl}/parts/${uuidb64(projectPart.parts.id)}`"
          @ready="ready"
        />
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

const projectFields = `id, name, created_at, description, url, project_parts(id, parts(id, part, value, footprint, description, quantity, price, ordering_url, locations(id, name)), quantity, references)`

const {data: project} = await useAsyncData(`project-${route.params.id}`, async () => {
  const { data } = await client.from('projects').select(projectFields).eq('id', route.params.id).order('created_at')

  return data[0]
})

const parts = computed(() => {
  return project.value.project_parts.filter((p: ProjectPart) => route.query.ids.indexOf(p.id) >= 0)
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
  body, html, div {
    background: white;
  }
</style>