<template>
  <div class="w-full my-2">
    <h1 class="mb-6 text-4xl font-bold u-text-white">
      Location {{ route.params.id }}
    </h1>
    {{ parts }}
  </div>
</template>

<script lang="ts" setup>

  const route = useRoute()
  const client = useSupabaseClient()
  const partFields = `id, name, description, footprint,quantity, min_quantity, Locations(id, name), location_id`

  const {data: parts} = await useAsyncData('parts', async () => {
    const { data } = await client.from('Parts').select(partFields).eq('location_id', route.params.id).order('created_at')

    return data
  })

</script>

<style>

</style>

