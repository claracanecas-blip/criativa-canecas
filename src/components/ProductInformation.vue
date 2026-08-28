<script setup lang="ts">
import { Coffee, Image as ImageIcon, PackageCheck, ShieldCheck } from '@lucide/vue'
import { deliveryPolicy } from '@/data/site'

defineProps<{ productName: string }>()

const details = [
  {
    icon: ImageIcon,
    title: 'Personalização e prévia',
    text: 'Envie sua foto, frase, logo ou referência pelo WhatsApp. A composição visual é apresentada para sua aprovação antes da produção.',
  },
  {
    icon: Coffee,
    title: 'Material e capacidade',
    text: 'As características podem variar conforme o modelo escolhido. Confirme material, capacidade e uso em micro-ondas ou lava-louças antes de fechar o pedido.',
  },
  {
    icon: ShieldCheck,
    title: 'Cuidados básicos',
    text: 'Use esponja macia e sabão neutro. Evite produtos abrasivos e impactos; orientações específicas são confirmadas no atendimento.',
  },
  {
    icon: PackageCheck,
    title: 'Preço e entrega',
    text: deliveryPolicy.priceNote,
  },
]
</script>

<template>
  <section class="product-information" :aria-label="`Informações de ${productName}`">
    <header>
      <small>Antes de pedir</small>
      <h2>Detalhes e cuidados</h2>
      <p>Informações confirmadas para você decidir com mais segurança.</p>
    </header>
    <div class="information-grid">
      <article v-for="item in details" :key="item.title">
        <component :is="item.icon" :size="22" aria-hidden="true" />
        <div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.product-information{margin-top:42px;padding:28px;border:1px solid var(--line);border-radius:20px;background:#fff}.product-information header{text-align:center;margin-bottom:20px}.product-information header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.product-information h2{margin:5px 0 4px;font-size:26px}.product-information header p{margin:0;color:var(--muted);font-size:13px}.information-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.information-grid article{display:grid;grid-template-columns:auto 1fr;gap:11px;padding:16px;border-radius:14px;background:#fff7fa}.information-grid svg{color:var(--pink-dark)}.information-grid h3{margin:0;font-size:15px}.information-grid p{margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.55}
@media(max-width:700px){.product-information{margin-top:32px;padding:20px}.information-grid{grid-template-columns:1fr}.product-information h2{font-size:22px}}
</style>
