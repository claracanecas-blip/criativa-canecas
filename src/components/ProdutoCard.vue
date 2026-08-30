<script setup lang="ts">
import { computed } from 'vue'
import { formatarPreco } from '@/utils/currency'
import { deliveryPolicy, linkWhatsapp, officialSiteUrl } from '@/data/site'
import CatalogImage from '@/components/ui/CatalogImage.vue'
import type { Product } from '@/types/catalog'
import { trackWhatsappClick } from '@/services/analytics'
import { ShoppingBag } from '@lucide/vue'
import { useQuoteCart } from '@/composables/useQuoteCart'

const props = withDefaults(defineProps<{ produto: Product; priority?: boolean }>(), {
  priority: false,
})
const cart = useQuoteCart()

const link = computed(() =>
  linkWhatsapp(`Olá! Tenho interesse na caneca ${props.produto.nome} (${props.produto.sku}). ${officialSiteUrl(`/produto/${props.produto.slug}`)}\n\n${deliveryPolicy.contactPrompt}`),
)

</script>

<template>
  <article class="card">
    <RouterLink class="product-link" :to="`/produto/${produto.slug}`" :aria-label="`Ver detalhes de ${produto.nome}`">
      <CatalogImage
        class="product-media"
        :src="produto.imagem"
        :alt="produto.nome"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
      />
    </RouterLink>
    <div class="info">
      <h3><RouterLink :to="`/produto/${produto.slug}`">{{ produto.nome }}</RouterLink></h3>
      <div class="price-row"><span class="price">{{ formatarPreco(produto.preco) }}</span><small>frete não incluso</small></div>
      <p class="local-benefit">{{ deliveryPolicy.local.title }}: {{ deliveryPolicy.local.cardNote }}</p>
      <button type="button" class="add-quote" :aria-label="`Adicionar ${produto.nome} ao orçamento`" @click="cart.add(produto.slug, produto.nome)"><ShoppingBag :size="17" /><span class="label-full">Adicionar ao orçamento</span><span class="label-short">Adicionar</span></button>
      <a class="comprar" :href="link" target="_blank" rel="noopener" @click="trackWhatsappClick('product_card', produto.slug)"><span class="label-full">Pedir pelo WhatsApp</span><span class="label-short">Pedir no WhatsApp</span></a>
    </div>
  </article>
</template>

<style scoped>
.card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 7px 20px rgba(65,35,47,.08);display:flex;flex-direction:column;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.card:hover{transform:translateY(-3px);border-color:#e9c4d1;box-shadow:var(--shadow)}
.card:focus-within{border-color:var(--pink);box-shadow:0 0 0 3px rgba(238,75,130,.12),var(--shadow)}
.product-link{display:block}
.product-media{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:#f4eef1}
.info{padding:16px;display:flex;flex-direction:column;gap:8px;flex:1}
.info h3{margin:0;font-size:17px;line-height:1.28;text-wrap:balance}
.price-row{display:flex;align-items:baseline;gap:6px}.price{font-size:24px;color:var(--pink);font-weight:900}.price-row small{color:var(--muted);font-weight:750}.local-benefit{margin:-3px 0 2px;color:var(--pink-dark);font-size:11px;line-height:1.3;font-weight:750}
.add-quote{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:auto;border:1px solid var(--pink-dark);background:#fff;color:var(--pink-dark);padding:10px 8px;border-radius:8px;font-weight:850;font-size:13px;cursor:pointer}.add-quote:hover{background:var(--pink-soft)}
.comprar{text-align:center;background:#087f3f;color:#fff;padding:10px;border-radius:8px;font-weight:800;font-size:13px}
.comprar:hover{background:#075e35}
.label-short{display:none}

@media(max-width:700px){
  .card{border-radius:15px}
  .info{padding:12px 11px;gap:7px}
  .info h3{font-size:15px;line-height:1.24}
  .price-row{display:grid;gap:0}
  .price{font-size:20px;line-height:1.1}
  .price-row small{font-size:10px;line-height:1.2}
  .local-benefit{margin:0 0 1px;font-size:10px;line-height:1.35}
  .add-quote,.comprar{min-height:39px;padding:9px 6px;font-size:12px}
  .label-full{display:none}.label-short{display:inline}
}
</style>
