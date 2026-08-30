<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import PersonalizationPreview from '@/components/PersonalizationPreview.vue'

const modelNames = ['Caneca personalizada']
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h1 class="flex items-center justify-center gap-2"><AppIcon name="Sparkles" :size="28" /> Caneca Personalizada</h1>
      <p>Envie sua arte pronta ou conte sua ideia para criarmos com você</p>
    </div>

    <PersonalizationPreview :models="modelNames" />

    <DeliveryOptions class="delivery" />
  </section>
</template>

<style scoped>
.section-title{margin-bottom:0}
.delivery{margin-top:28px}
</style>
