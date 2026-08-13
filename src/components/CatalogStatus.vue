<script setup lang="ts">
import { AlertTriangle, LoaderCircle, RefreshCw } from '@lucide/vue'
import { useCatalog } from '@/composables/useCatalog'

const catalog = useCatalog()
</script>

<template>
  <div v-if="catalog.state.value === 'loading'" class="catalog-status loading" role="status" aria-live="polite">
    <LoaderCircle class="spin" :size="18" aria-hidden="true" /> Carregando catálogo…
  </div>
  <div v-else-if="catalog.state.value === 'fallback'" class="catalog-status warning" role="status">
    <AlertTriangle :size="18" aria-hidden="true" />
    <span>{{ catalog.message.value }}</span>
    <button type="button" @click="catalog.refresh"><RefreshCw :size="15" /> Tentar novamente</button>
  </div>
  <div v-else-if="catalog.state.value === 'error'" class="catalog-status error" role="alert">
    <AlertTriangle :size="18" aria-hidden="true" />
    <span>{{ catalog.message.value }}</span>
    <button type="button" @click="catalog.refresh"><RefreshCw :size="15" /> Tentar novamente</button>
  </div>
</template>

<style scoped>
.catalog-status{display:flex;align-items:center;justify-content:center;gap:9px;min-height:42px;padding:9px 16px;font-size:13px;font-weight:750;text-align:center}
.catalog-status.loading{color:var(--muted);background:#fff8fa}
.catalog-status.warning{color:#744b00;background:#fff7d6;border-block:1px solid #f1d98c}
.catalog-status.error{color:#8f253e;background:#fff0f3;border-block:1px solid #f1b8c5}
.catalog-status button{display:inline-flex;align-items:center;gap:5px;border:1px solid currentColor;border-radius:999px;padding:5px 10px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.spin{animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:700px){.catalog-status{align-items:flex-start;flex-wrap:wrap}}
</style>
