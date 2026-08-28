<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronRight, MessageCircle, ShieldCheck, ShoppingBag } from '@lucide/vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import NaoEncontradoView from '@/views/NaoEncontradoView.vue'
import { useCatalog } from '@/composables/useCatalog'
import { usePageMeta, type PageMeta } from '@/composables/usePageMeta'
import { formatarPreco } from '@/utils/currency'
import { deliveryPolicy, linkWhatsapp, officialSiteOrigin, officialSiteUrl } from '@/data/site'
import { productImageUrl } from '@/utils/assets'
import { trackWhatsappClick } from '@/services/analytics'
import { useQuoteCart } from '@/composables/useQuoteCart'

const props = defineProps<{ slug: string }>()
const catalog = useCatalog()
const cart = useQuoteCart()
const selectedImage = ref(0)
const product = computed(() => catalog.buscarProduto(props.slug))
const ready = computed(() => ['ready', 'fallback', 'error'].includes(catalog.state.value))
const collections = computed(() => (product.value?.colecoes ?? [])
  .map((slug) => catalog.buscarColecao(slug))
  .filter((item) => item !== undefined))
const images = computed(() => product.value?.imagem ? [product.value.imagem] : [])
const selectedImageSource = computed(() => images.value[selectedImage.value] ?? '')
const related = computed(() => {
  if (!product.value) return []
  const slugs = new Set(product.value.colecoes ?? [product.value.colecao])
  return catalog.produtos.value
    .filter((item) => item.id !== product.value?.id && (item.colecoes ?? [item.colecao]).some((slug) => slugs.has(slug)))
    .slice(0, 4)
})
const canonical = computed(() => officialSiteUrl(`/produto/${props.slug}`))
const whatsapp = computed(() => product.value
  ? linkWhatsapp(`Olá! Quero personalizar e pedir a caneca ${product.value.nome} (${product.value.sku}). ${canonical.value}\n\n${deliveryPolicy.contactPrompt}`)
  : '#')
const meta = computed<PageMeta | null>(() => product.value ? {
  title: `${product.value.nome} | Criativa Canecas`,
  description: product.value.descricao,
  canonical: canonical.value,
  image: productImageUrl(product.value.imagem, 'social'),
  type: 'product',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.value.nome,
      description: product.value.descricao,
      sku: product.value.sku,
      image: [productImageUrl(product.value.imagem)],
      brand: { '@type': 'Brand', name: 'Criativa Canecas' },
      offers: {
        '@type': 'Offer',
        url: canonical.value,
        priceCurrency: 'BRL',
        price: product.value.preco.toFixed(2),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: officialSiteOrigin() },
        { '@type': 'ListItem', position: 2, name: 'Coleções', item: officialSiteUrl('/colecoes') },
        { '@type': 'ListItem', position: 3, name: product.value.nome, item: canonical.value },
      ],
    },
  ],
} : null)

usePageMeta(meta)
watch(() => props.slug, () => { selectedImage.value = 0 })
</script>

<template>
  <NaoEncontradoView v-if="ready && !product" />
  <article v-else-if="product" class="product-page section container">
    <nav class="breadcrumb" aria-label="Navegação estrutural">
      <RouterLink to="/">Início</RouterLink><ChevronRight :size="13" />
      <RouterLink to="/colecoes">Coleções</RouterLink><ChevronRight :size="13" />
      <span>{{ product.nome }}</span>
    </nav>

    <div class="product-layout">
      <section class="gallery" aria-label="Imagens do produto">
        <CatalogImage v-if="selectedImageSource" class="main-image" :src="selectedImageSource" :alt="product.nome" loading="eager" fetchpriority="high" sizes="(max-width: 800px) 94vw, 52vw" />
      </section>
      <section class="product-copy">
        <small class="sku">Código {{ product.sku }}</small>
        <h1>{{ product.nome }}</h1>
        <p class="theme">{{ product.tema }}</p>
        <p class="price">{{ formatarPreco(product.preco) }}</p>
        <DeliveryOptions compact />
        <p class="description">{{ product.descricao }}</p>
        <div class="collection-links"><RouterLink v-for="collection in collections" :key="collection.slug" :to="collection.to ?? `/colecao/${collection.slug}`">{{ collection.nome }}</RouterLink></div>
        <button type="button" class="add-quote" :aria-label="`Adicionar ${product.nome} ao orçamento`" @click="cart.add(product.slug, product.nome)"><ShoppingBag :size="21" /> Adicionar ao orçamento</button>
        <a class="whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('product_page', product.slug)"><MessageCircle :size="21" /> Personalizar e pedir pelo WhatsApp</a>
        <p class="estimate"><ShieldCheck :size="18" /> Valor estimado da caneca; confirme personalização, entrega e prazo no atendimento.</p>
      </section>
    </div>

    <section v-if="related.length" class="related">
      <div class="section-title"><h2>Você também pode gostar</h2><p>Outros modelos das mesmas coleções</p></div>
      <div class="grid"><ProdutoCard v-for="item in related" :key="item.id" :produto="item" /></div>
    </section>
    <EstadoVazio v-else icone="Sparkles" titulo="Modelo exclusivo" texto="Este produto ainda não possui relacionados." />
  </article>
</template>

<style scoped>
.breadcrumb{display:flex;align-items:center;gap:4px;margin-bottom:18px;font-size:12px;color:var(--muted)}.breadcrumb a:hover{color:var(--pink-dark)}
.product-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:46px;align-items:start}.gallery{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#f7f1f4}.main-image{display:block;width:100%;aspect-ratio:1;object-fit:cover}.product-copy{padding-top:14px}.sku{color:var(--pink-dark);font-weight:900;letter-spacing:.06em;text-transform:uppercase}.product-copy h1{font-family:Georgia,serif;font-size:clamp(34px,4vw,52px);line-height:1.02;margin:10px 0}.theme{color:var(--muted);font-weight:750}.price{font-size:34px;color:var(--pink);font-weight:950;margin:24px 0 12px}.description{font-size:16px;line-height:1.65;color:#5e5157;margin-top:20px}.collection-links{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.collection-links a{border:1px solid var(--line);border-radius:999px;padding:7px 12px;font-size:12px;font-weight:850}.collection-links a:hover{border-color:var(--pink);color:var(--pink-dark)}.add-quote,.whatsapp{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;padding:14px 18px;font-weight:900}.add-quote{width:100%;margin-bottom:10px;border:1px solid var(--pink-dark);background:#fff;color:var(--pink-dark);cursor:pointer}.add-quote:hover{background:var(--pink-soft)}.whatsapp{background:#087f3f;color:#fff}.whatsapp:hover{background:#075e35}.estimate{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12px;line-height:1.4;margin-top:12px}.related{margin-top:58px}
@media(max-width:800px){.product-layout{grid-template-columns:1fr;gap:22px}.product-copy{padding-top:0}.product-copy h1{font-size:36px}.related{margin-top:42px}}
</style>
