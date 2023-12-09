<template>
  <UModal v-model="open" :ui="{base: 'overflow-visible relative text-left rtl:text-right w-full flex flex-col'}" @close="emit('close')">
    <UCard :ui="{ base:'', ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2>Move part to {{ location.name }}</h2>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>
      <!-- <UForm class="space-y-8" @submit="save" :validate="validate" :state="selectedPart">
        <UFormGroup label="Part" name="part"> -->
          <USelectMenu
            v-model="selected"
            :options="parts"
            multiple
            searchable
            placeholder="Select parts to move to this location"
            :uiMenu="{option: {container:'w-full block'}}"
          >
            <template #label>
              <span v-if="selected.length" class="truncate">{{ selected.map((p: Part) => (p.part ? p.part : '')+' '+p.value).join(', ') }}</span>
              <span v-else>Select parts</span>
            </template>
            <template #option="{ option: part, selected: sel }">
              <div class="flex flex-row justify-between px-1">
                <div class="truncate grow">{{ part.part }} {{ part.value }}</div>
                <div v-if="part.location_parts && part.location_parts.length > 0" class="truncate shrink text-slate-600 dark:text-slate-200">{{ part.location_parts.map((lp: LocationPart) => lp.locations.name).join(', ') }}</div>
                <div v-else class="truncate shrink text-slate-600 dark:text-slate-200">None</div>

                <div class="w-5 pe-2" v-if="!sel"></div>
              </div>
            </template>
          </USelectMenu>
        <!-- </UFormGroup>
      </UForm> -->

      <template #footer>
        <UButton
          class="mr-4"
          @click="save"
          :loading="saving"
        >
          <span v-if="saving">Moving...</span>
          <span v-else>Move</span>
        </UButton>
        or
        <UButton
          variant="link"
          color="white"
          class="ml-0"
          label="Cancel"
          @click="$emit('close')"
        />
      </template>

    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const client = useSupabaseClient()
const emit = defineEmits()
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  location: {
    type: Object as Location,
    required: true,
  }
})
const open = ref(false)
const saving = ref(false)
const selected = ref([])

watch(
  () => props.open,
  () => {open.value = props.open}
)

const partFields = `id, part, value, description, footprint, quantity, min_quantity, price, ordering_url, location_parts(id, locations(id, name), quantity)`

const {data: parts} = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields).order('created_at')

  return data
})

const save = async () => {
  saving.value = true
  for await (const part of selected.value) {
    const r = await client.from('location_parts')
      .insert({ part_id: part.id, location_id: props.location.id})
  }
  saving.value = false

  emit('refresh')
  emit('close')
}


</script>

<style>

</style>

