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
const temaAtivo = ref<string>('')
const pagina = ref(1)
const POR_PAGINA = 20

const visiveis = computed(() =>
  temaAtivo.value ? itens.value.filter((p) => (p.tema ?? p.nome) === temaAtivo.value) : itens.value,
)
const totalPaginas = computed(() => Math.max(1, Math.ceil(visiveis.value.length / POR_PAGINA)))
const itensDaPagina = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA
  return visiveis.value.slice(inicio, inicio + POR_PAGINA)
})

function selecionarTema(tema: string) {
  temaAtivo.value = tema
  pagina.value = 1
}

watch(
  () => [props.slug, colecao.value?.nome] as const,
  ([slug, nome]) => {
    temaAtivo.value = ''
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

    <div v-if="temas.length > 1" class="filtros">
      <button class="chip" :class="{ ativo: !temaAtivo }" @click="selecionarTema('')">Todos</button>
      <button
        v-for="tema in temas"
        :key="tema"
        class="chip"
        :class="{ ativo: temaAtivo === tema }"
        @click="selecionarTema(tema)"
      >{{ tema }}</button>
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
      v-else
      :icone="colecao.icone"
      titulo="Coleção em breve"
      :texto="`Ainda estamos preparando os modelos de ${colecao.nome}. Fale com a gente que criamos a sua sob encomenda.`"
      :mensagem="`Olá! Quero uma caneca da coleção ${colecao.nome}.`"
    />
  </section>
</template>

<style scoped>
.trilha{display:flex;align-items:center;gap:3px;font-size:12px;color:var(--muted);margin-bottom:14px}
.trilha a:hover{color:var(--pink-dark)}

.filtros{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:24px}
.chip{padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:800;cursor:pointer}
.chip:hover{border-color:#efacc3}
.chip.ativo{background:var(--pink-dark);border-color:var(--pink-dark);color:#fff}
.paginacao{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:28px;font-size:13px;font-weight:800}
.paginacao button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:#fff;font-weight:800;cursor:pointer}
.paginacao button:not(:disabled):hover{border-color:var(--pink);color:var(--pink-dark)}
.paginacao button:disabled{opacity:.45;cursor:not-allowed}
</style>
