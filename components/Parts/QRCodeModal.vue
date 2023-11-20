<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Label for {{ selectedPart.name }}</h2>
      </template>

      <div class="flex flex-row" id="label-container">
        <div>
          <vue-qrcode
            :value="`${req.public.baseUrl}${route.fullPath}/${selectedPart.id}`"
            margin="0"
          />
        </div>
        <div style="margin-left: 1em;font-family: sans-serif;">
          <strong>{{ selectedPart.name }}</strong><br>
          <span>{{ selectedPart.Locations.name }}</span><br>
          <span>{{ selectedPart.footprint }}</span><br>
        </div>
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
import VueQrcode from 'vue-qrcode'

const req = useRuntimeConfig()
const route = useRoute()

const props = defineProps({
  partModal: {
    type: Boolean,
    required: true,
  },
  selectedPart: {
    type: Object as Part,
    required: true,
  },
});

const open = ref(false)

const print = () => {
  const html = document.getElementById('label-container').innerHTML
  const mywindow = window.open('', 'PRINT', 'height=400,width=600');
  mywindow.document.body.innerHTML = `<div style="display:flex;flex-direction:row">${html}</div>`
  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/

  mywindow.print();
  mywindow.close();
}

watch(
  () => props.partModal,
  () => {open.value = props.partModal}
)
</script>

<style>

</style>

