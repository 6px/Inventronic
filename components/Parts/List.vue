<template>
  <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white text-center">
      Parts
    </h1>
    <UContainer
      body-class="overflow-hidden"
    >
      <!-- TODO display as table only for wide screens -->
      <PartsTable :parts="parts" @refresh="refresh" class="hidden lg:block" />
    </UContainer>
  </div>

</template>

<script lang="ts" setup>

const client = useSupabaseClient()


const {data: parts, refresh} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields()).order('created_at')
  return data
})



</script>

<style>

</style>

