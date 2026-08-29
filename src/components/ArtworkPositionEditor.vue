<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CircleCheck, Crosshair, Maximize2, Move, Scan, TriangleAlert } from '@lucide/vue'
import {
  ARTWORK_OFFSET_LIMIT,
  ARTWORK_SCALE_MAX,
  ARTWORK_SCALE_MIN,
  calculateArtworkPlacement,
  calculateArtworkQuality,
  calculateFillScalePercent,
  clampArtworkOffset,
  clampArtworkScale,
  MUG_TEXTURE_HEIGHT,
  MUG_TEXTURE_WIDTH,
} from '@/utils/mugPersonalization'

const props = defineProps<{
  imageUrl: string
  imageScale: number
  imageX: number
  imageY: number
  phrase: string
}>()

const emit = defineEmits<{
  'update:imageScale': [value: number]
  'update:imageX': [value: number]
  'update:imageY': [value: number]
}>()

const stage = ref<HTMLDivElement>()
const naturalWidth = ref(1)
const naturalHeight = ref(1)
const imageReady = ref(false)
const statusMessage = ref('Arraste a foto para escolher o enquadramento.')

let activePointer: number | undefined
let pointerStartX = 0
let pointerStartY = 0
let offsetStartX = 0
let offsetStartY = 0

const placement = computed(() => calculateArtworkPlacement(
  naturalWidth.value,
  naturalHeight.value,
  props.imageScale,
  props.imageX,
  props.imageY,
  Boolean(props.phrase.trim()),
))

const imageStyle = computed(() => ({
  left: `${(placement.value.x / MUG_TEXTURE_WIDTH) * 100}%`,
  top: `${(placement.value.y / MUG_TEXTURE_HEIGHT) * 100}%`,
  width: `${(placement.value.width / MUG_TEXTURE_WIDTH) * 100}%`,
  height: `${(placement.value.height / MUG_TEXTURE_HEIGHT) * 100}%`,
}))

const imageQuality = computed(() => calculateArtworkQuality(
  naturalWidth.value,
  naturalHeight.value,
  props.imageScale,
  Boolean(props.phrase.trim()),
))

const qualityMessage = computed(() => {
  if (imageQuality.value.level === 'good') return 'Boa resolução para este enquadramento (300 dpi).'
  if (imageQuality.value.level === 'warning') return `Resolução aceitável, cerca de ${imageQuality.value.effectiveDpi} dpi. Envie também a foto original.`
  return `Atenção: cerca de ${imageQuality.value.effectiveDpi} dpi. Reduza o zoom ou escolha uma foto maior.`
})

function updateScale(value: number) {
  emit('update:imageScale', clampArtworkScale(value))
}

function updateX(value: number) {
  emit('update:imageX', Math.round(clampArtworkOffset(value)))
}

function updateY(value: number) {
  emit('update:imageY', Math.round(clampArtworkOffset(value)))
}

function centerPhoto(announce = true) {
  updateX(0)
  updateY(0)
  if (announce) statusMessage.value = 'Foto centralizada.'
}

function fitPhoto() {
  updateScale(100)
  centerPhoto(false)
  statusMessage.value = 'Foto inteira encaixada e centralizada.'
}

function fillPhoto() {
  updateScale(calculateFillScalePercent(naturalWidth.value, naturalHeight.value, Boolean(props.phrase.trim())))
  centerPhoto(false)
  statusMessage.value = 'Foto ampliada para preencher a área principal.'
}

function handleImageLoad(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  naturalWidth.value = image.naturalWidth || 1
  naturalHeight.value = image.naturalHeight || 1
  imageReady.value = true
}

function startDrag(event: PointerEvent) {
  if (!imageReady.value || !stage.value) return
  activePointer = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  offsetStartX = props.imageX
  offsetStartY = props.imageY
  stage.value.setPointerCapture(event.pointerId)
  stage.value.focus()
}

function moveDrag(event: PointerEvent) {
  if (activePointer !== event.pointerId || !stage.value) return
  const bounds = stage.value.getBoundingClientRect()
  const horizontalMovement = ((event.clientX - pointerStartX) / Math.max(bounds.width, 1)) * MUG_TEXTURE_WIDTH
  const verticalMovement = ((event.clientY - pointerStartY) / Math.max(bounds.height, 1)) * MUG_TEXTURE_HEIGHT
  updateX(offsetStartX + (horizontalMovement / 180) * ARTWORK_OFFSET_LIMIT)
  updateY(offsetStartY + (verticalMovement / 82) * ARTWORK_OFFSET_LIMIT)
}

function endDrag(event: PointerEvent) {
  if (activePointer !== event.pointerId) return
  activePointer = undefined
  if (stage.value?.hasPointerCapture(event.pointerId)) stage.value.releasePointerCapture(event.pointerId)
  statusMessage.value = 'Posição da foto atualizada.'
}

function handleKeyboard(event: KeyboardEvent) {
  const amount = event.shiftKey ? 5 : 2
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    updateX(props.imageX + (event.key === 'ArrowLeft' ? -amount : amount))
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    updateY(props.imageY + (event.key === 'ArrowUp' ? -amount : amount))
  } else if (event.key === 'Home') {
    event.preventDefault()
    centerPhoto()
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    updateScale(props.imageScale + 5)
  } else if (event.key === '-') {
    event.preventDefault()
    updateScale(props.imageScale - 5)
  }
}

watch(() => props.imageUrl, () => {
  imageReady.value = false
  naturalWidth.value = 1
  naturalHeight.value = 1
})
</script>

<template>
  <section class="photo-editor" aria-labelledby="photo-editor-title">
    <div class="editor-heading">
      <span class="editor-icon"><Move :size="18" /></span>
      <div>
        <h3 id="photo-editor-title">Ajuste sua foto</h3>
        <span>Arraste para posicionar e use o zoom para enquadrar.</span>
      </div>
    </div>

    <div
      ref="stage"
      class="artwork-stage"
      role="group"
      aria-label="Área para posicionar a foto"
      aria-describedby="photo-editor-help photo-editor-status"
      tabindex="0"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @keydown="handleKeyboard"
    >
      <img :src="imageUrl" alt="Foto escolhida para personalização" draggable="false" :style="imageStyle" @load="handleImageLoad">
      <span class="template-size" aria-hidden="true">Gabarito 21 × 8,7 cm</span>
      <span class="print-guide" aria-hidden="true"><small>Área sublimável</small></span>
      <span class="handle-guard left" aria-hidden="true"></span>
      <span class="handle-guard right" aria-hidden="true"></span>
      <strong v-if="phrase" class="editor-phrase">{{ phrase }}</strong>
      <span class="drag-hint" aria-hidden="true"><Move :size="15" /> Arraste a foto</span>
    </div>
    <p v-if="imageReady" class="quality-message" :class="imageQuality.level" role="status">
      <CircleCheck v-if="imageQuality.level === 'good'" :size="15" />
      <TriangleAlert v-else :size="15" />
      {{ qualityMessage }}
    </p>
    <p id="photo-editor-help" class="editor-help"><strong>Proteção da alça:</strong> as faixas laterais não recebem a imagem. No teclado, use as setas para mover, + ou − para ampliar e Home para centralizar.</p>

    <div class="quick-actions" aria-label="Ajustes rápidos da foto">
      <button type="button" :disabled="!imageReady" @click="fitPhoto"><Scan :size="17" /> Foto inteira</button>
      <button type="button" :disabled="!imageReady" @click="fillPhoto"><Maximize2 :size="17" /> Preencher</button>
      <button type="button" :disabled="!imageReady" @click="centerPhoto()"><Crosshair :size="17" /> Centralizar</button>
    </div>

    <label class="zoom-control">
      <span>Zoom da foto <output>{{ imageScale }}%</output></span>
      <input
        :value="imageScale"
        type="range"
        :min="ARTWORK_SCALE_MIN"
        :max="ARTWORK_SCALE_MAX"
        step="5"
        aria-label="Zoom da foto"
        @input="updateScale(Number(($event.target as HTMLInputElement).value))"
      >
    </label>

    <details class="fine-adjustments">
      <summary>Ajuste fino de posição</summary>
      <label>Horizontal
        <input
          :value="imageX"
          type="range"
          :min="-ARTWORK_OFFSET_LIMIT"
          :max="ARTWORK_OFFSET_LIMIT"
          step="1"
          aria-label="Posição horizontal da foto"
          @input="updateX(Number(($event.target as HTMLInputElement).value))"
        >
      </label>
      <label>Vertical
        <input
          :value="imageY"
          type="range"
          :min="-ARTWORK_OFFSET_LIMIT"
          :max="ARTWORK_OFFSET_LIMIT"
          step="1"
          aria-label="Posição vertical da foto"
          @input="updateY(Number(($event.target as HTMLInputElement).value))"
        >
      </label>
    </details>

    <p id="photo-editor-status" class="sr-only" aria-live="polite">{{ statusMessage }}</p>
  </section>
</template>

<style scoped>
.photo-editor{display:grid;gap:12px;padding:14px;border:1px solid #ebc8d5;border-radius:15px;background:#fff}.editor-heading{display:flex;align-items:center;gap:10px}.editor-icon{display:grid;place-items:center;flex:0 0 34px;height:34px;border-radius:10px;background:#fff0f5;color:#922d4d}.editor-heading h3,.editor-heading span{display:block}.editor-heading h3{margin:0;color:#592f3e;font-size:13px}.editor-heading div>span{margin-top:2px;color:var(--muted);font-size:11px;font-weight:650;line-height:1.35}.artwork-stage{position:relative;width:100%;aspect-ratio:21/8.7;overflow:hidden;border:1px solid #d6b6c2;border-radius:12px;background:linear-gradient(135deg,#f7eef2,#fff 42%,#f1e2e8);cursor:grab;outline:none;touch-action:none}.artwork-stage:active{cursor:grabbing}.artwork-stage:focus-visible{box-shadow:0 0 0 4px #f3a8c1}.artwork-stage>img{position:absolute;display:block;max-width:none;object-fit:fill;pointer-events:none;user-select:none}.template-size{position:absolute;top:7px;right:7px;padding:3px 6px;border-radius:999px;background:rgba(255,255,255,.9);color:#76354b;font-size:8px;font-weight:900;text-transform:uppercase;pointer-events:none}.print-guide{position:absolute;inset:5% 3%;border:1px dashed rgba(135,38,67,.65);border-radius:8px;pointer-events:none}.print-guide small{position:absolute;top:5px;left:7px;padding:2px 5px;border-radius:5px;background:rgba(255,255,255,.88);color:#76354b;font-size:8px;font-weight:900;letter-spacing:.02em;text-transform:uppercase}.handle-guard{position:absolute;top:0;bottom:0;width:3%;z-index:2;background:repeating-linear-gradient(135deg,rgba(109,61,78,.22) 0 3px,rgba(255,255,255,.8) 3px 6px);border-color:rgba(116,54,76,.5);pointer-events:none}.handle-guard.left{left:0;border-right:1px solid}.handle-guard.right{right:0;border-left:1px solid}.editor-phrase{position:absolute;left:6%;right:6%;bottom:8%;padding:3px 6px;color:#872643;font-size:clamp(10px,2.5vw,15px);font-weight:950;line-height:1.05;text-align:center;text-shadow:-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff;overflow-wrap:anywhere;pointer-events:none}.drag-hint{position:absolute;right:8px;bottom:8px;display:flex;align-items:center;gap:4px;padding:5px 7px;border-radius:999px;background:rgba(54,32,40,.76);color:#fff;font-size:9px;font-weight:850;pointer-events:none}.quality-message{display:flex;align-items:flex-start;gap:6px;margin:-3px 0 0;padding:7px 8px;border-radius:8px;font-size:10px;font-weight:800;line-height:1.35}.quality-message svg{flex:0 0 auto;margin-top:1px}.quality-message.good{background:#e9f8ef;color:#08733c}.quality-message.warning{background:#fff7df;color:#76530a}.quality-message.low{background:#fff0f1;color:#90263f}.editor-help{margin:-4px 0 0;color:var(--muted);font-size:10px;line-height:1.35}.editor-help strong{color:#773148}.quick-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.quick-actions button{display:flex;align-items:center;justify-content:center;gap:5px;min-height:40px;padding:7px;border:1px solid #dfb8c6;border-radius:9px;background:#fff9fb;color:#782944;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.quick-actions button:hover{background:#fff0f5}.quick-actions button:focus-visible,.fine-adjustments summary:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.quick-actions button:disabled{cursor:wait;opacity:.55}.zoom-control{display:grid;gap:6px}.zoom-control>span{display:flex;justify-content:space-between;gap:12px;color:#5e3141;font-size:11px;font-weight:900}.zoom-control output{color:#962f50}.zoom-control input,.fine-adjustments input{width:100%;accent-color:#9a294b}.fine-adjustments{padding-top:2px;border-top:1px solid #f0dce3}.fine-adjustments summary{padding:7px 0;color:#783047;font-size:11px;font-weight:900;cursor:pointer}.fine-adjustments label{display:grid;grid-template-columns:76px 1fr;align-items:center;gap:8px;margin-top:7px;color:#6a4050;font-size:10px;font-weight:800}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:420px){.photo-editor{margin-inline:-4px;padding:12px}.quick-actions button{flex-direction:column;gap:2px;min-height:48px}.print-guide small{font-size:7px}}
</style>
