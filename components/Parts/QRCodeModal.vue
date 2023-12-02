<template>
  <UModal v-model="open">
    <UCard :ui="{ ring: '', body: {background: 'bg-slate-200 dark:bg-slate-800'}, divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h2>Label for {{ selectedPart.name }}</h2>
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
  partModal: {
    type: Boolean,
    required: true,
  },
  selectedPart: {
    type: Object as Part,
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
    QRCode.toDataURL(`${req.public.baseUrl}/parts/${props.selectedPart.id}`, {margin:0})
    .then(url => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 11*mul, 11*mul)
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
      ctx.textAlign = "right"
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = `${4.5*mul}px monaspaceBold`;
      let val = props.selectedPart.part;
      if (props.selectedPart.part != props.selectedPart.value) {
        val = props.selectedPart.part +' ' + props.selectedPart.value
      }
      ctx.fillText(val, 50*mul, 4*mul);
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
      if (props.selectedPart.locations) {
        ctx.fillText(props.selectedPart.locations.name, 50*mul, 7*mul);
      }
      
      ctx.textAlign = "left"
      ctx.fillText(props.selectedPart.description, 11*mul, 10*mul);
      ctx.font = `normal 400 ${2.5*mul}px ${f2.family}`;
      ctx.textAlign = "left"
      ctx.fillText(props.selectedPart.footprint, 0*mul, 14*mul);
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
  emit('close')
}

watch(
  () => props.partModal,
  () => {open.value = props.partModal}
)
</script>

<style>
@font-face {
    font-family: 'monaspaceBold';
    src: url('/fonts/MonaspaceKrypton-ExtraBold.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
}
</style>

