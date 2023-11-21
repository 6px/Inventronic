<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2 v-if="location.id">Editing {{ location.name }}</h2>
        <h2 v-else>Create new location in <strong>{{ parent.name }}</strong></h2>
      </template>

      <UForm class="space-y-4" @submit="save" :validate="validate" :state="location">
        <UFormGroup label="Name" name="name">
          <UInput v-model=location.name color="white" variant="outline" placeholder="Location name" />
        </UFormGroup>
        <UFormGroup label="Description" name="description">
          <UInput v-model=location.description color="white" variant="outline" placeholder="Description" />
        </UFormGroup>
      </UForm>

      <template #footer>
        <UButton
          class="mr-4"
          @click="save"
        >
          <span v-if="saving">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>Save</span>
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

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  parent: {
    type: Object as Location,
    required: false,
  },
});

const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits()
const location = reactive({
  name: "",
  description: "",
  parent_id: props.parent.id,
  owner_id: null
})

const open = ref(false)
const saving = ref(false)

watch(
  () => props.open,
  () => {open.value = props.open}
)

const save = async () => {
  saving.value = true
  const p = { ...location }

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('Locations').update({ ...p }).select('id, name')
    .eq('id', p.id)
    if (r.error) {
      alert(r.error.message)
    } else {
      open.value = false;
      const newPart = r.data[0]
      // TODO trigger refresh
      emit('refresh')
    }
    saving.value = false
  } else {
    p.owner_id = user.value.id
    delete p.id
    const r = await client.from('Locations').insert({ ...p }).select('id, name')
    if (r.error) {
      alert(r.error.message)
    } else {
      open.value = false;
      // TODO refresh locations
      emit('refresh')
    }
    saving.value = false
  }
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  return errors
}

</script>

<style>

</style>

