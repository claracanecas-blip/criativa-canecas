<script setup>
import ProdutoCard from '@/components/ProdutoCard.vue'
import { colecoes, destaques } from '@/data/colecoes'
import { produtosDaColecao } from '@/data/produtos'
import { site } from '@/data/site'

const beneficios = [
  { icone: '🚚', titulo: 'Envio seguro',      texto: 'Seu pedido bem embalado' },
  { icone: '💳', titulo: 'Pagamento fácil',   texto: 'Combine pelo atendimento' },
  { icone: '🎁', titulo: 'Presente criativo', texto: 'Para todas as ocasiões' },
  { icone: '💬', titulo: 'Atendimento rápido', texto: 'Direto pelo WhatsApp' },
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

const atalhos = destaques
  .map((slug) => colecoes.find((c) => c.slug === slug))
  .filter(Boolean)

const novidades = produtosDaColecao('series').slice(0, 8)
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
        <div class="icon">{{ b.icone }}</div>
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
        <img :src="banner.imagem" alt="">
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
          :to="`/colecao/${colecao.slug}`"
        >
          <div>{{ colecao.icone }}</div>
          {{ colecao.nome }}
        </RouterLink>
      </div>
    </div>
  </section>

  <section v-if="novidades.length" class="section container">
    <div class="section-title">
      <h2>Modelos em destaque</h2>
      <p>Alguns favoritos da coleção de séries</p>
    </div>
    <div class="grid">
      <ProdutoCard v-for="produto in novidades" :key="produto.id" :produto="produto" />
    </div>
    <p class="ver-mais">
      <RouterLink class="btn" to="/colecao/series">Ver toda a coleção</RouterLink>
    </p>
  </section>
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
.benefit .icon{font-size:25px}
.benefit b{display:block;color:var(--pink-dark);font-size:13px}
.benefit span{display:block;color:var(--muted);font-size:11px}

.promo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.promo{min-height:220px;border-radius:22px;position:relative;overflow:hidden;box-shadow:var(--shadow);background:#eee;display:block}
.promo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.promo:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(40,19,28,.78),rgba(40,19,28,.12))}
.promo-copy{position:absolute;left:22px;top:50%;transform:translateY(-50%);z-index:2;color:#fff;width:54%}
.promo-copy h3{font-size:26px;line-height:1.06;margin:0 0 8px}
.promo-copy p{font-size:13px;margin:0 0 13px;color:#fff4f7}
.promo-copy span{display:inline-block;background:#fff;color:var(--pink-dark);font-weight:900;padding:9px 16px;border-radius:999px}

.quick{background:#fff5f8;padding:38px 0}
.quick-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.quick-card{padding:18px 12px;background:#fff;border:1px solid var(--line);border-radius:16px;text-align:center;font-size:13px;font-weight:850;box-shadow:0 7px 20px rgba(70,35,50,.05)}
.quick-card:hover{border-color:#efacc3;transform:translateY(-2px)}
.quick-card div{font-size:28px;margin-bottom:6px}

.ver-mais{text-align:center;margin-top:26px}

@media(max-width:950px){
  .hero-copy{width:78%}
  .quick-grid{grid-template-columns:repeat(3,1fr)}
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
}
</style>
