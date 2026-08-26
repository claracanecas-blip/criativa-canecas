<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import { useCatalog } from '@/composables/useCatalog'
import { trackSearch } from '@/services/analytics'

const route = useRoute()
const catalog = useCatalog()
const termo = computed(() => String(route.query.q ?? ''))
const pagina = ref(1)
const POR_PAGINA = 20

const resultados = computed(() => catalog.buscarProdutos(termo.value))
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
watch(termo, () => { pagina.value = 1 })
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
      <p>{{ resultados.length }} produtos e {{ colecoesEncontradas.length }} coleções</p>
    </div>

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
      v-else-if="!colecoesEncontradas.length"
      icone="Search"
      titulo="Nada encontrado"
      texto="Não achamos nenhum modelo com esse termo. Conte o que você procura que a gente cria sob encomenda."
      :mensagem="`Olá! Estou procurando uma caneca de ${termo}.`"
    />
  </section>
</template>

<style scoped>
.sugestoes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:26px}
.chip{padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:800}
.chip:hover{border-color:#efacc3;color:var(--pink-dark)}
.paginacao{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:28px;font-size:13px;font-weight:800}
.paginacao button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:#fff;font-weight:800;cursor:pointer}
.paginacao button:not(:disabled):hover{border-color:var(--pink);color:var(--pink-dark)}
.paginacao button:disabled{opacity:.45;cursor:not-allowed}
</style>
