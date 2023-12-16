<template>
  <UModal v-model="open" @close="emit('close')">
    <UCard :ui="{ body: {background: 'bg-slate-200 dark:bg-slate-800'}, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2>Label for {{ projectPart.parts.part === projectPart.parts.value ? projectPart.parts.part : projectPart.parts.part + ' ' + projectPart.parts.value }} </h2>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>
      <div id="image">
        <CommonQRCode
          :title="projectPart.parts.part === projectPart.parts.value ? projectPart.parts.part : projectPart.parts.part + ' ' + projectPart.parts.value"
          :subtitle="projectPart.references"
          :description="projectPart.parts.footprint"
          :description-size="2"
          :subtitle-size="2.5"
          :url="`${req.public.baseUrl}/parts/${uuidb64(projectPart.parts.id)}`"
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


const req = useRuntimeConfig()
const emit = defineEmits()



const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  projectPart: {
    type: Object as ProjectPart,
    required: true,
  },
});

const open = ref(false)




const print = () => {
  const mywindow = window.open(`${req.public.baseUrl}/parts/${props.projectPart.parts.id}`, 'PRINT', 'height=400,width=600');
  const html = document.getElementById('image').innerHTML
  mywindow.onload = () => {
    mywindow.document.head.innerHTML = ''
    mywindow.document.body.innerHTML = ''
    const style = mywindow.document.createElement('style')
    const css = mywindow.document.createTextNode(`
    @media print {
      svg {
        width: 50mm !important;
        padding:0;
        margin:0;
      }
      body{
        width: 50mm !important; 
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




</script>

<style>

</style>

