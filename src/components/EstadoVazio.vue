<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { linkWhatsapp } from '@/data/site'
import type { IconName } from '@/types/catalog'
import { trackWhatsappClick } from '@/services/analytics'

withDefaults(defineProps<{
  icone?: IconName
  titulo?: string
  texto?: string
  mensagem?: string
}>(), {
  icone: 'Coffee',
  titulo: 'Coleção em breve',
  texto: 'Ainda estamos preparando os modelos desta coleção.',
  mensagem: 'Olá! Quero saber mais sobre as canecas.',
})
</script>

<template>
  <div class="empty">
    <AppIcon class="mx-auto mb-3 text-brand-500" :name="icone" :size="52" :stroke-width="1.7" />
    <h3>{{ titulo }}</h3>
    <p>{{ texto }}</p>
    <a class="btn" :href="linkWhatsapp(mensagem)" target="_blank" rel="noopener" @click="trackWhatsappClick('empty_state')">
      Pedir pelo WhatsApp
    </a>
  </div>
</template>
