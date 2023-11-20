<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Label for {{ location.name }}</h2>
      </template>

      <div id="image">
          
      </div>
      <template #footer>
        <UButton
          class="mx-4"
          label="Print"
          @click="print"
        />
        <UButton
          class="mx-4"
          label="Cancel"
          @click="$emit('close')"
        />
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import QRCode from 'qrcode'

const req = useRuntimeConfig()
const route = useRoute()
const emit = defineEmits()


const mul = 12

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  location: {
    type: Object as Location,
    required: true,
  },
});

const open = ref(false)

let canvas: OffscreenCanvas = null

onUpdated(() => {
  generateLabel().then(() => {
    canvas.convertToBlob().then(blob => {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        document.getElementById("image").innerHTML = `<img src=${reader.result} class="max-w-full" />`
      })
      reader.readAsDataURL(blob)
    
    })
  })
})

const generateLabel = () => {
  canvas = new window.OffscreenCanvas(62*mul, 15*mul)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = "rgb(255,255,255)"
  ctx.fillRect(0, 0, 62*mul, 15*mul)

  const p1 = new Promise((resolve, reject) => {
    QRCode.toDataURL(`${req.public.baseUrl}${route.fullPath}/${props.location.id}`)
    .then(url => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 15*mul, 15*mul)
        resolve(null)
      }

      img.src = url
    })
    .catch(err => {
      reject(err)
    })
  })

  const p2 = new Promise((resolve, reject) => {
    const monaspaceBold = new FontFace('monaspaceBold', 'url(/fonts/MonaspaceKrypton-ExtraBold.otf)');

    monaspaceBold.load().then(function(font){
      document.fonts.add(font);
      console.log('Font loaded');
      ctx.textAlign = "right"
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = `${4*mul}px monaspaceBold`;
      ctx.fillText(props.location.name, 50*mul, 5*mul);
      resolve(null)
    });
  })

  const p3 = new Promise((resolve, reject) => {
    const f2 = new FontFace("monaspace", "url(/fonts/MonaspaceKrypton-Light.otf)", {style: "normal", weight: "400"});

    f2.load().then((font) => {
      document.fonts.add(font);
      ctx.textAlign = "right"
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = `normal 400 ${3*mul}px ${f2.family}`;
      ctx.fillText(props.location.Parts.length + " part" + (props.location.Parts.length > 1 ? 's' : ''), 50*mul, 10*mul);
      ctx.fillText(props.location.description, 50*mul, 13*mul);
      resolve(null)
    });
  })

  return Promise.all([p1, p2, p3])
  
}


const print = () => {
  const mywindow = window.open('', 'PRINT', 'height=400,width=600');
  mywindow.document.body.innerHTML = document.getElementById('image').innerHTML
  mywindow.print();
  mywindow.close();
  emit('close');
}

watch(
  () => props.open,
  () => {open.value = props.open}
)
</script>

<style>
</style>

