<template>
  <div>
    <div v-if="part.parent && part.parent.location_parts && part.parent.location_parts.length">
      <div class="max-w-[100px]">
        <UTooltip v-for="lp in part.parent.location_parts"
          :text="`${lp.quantity} items of ${part.parent.part === part.parent.value ? '' : part.parent.part} ${part.parent.value} in ${lp.locations.name}`">
          <UButton class="p-0 mr-2" variant="link" :to="`/locations/${uuidb64(lp.locations.id)}`">
            {{ lp.locations.name }}
          </UButton>
        </UTooltip>
      </div>
    </div>
    <div v-else-if="part.location_parts && part.location_parts.length">
      <div class="max-w-[100px]">
        <UTooltip v-for="lp in part.location_parts" :text="`${lp.quantity} items in ${lp.locations.name}`">
          <UButton class="p-0 mr-2" variant="link" :to="`/locations/${uuidb64(lp.locations.id)}`">
            {{ lp.locations.name }}
          </UButton>

        </UTooltip>
      </div>
    </div>

    <div v-else>
      None
    </div>
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