<script setup>
import { computed } from 'vue'
import { colecoes } from '@/data/colecoes'
import { produtosDaColecao } from '@/data/produtos'

const lista = computed(() =>
  colecoes.map((colecao) => ({
    ...colecao,
    total: produtosDaColecao(colecao.slug).length,
  })),
)
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h2>Todas as coleções</h2>
      <p>{{ colecoes.length }} temas para escolher a sua caneca</p>
    </div>

    <div class="colecoes-grid">
      <RouterLink
        v-for="colecao in lista"
        :key="colecao.slug"
        class="colecao-card"
        :to="`/colecao/${colecao.slug}`"
      >
        <div class="icone">{{ colecao.icone }}</div>
        <strong>{{ colecao.nome }}</strong>
        <span>{{ colecao.total ? `${colecao.total} modelos` : 'em breve' }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.colecoes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.colecao-card{padding:22px 14px;background:#fff;border:1px solid var(--line);border-radius:16px;text-align:center;box-shadow:0 7px 20px rgba(70,35,50,.05)}
.colecao-card:hover{border-color:#efacc3;transform:translateY(-2px)}
.colecao-card .icone{font-size:30px;margin-bottom:8px}
.colecao-card strong{display:block;font-size:14px;font-weight:850}
.colecao-card span{display:block;margin-top:4px;font-size:12px;color:var(--muted)}

@media(max-width:700px){
  .colecoes-grid{grid-template-columns:repeat(2,1fr)}
}
</style>
