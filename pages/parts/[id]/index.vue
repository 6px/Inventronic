<template>

    <PartsForm :modal="false" :selectedPart="part" :saving="saving" @save="savePart" />

    <PartsQRCodeModal :partModal="qrModal" :selectedPart="part" @close="qrModal=false" />

    <UButton class="mr-2" label="" icon="i-heroicons-outline-qr-code" @click="qrModal=true" />

</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const qrModal = ref(false)

  const saving = ref(false)

  const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

  const {data: part, refresh} = await useAsyncData(`part-${route.params.id}`, async () => {
    const { data } = await client.from('parts').select(partFields).eq('id', route.params.id).order('created_at')

    return data[0]
  })

  if (!part.value) {
    showError({
      statusCode: 404,
      statusMessage: 'Page Not Found'
    })
  }

useHead({
  title: part.value.part + ' ' + part.value.value, 
})

  const savePart = async () => {
    saving.value = true
    const p: Part = { ...part.value }
    console.log('saving', p)
    delete p.locations

    if (p.id) {
      p.owner_id = user.value.id
      const r = await client.from('parts').update({ ...p }).select(partFields)
      .eq('id', p.id)
      if (r.error) {
        alert(r.error.message)
      }
      saving.value = false
    }
  }
</script>

<style>

</style>