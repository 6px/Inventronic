<template>
  <svg version="1.1" baseProfile="full" :viewBox="`0 0 ${width * mul} ${height * mul}`" xmlns="http://www.w3.org/2000/svg"
    style="max-width: 100%;">
    <svg:style>
      {{ svgStyle }}
    </svg:style>
    <!-- <rect width="100%" height="100%" fill="white" /> -->

    <text :x="title.length > 16 ? qrSize*mul : width * mul" :y="3 * mul" class="name" :style="title.length > 16 ? 'text-anchor: start;' : ''">
      {{ title }}
    </text>

    <text :x="maxLineLen > 68 / subtitleSize ? qrSize * mul : width * mul" :y="3.25 * mul" class="parts"
      :style="maxLineLen > 68 / subtitleSize ? 'text-anchor:start;' : ''">
      <tspan :x="maxLineLen > 68 / subtitleSize ? qrSize * mul : width * mul" :dy="subtitleSize * mul" v-for="line in partLines">
        {{ line }}
      </tspan>
    </text>

    <!-- <rect x="0" :y="qrSize * mul" width="100%" :height="(height - qrSize) * mul" fill="#ffffff" /> -->

    <text :x="0" :y="qrSize * mul" class="description">
      <tspan :x="0" :dy="descriptionSize * mul" v-for="line in descLines">
        {{ line }}
      </tspan>
    </text>

    <g v-html="qrSvg"></g>
  </svg>
</template>

<script lang="ts" setup>

import QRCode from 'qrcode'

const emit = defineEmits(['ready'])

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  subtitleSize: {
    type: Number,
    required: false,
    default: 1.75
  },
  description: {
    type: String,
    required: false,
  },
  descriptionSize: {
    type: Number,
    required: false,
    default: 2.25
  },
  url: {
    type: String,
    required: false,
  },
});

const partLines = ref([props.subtitle])
const descLines = ref([props.description])

const mul = 4
const height = 13
const width = 48
const qrSize = 10

const svgStyle = `
@font-face {
  font-family: monaspaceBold;
  src: url(/fonts/MonaspaceKrypton-ExtraBold.otf);
}

@font-face {
  font-family: monaspace;
  src: url(/fonts/MonaspaceKrypton-Light.otf);
}

@media print {
  svg {
     width: ${width}mm; 
     height: ${height}mm; 
  }
}

.name {
  font: ${3.75 * mul}px monaspaceBold;
  fill: black;
  text-anchor:end;
}
.parts {
  font: ${props.subtitleSize * mul}px monaspace;
  fill: black;
  text-anchor:end;
}

.description {
  font: ${props.descriptionSize * mul}px monaspace;
  fill: black;
}
`

const qrSvg = ref('')

onMounted(async () => {
  await generateLabel()
  const ln = await Promise.all(
    props.subtitle.split('\n')
      .map(
        async (l) => {
          console.log('l', l)
          return await getLines(l, (width - 12) * mul)
        }
      )
  )
  console.log('split', ln.flat())
  partLines.value = (await Promise.all(props.subtitle.split('\n').map(async (l) => await getLines(l, (width - 12) * mul)))).flat()
  descLines.value = await getLines(props.description, width * mul, 'description')

  emit('ready')
})

const maxLineLen = computed(() => {
  const ls = partLines.value.map(l => l.length)
  return Math.max(...ls)
})

const generateLabel = () => {
  return new Promise((resolve, reject) => {
    QRCode.toString(props.url, { margin: 0, type: 'svg', width: qrSize * mul })
      .then(svg => {
        qrSvg.value = svg
        resolve(svg)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const getLines = async (text, maxWidth, cls = 'parts') => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  label.setAttribute('baseProfile', "full")
  label.setAttribute('viewBox', `0 0 ${width * mul} ${height * mul}`)
  label.setAttribute('version', "1.1")
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.appendChild(document.createTextNode(svgStyle))

  label.appendChild(style)

  const textEl = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );

  textEl.setAttribute('class', cls)

  label.appendChild(textEl)

  document.body.appendChild(label)

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var textNode = document.createTextNode(currentLine + " " + word);
        textEl.appendChild(textNode);
        var width = textEl.getBBox().width
        textEl.removeChild(textNode)
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      document.body.removeChild(label)

      resolve(lines)
    }, 100)

  })
}


</script>

<style></style>