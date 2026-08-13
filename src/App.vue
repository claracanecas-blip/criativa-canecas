<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import BotaoWhatsapp from '@/components/BotaoWhatsapp.vue'
import CatalogStatus from '@/components/CatalogStatus.vue'
import QuoteCartDrawer from '@/components/QuoteCartDrawer.vue'
</script>

<template>
  <TheHeader />
  <CatalogStatus />

  <main>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </main>

  <TheFooter />
  <BotaoWhatsapp />
  <QuoteCartDrawer />
</template>
