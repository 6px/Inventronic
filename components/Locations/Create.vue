<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2 v-if="location.id">Editing {{ location.name }}</h2>
        <h2 v-else-if="parent">Create new location in <strong>{{ parent.name }}</strong></h2>
        <h2 v-else>Create new top-level location</h2>
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
          :loading="saving"
        >
          <span v-if="saving">Saving...</span>
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
  parent_id: props.parent ? props.parent.id : null,
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

