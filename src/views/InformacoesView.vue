<script setup lang="ts">
import { ChevronDown, Coffee, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from '@lucide/vue'
import { linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'

const faq = [
  { question: 'Como funciona a personalização?', answer: 'Envie sua ideia, foto, frase ou arte pelo WhatsApp. Antes da produção, confirme no atendimento o modelo, a composição visual, o valor e o prazo.' },
  { question: 'O valor mostrado já é o total final?', answer: 'Não. O catálogo e o orçamento exibem estimativas. Personalização, quantidade, embalagem e entrega podem alterar o valor; tudo é confirmado antes do pedido.' },
  { question: 'Quanto tempo leva para produzir e entregar?', answer: 'O prazo depende da arte, quantidade, disponibilidade e destino. Peça a estimativa atual no WhatsApp antes de confirmar.' },
  { question: 'Como cuidar da caneca?', answer: 'Para conservar a estampa, use esponja macia e sabão neutro. Evite abrasivos e impactos. Confirme no atendimento as orientações específicas do modelo escolhido.' },
  { question: 'Como solicitar correção, troca ou cancelamento?', answer: 'Entre em contato pelo WhatsApp com os dados do atendimento e fotos, quando aplicável. A situação será analisada conforme o pedido e os direitos previstos na legislação de consumo.' },
]
</script>

<template>
  <section class="info-hero"><div class="container"><small>Compre com clareza</small><h1>Informações e cuidados</h1><p>O que saber antes de confirmar sua caneca personalizada.</p></div></section>
  <section class="section container info-grid">
    <article><Sparkles /><h2>Personalização</h2><p>Compartilhe a ideia e revise a prévia. A produção começa somente depois da confirmação combinada no atendimento.</p></article>
    <article><PackageCheck /><h2>Produção e entrega</h2><p>Prazo, disponibilidade, embalagem, forma de envio e custo de entrega são informados antes da confirmação.</p></article>
    <article><Coffee /><h2>Materiais e cuidados</h2><p>As características variam conforme o modelo. Use lavagem suave e confirme compatibilidade com micro-ondas/lava-louças no atendimento.</p></article>
    <article><ShieldCheck /><h2>Atendimento e direitos</h2><p>Dúvidas, correções e solicitações pós-venda são tratadas pelo mesmo WhatsApp. Guarde as mensagens e a confirmação do pedido.</p></article>
  </section>
  <section class="faq section"><div class="container narrow"><div class="section-title"><h2>Perguntas frequentes</h2><p>Respostas objetivas, sem promessas antes da confirmação.</p></div><details v-for="item in faq" :key="item.question"><summary>{{ item.question }}<ChevronDown :size="19" /></summary><p>{{ item.answer }}</p></details><div class="contact"><p>Ainda ficou alguma dúvida?</p><a class="btn" :href="linkWhatsapp('Olá! Tenho uma dúvida sobre as canecas e o atendimento.')" target="_blank" rel="noopener" @click="trackWhatsappClick('footer')"><MessageCircle :size="19" /> Falar no WhatsApp</a></div></div></section>
</template>

<style scoped>
.info-hero{padding:58px 0;text-align:center;background:linear-gradient(135deg,#fff0f5,#fff)}.info-hero small{color:var(--pink-dark);font-weight:900;text-transform:uppercase;letter-spacing:.1em}.info-hero h1{margin:7px 0;font:700 clamp(36px,5vw,56px)/1 Georgia,serif}.info-hero p{color:var(--muted)}.info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.info-grid article{border:1px solid var(--line);border-radius:18px;padding:22px;background:#fff}.info-grid svg{color:var(--pink-dark)}.info-grid h2{font-size:18px}.info-grid p{font-size:13px;line-height:1.6;color:var(--muted)}.faq{background:#fff7fa}.narrow{max-width:780px}.faq details{border-bottom:1px solid var(--line);padding:16px 4px}.faq summary{display:flex;justify-content:space-between;align-items:center;font-weight:850;cursor:pointer}.faq details p{color:var(--muted);line-height:1.6}.contact{text-align:center;margin-top:30px}.contact .btn{display:inline-flex;align-items:center;gap:7px}@media(max-width:900px){.info-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.info-grid{grid-template-columns:1fr}}
</style>
