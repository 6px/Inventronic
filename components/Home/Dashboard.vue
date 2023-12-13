<template>
  <div class="w-full my-2">
    <UContainer>
      <div class="mb-6">
        <UBreadcrumb divider=">" :links="[{ label: 'Dashboard', to: '/' }]" />
      </div>
    </UContainer>
    <h1 class="mb-6 text-4xl font-bold u-text-white text-center">
      Welcome {{ user.email }}
    </h1>
    <UContainer>
      <div class="md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <UCard>
            <template #header>
              <span class="text-xl">Total parts</span>
            </template>

            <div class=" text-center text-4xl text-monaspace text-primary">
              {{ parts.length }}
            </div>
          </UCard>
        </div>
        <div>
          <UCard>
            <template #header>
              <span class="text-xl">Low quantity parts</span>
            </template>

            <div class=" text-center text-4xl text-monaspace text-red-600">
              {{ lowQuantityParts.length }}
            </div>
          </UCard>
        </div>

        <div>
          <UCard>
            <template #header>
              <span class="text-xl">Total projects</span>
            </template>

            <div class=" text-center text-4xl text-monaspace text-primary-600">
              {{ projects.length }}
            </div>
          </UCard>
        </div>

        <div>
          <UCard>
            <template #header>
              <span class="text-xl">Buildable projects</span>
            </template>

            <div class=" text-center text-4xl text-monaspace text-primary-600">
              {{ buildableProjects.length }}
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>



  </div>
</template>

<script lang="ts" setup>
const user = useSupabaseUser()
const client = useSupabaseClient()

const { data: parts } = await useAsyncData('parts', async () => {
  const { data } = await client.from('parts').select(partFields()).order('created_at')
  return data
})

const projectFields = `id, name, description, url, created_at, project_parts(id, parts(id, part, value), quantity, references)`

const { data: projects } = await useAsyncData(`projects`, async () => {
  const { data } = await client.from('projects').select(projectFields).order('created_at')

  return data
})

const buildableProjects = computed(() => {
  return projects.value.filter((project: Project) => {
    const np = nparts(project)
    return np > 0 && np < Infinity
  })
})

const lowQuantityParts = computed(() => {
  return parts.value.filter((p: Part) => {
    return p.min_quantity > qty(p)
  })
})

const qty = (row: Part) => {
  if (row.parent) {
    return Math.round(100 * row.parent.location_parts.reduce((acc, lp) => lp.quantity + acc, 0) / row.quantity_of) / 100
  }
  return row.location_parts ? Math.round(100 * row.location_parts.reduce((acc, lp) => lp.quantity + acc, 0)) / 100 : 0
}


const nparts = (row) => {
  // For each project parts, get current inventory, 
  // and divide by the quantity required by the project
  let nparts = Infinity;

  const m: Array<Part> = []

  row.project_parts.forEach((pp: ProjectPart) => {
    const part = parts.value.find(p => p.id === pp.parts.id)
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
    }
    if (part && Math.floor(qty / pp.quantity) === 0) {
      nparts = 0
    }
  });
  return nparts
}


</script>

<style></style>