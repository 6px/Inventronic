<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-bold u-text-white">Project details</h2>
    </template>
    <div>
      <p>
        Project created on 
        <strong>
          {{ (new Date(project.created_at)).toLocaleDateString() }}
        </strong>
        at
        {{ (new Date(project.created_at)).toLocaleTimeString() }}
      </p>
      <p>
        With the current parts inventory, you can build <strong>{{ nparts }}</strong> of this project.
      </p>
    </div>
  </UCard>

</template>

<script lang="ts" setup>

const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  },
})

const client = useSupabaseClient()

const partFields = `id, part, value, description, footprint, quantity, min_quantity, locations(id, name), location_id`

const {data: parts} = await useAsyncData(`parts`, async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const nparts = computed(() => {
  // For each project parts, get current inventory, 
  // and divide by the quantity required by the project
  let nparts = Infinity;
  console.log(props.project.project_parts)
  props.project.project_parts.forEach((pp: ProjectPart) => {
    const part = parts.value.find(p => p.id === pp.parts.id)
    if (!part) {
      nparts = 0
    } else if (Math.floor(part.quantity / pp.quantity) < nparts) {
      nparts = Math.floor(part.quantity / pp.quantity)
    }
  });
  return nparts
})
</script>

<style>

</style>