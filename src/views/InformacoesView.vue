<script setup lang="ts">
import { ChevronDown, Coffee, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from '@lucide/vue'
import { useInformationContent } from '@/composables/useInformationContent'
import type { InformationIconName } from '@/data/informationContent'
import { linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'

const iconComponents = { Sparkles, PackageCheck, Coffee, ShieldCheck }
const { cards, faq } = useInformationContent()

function iconFor(name: InformationIconName | null) {
  return name ? iconComponents[name] : Sparkles
}
</script>

<template>
  <section class="info-hero"><div class="container"><small>Compre com clareza</small><h1>Informações e cuidados</h1><p>O que saber antes de confirmar sua caneca personalizada.</p></div></section>
  <section v-if="cards.length" class="section container info-grid">
    <article v-for="item in cards" :key="item.content_key"><component :is="iconFor(item.icon_name)" /><h2>{{ item.title }}</h2><p>{{ item.body }}</p></article>
  </section>
  <section class="faq section"><div class="container narrow"><div v-if="faq.length" class="section-title"><h2>Perguntas frequentes</h2><p>Respostas objetivas, sem promessas antes da confirmação.</p></div><details v-for="item in faq" :key="item.content_key"><summary>{{ item.title }}<ChevronDown :size="19" /></summary><p>{{ item.body }}</p></details><p v-if="!cards.length && !faq.length" class="empty" role="status">As informações estão sendo revisadas. Fale conosco para confirmar os detalhes antes do pedido.</p><div class="contact"><p>Ainda ficou alguma dúvida?</p><a class="btn" :href="linkWhatsapp('Olá! Tenho uma dúvida sobre as canecas e o atendimento.')" target="_blank" rel="noopener" @click="trackWhatsappClick('footer')"><MessageCircle :size="19" /> Falar no WhatsApp</a></div></div></section>
</template>

<style scoped>
.info-hero{padding:58px 0;text-align:center;background:linear-gradient(135deg,#fff0f5,#fff)}.info-hero small{color:var(--pink-dark);font-weight:900;text-transform:uppercase;letter-spacing:.1em}.info-hero h1{margin:7px 0;font:700 clamp(36px,5vw,56px)/1 Georgia,serif}.info-hero p{color:var(--muted)}.info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.info-grid article{border:1px solid var(--line);border-radius:18px;padding:22px;background:#fff}.info-grid svg{color:var(--pink-dark)}.info-grid h2{font-size:18px}.info-grid p{font-size:13px;line-height:1.6;color:var(--muted)}.faq{background:#fff7fa}.narrow{max-width:780px}.faq details{border-bottom:1px solid var(--line);padding:16px 4px}.faq summary{display:flex;justify-content:space-between;align-items:center;font-weight:850;cursor:pointer}.faq details p,.empty{color:var(--muted);line-height:1.6}.empty{text-align:center}.contact{text-align:center;margin-top:30px}.contact .btn{display:inline-flex;align-items:center;gap:7px}@media(max-width:900px){.info-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.info-grid{grid-template-columns:1fr}}
</style>
