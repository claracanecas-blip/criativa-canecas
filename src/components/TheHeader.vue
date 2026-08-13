<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown } from '@lucide/vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MegaMenu from '@/components/MegaMenu.vue'
import { menuPrincipal } from '@/data/colecoes'
import { site, linkWhatsapp } from '@/data/site'

const router = useRouter()
const termo = ref('')

function buscar() {
  const q = termo.value.trim()
  router.push(q ? { name: 'busca', query: { q } } : { name: 'colecoes' })
}
</script>

<template>
  <div class="notice">{{ site.aviso }}</div>

  <header class="header-main">
    <div class="container header-row">
      <RouterLink class="brand" to="/">
        <img :src="site.logo" alt="Criativa Canecas">
        <strong>Criativa<br>Canecas</strong>
      </RouterLink>

      <form class="search-wrap" @submit.prevent="buscar">
        <input v-model="termo" type="search" placeholder="Digite o que você procura" aria-label="Buscar">
        <button type="submit" aria-label="Buscar"><AppIcon name="Search" :size="19" /></button>
      </form>

      <div class="header-actions">
        <a class="head-link" :href="linkWhatsapp('Olá! Preciso de ajuda com um pedido.')" target="_blank" rel="noopener">
          <AppIcon name="MessageCircle" :size="21" />
          <span>Central de<br>Atendimento</span>
        </a>
        <a class="head-link order" :href="linkWhatsapp('Olá! Gostaria de fazer um pedido.')" target="_blank" rel="noopener">
          <AppIcon name="ShoppingBag" :size="20" />
          <span>Meu pedido</span>
        </a>
      </div>
    </div>
  </header>

  <nav class="navbar">
    <div class="container nav-row">
      <MegaMenu />
      <RouterLink
        v-for="item in menuPrincipal"
        :key="item.nome"
        class="nav-link"
        :class="{ special: item.destaque }"
        :to="item.to"
      >{{ item.nome }} <ChevronDown v-if="item.seta" :size="14" aria-hidden="true" /></RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.notice{background:linear-gradient(90deg,var(--pink-dark),var(--pink));color:#fff;text-align:center;padding:7px 12px;font-size:12px;font-weight:800}

.header-main{background:#fff;border-bottom:1px solid var(--line)}
.header-row{display:grid;grid-template-columns:220px 1fr auto;gap:22px;align-items:center;padding:13px 0}
.brand{display:flex;align-items:center;gap:10px}
.brand img{width:64px;height:64px;object-fit:contain;border-radius:50%}
.brand strong{font-family:Georgia,serif;font-size:23px;color:var(--pink-dark);line-height:1}
.search-wrap{position:relative}
.search-wrap input{width:100%;height:46px;border:1px solid #ded4d9;border-radius:999px;padding:0 52px 0 18px;outline:none;background:#fafafa}
.search-wrap input:focus{border-color:#ef9fbb;box-shadow:0 0 0 3px #ffe8f0}
.search-wrap button{position:absolute;right:5px;top:5px;width:36px;height:36px;border-radius:50%;border:0;background:var(--pink);color:#fff;cursor:pointer}
.header-actions{display:flex;gap:9px;align-items:center}
.head-link{display:flex;align-items:center;gap:8px;padding:10px 11px;border-radius:13px;font-size:13px;font-weight:800;white-space:nowrap}
.head-link:hover{background:var(--pink-soft)}
.order{background:var(--pink);color:#fff;border-radius:999px;padding:11px 15px}
.order:hover{background:var(--pink-dark)}

.navbar{background:#fff;border-bottom:1px solid var(--line);position:relative;z-index:50}
.nav-row{display:flex;align-items:center;gap:1px}
.nav-link{display:flex;align-items:center;gap:3px;padding:13px 15px;font-size:13px;font-weight:850;white-space:nowrap}
.nav-link:hover{color:var(--pink-dark)}
.special{background:var(--pink);color:#fff}
.special:hover{color:#fff;background:var(--pink-dark)}

@media(max-width:950px){
  .header-row{grid-template-columns:auto 1fr}
  .header-actions{grid-column:1/-1;justify-content:flex-end}
}
@media(max-width:700px){
  .header-row{grid-template-columns:1fr}
  .brand{justify-content:center}
  .header-actions{justify-content:center;flex-wrap:wrap}
  .nav-row{overflow-x:auto}
}
</style>
