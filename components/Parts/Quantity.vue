<template>
  <div>
    <UBadge v-if="part.id" size="xs" :color="part.min_quantity < partQty(part) ? 'green' : 'red'"
      class="ml-2 shrink">
      {{ partQty(part) }}
    </UBadge>
    <UBadge v-else size="xs" color="red" class="ml-2 shrink">
      0
    </UBadge>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  part: {
    type: Object as Part,
    required: true,
  },
})
</script>

<style></style>