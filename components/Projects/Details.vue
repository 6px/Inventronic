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
        With the current parts inventory, 
        <span v-if="nparts > 0">
          you can build <strong>{{ nparts }}</strong> of this project.<br>
          Limiting part:
          <strong>
            {{ limitingPart.part === limitingPart.value ? limitingPart.part : limitingPart.part + ' ' + limitingPart.value }}
          </strong>
        </span>
        <span v-if="nparts == 0">
          you cannot build this project. 
        </span>
      </p>
      <div v-if="nparts > 0" class="mt-2 flex flex-row">
        <UFormGroup label="Number to build">
          <UInput :max="nparts" min="0" v-model="buildnum" type="number"></UInput>
        </UFormGroup>
        <UFormGroup label="&nbsp;">
          <UButton :disabled="buildnum < 1 || nparts < buildnum" @click="build" class="ml-4">Build</UButton>
        </UFormGroup>
      </div>
      <div  v-if="nparts === 0" class="mt-4">
        <div>
          <UAccordion :items="[{label: missing.length + ' missing parts',content:'', defaultOpen: false,}]" :ui="{ wrapper: 'flex flex-col w-full' }">
            <template #item="{ item, index, open }">
              <UVerticalNavigation :links="missing.map(m => {
                  return {
                    label: m.part === m.value ? m.part : m.part + ' ' + m.value,
                    badge: m.quantity || '0',
                    click: () => { emit('editPart', m) }
                  }
                })" />
            </template>
          </UAccordion>
        </div>
      </div>
    </div>
  </UCard>

</template>

<script lang="ts" setup>

const props = defineProps({
  project: {
    type: Object as Project,
    required: true,
  },
  parts: {
    type: Array<Part>,
    required: true,
  }
})

const emit = defineEmits(['editPart', 'refresh'])

const client = useSupabaseClient()
const limitingPart = ref({})
const missing = ref([])

const buildnum = ref(0)

const build = async () => {
  if (!buildnum.value || buildnum.value > nparts) {
    alert('you do not have enough parts to build ' + buildnum + ' of this project')
    return
  }

  missing.value = []

  for await (const pp of props.project.project_parts) {
    const part = props.parts.find(p => p.id === pp.parts.id)
    // TODO handle case where part is made up of another part
    if(!part) {
      return
    }
    // Remove from part location
    const loc = part.location_parts.find(lp => lp.quantity > 0)
    if (!loc) {
      return
    }
    let newQty = loc.quantity - pp.quantity * buildnum.value
    if (part.parent) {
      newQty = loc.quantity - pp.quantity * buildnum.value * part.quantity_of
    }
    await client.from('location_parts').update({ quantity: newQty }).eq('id', loc.id)
  }

  emit('refresh')
}

const nparts = computed(() => {
  // For each project parts, get current inventory, 
  // and divide by the quantity required by the project
  let nparts = Infinity;

  const m: Array<Part> = []

  props.project.project_parts.forEach((pp: ProjectPart) => {
    const part = props.parts.find(p => p.id === pp.parts.id)
    let qty = 0
    if (part && !part.parent) {
      qty = part.location_parts.reduce((acc: number, lp: LocationPart) => {
        return acc + lp.quantity
      }, 0)
    } else if (part.parent) {
      //TODO handle case where part is made up of another part
      qty = part.parent.location_parts.reduce((acc: number, lp: LocationPart) => {
        return acc + lp.quantity
      }, 0) / part.quantity_of
    }
    if (qty == 0) {
      nparts = 0
    } else if (Math.floor(qty / pp.quantity) < nparts) {
      nparts = Math.floor(qty / pp.quantity)
      limitingPart.value = part
    }
    if (part && Math.floor(qty / pp.quantity) === 0) {
      nparts = 0
      m.push(part)
    }
  });
  missing.value = m
  return nparts
})
</script>

<style>

</style>