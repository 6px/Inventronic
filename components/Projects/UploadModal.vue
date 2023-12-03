<template>
  <UModal v-model="open" @close="emit('close')">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Add parts from KiCAD BOM file
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>

      <DragDrop
        :class="` flex items-center justify-center content-center border h-40 w-full rounded-md bg-slate-600 border-slate-300 dark:border-slate-800 ${error ? 'border-rose-500 dark:border-rose-500' : ''}`"
        @files-dropped="dropped"
      >
        <div :class="`text-slate-400 `">
          <p>
            Drop your CSV file here, or click to choose a file
          </p>
          <p v-if="error" class="text-sm text-rose-400 text-center">
            Please upload a CSV file
          </p>
          
        </div>
      </DragDrop>
    </UCard>
    
  </UModal>
</template>

<script lang="ts" setup>
  const props = defineProps({
    open: {
      type: Boolean,
      required: true,
    },
  })
  const emit=defineEmits()
  const open=ref(false)
  const error = ref(false)
  watch(
    () => props.open,
    () => {open.value = props.open}
  )

  const dropped = (files) => {
    error.value = false
    if (files.length > 0 && files[0].type === 'text/csv') {
      emit('change', files)
      emit('close')
    }  else {
      error.value=true
    }
  }
</script>

<style>

</style>