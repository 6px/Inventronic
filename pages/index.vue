<template>
  <div>
    <PartsList v-if="user" />
    <div v-else>
      <div style="background: url(/img/workbench.jpg); background-size: cover; background-repeat: no-repeat;">
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
      </UContainer>
      <UContainer>
        <div class="md:grid md:grid-cols-2 md:gap-x-2 mt-16">
          <div class="leading-6 flex justify-center items-center">
            <div>
              <h2 class="md:mb-4 mb-2 text-xl md:text-2xl text-monaspace font-bold text-center md:text-right text-primary-600 uppercase">
                Import your parts
              </h2>
              <div class="md:text-right text-lg">
                The first step to track your inventory will be to import the parts and components you use. 
                The easiest way to do it is with the KiCAD BOM file importer, 
                but if you do not use KiCAD, do not fear!  The import format is a simple CSV 
                file with just a few columns.
              </div>
            </div>
          </div>
          <div class="mt-8 md:mt-0 flex justify-center items-center">
            <video controls width="300">
              <source src="/img/projects.webm" type="video/webm" />

              <source src="/img/projects.mp4" type="video/mp4" />

              Download the
              <a href="/img/projects.webm">WEBM</a>
              or
              <a href="/img/projects.mp4">MP4</a>
              video.
            </video>
          </div>
        </div>
        
      </UContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>

const user = useSupabaseUser()


</script>

<style></style>

