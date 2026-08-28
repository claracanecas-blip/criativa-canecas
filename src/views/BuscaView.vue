<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import { useCatalog } from '@/composables/useCatalog'
import { trackSearch } from '@/services/analytics'
import { filterAndSortProducts, type ProductSort } from '@/utils/catalogFilters'

const route = useRoute()
const catalog = useCatalog()
const termo = computed(() => String(route.query.q ?? ''))
const pagina = ref(1)
const POR_PAGINA = 20

const resultadosBase = computed(() => catalog.buscarProdutos(termo.value))
const colecaoAtiva = ref('')
const ordenacao = ref<ProductSort>('default')
const resultados = computed(() => filterAndSortProducts(resultadosBase.value, {
  collection: colecaoAtiva.value,
  sort: ordenacao.value,
}))
const colecoesDisponiveis = computed(() => {
  const slugs = new Set(resultadosBase.value.flatMap((product) => product.colecoes ?? [product.colecao]))
  return catalog.colecoes.value.filter((collection) => slugs.has(collection.slug))
})
const totalPaginas = computed(() => Math.max(1, Math.ceil(resultados.value.length / POR_PAGINA)))
const resultadosDaPagina = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA
  return resultados.value.slice(inicio, inicio + POR_PAGINA)
})

const colecoesEncontradas = computed(() => {
  const q = termo.value.trim().toLowerCase()
  if (!q) return []
  return catalog.colecoes.value.filter(
    (c) => c.nome.toLowerCase().includes(q) || c.slug.includes(q),
  )
})

const lastTrackedSearch = ref('')
watch(termo, () => {
  pagina.value = 1
  colecaoAtiva.value = ''
  ordenacao.value = 'default'
})
watch([colecaoAtiva, ordenacao], () => { pagina.value = 1 })
watch(
  () => [termo.value.trim().length, resultados.value.length + colecoesEncontradas.value.length, catalog.state.value] as const,
  ([queryLength, resultCount, state]) => {
    if (!queryLength || !['ready', 'fallback'].includes(state)) return
    const signature = `${queryLength}:${resultCount}`
    if (signature === lastTrackedSearch.value) return
    lastTrackedSearch.value = signature
    trackSearch(queryLength, resultCount)
  },
  { immediate: true },
)
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h1>Resultados para “{{ termo }}”</h1>
      <p>{{ resultadosBase.length }} produtos e {{ colecoesEncontradas.length }} coleções</p>
    </div>

    <div v-if="resultadosBase.length" class="catalog-tools" aria-label="Refinar resultados">
      <label v-if="colecoesDisponiveis.length > 1">Coleção
        <select v-model="colecaoAtiva" aria-label="Filtrar por coleção"><option value="">Todas as coleções</option><option v-for="colecao in colecoesDisponiveis" :key="colecao.slug" :value="colecao.slug">{{ colecao.nome }}</option></select>
      </label>
      <label>Ordenar
        <select v-model="ordenacao" aria-label="Ordenar resultados"><option value="default">Mais relevantes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome de A a Z</option></select>
      </label>
      <button v-if="colecaoAtiva || ordenacao !== 'default'" type="button" @click="colecaoAtiva = ''; ordenacao = 'default'">Limpar filtros</button>
    </div>
    <p v-if="resultadosBase.length" class="result-count" aria-live="polite">{{ resultados.length }} {{ resultados.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}</p>

    <div v-if="colecoesEncontradas.length" class="sugestoes">
      <RouterLink
        v-for="colecao in colecoesEncontradas"
        :key="colecao.slug"
        class="chip"
        :to="`/colecao/${colecao.slug}`"
      ><AppIcon :name="colecao.icone" :size="16" /> {{ colecao.nome }}</RouterLink>
    </div>

    <div v-if="resultados.length" class="grid">
      <ProdutoCard v-for="produto in resultadosDaPagina" :key="produto.id" :produto="produto" />
    </div>

    <nav v-if="totalPaginas > 1" class="paginacao" aria-label="Paginação dos resultados da busca">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button :disabled="pagina === totalPaginas" @click="pagina++">Próxima</button>
    </nav>

    <EstadoVazio
      v-if="!resultados.length && !colecoesEncontradas.length"
      icone="Search"
      :titulo="resultadosBase.length ? 'Nenhum produto neste filtro' : 'Nada encontrado'"
      :texto="resultadosBase.length ? 'Ajuste ou limpe os filtros para ver outros resultados.' : 'Não achamos nenhum modelo com esse termo. Conte o que você procura que a gente cria sob encomenda.'"
      :mensagem="`Olá! Estou procurando uma caneca de ${termo}.`"
    />
  </section>
</template>

<style scoped>
.sugestoes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:26px}
.chip{padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:800}
.chip:hover{border-color:#efacc3;color:var(--pink-dark)}
.catalog-tools{display:flex;align-items:end;justify-content:center;flex-wrap:wrap;gap:10px;margin:0 0 10px;padding:14px;border:1px solid var(--line);border-radius:15px;background:#fff7fa}.catalog-tools label{display:grid;gap:5px;min-width:210px;color:#8b304e;font-size:11px;font-weight:900;text-transform:uppercase}.catalog-tools select{height:42px;padding:0 34px 0 12px;border:1px solid #d9cbd2;border-radius:10px;background:#fff;color:var(--ink);font:inherit;text-transform:none}.catalog-tools button{height:42px;padding:0 14px;border:1px solid var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);font-weight:850;cursor:pointer}.result-count{text-align:center;margin:0 0 22px;color:var(--muted);font-size:12px;font-weight:800}
.paginacao{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:28px;font-size:13px;font-weight:800}
.paginacao button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:#fff;font-weight:800;cursor:pointer}
.paginacao button:not(:disabled):hover{border-color:var(--pink);color:var(--pink-dark)}
.paginacao button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:700px){.catalog-tools{display:grid;grid-template-columns:1fr}.catalog-tools label{min-width:0}}
</style>
