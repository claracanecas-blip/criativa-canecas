<script setup>
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import BotaoWhatsapp from '@/components/BotaoWhatsapp.vue'
</script>

<template>
  <TheHeader />

  <main>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </main>

  <TheFooter />
  <BotaoWhatsapp />
</template>
