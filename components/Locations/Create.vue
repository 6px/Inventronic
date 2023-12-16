<template>
  <UModal v-model="open" @close="emit('close')">
    <UForm class="space-y-4" @submit="save" :validate="validate" :state="location">

      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 v-if="location.id">Editing {{ location.name }}</h2>
            <h2 v-else-if="parent">Create new location in <strong>{{ parent.name }}</strong></h2>
            <h2 v-else>Create new top-level location</h2>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="emit('close')" />
          </div>
        </template>

        <UFormGroup label="Name" name="name">
          <UInput v-model=location.name color="white" variant="outline" placeholder="Location name" />
        </UFormGroup>
        <UFormGroup label="Description" name="description" class="mt-4">
          <UInput v-model=location.description color="white" variant="outline" placeholder="Description" />
        </UFormGroup>

        <template #footer>
          <UButton class="mr-4" type="submit" :loading="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>Save</span>
          </UButton>
          or
          <UButton variant="link" color="white" class="ml-0" label="Cancel" @click="$emit('close')" />
        </template>
      </UCard>
    </UForm>

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
const toast = useToast()

const emit = defineEmits()
const defaultLocation = {
  name: "",
  description: "",
  parent_id: props.parent ? props.parent.id : null,
  owner_id: user.id,
}
const location = reactive({ ...defaultLocation })

const open = ref(false)
const saving = ref(false)

watch(
  () => props.open,
  () => {
    open.value = props.open
    location.name = ""
    location.description = ""
    location.parent_id = props.parent ? props.parent.id : null
    location.owner_id = user.id
  }
)

const save = async () => {
  saving.value = true
  const p = { ...location }

  if (p.id) {
    p.owner_id = user.value.id
    const r = await client.from('locations').update({ ...p }).select('id, name')
      .eq('id', p.id)
    if (r.error) {
      toast.add({
        id: 'location_save_error',
        title: `Could not update location ${p.name}.`,
        description: r.error.message,
        icon: 'i-heroicons-outline-exclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
    } else {
      emit('close')
      // TODO trigger refresh
      emit('refresh')
    }
    saving.value = false
  } else {
    p.owner_id = user.value.id
    const r = await client.from('locations').insert({ ...p }).select('id, name')
    if (r.error) {
      toast.add({
        id: 'location_update_error',
        title: `Could not create location ${p.name}.`,
        description: r.error.message,
        icon: 'i-heroicons-outline-exclamation-triangle',
        timeout: 4000,
        color: 'red'
      })
    } else {
      emit('close')
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

<style></style>

