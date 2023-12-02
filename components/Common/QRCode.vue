<template>
  <div id="image" class="bg-white">
    <svg version="1.1"
      id="label-svg"
      baseProfile="full"
      :viewBox="`0 0 ${width*mul} ${height*mul}`"
      xmlns="http://www.w3.org/2000/svg"
      style="width: 100%;"
    >
      <svg:style>
        {{ svgStyle }}
      </svg:style>
      <rect width="100%" height="100%" fill="white" />

      <g v-html="qrSvg"></g>

      <text :x="width*mul" :y="3*mul" class="name">
        <slot name="title"></slot>
      </text>
      
      <text :x="width*mul" :y="3*mul" class="parts">
        <tspan :x="width*mul" :dy="2*mul" v-for="line in partLines">
          {{ line }}
        </tspan>
      </text>

      <rect x="0" :y="12*mul" width="100%" :height="(height-12)*mul" fill="white" />
      
      <text :x="0" :y="(height-5)*mul" class="description">
        <tspan :x="0" :dy="2*mul" v-for="line in descLines">
          {{ line }}
        </tspan>
      </text>

    </svg>
  </div>
</template>

<script lang="ts" setup>

import QRCode from 'qrcode'

const props = defineProps({
  subtitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: false,
  },
});

const partLines = ref([props.subtitle])
const descLines = ref([props.description])

const mul = 4
const height=17
const width=54

const svgStyle = `
@font-face {
  font-family: monaspaceBold;
  src: url(/fonts/MonaspaceKrypton-ExtraBold.otf);
}

@font-face {
  font-family: monaspace;
  src: url(/fonts/MonaspaceKrypton-Light.otf);
}


.name {
  font: ${4*mul}px monaspaceBold;
  fill: black;
  text-anchor:end;
}
.parts {
  font: ${1.75*mul}px monaspace;
  fill: black;
  text-anchor:end;
}

.description {
  font: ${2.25*mul}px monaspace;
  fill: black;
}
`

const qrSvg = ref('')

onUpdated(async () => {
  generateLabel()
  partLines.value = await getLines(props.subtitle, (width - 12)*mul)
  descLines.value = await getLines(props.description, width*mul, 'description')
})

const generateLabel = () => {
  return new Promise((resolve, reject) => {
    QRCode.toString(props.url, {margin:0, type: 'svg', width:12*mul})
    .then(svg => {
      qrSvg.value = svg
      resolve(svg)
    })
    .catch(err => {
      reject(err)
    })
  })
}

const getLines = async (text, maxWidth, cls='parts') => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    label.setAttribute('baseProfile',"full")
    label.setAttribute('viewBox', `0 0 ${width*mul} ${height*mul}`)
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

<style>

</style>