<template>
  <UModal v-model="open" @close="emit('close')">
    <UCard
      :ui="{ body: { background: 'bg-slate-200 dark:bg-slate-800' }, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2>{{ projectPart.parts.part === projectPart.parts.value ? projectPart.parts.part :
            projectPart.parts.part + ' ' + projectPart.parts.value }} </h2>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>
      <UForm :state="state" :validate="validate">
        <UFormGroup label="Part" class="mb-4">
          <USelectMenu v-model="projectPart.part_id" :options="parts" value-attribute="id" option-attribute="name">
            <template #label>
              <span
                :class="[current.quantity > projectPart.quantity ? 'bg-green-400' : 'bg-red-400', 'inline-block h-2 w-2 flex-shrink-0 rounded-full']"
                aria-hidden="true" />
              <span class="truncate">{{ current.part === current.value ? current.part : current.part + ' ' + current.value }}</span>            </template>
            <template #option="{ option: part }">
              <span
                :class="[part.quantity > projectPart.quantity ? 'bg-green-400' : 'bg-red-400', 'inline-block h-2 w-2 flex-shrink-0 rounded-full']"
                aria-hidden="true" />
              <span class="truncate">{{ part.part === part.value ? part.part : part.part + ' ' + part.value }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>
        <UFormGroup label="Quantity" class="mb-4">
          <UInput v-model="projectPart.quantity" />
        </UFormGroup>
        <UFormGroup label="References">
          <UInput v-model="projectPart.references" />
        </UFormGroup>
      </UForm>
      <template #footer>
        <UButton class="mx-4" label="Print" @click="save" />
        <UButton class="mx-4" label="Cancel" @click="$emit('close')" />
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits(['close'])
const client = useSupabaseClient()

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  projectPart: {
    part: Object as ProjectPart,
    required: true,
  },
})
const open = ref(false)

const state = reactive({
  part_id: props.projectPart.part_id,
  quantity: props.projectPart.quantity,
  references: props.projectPart.references,
})

const partFields = `id, part, value, description, footprint, quantity, price, ordering_url, min_quantity, locations(id, name), project_parts(id, projects(id, name), part_id) location_id`

const { data: parts, refresh } = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const save = async () => {
  const pp = { ...state }

  await client.from('project_parts').update(pp).eq('id', props.projectPart.id)
}

const current = computed(() => parts.value.find(p => p.id === props.projectPart.part_id))

watch(
  () => props.open,
  () => { open.value = props.open }
)

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  return errors
}
</script>

<style></style>