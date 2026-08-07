<script setup>
import { linkWhatsapp } from '@/data/site'

defineProps({
  icone: { type: String, default: '☕' },
  titulo: { type: String, default: 'Coleção em breve' },
  texto: { type: String, default: 'Ainda estamos preparando os modelos desta coleção.' },
  mensagem: { type: String, default: 'Olá! Quero saber mais sobre as canecas.' },
})
</script>

<template>
  <div class="empty">
    <div>{{ icone }}</div>
    <h3>{{ titulo }}</h3>
    <p>{{ texto }}</p>
    <a class="btn" :href="linkWhatsapp(mensagem)" target="_blank" rel="noopener">
      Pedir pelo WhatsApp
    </a>
  </div>
</template>
