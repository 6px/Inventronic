<template>
  <UContainer>
    <UBreadcrumb divider=">"
      :links="[{ label: 'Dashboard', to: '/' }, { label: 'Parts', to: '/parts' }, { label: part.part + ' ' + part.value, to: `/parts/${uuidb64(part.id)}` }]" />
  </UContainer>
  <PartsForm :modal="false" :selectedPart="part" :saving="saving" @save="savePart" @setParent="setParent" />
</template>

<script lang="ts" setup>

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

const qrModal = ref(false)

const saving = ref(false)


const { data: part, refresh } = await useAsyncData(`part-${route.params.id}`, async () => {
  const { data } = await client.from('parts').select(partFields()).eq('id', b64uuid(route.params.id)).order('created_at')

  console.log('single part', data)
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

const setParent = () => {
  if (part.value.parent && part.value.parent.id) {
    router.push(`/parts/${uuidb64(part.value.parent.id)}`)
  }
}
const savePart = async () => {
  saving.value = true
  const p: Part = { ...part.value }
  console.log('saving', p)
  delete p.locations

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('parts').update({ ...p }).select(partFields())
      .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    }
    saving.value = false
  }
}
</script>

<style></style>