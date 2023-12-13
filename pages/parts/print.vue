<template>
  <div>
    <CommonQrCode
        v-for="part in parts"
        :title="part.part === part.value ? part.part : part.part + ' ' + part.value"
        :subtitle="part.footprint + '\n' + (part.locations ? part.locations.name : '')"
        :description="part.description"
        :subsubtitle="part.parts.map(np => np.part === np.value ? np.part : np.part + ' ' + np.value).join(' ')"
        :description-size="2"
        :subtitle-size="2.5"
        :qrSize="11"
        :url="`${config.public.baseUrl}/parts/${uuidb64(part.id)}`"
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



const {data: parts, refresh} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(`${partFields()}, parts(id, part, value)`).in('id', route.query.ids).order('created_at')
  
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
    width: 54mm;
    height: 17mm;
    display: inline;
    margin: 0 !important;
    padding: 0 !important;
  }
  body, html, div {
    background: white;
  }
  @media print {
      svg {
        width: 54mm !important;
        height: 17mm;
        margin: 0 !important;
        padding: 0 !important;
      }
      body{
        color-adjust: exact;
        print-color-adjust: exact;
        padding:0;
        margin:0;
      }
    }
</style>