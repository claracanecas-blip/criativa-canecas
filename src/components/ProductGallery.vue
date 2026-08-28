<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from '@lucide/vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'

const props = defineProps<{
  images: string[]
  productName: string
}>()

const dialog = ref<HTMLDialogElement>()
const activeIndex = ref(0)
const zoom = ref(1)
const currentImage = computed(() => props.images[activeIndex.value] ?? '')
const hasMultipleImages = computed(() => props.images.length > 1)

watch(() => props.images, () => {
  activeIndex.value = 0
  zoom.value = 1
}, { deep: true })

function selectImage(index: number) {
  activeIndex.value = index
  zoom.value = 1
}

function openGallery(index = activeIndex.value) {
  selectImage(index)
  dialog.value?.showModal()
}

function closeGallery() {
  dialog.value?.close()
}

function handleBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) closeGallery()
}

function changeZoom(step: number) {
  zoom.value = Math.min(3, Math.max(1, Number((zoom.value + step).toFixed(1))))
}

function previousImage() {
  selectImage((activeIndex.value - 1 + props.images.length) % props.images.length)
}

function nextImage() {
  selectImage((activeIndex.value + 1) % props.images.length)
}

function handleKeydown(event: KeyboardEvent) {
  if (!dialog.value?.open || !hasMultipleImages.value) return
  if (event.key === 'ArrowLeft') previousImage()
  if (event.key === 'ArrowRight') nextImage()
}
</script>

<template>
  <section class="product-gallery" :aria-label="`Galeria de ${productName}`" @keydown="handleKeydown">
    <button
      v-if="currentImage"
      class="main-media"
      type="button"
      :aria-label="`Ampliar imagem de ${productName}`"
      @click="openGallery()"
    >
      <CatalogImage
        class="main-image"
        :src="currentImage"
        :alt="productName"
        loading="eager"
        fetchpriority="high"
        sizes="(max-width: 800px) 94vw, 52vw"
      />
      <span class="zoom-hint"><ZoomIn :size="18" /> Ampliar</span>
    </button>

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

    <dialog
      ref="dialog"
      class="image-dialog"
      :aria-label="`Imagem ampliada de ${productName}`"
      @click="handleBackdrop"
      @close="zoom = 1"
      @cancel.prevent="closeGallery"
    >
      <section class="lightbox">
        <header>
          <div>
            <strong>{{ productName }}</strong>
            <span v-if="hasMultipleImages">Imagem {{ activeIndex + 1 }} de {{ images.length }}</span>
          </div>
          <div class="zoom-controls" aria-label="Controles de zoom">
            <button type="button" aria-label="Diminuir zoom" :disabled="zoom <= 1" @click="changeZoom(-0.5)"><ZoomOut :size="20" /></button>
            <output aria-live="polite">{{ Math.round(zoom * 100) }}%</output>
            <button type="button" aria-label="Aumentar zoom" :disabled="zoom >= 3" @click="changeZoom(0.5)"><ZoomIn :size="20" /></button>
            <button type="button" aria-label="Restaurar zoom" :disabled="zoom === 1" @click="zoom = 1"><RotateCcw :size="19" /></button>
            <button class="close" type="button" aria-label="Fechar imagem ampliada" @click="closeGallery"><X :size="23" /></button>
          </div>
        </header>

        <div class="image-viewport">
          <div class="zoom-canvas" :style="{ width: `${zoom * 100}%` }">
            <CatalogImage
              v-if="currentImage"
              class="zoom-image"
              :src="currentImage"
              :alt="`${productName}, imagem ampliada`"
              loading="eager"
              fetchpriority="high"
              sizes="100vw"
            />
          </div>
        </div>

        <footer v-if="hasMultipleImages">
          <button type="button" aria-label="Imagem anterior" @click="previousImage"><ChevronLeft :size="21" /> Anterior</button>
          <button type="button" aria-label="Próxima imagem" @click="nextImage">Próxima <ChevronRight :size="21" /></button>
        </footer>
      </section>
    </dialog>
  </section>
</template>

<style scoped>
.product-gallery{min-width:0}.main-media{position:relative;display:block;width:100%;padding:0;border:0;border-radius:22px;overflow:hidden;background:#f7f1f4;cursor:zoom-in}.main-media:focus-visible{outline:3px solid var(--pink-dark);outline-offset:4px}.main-image{display:block;width:100%;aspect-ratio:1;object-fit:cover}.zoom-hint{position:absolute;right:14px;bottom:14px;display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.94);color:var(--pink-dark);box-shadow:0 5px 16px rgba(35,24,29,.18);font-size:12px;font-weight:900}.thumbnails{display:flex;gap:9px;margin-top:12px;overflow:auto;padding:3px}.thumbnails button{flex:0 0 78px;padding:3px;border:2px solid transparent;border-radius:12px;background:#fff;cursor:pointer}.thumbnails button.active{border-color:var(--pink-dark)}.thumbnails img,.thumbnails :deep(.catalog-image-fallback){display:block;width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover}
.image-dialog{width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:rgba(28,20,24,.78)}.image-dialog::backdrop{background:rgba(28,20,24,.78)}.lightbox{display:flex;flex-direction:column;width:100%;height:100%;background:#171216;color:#fff}.lightbox header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 18px;background:#251d22}.lightbox header strong,.lightbox header span{display:block}.lightbox header span{margin-top:2px;color:#d9cdd3;font-size:12px}.zoom-controls{display:flex;align-items:center;gap:7px}.zoom-controls button,.lightbox footer button{display:flex;align-items:center;justify-content:center;gap:5px;min-width:42px;height:42px;border:1px solid #5d4b55;border-radius:10px;background:#33282e;color:#fff;cursor:pointer}.zoom-controls button:hover:not(:disabled),.lightbox footer button:hover{background:#493841}.zoom-controls button:disabled{opacity:.4;cursor:not-allowed}.zoom-controls output{min-width:48px;text-align:center;font-size:12px;font-weight:900}.zoom-controls .close{margin-left:6px;background:var(--pink-dark);border-color:var(--pink-dark)}.image-viewport{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;touch-action:pan-x pan-y;padding:18px}.zoom-canvas{min-width:100%;margin:auto;transition:width .18s ease}.zoom-image{display:block;width:100%;height:auto;max-width:none;object-fit:contain}.lightbox footer{display:flex;justify-content:space-between;padding:10px 18px;background:#251d22}.lightbox footer button{width:auto;padding:0 14px}
@media(max-width:700px){.zoom-hint{right:10px;bottom:10px}.lightbox header{align-items:flex-start;padding:10px 12px}.lightbox header>div:first-child{max-width:105px}.zoom-controls{gap:4px}.zoom-controls button{min-width:38px;width:38px;height:38px}.zoom-controls output{min-width:40px}.zoom-controls .close{margin-left:0}.image-viewport{padding:8px}.lightbox footer{padding:8px 12px}}
</style>
