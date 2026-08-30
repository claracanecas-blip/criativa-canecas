<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronRight, SlidersHorizontal } from '@lucide/vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import NaoEncontradoView from '@/views/NaoEncontradoView.vue'
import { useCatalog } from '@/composables/useCatalog'
import { usePageMeta, type PageMeta } from '@/composables/usePageMeta'
import { productImageUrl } from '@/utils/assets'
import { officialSiteOrigin, officialSiteUrl } from '@/data/site'
import { filterAndSortProducts, hasMultiplePrices, type PriceBand, type ProductSort } from '@/utils/catalogFilters'

const props = defineProps<{ slug: string }>()
const catalog = useCatalog()

const colecao = computed(() => catalog.buscarColecao(props.slug))
const itens = computed(() => catalog.produtosDaColecao(props.slug))
const catalogoPronto = computed(() => ['ready', 'fallback', 'error'].includes(catalog.state.value))
const pageMeta = computed<PageMeta | null>(() => colecao.value ? {
  title: `${colecao.value.nome} | Criativa Canecas`,
  description: colecao.value.descricao || `Explore canecas da coleção ${colecao.value.nome} na Criativa Canecas.`,
  canonical: officialSiteUrl(`/colecao/${colecao.value.slug}`),
  image: itens.value[0]?.imagem ? productImageUrl(itens.value[0].imagem, 'social') : undefined,
  type: 'website',
  jsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: officialSiteOrigin() },
      { '@type': 'ListItem', position: 2, name: 'Coleções', item: officialSiteUrl('/colecoes') },
      { '@type': 'ListItem', position: 3, name: colecao.value.nome, item: officialSiteUrl(`/colecao/${colecao.value.slug}`) },
    ],
  }],
} : null)

usePageMeta(pageMeta)

// filtro por tema (ex.: Arrow, Breaking Bad), montado a partir dos produtos
const temas = computed(() => [...new Set(itens.value.map((p) => p.tema ?? p.nome))].sort())
const possuiPrecosDiferentes = computed(() => hasMultiplePrices(itens.value))
const temaAtivo = ref<string>('')
const faixaPreco = ref<PriceBand>('all')
const ordenacao = ref<ProductSort>('default')
const pagina = ref(1)
const POR_PAGINA = 20

const visiveis = computed(() => filterAndSortProducts(itens.value, {
  theme: temaAtivo.value,
  priceBand: faixaPreco.value,
  sort: ordenacao.value,
}))
const totalPaginas = computed(() => Math.max(1, Math.ceil(visiveis.value.length / POR_PAGINA)))
const itensDaPagina = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA
  return visiveis.value.slice(inicio, inicio + POR_PAGINA)
})

function clearFilters() {
  temaAtivo.value = ''
  faixaPreco.value = 'all'
  ordenacao.value = 'default'
  pagina.value = 1
}

watch([temaAtivo, faixaPreco, ordenacao], () => { pagina.value = 1 })

watch(
  () => [props.slug, colecao.value?.nome] as const,
  ([slug, nome]) => {
    temaAtivo.value = ''
    faixaPreco.value = 'all'
    ordenacao.value = 'default'
    pagina.value = 1
    document.title = nome ? `${nome} | Criativa Canecas` : 'Criativa Canecas'
  },
  { immediate: true },
)
</script>

<template>
  <NaoEncontradoView v-if="catalogoPronto && !colecao" />

  <section v-else-if="colecao" class="section container">
    <nav class="trilha">
      <RouterLink to="/">Início</RouterLink><ChevronRight :size="13" />
      <RouterLink to="/colecoes">Coleções</RouterLink><ChevronRight :size="13" />
      <span>{{ colecao.nome }}</span>
    </nav>

    <header class="collection-hero">
      <div class="collection-heading">
        <span class="collection-icon" aria-hidden="true"><AppIcon :name="colecao.icone" :size="30" /></span>
        <div>
          <small>Coleção</small>
          <h1>{{ colecao.nome }}</h1>
          <p v-if="itens.length">{{ itens.length }} modelos para escolher</p>
          <p v-else>Uma coleção preparada para o seu momento</p>
        </div>
      </div>
      <div v-if="itens[0]" class="collection-art" aria-hidden="true">
        <img
          :src="productImageUrl(itens[0].imagem, 'card-320')"
          alt=""
          width="320"
          height="320"
          loading="eager"
          fetchpriority="high"
        >
      </div>
    </header>

    <div v-if="itens.length" class="catalog-tools" aria-label="Filtros do catálogo">
      <div class="tools-summary">
        <span><SlidersHorizontal :size="18" aria-hidden="true" /> Refine sua escolha</span>
        <strong aria-live="polite">{{ visiveis.length }} {{ visiveis.length === 1 ? 'modelo encontrado' : 'modelos encontrados' }}</strong>
      </div>
      <div class="tools-fields">
        <label v-if="temas.length > 1">Tema
          <select v-model="temaAtivo" aria-label="Filtrar por tema"><option value="">Todos os temas</option><option v-for="tema in temas" :key="tema" :value="tema">{{ tema }}</option></select>
        </label>
        <label v-if="possuiPrecosDiferentes">Preço
          <select v-model="faixaPreco" aria-label="Faixa de preço"><option value="all">Todos os preços</option><option value="under-40">Até R$ 39,99</option><option value="40-50">R$ 40 a R$ 49,99</option><option value="over-50">R$ 50 ou mais</option></select>
        </label>
        <label>Ordenar
          <select v-model="ordenacao" aria-label="Ordenar produtos"><option value="default">Destaques</option><option v-if="possuiPrecosDiferentes" value="price-asc">Menor preço</option><option v-if="possuiPrecosDiferentes" value="price-desc">Maior preço</option><option value="name">Nome de A a Z</option></select>
        </label>
        <button v-if="temaAtivo || faixaPreco !== 'all' || ordenacao !== 'default'" type="button" aria-label="Limpar filtros" @click="clearFilters">Limpar</button>
      </div>
    </div>

    <div v-if="visiveis.length" class="grid">
      <ProdutoCard
        v-for="(produto, indice) in itensDaPagina"
        :key="produto.id"
        :produto="produto"
        :priority="indice === 0"
      />
    </div>

    <nav v-if="totalPaginas > 1" class="paginacao" aria-label="Paginação de produtos">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button :disabled="pagina === totalPaginas" @click="pagina++">Próxima</button>
    </nav>

    <EstadoVazio
      v-if="!visiveis.length"
      :icone="colecao.icone"
      :titulo="itens.length ? 'Nenhum modelo neste filtro' : 'Coleção em breve'"
      :texto="itens.length ? 'Ajuste ou limpe os filtros para ver outros modelos.' : `Ainda estamos preparando os modelos de ${colecao.nome}. Fale com a gente que criamos a sua sob encomenda.`"
      :mensagem="`Olá! Quero uma caneca da coleção ${colecao.nome}.`"
    />
  </section>
</template>

<style scoped>
.trilha{display:flex;align-items:center;gap:3px;font-size:12px;color:var(--muted);margin-bottom:12px}
.trilha a:hover{color:var(--pink-dark)}
.collection-hero{position:relative;isolation:isolate;display:flex;align-items:center;min-height:154px;margin-bottom:14px;padding:24px 210px 24px 28px;overflow:hidden;border:1px solid #f0d6df;border-radius:24px;background:linear-gradient(115deg,#fff3f7 0%,#fff 68%)}
.collection-hero::before{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(circle at 16% 20%,rgba(238,75,130,.12) 0 2px,transparent 3px) 0 0/22px 22px;mask-image:linear-gradient(90deg,#000,transparent 55%);opacity:.7}
.collection-heading{display:flex;align-items:center;gap:17px}.collection-icon{display:grid;place-items:center;flex:0 0 58px;width:58px;height:58px;border-radius:19px;background:#fff;color:var(--pink-dark);box-shadow:0 10px 24px rgba(125,48,76,.11)}
.collection-heading small{display:block;margin-bottom:3px;color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.13em;text-transform:uppercase}.collection-heading h1{margin:0;font-family:Georgia,serif;font-size:clamp(30px,3.5vw,43px);line-height:1.06;text-wrap:balance}.collection-heading p{margin:7px 0 0;color:var(--muted);font-size:14px;font-weight:650}
.collection-art{position:absolute;right:23px;top:50%;width:150px;height:150px;padding:7px;border-radius:50%;background:#fff;box-shadow:0 14px 30px rgba(72,36,51,.14);transform:translateY(-50%) rotate(4deg)}.collection-art::after{content:"";position:absolute;inset:7px;border:1px solid rgba(238,75,130,.16);border-radius:50%;pointer-events:none}.collection-art img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.catalog-tools{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 22px;padding:13px 15px;border:1px solid var(--line);border-radius:17px;background:#fff;box-shadow:0 7px 20px rgba(73,39,53,.05)}
.tools-summary{display:grid;gap:2px;min-width:max-content}.tools-summary span{display:flex;align-items:center;gap:7px;color:var(--pink-dark);font-size:12px;font-weight:900}.tools-summary strong{color:var(--muted);font-size:11px;font-weight:750}
.tools-fields{display:flex;align-items:end;justify-content:flex-end;gap:9px;flex-wrap:wrap}.catalog-tools label{display:grid;gap:4px;min-width:172px;color:#8b304e;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.catalog-tools select{height:40px;padding:0 34px 0 11px;border:1px solid #d9cbd2;border-radius:10px;background:#fff;color:var(--ink);font-size:12px;font-weight:750;text-transform:none;letter-spacing:0}.catalog-tools button{height:40px;padding:0 13px;border:1px solid var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);font-size:12px;font-weight:850;cursor:pointer}.catalog-tools button:hover{background:var(--pink-soft)}
.paginacao{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:28px;font-size:13px;font-weight:800}
.paginacao button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:#fff;font-weight:800;cursor:pointer}
.paginacao button:not(:disabled):hover{border-color:var(--pink);color:var(--pink-dark)}
.paginacao button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:800px){.collection-hero{min-height:132px;padding:19px 145px 19px 18px;border-radius:20px}.collection-icon{flex-basis:48px;width:48px;height:48px;border-radius:15px}.collection-heading{gap:12px}.collection-heading h1{font-size:30px}.collection-heading p{font-size:12px}.collection-art{right:14px;width:112px;height:112px}.catalog-tools{display:grid;gap:12px}.tools-summary{display:flex;align-items:center;justify-content:space-between;gap:10px}.tools-summary strong{text-align:right}.tools-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:9px}.catalog-tools label{min-width:0}.catalog-tools button{grid-column:1/-1}}
@media(max-width:480px){.trilha{margin-bottom:9px}.collection-hero{min-height:112px;padding:16px 106px 16px 15px;border-radius:18px}.collection-heading{align-items:flex-start}.collection-icon{display:none}.collection-heading small{font-size:9px}.collection-heading h1{font-size:clamp(25px,8vw,30px)}.collection-heading p{margin-top:5px;line-height:1.35}.collection-art{right:10px;width:88px;height:88px;padding:5px}.collection-art::after{inset:5px}.catalog-tools{padding:12px;margin-bottom:18px}.tools-summary span{font-size:11px}.tools-summary strong{font-size:10px}.catalog-tools select{width:100%;height:39px}}
</style>
