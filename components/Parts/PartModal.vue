<template>
  <UModal v-model="open">
    <PartsForm :selectedPart="selectedPart" @close="emit('close')" :saving="saving" @save="emit('save')" />
  </UModal>
</template>

<script lang="ts" setup>
import type { PartsForm } from '#ui-colors/components';


const emit = defineEmits(['close', 'save'])

const props = defineProps({
  partModal: {
    type: Boolean,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  selectedPart: {
    type: Object as Part,
    required: true,
  },
});

const open = ref(false)

watch(
  () => props.partModal,
  () => {open.value = props.partModal}
)


</script>

<style>

</style>

