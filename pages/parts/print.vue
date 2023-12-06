<template>
  <div>
    <CommonQrCode
        v-for="part in parts"
        :title="part.part === part.value ? part.part : part.part + ' ' + part.value"
        :subtitle="part.footprint + '\n' + (part.locations ? part.locations.name : '')"
        :description="part.description"
        :description-size="2"
        :subtitle-size="2.5"
        :url="`${config.public.baseUrl}/parts/${part.id}`"
        @ready="ready"
      >
      </CommonQrCode>
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


const partFields = `id, part, value, description, footprint, quantity, min_quantity, price, ordering_url, locations(id, name), location_id`

const {data: parts, refresh} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).in('id', route.query.ids).order('created_at')
  
  return data
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
    width: 48mm;
    display: inline;
    margin: 2mm;
  }
  body, html, div {
    background: white;
  }
</style>