<template>
  <UModal v-model="open">
    <UCard :ui="{ body: {background: 'bg-slate-200 dark:bg-slate-800'}, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Label for {{ part.part === part.value ? part.part : part.part + ' ' + part.value }} </h2>
      </template>

      <CommonQrCode
        :subtitle="part.footprint + '\n' + (part.locations ? part.locations.name : '')"
        :description="part.description"
        :description-size="2"
        :subtitle-size="2.5"
        :url="`${req.public.baseUrl}/parts/${part.id}`"
      >
        <template #title>
          {{ part.part === part.value ? part.part : part.part + ' ' + part.value }} 
        </template>
      </CommonQrCode>
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
import type { CommonQrCode } from '#build/components';


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

