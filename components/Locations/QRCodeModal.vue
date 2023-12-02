<template>
  <UModal v-model="open">
    <UCard :ui="{ body: {background: 'bg-slate-200 dark:bg-slate-800'}, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Label for {{ location.name }}</h2>
      </template>

      <CommonQrCode
        :subtitle="location.parts.map(p => p.part).join(', ')"
        :description="location.description"
        :url="`${req.public.baseUrl}/locations/${props.location.id}`"
      >
        <template #title>
          {{ location.name }}
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
  location: {
    type: Object as Location,
    required: true,
  },
});

const open = ref(false)




const print = () => {
  const mywindow = window.open(`${req.public.baseUrl}/locations/${props.location.id}`, 'PRINT', 'height=400,width=600');
  const html = document.getElementById('image').innerHTML
  mywindow.onload = () => {
    mywindow.document.head.innerHTML = ''
    mywindow.document.body.innerHTML = ''
    const style = mywindow.document.createElement('style')
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

