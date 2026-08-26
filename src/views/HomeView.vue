<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { destaques } from '@/data/colecoes'
import { site } from '@/data/site'
import type { Collection, IconName } from '@/types/catalog'
import { useTestimonials } from '@/composables/useTestimonials'
import { Star } from '@lucide/vue'

const beneficios: Array<{ icone: IconName; titulo: string; texto: string }> = [
  { icone: 'Truck', titulo: 'Envio seguro',      texto: 'Seu pedido bem embalado' },
  { icone: 'CreditCard', titulo: 'Pagamento fácil',   texto: 'Combine pelo atendimento' },
  { icone: 'Gift', titulo: 'Presente criativo', texto: 'Para todas as ocasiões' },
  { icone: 'MessageCircle', titulo: 'Atendimento rápido', texto: 'Direto pelo WhatsApp' },
]

const banners = [
  {
    to: '/colecao/series',
    imagem: './img/breaking-bad-1.jpg',
    titulo: 'Coleção Séries',
    texto: 'Suas séries favoritas estampadas na caneca do café de todo dia.',
    acao: 'Ver coleção',
  },
  {
    to: '/personalizada',
    imagem: './img/black-mirror-2.jpg',
    titulo: 'Personalize do seu jeito',
    texto: 'Envie sua arte, foto ou frase e a gente transforma em caneca.',
    acao: 'Criar a minha',
  },
]

const catalog = useCatalog()
const atalhos = computed(() => destaques
  .map((slug) => catalog.colecoes.value.find((collection) => collection.slug === slug))
  .filter((collection): collection is Collection => collection !== undefined))

const colecoesDaVitrine = ['amizade', 'animes', 'pets', 'futebol', 'profissoes', 'divertidas', 'religiao', 'series']
const modelosEmDestaque = computed(() => {
  const candidatos = [
    ...catalog.produtos.value.filter((produto) => produto.destaque),
    ...colecoesDaVitrine.flatMap((slug) => catalog.produtosDaColecao(slug).slice(0, 1)),
  ]
  const vistos = new Set<string>()
  return candidatos.filter((produto) => {
    if (vistos.has(produto.id)) return false
    vistos.add(produto.id)
    return true
  }).slice(0, 8)
})
const { testimonials } = useTestimonials()
</script>

<template>
  <section class="hero">
    <div class="hero-box">
      <img class="hero-logo" :src="site.logo" alt="">
      <div class="hero-copy">
        <small>Criativa Canecas</small>
        <h1>Canecas <span>personalizadas</span><br>feitas para encantar</h1>
        <p>Escolha uma coleção, encontre seu modelo favorito e peça sua caneca direto pelo WhatsApp.</p>
        <RouterLink class="btn" to="/colecoes">Ver coleções</RouterLink>
      </div>
    </div>
  </section>

  <section class="benefits">
    <div class="container benefit-row">
      <div v-for="b in beneficios" :key="b.titulo" class="benefit">
        <div class="icon"><AppIcon :name="b.icone" :size="25" /></div>
        <div>
          <b>{{ b.titulo }}</b>
          <span>{{ b.texto }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="promo-grid">
      <RouterLink v-for="banner in banners" :key="banner.titulo" class="promo" :to="banner.to">
        <CatalogImage
          class="promo-media"
          :src="banner.imagem"
          :alt="banner.titulo"
          sizes="(max-width: 700px) calc(100vw - 32px), 48vw"
        />
        <div class="promo-copy">
          <h3>{{ banner.titulo }}</h3>
          <p>{{ banner.texto }}</p>
          <span>{{ banner.acao }}</span>
        </div>
      </RouterLink>
    </div>
  </section>

  <section class="quick">
    <div class="container">
      <div class="section-title">
        <h2>Categorias em destaque</h2>
        <p>Encontre a caneca certa para cada estilo</p>
      </div>
      <div class="quick-grid">
        <RouterLink
          v-for="colecao in atalhos"
          :key="colecao.slug"
          class="quick-card"
          :to="colecao.to ?? `/colecao/${colecao.slug}`"
        >
          <div><AppIcon :name="colecao.icone" :size="28" /></div>
          {{ colecao.nome }}
        </RouterLink>
      </div>
    </div>
  </section>

  <section v-if="modelosEmDestaque.length" class="section container">
    <div class="section-title">
      <h2>Modelos em destaque</h2>
      <p>Uma seleção especial de diferentes coleções</p>
    </div>
    <div class="grid">
      <ProdutoCard v-for="produto in modelosEmDestaque" :key="produto.id" :produto="produto" />
    </div>
    <p class="ver-mais">
      <RouterLink class="btn" to="/colecoes">Explorar todas as coleções</RouterLink>
    </p>
  </section>

  <section v-if="testimonials.length" class="section testimonials"><div class="container"><div class="section-title"><h2>Quem presenteia, recomenda</h2><p>Depoimentos publicados após moderação.</p></div><div class="testimonial-grid"><blockquote v-for="item in testimonials" :key="item.id"><div class="stars" :aria-label="`${item.rating} de 5 estrelas`"><Star v-for="star in item.rating" :key="star" :size="17" fill="currentColor" /></div><p>“{{ item.quote }}”</p><cite>{{ item.author_display_name }}</cite></blockquote></div></div></section>
</template>

<style scoped>
.hero{background:#fff}
.hero-box{height:365px;position:relative;overflow:hidden;background:
  radial-gradient(circle at 12% 25%,rgba(255,255,255,.95),transparent 22%),
  linear-gradient(105deg,#ffe5ee 0%,#fff7fa 52%,#ffd8e6 100%);
  border-bottom:1px solid var(--line)}
.hero-copy{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;text-align:center;width:min(760px,78%)}
.hero-copy small{color:var(--pink-dark);font-weight:950;letter-spacing:.12em;text-transform:uppercase}
.hero-copy h1{font-family:Georgia,serif;font-size:clamp(38px,4.8vw,64px);line-height:.98;margin:7px 0 10px;color:#38272e}
.hero-copy h1 span{color:var(--pink)}
.hero-copy p{color:#6a5a61;font-size:16px;margin:0 auto 18px;max-width:520px}
.hero-logo{position:absolute;left:50%;top:22px;transform:translateX(-50%);width:92px;height:92px;object-fit:contain;opacity:.16}

.benefits{border-bottom:1px solid var(--line);background:#fff}
.benefit-row{display:grid;grid-template-columns:repeat(4,1fr)}
.benefit{display:flex;justify-content:center;align-items:center;gap:11px;padding:13px 16px}
.benefit+.benefit{border-left:1px solid var(--line)}
.benefit .icon{display:flex;color:var(--pink)}
.benefit b{display:block;color:var(--pink-dark);font-size:13px}
.benefit span{display:block;color:var(--muted);font-size:11px}

.promo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.promo{min-height:220px;border-radius:22px;position:relative;overflow:hidden;box-shadow:var(--shadow);background:#eee;display:block}
.promo-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.promo:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(40,19,28,.78),rgba(40,19,28,.12))}
.promo-copy{position:absolute;left:22px;top:50%;transform:translateY(-50%);z-index:2;color:#fff;width:54%}
.promo-copy h3{font-size:26px;line-height:1.06;margin:0 0 8px}
.promo-copy p{font-size:13px;margin:0 0 13px;color:#fff4f7}
.promo-copy span{display:inline-block;background:#fff;color:var(--pink-dark);font-weight:900;padding:9px 16px;border-radius:999px}

.quick{background:#fff5f8;padding:38px 0}
.quick-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.quick-card{padding:18px 12px;background:#fff;border:1px solid var(--line);border-radius:16px;text-align:center;font-size:13px;font-weight:850;box-shadow:0 7px 20px rgba(70,35,50,.05)}
.quick-card:hover{border-color:#efacc3;transform:translateY(-2px)}
.quick-card div{display:flex;justify-content:center;color:var(--pink);margin-bottom:6px}

.ver-mais{text-align:center;margin-top:26px}
.testimonials{background:#fff7fa}.testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.testimonial-grid blockquote{margin:0;padding:22px;border:1px solid var(--line);border-radius:17px;background:#fff}.stars{display:flex;color:#a86800;gap:2px}.testimonial-grid p{line-height:1.6}.testimonial-grid cite{font-style:normal;color:var(--pink-dark);font-weight:850}

@media(max-width:950px){
  .hero-copy{width:78%}
  .quick-grid{grid-template-columns:repeat(3,1fr)}
  .testimonial-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:700px){
  .hero-box{height:440px}
  .hero-copy{width:88%}
  .benefit-row{grid-template-columns:1fr 1fr}
  .benefit:nth-child(3){border-left:0}
  .benefit:nth-child(n+3){border-top:1px solid var(--line)}
  .promo-grid{grid-template-columns:1fr}
  .promo-copy{width:70%}
  .quick-grid{grid-template-columns:repeat(2,1fr)}
  .testimonial-grid{grid-template-columns:1fr}
}
</style>
