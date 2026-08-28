<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ZoomIn } from '@lucide/vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'

const props = defineProps<{
  images: string[]
  productName: string
}>()

const activeIndex = ref(0)
const zoomActive = ref(false)
const focalX = ref(50)
const focalY = ref(50)
const lastPointerType = ref('mouse')
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const pointerMoved = ref(false)
const currentImage = computed(() => props.images[activeIndex.value] ?? '')
const hasMultipleImages = computed(() => props.images.length > 1)

watch(() => props.images, () => {
  activeIndex.value = 0
  resetZoom()
}, { deep: true })

function resetZoom() {
  zoomActive.value = false
  focalX.value = 50
  focalY.value = 50
}

function selectImage(index: number) {
  activeIndex.value = index
  resetZoom()
}

function updateFocalPoint(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  focalX.value = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100))
  focalY.value = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100))
}

function handlePointerEnter(event: PointerEvent) {
  lastPointerType.value = event.pointerType
  if (event.pointerType !== 'mouse') return
  zoomActive.value = true
  updateFocalPoint(event)
}

function handlePointerMove(event: PointerEvent) {
  lastPointerType.value = event.pointerType
  if (!zoomActive.value) return
  if (event.pointerType !== 'mouse') {
    event.preventDefault()
    if (Math.abs(event.clientX - pointerStartX.value) > 4 || Math.abs(event.clientY - pointerStartY.value) > 4) {
      pointerMoved.value = true
    }
  }
  updateFocalPoint(event)
}

function handlePointerDown(event: PointerEvent) {
  lastPointerType.value = event.pointerType
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  pointerMoved.value = false
  if (zoomActive.value && event.pointerType !== 'mouse') {
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
  }
}

function handlePointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse') resetZoom()
}

function handleClick(event: MouseEvent) {
  if (event.detail !== 0 && lastPointerType.value === 'mouse') return
  if (lastPointerType.value !== 'mouse' && pointerMoved.value) {
    pointerMoved.value = false
    return
  }
  zoomActive.value = !zoomActive.value
  if (zoomActive.value && event.detail !== 0) updateFocalPoint(event as PointerEvent)
  if (!zoomActive.value) {
    focalX.value = 50
    focalY.value = 50
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    zoomActive.value = !zoomActive.value
  } else if (event.key === 'Escape') {
    resetZoom()
  } else if (zoomActive.value && event.key.startsWith('Arrow')) {
    event.preventDefault()
    if (event.key === 'ArrowLeft') focalX.value = Math.max(0, focalX.value - 10)
    if (event.key === 'ArrowRight') focalX.value = Math.min(100, focalX.value + 10)
    if (event.key === 'ArrowUp') focalY.value = Math.max(0, focalY.value - 10)
    if (event.key === 'ArrowDown') focalY.value = Math.min(100, focalY.value + 10)
  }
}
</script>

<template>
  <section class="product-gallery" :aria-label="`Galeria de ${productName}`">
    <div
      v-if="currentImage"
      class="main-media"
      :class="{ zoomed: zoomActive }"
      role="button"
      tabindex="0"
      :aria-label="`Zoom de ${productName}`"
      :aria-pressed="zoomActive"
      @pointerenter="handlePointerEnter"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown"
      @pointerleave="handlePointerLeave"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <CatalogImage
        class="main-image"
        :style="{
          transform: zoomActive ? 'scale(2.4)' : 'scale(1)',
          transformOrigin: `${focalX}% ${focalY}%`,
        }"
        :src="currentImage"
        :alt="productName"
        loading="eager"
        fetchpriority="high"
        sizes="(max-width: 800px) 94vw, 52vw"
      />
      <span class="zoom-hint">
        <ZoomIn :size="18" />
        <span v-if="zoomActive">Mova para explorar</span>
        <template v-else>
          <span class="desktop-hint">Passe o cursor para ampliar</span>
          <span class="touch-hint">Toque para ampliar</span>
        </template>
      </span>
      <span class="zoom-status" aria-live="polite">{{ zoomActive ? 'Zoom ativado. Mova o ponteiro ou use as setas para explorar.' : 'Zoom desativado.' }}</span>
    </div>

    <div v-if="hasMultipleImages" class="thumbnails" aria-label="Escolher imagem">
      <button
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        type="button"
        :class="{ active: index === activeIndex }"
        :aria-label="`Ver imagem ${index + 1} de ${productName}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="selectImage(index)"
      >
        <CatalogImage :src="image" alt="" sizes="84px" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.product-gallery{min-width:0}.main-media{position:relative;display:block;width:100%;border-radius:22px;overflow:hidden;background:#f7f1f4;cursor:zoom-in;touch-action:pan-y}.main-media.zoomed{cursor:zoom-out;touch-action:none}.main-media:focus-visible{outline:3px solid var(--pink-dark);outline-offset:4px}.main-image{display:block;width:100%;aspect-ratio:1;object-fit:cover;transition:transform .16s ease-out;will-change:transform}.zoom-hint{position:absolute;right:14px;bottom:14px;display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.94);color:var(--pink-dark);box-shadow:0 5px 16px rgba(35,24,29,.18);font-size:12px;font-weight:900;pointer-events:none}.touch-hint{display:none}.zoom-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.thumbnails{display:flex;gap:9px;margin-top:12px;overflow:auto;padding:3px}.thumbnails button{flex:0 0 78px;padding:3px;border:2px solid transparent;border-radius:12px;background:#fff;cursor:pointer}.thumbnails button.active{border-color:var(--pink-dark)}.thumbnails img,.thumbnails :deep(.catalog-image-fallback){display:block;width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover}
@media(max-width:700px){.zoom-hint{right:10px;bottom:10px}.desktop-hint{display:none}.touch-hint{display:inline}}
@media(prefers-reduced-motion:reduce){.main-image{transition:none}}
</style>
