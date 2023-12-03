<template>
  <UModal v-model="open" @close="emit('close')">
    <ProjectsForm :project="project" @saved="emit('close')" />
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits(['close'])
  const props = defineProps({
    open: {
      type: Boolean,
      required: true,
    },
  })
  const open=ref(false)
  const project = ref({
    name: '',
    description: '',
  })
  watch(
    () => props.open,
    () => {open.value = props.open}
  )
</script>

<style>

</style>