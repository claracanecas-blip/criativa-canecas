<script setup lang="ts">
import { MessageCircle } from '@lucide/vue'
import { linkWhatsapp } from '@/data/site'
</script>

<template>
  <a class="wa" :href="linkWhatsapp()" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
    <MessageCircle :size="27" :stroke-width="2.2" aria-hidden="true" />
  </a>
</template>

<style scoped>
.wa{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:#25D366;color:#fff;font-size:25px;z-index:90;box-shadow:0 12px 25px rgba(0,0,0,.18)}
.wa:hover{transform:scale(1.06)}
</style>
