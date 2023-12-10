<template>
  <UCard class="mr-2">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold u-text-white" v-if="project.id">Edit project</h2>
        <h2 class="text-xl font-bold u-text-white" v-else>Create project</h2>
        <UButton v-if="modal" color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
          @click="emit('close')" />
      </div>
    </template>
    <UForm :validate="validate" :state="state" @submit="save" class="space-y-4">
      <UFormGroup label="Project name" name="name">
        <UInput v-model="state.name" required />
      </UFormGroup>
      <UFormGroup label="Description">
        <UInput v-model="state.description" />
      </UFormGroup>
      <UFormGroup label="URL">
        <UInput v-model="state.url" type="url" />
      </UFormGroup>
      <UButton type="submit" :loading="saving" class="mr-2">
        Save
      </UButton>
      <span class="pl-2 text-slate-400">or</span>
      <UButton to="/projects" @click="emit('saved')" variant="link" color="white">
        Back to list
      </UButton>
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>

import type { UInput } from '#ui-colors/components';

const toast = useToast()
const client = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits(['refresh', 'saved'])



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
  url: props.project.url,
})

const save = async () => {
  saving.value = true
  let r
  if (props.project.id) {
    r = await client.from('projects')
      .update({ ...state })
      .eq('id', props.project.id)
  } else {
    r = await client.from('projects')
      .insert({ ...state })
  }

  if (r.error) {
    toast.add({
      id: 'project save_error',
      title: `Could not project ${props.project.name}.`,
      description: r.error.message,
      icon: 'i-heroicons-outline-exclamation-triangle',
      timeout: 4000,
      color: 'red'
    })
  } else {
    emit('saved')
  }

  saving.value = false;
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  return errors
}
</script>

<style></style>