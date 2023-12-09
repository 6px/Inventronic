<template>
  <UModal v-model="open" @close="emit('close')" :ui="{width: 'w-full sm:max-w-2xl'}">
    <PartsForm :modal="true" :selectedPart="selectedPart" @close="emit('close')" @refresh="emit('refresh')" />
  </UModal>
</template>

<script lang="ts" setup>
import type { PartsForm } from '#ui-colors/components';


const emit = defineEmits(['close', 'refresh'])

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

watch(
  () => props.partModal,
  () => {open.value = props.partModal}
)


</script>

<style>

</style>

