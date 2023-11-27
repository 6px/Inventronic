<template>
  <UCard class="mr-2">
    <template #header>
      <h2 class="text-xl font-bold u-text-white">Edit project</h2>
    </template>
    <UForm :validate="validate" :state="state" @submit="save" class="space-y-4">
      <UFormGroup label="Project name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="Description">
        <UInput v-model="state.description" />
      </UFormGroup>
      <UButton type="submit" :loading="saving" class="mr-2">
        Save
      </UButton>
      <span class="pl-2 text-slate-400">or</span>
      <UButton to="/projects" variant="link" color="white">
        Back to list
      </UButton>
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>

import type { UInput } from '#ui-colors/components';


const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits(['refresh'])



const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  },
})



const saving = ref(false)

const state = reactive({
  name: props.project.name,
  description: props.project.description,
})



const save = async () => {
  saving.value = true
  await client.from('projects')
    .update({name: state.name, description: state.description})
    .eq('id', props.project.id)
  saving.value = false;
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  return errors
}
</script>

<style>

</style>