<template>
<div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">
      Todo List.
    </h1>
    <form
      class="flex gap-2 my-2"
      @submit.prevent="addTask"
    >
      <UInput
        v-model="newTask"
        :loading="loading"
        class="w-full"
        size="xl"
        variant="white"
        type="text"
        name="newTask"
        placeholder="Make a coffee"
        autofocus
        autocomplete="off"
      />
      <UButton
        type="submit"
        variant="white"
      >
        Add
      </UButton>
    </form>
    <UCard
      v-if="parts?.length > 0"
      body-class="px-6 py-2 overflow-hidden"
    >
      <ul>
        <li
          v-for="part of parts"
          :key="part.id"
          class="border-b border-gray-200 divide-y divide-gray-200"
        >
          <div class="py-2">
            <UFormGroup
              :label-class="`block font-medium`"
              :label="part.name"
              :name="String(part.id)"
              wrapper-class="flex items-center justify-between w-full"
            >
              <div class="flex items-center justify-between">
                <UButton
                  class="ml-3 text-red-600"
                  size="sm"
                  variant="transparent"
                  icon="i-heroicons-outline-trash"
                  @click="removeTask(part)"
                />
              </div>
            </UFormGroup>
          </div>
        </li>
      </ul>
    </UCard>
    <UButton
      class="mt-6"
      label="Fetch tasks from Nuxt server route"
      @click="fetchPartsFromServerRoute"
    />
    <UModal v-model="isModalOpen">
      <h2 class="mb-4">
        Tasks fetched from
        <a
          href="https://nuxt.com/docs/guide/directory-structure/server"
          target="_blank"
          class="text-primary-500 underline"
        >Nuxt Server route</a>
        with the use of the
        <a
          href="https://supabase.nuxtjs.org/usage/services/server-supabase-client"
          target="_blank"
          class="text-primary-500 underline"
        >serverSupabaseClient</a>:
      </h2>
      <pre>
        {{ tasksFromServer }}
      </pre>
    </UModal>
    <pre>
        {{ parts }}
      </pre>
  </div>
</template>

<script lang="ts" setup>

const client = useSupabase()
const user = useSupabaseUser()

const tasksFromServer = ref()
const isModalOpen = ref(false)
const loading = ref(false)
const newTask = ref('')

console.log("dddddd")





const { data: parts } = await useAsyncData('parts', async () => {
  const { data } = await client.from('Parts').select().order('created_at')
  console.log("data", data)
  return data
})

async function addTask () {
  if (newTask.value.trim().length === 0) { return }

  loading.value = true

  const { data } = await client.from('tasks')
    .upsert({
      user: user.value.id,
      title: newTask.value,
      completed: false
    })
    .select('id, name, descriptions, quantity')
    .single()

  tasks.value.push(data)
  newTask.value = ''
  loading.value = false
}

const completeTask = async (task: Part) => {
  await client.from('tasks').update({ completed: task.completed }).match({ id: task.id })
}

const removeTask = async (task: Part) => {
  tasks.value = tasks.value.filter(t => t.id !== task.id)
  await client.from('tasks').delete().match({ id: task.id })
}

const fetchPartsFromServerRoute = async () => {
  const { data } = await useFetch('/api/parts', { headers: useRequestHeaders(['cookie']), key: 'parts-from-server' })
  console.log("d", data)
  tasksFromServer.value = data
  isModalOpen.value = true
}
</script>

<style>

</style>

