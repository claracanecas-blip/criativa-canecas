<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { colecoes, menuLateral } from '@/data/colecoes'

const route = useRoute()
const aberto = ref(false)

// as coleções são distribuídas em 5 colunas, na ordem do catálogo
const COLUNAS = 5
const colunas = computed(() => {
  const porColuna = Math.ceil(colecoes.length / COLUNAS)
  return Array.from({ length: COLUNAS }, (_, i) =>
    colecoes.slice(i * porColuna, (i + 1) * porColuna),
  ).filter((coluna) => coluna.length)
})

function alternar(e) {
  // no desktop o hover já abre; o clique só responde no próprio gatilho
  if (window.innerWidth <= 700 || e.target === e.currentTarget) {
    aberto.value = !aberto.value
  }
}

watch(() => route.fullPath, () => { aberto.value = false })
</script>

<template>
  <div class="categories-trigger" :class="{ open: aberto }" @click="alternar">
    ☰ Todas as categorias ▾

    <div class="mega" @click.stop>
      <div class="mega-left">
        <RouterLink
          v-for="item in menuLateral"
          :key="item.nome"
          :to="item.to"
          :class="{ active: item.to === '/colecoes' }"
        >
          {{ item.nome }}<span v-if="item.seta">›</span>
        </RouterLink>
      </div>

      <div class="mega-main">
        <h3 class="mega-title">Coleção</h3>
        <div class="mega-grid">
          <div v-for="(coluna, i) in colunas" :key="i">
            <RouterLink
              v-for="colecao in coluna"
              :key="colecao.slug"
              :to="`/colecao/${colecao.slug}`"
            >{{ colecao.nome }}</RouterLink>
          </div>
        </div>
        <RouterLink class="mega-todas" to="/colecoes">Ver todas as coleções ›</RouterLink>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="aberto" class="mega-backdrop" @click="aberto = false" />
  </Teleport>
</template>

<style scoped>
.categories-trigger{position:relative;padding:13px 15px;font-size:13px;font-weight:850;cursor:pointer;white-space:nowrap}
.categories-trigger:hover{color:var(--pink-dark)}

.mega-backdrop{position:fixed;inset:0;background:rgba(22,17,20,.48);z-index:38}

.mega{display:none;position:absolute;top:100%;left:0;width:min(930px,92vw);background:#fff;border:1px solid var(--line);box-shadow:0 25px 55px rgba(40,25,32,.22);border-radius:0 0 8px 8px;z-index:60;overflow:hidden;color:var(--ink);cursor:default}
.categories-trigger:hover .mega,
.categories-trigger.open .mega{display:grid;grid-template-columns:205px 1fr}

.mega-left{background:#fff;border-right:1px solid #eee;padding:10px 0}
.mega-left a{display:flex;justify-content:space-between;align-items:center;padding:11px 22px;font-size:13px;font-weight:750}
.mega-left a:hover,.mega-left a.active{background:#fff0f5;color:var(--pink-dark)}

.mega-main{padding:18px 22px 20px;min-width:0}
.mega-title{font-size:20px;margin:0 0 12px;font-weight:800}
.mega-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:2px 26px;max-height:330px;overflow:auto;padding-right:4px}
.mega-grid a{display:block;padding:7px 0;font-size:13px;font-weight:750}
.mega-grid a:hover{color:var(--pink);transform:translateX(3px)}
.mega-todas{display:inline-block;margin-top:14px;font-size:13px;font-weight:850;color:var(--pink-dark)}

@media(max-width:950px){
  .mega-grid{grid-template-columns:repeat(4,1fr)}
}
@media(max-width:700px){
  .categories-trigger{position:static}
  .mega{position:fixed;left:3%;right:3%;top:170px;width:auto;max-height:67vh;overflow:auto;grid-template-columns:1fr}
  .categories-trigger:hover .mega{display:none}
  .categories-trigger.open .mega{display:grid}
  .mega-grid{grid-template-columns:repeat(2,1fr)}
  .mega-left{border-right:0;border-bottom:1px solid #eee}
}
</style>
