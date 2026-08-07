<script setup>
import { computed, ref, watch } from 'vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import NaoEncontradoView from '@/views/NaoEncontradoView.vue'
import { buscarColecao } from '@/data/colecoes'
import { produtosDaColecao } from '@/data/produtos'

const props = defineProps({
  slug: { type: String, required: true },
})

const colecao = computed(() => buscarColecao(props.slug))
const itens = computed(() => produtosDaColecao(props.slug))

// filtro por tema (ex.: Arrow, Breaking Bad), montado a partir dos produtos
const temas = computed(() => [...new Set(itens.value.map((p) => p.nome))].sort())
const temaAtivo = ref('')

const visiveis = computed(() =>
  temaAtivo.value ? itens.value.filter((p) => p.nome === temaAtivo.value) : itens.value,
)

watch(
  () => props.slug,
  (slug) => {
    temaAtivo.value = ''
    const nome = buscarColecao(slug)?.nome
    document.title = nome ? `${nome} | Criativa Canecas` : 'Criativa Canecas'
  },
  { immediate: true },
)
</script>

<template>
  <NaoEncontradoView v-if="!colecao" />

  <section v-else class="section container">
    <nav class="trilha">
      <RouterLink to="/">Início</RouterLink> ›
      <RouterLink to="/colecoes">Coleções</RouterLink> ›
      <span>{{ colecao.nome }}</span>
    </nav>

    <div class="section-title">
      <h2>{{ colecao.icone }} {{ colecao.nome }}</h2>
      <p v-if="itens.length">{{ itens.length }} modelos disponíveis</p>
    </div>

    <div v-if="temas.length > 1" class="filtros">
      <button class="chip" :class="{ ativo: !temaAtivo }" @click="temaAtivo = ''">Todos</button>
      <button
        v-for="tema in temas"
        :key="tema"
        class="chip"
        :class="{ ativo: temaAtivo === tema }"
        @click="temaAtivo = tema"
      >{{ tema }}</button>
    </div>

    <div v-if="visiveis.length" class="grid">
      <ProdutoCard v-for="produto in visiveis" :key="produto.id" :produto="produto" />
    </div>

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
.trilha{font-size:12px;color:var(--muted);margin-bottom:14px}
.trilha a:hover{color:var(--pink-dark)}

.filtros{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:24px}
.chip{padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:800;cursor:pointer}
.chip:hover{border-color:#efacc3}
.chip.ativo{background:var(--pink);border-color:var(--pink);color:#fff}
</style>
