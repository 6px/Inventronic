<template>
  <div class="w-full my-2">
    <UContainer>
      <div class="mb-6">
        <UBreadcrumb divider=">" :links="[{ label: 'Dashboard', to: '/' }, { label: 'Parts', to: '/parts' }]" />
      </div>
    </UContainer>

    <PartsList />
  </div>
</template>

<script lang="ts" setup>


</script>

<style></style>

