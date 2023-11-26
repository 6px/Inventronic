<template>
  <div
    :data-active="active"
    @dragenter.prevent="active=true"
    @dragover.prevent="active=true"
    @dragleave.prevent="active=false"
    @drop.prevent="onDrop"
    class="cursor-pointer"
    @click="chooseFile"
  >
        <!-- share state with the scoped slot -->
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script lang="ts" setup>

const emit = defineEmits(['files-dropped'])

let active = ref(false)

function onDrop(e) {
  active.value = false
  emit('files-dropped', [...e.dataTransfer.files])
}

function preventDefaults(e) {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  events.forEach((eventName) => {
      document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
      document.body.removeEventListener(eventName, preventDefaults)
  })
})

const chooseFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = (ev) => {
    emit('files-dropped', [...ev.target.files])
  }
  input.click()
}
</script>