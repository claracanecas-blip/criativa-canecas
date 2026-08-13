<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImageOff } from '@lucide/vue'
import { productImageSrcset, productImageUrl } from '@/utils/assets'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  sizes?: string
  loading?: 'eager' | 'lazy'
  fetchpriority?: 'high' | 'low' | 'auto'
}>(), {
  sizes: '(max-width: 700px) 46vw, (max-width: 1100px) 31vw, 280px',
  loading: 'lazy',
  fetchpriority: 'auto',
})

const failed = ref(false)
const imageUrl = computed(() => productImageUrl(props.src, 'card-640'))
const imageSrcset = computed(() => productImageSrcset(props.src))

watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <div v-if="failed" class="catalog-image-fallback" role="img" :aria-label="`${alt} — imagem indisponível`">
    <ImageOff :size="32" :stroke-width="1.8" aria-hidden="true" />
    <span>Imagem indisponível</span>
  </div>
  <img
    v-else
    :src="imageUrl"
    :srcset="imageSrcset"
    :sizes="sizes"
    :alt="alt"
    width="1000"
    height="1000"
    :loading="loading"
    :fetchpriority="fetchpriority"
    decoding="async"
    @error="failed = true"
  >
</template>

<style scoped>
.catalog-image-fallback{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#fff4f7,#f2e8ed);color:#8d727d;text-align:center;font-size:12px;font-weight:800}
</style>
