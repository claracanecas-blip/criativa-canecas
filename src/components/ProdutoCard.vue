<script setup>
import { computed } from 'vue'
import { formatarPreco } from '@/data/produtos'
import { linkWhatsapp } from '@/data/site'

const props = defineProps({
  produto: { type: Object, required: true },
})

const link = computed(() =>
  linkWhatsapp(`Olá! Tenho interesse na caneca ${props.produto.nome}.`),
)
</script>

<template>
  <article class="card">
    <img :src="produto.imagem" :alt="produto.nome" loading="lazy">
    <div class="info">
      <h3>{{ produto.nome }}</h3>
      <div class="price">{{ formatarPreco(produto.preco) }}</div>
      <a class="comprar" :href="link" target="_blank" rel="noopener">Comprar pelo WhatsApp</a>
    </div>
  </article>
</template>

<style scoped>
.card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08);display:flex;flex-direction:column}
.card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
.card img{width:100%;height:300px;object-fit:cover;background:#f4eef1}
.info{padding:16px;display:flex;flex-direction:column;gap:8px;flex:1}
.info h3{margin:0;font-size:17px}
.price{font-size:24px;color:var(--pink);font-weight:900}
.comprar{margin-top:auto;text-align:center;background:#25D366;color:#fff;padding:11px;border-radius:8px;font-weight:800;font-size:14px}
.comprar:hover{background:#1eb757}

@media(max-width:700px){
  .card img{height:190px}
  .info{padding:12px}
  .price{font-size:19px}
}
</style>
