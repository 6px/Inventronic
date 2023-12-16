<template>
  <UModal v-model="open" @close="emit('close')">
    <UCard :ui="{ body: {background: 'bg-slate-200 dark:bg-slate-800'}, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2>Label for {{ part.part === part.value ? part.part : part.part + ' ' + part.value }} </h2>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>
      <div id="image">
        <CommonQRCode
          :title="part.part === part.value ? part.part : part.part + ' ' + part.value"
          :subtitle="part.footprint"
          :subsubtitle="(p ? p.parts.map(np => np.part === np.value ? np.part : np.part + ' ' + np.value).join(' ') : '')"
          :description="part.description || ''"
          :description-size="2"
          :subtitle-size="2.5"
          :qrSize="11"
          :url="`${req.public.baseUrl}/parts/${uuidb64(part.id)}`"
        />
        
      </div>
      <template #footer>
        <UButton
          class="mx-4"
          label="Print"
          @click="print"
        />
        <UButton
          class="mx-4"
          label="Cancel"
          @click="$emit('close')"
        />
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>

const client = useSupabaseClient()
const req = useRuntimeConfig()
const emit = defineEmits()



const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  part: {
    type: Object as Part,
    required: true,
  },
});

const part_id = ref(props.part.id)

const {data: p} = await useAsyncData(`part-${props.part.id}`, async () => {
  const { data } = await client.from('parts').select(`${partFields()}, parts(id, part, value)`).eq('id', part_id.value).single()

  return data
}, {
  watch: [part_id]
})

const open = ref(false)

const print = () => {
  const mywindow = window.open(`${req.public.baseUrl}/parts/${props.part.id}`, 'PRINT', 'height=400,width=600');
  const html = document.getElementById('image').innerHTML
  mywindow.onload = () => {
    mywindow.document.head.innerHTML = ''
    mywindow.document.body.innerHTML = ''
    const style = mywindow.document.createElement('style')
    const css = mywindow.document.createTextNode(`
    @media print {
      svg {
        width: 54mm !important;
        padding:0;
        margin:0;
      }
      body{
        width: 54mm !important; 
        height: 17mm !important; 
        color-adjust: exact;
        padding:0;
        margin:0;
      }
    }
    `)
    style.appendChild(css)
    mywindow.document.head.innerHTML = ''
    mywindow.document.head.appendChild(style)
    mywindow.document.body.innerHTML = `
    ${html}
    `
    mywindow.print();
    mywindow.close();
  }
  
  emit('close');
}

watch(
  () => props.open,
  () => {open.value = props.open}
)
watch(
  () => props.part,
  () => {part_id.value = props.part && props.part.id ? props.part.id : 0}
)



</script>

<style>

</style>

