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

const resultados = computed(() => catalog.buscarProdutos(termo.value))

const colecoesEncontradas = computed(() => {
  const q = termo.value.trim().toLowerCase()
  if (!q) return []
  return catalog.colecoes.value.filter(
    (c) => c.nome.toLowerCase().includes(q) || c.slug.includes(q),
  )
})

const lastTrackedSearch = ref('')
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
      <h2>Resultados para “{{ termo }}”</h2>
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
      <ProdutoCard v-for="produto in resultados" :key="produto.id" :produto="produto" />
    </div>

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
</style>
