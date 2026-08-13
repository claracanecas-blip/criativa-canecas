<script setup lang="ts">
import { computed } from 'vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import { useCatalog } from '@/composables/useCatalog'
import { linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'

const catalog = useCatalog()

// campanha sazonal: enquanto não houver uma coleção própria,
// mostramos sugestões vindas de outras coleções do catálogo
const sugestoes = computed(() => [
  ...catalog.produtosDaColecao('pais'),
  ...catalog.produtosDaColecao('series').slice(0, 4),
])

const frases = [
  'Melhor pai do mundo',
  'Pai coruja desde sempre',
  'Herói fora dos quadrinhos',
  'Meu primeiro melhor amigo',
]
</script>

<template>
  <section class="faixa">
    <div class="container">
      <small>Campanha especial</small>
      <h1>Dia dos Pais</h1>
      <p>Uma caneca com a cara dele — com foto, frase ou o time do coração.</p>
      <a class="btn" :href="linkWhatsapp('Olá! Quero uma caneca para o Dia dos Pais.')" target="_blank" rel="noopener" @click="trackWhatsappClick('campaign')">
        Encomendar agora
      </a>
    </div>
  </section>

  <section class="section container">
    <div class="section-title">
      <h2>Sugestões para presentear</h2>
      <p>Modelos que costumam agradar</p>
    </div>

    <div v-if="sugestoes.length" class="grid">
      <ProdutoCard v-for="produto in sugestoes" :key="produto.id" :produto="produto" />
    </div>

    <EstadoVazio
      v-else
      icone="Shirt"
      titulo="Coleção sendo preparada"
      texto="Os modelos de Dia dos Pais estão a caminho. Enquanto isso, personalizamos a sua do zero."
      mensagem="Olá! Quero uma caneca para o Dia dos Pais."
    />

    <div class="frases">
      <h3>Frases prontas para estampar</h3>
      <div class="frases-lista">
        <span v-for="frase in frases" :key="frase">“{{ frase }}”</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faixa{background:linear-gradient(105deg,#3a2b33,#6b4453);color:#fff;text-align:center;padding:52px 0}
.faixa small{font-weight:950;letter-spacing:.12em;text-transform:uppercase;color:#ffc9dc}
.faixa h1{font-family:Georgia,serif;font-size:clamp(34px,4.6vw,54px);margin:8px 0 10px}
.faixa p{margin:0 auto 20px;max-width:520px;color:#f3e4ea}

.frases{margin-top:40px;text-align:center}
.frases h3{margin:0 0 14px;font-size:20px}
.frases-lista{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.frases-lista span{background:var(--pink-soft);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-size:13px;font-weight:750}
</style>
