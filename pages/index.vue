<template>
  <div>
    <PartsList v-if="user" />
    <div v-else>
      <div style="background: url(/workbench.jpg); background-size: cover; background-repeat: no-repeat;">
        <div class="py-16 bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-70">
          <UContainer>

            <div class="text-bold text-2xl md:text-4xl lg:text-6xl text-center md:max-w-xl lg:max-w-2xl m-auto mt-8">
              Too many parts cluttering your workbench?
            </div>
            <div class="opacity-50 text-sm md:text-lg lg:text-xl text-center md:max-w-xl lg:max-w-2xl m-auto mt-4">
              But still not what you need to build your latest project?
            </div>

            <div class="text-bold text-md md:text-xl lg:text-2xl text-center md:max-w-xl lg:max-w-2xl m-auto mt-8">
              Get organized!
            </div>
            <div class="text-bold text-md md:text-xl lg:text-2xl text-center md:max-w-xl lg:max-w-2xl m-auto mt-8">
              <UButton color="primary" size="xl" block to="/login">
                Create an account
              </UButton>
            </div>
            <div class="opacity-70 text-xs md:text-sm text-center md:max-w-xl lg:max-w-2xl m-auto mt-2">
              It's free and only takes a few seconds. You'l be uploading your bills of materials in no time.
            </div>

          </UContainer>
        </div>
      </div>
      <UContainer>
        <div class="md:max-w-xl lg:max-w-2xl m-auto mt-16">
          <strong class="text-monaspace uppercase text-primary-600">Inventronic</strong>
          lets you keep track of what parts you have in stock, so that you neither run out, nor buy some parts that you
          already have... somewhere...
        </div>
        <div class="md:max-w-xl lg:max-w-2xl m-auto mt-8">
          The first step to do so will be to import the parts and components you use. 
          The easiest way to do it is with the kicad BOM file importer, 
          but if you do not use KiCAD, do not fear!  The import format is a simple CSV 
          file with just a few columns.
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>

const user = useSupabaseUser()


</script>

<style></style>

