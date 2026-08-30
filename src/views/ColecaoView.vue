<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronRight } from '@lucide/vue'
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

    <div class="section-title">
      <h1 class="flex items-center justify-center gap-2"><AppIcon :name="colecao.icone" :size="28" /> {{ colecao.nome }}</h1>
      <p v-if="itens.length">{{ itens.length }} modelos disponíveis</p>
    </div>

    <div v-if="itens.length" class="catalog-tools" aria-label="Filtros do catálogo">
      <label v-if="temas.length > 1">Tema
        <select v-model="temaAtivo" aria-label="Filtrar por tema"><option value="">Todos os temas</option><option v-for="tema in temas" :key="tema" :value="tema">{{ tema }}</option></select>
      </label>
      <label v-if="possuiPrecosDiferentes">Preço
        <select v-model="faixaPreco" aria-label="Faixa de preço"><option value="all">Todos os preços</option><option value="under-40">Até R$ 39,99</option><option value="40-50">R$ 40 a R$ 49,99</option><option value="over-50">R$ 50 ou mais</option></select>
      </label>
      <label>Ordenar
        <select v-model="ordenacao" aria-label="Ordenar produtos"><option value="default">Destaques</option><option v-if="possuiPrecosDiferentes" value="price-asc">Menor preço</option><option v-if="possuiPrecosDiferentes" value="price-desc">Maior preço</option><option value="name">Nome de A a Z</option></select>
      </label>
      <button v-if="temaAtivo || faixaPreco !== 'all' || ordenacao !== 'default'" type="button" @click="clearFilters">Limpar filtros</button>
    </div>
    <p v-if="itens.length" class="result-count" aria-live="polite">{{ visiveis.length }} {{ visiveis.length === 1 ? 'modelo encontrado' : 'modelos encontrados' }}</p>

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
.trilha{display:flex;align-items:center;gap:3px;font-size:12px;color:var(--muted);margin-bottom:14px}
.trilha a:hover{color:var(--pink-dark)}

.catalog-tools{display:flex;align-items:end;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;padding:16px;border:1px solid var(--line);border-radius:16px;background:#fff7fa}.catalog-tools label{display:grid;gap:5px;min-width:180px;color:#8b304e;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.catalog-tools select{height:42px;padding:0 34px 0 12px;border:1px solid #d9cbd2;border-radius:10px;background:#fff;color:var(--ink);font:inherit;text-transform:none;letter-spacing:0}.catalog-tools button{height:42px;padding:0 14px;border:1px solid var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);font-weight:850;cursor:pointer}.result-count{text-align:center;margin:0 0 22px;color:var(--muted);font-size:12px;font-weight:800}
.paginacao{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:28px;font-size:13px;font-weight:800}
.paginacao button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:#fff;font-weight:800;cursor:pointer}
.paginacao button:not(:disabled):hover{border-color:var(--pink);color:var(--pink-dark)}
.paginacao button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:700px){.catalog-tools{display:grid;grid-template-columns:1fr 1fr;align-items:end}.catalog-tools label{min-width:0}.catalog-tools label:first-child{grid-column:1/-1}.catalog-tools button{grid-column:1/-1}}
</style>
