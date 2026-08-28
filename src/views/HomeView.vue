<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { destaques } from '@/data/colecoes'
import type { Collection, IconName } from '@/types/catalog'
import { useTestimonials } from '@/composables/useTestimonials'
import { Star } from '@lucide/vue'

const beneficios: Array<{ icone: IconName; titulo: string; texto: string }> = [
  { icone: 'Coffee', titulo: 'Caneca pronta', texto: 'Personalização inclusa' },
  { icone: 'WandSparkles', titulo: 'Arte aprovada', texto: 'Antes da produção' },
  { icone: 'MessageCircle', titulo: 'Atendimento direto', texto: 'Pelo WhatsApp' },
  { icone: 'Truck', titulo: 'Entrega combinada', texto: 'Local ou pelos Correios' },
]

const banners = [
  {
    to: '/presentes',
    imagem: './img/pets-01.png',
    titulo: 'Presentes com significado',
    texto: 'Encontre um modelo que combine com a pessoa e com a ocasião.',
    acao: 'Escolher presente',
  },
  {
    to: '/personalizada',
    imagem: './img/aniversario-01.jpg',
    titulo: 'Sua ideia vira presente',
    texto: 'Envie sua foto, frase ou arte e aprove a prévia antes da produção.',
    acao: 'Personalizar a minha',
  },
]

const passos: Array<{ icone: IconName; numero: string; titulo: string; texto: string }> = [
  { icone: 'Image', numero: '01', titulo: 'Escolha ou envie sua ideia', texto: 'Use um modelo do catálogo ou conte como deseja personalizar.' },
  { icone: 'WandSparkles', numero: '02', titulo: 'Aprove a prévia', texto: 'Você confere a simulação antes de a caneca entrar em produção.' },
  { icone: 'Truck', numero: '03', titulo: 'Combine como receber', texto: 'Retire ou receba em Araranguá, ou solicite envio pelos Correios.' },
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
const imagensDeColecao: Partial<Record<string, string>> = {
  personalizada: './img/aniversario-01.jpg',
}
function imagemDaColecao(collection: Collection): string | undefined {
  return imagensDeColecao[collection.slug] ?? catalog.produtosDaColecao(collection.slug)[0]?.imagem
}
const { testimonials } = useTestimonials()
</script>

<template>
  <section class="hero">
    <div class="hero-details" aria-hidden="true">
      <span class="detail-spark detail-spark-one">✦</span>
      <span class="detail-spark detail-spark-two">✦</span>
      <span class="detail-dots" />
      <span class="detail-line" />
    </div>
    <div class="hero-box container">
      <div class="hero-copy">
        <small>Canecas prontas e personalizadas</small>
        <h1>Canecas <span>personalizadas</span><br>feitas para encantar</h1>
        <p>Escolha um modelo ou envie sua ideia. Você aprova a prévia e combina todos os detalhes direto pelo WhatsApp.</p>
        <div class="hero-actions">
          <RouterLink class="btn" to="/colecoes">Ver modelos</RouterLink>
          <RouterLink class="btn secondary" to="/personalizada">Criar minha caneca</RouterLink>
        </div>
        <span class="hero-local"><AppIcon name="Heart" :size="16" /> Atendimento local em Araranguá</span>
      </div>

      <div class="hero-showcase" aria-label="Exemplos de canecas disponíveis">
        <RouterLink class="hero-product hero-product-main" to="/produto/aniversario-01" aria-label="Ver modelo Aniversário 01">
          <CatalogImage
            src="./img/aniversario-01.jpg"
            alt="Caneca de aniversário personalizada"
            sizes="(max-width: 700px) 205px, 285px"
            loading="eager"
            fetchpriority="high"
          />
        </RouterLink>
        <RouterLink class="hero-product hero-product-top" to="/produto/pets-01" aria-label="Ver modelo Pets 01">
          <CatalogImage src="./img/pets-01.png" alt="Caneca com tema de pets" sizes="(max-width: 700px) 130px, 180px" loading="eager" />
        </RouterLink>
        <RouterLink class="hero-product hero-product-bottom" to="/produto/amizade-43" aria-label="Ver modelo Amizade 43">
          <CatalogImage src="./img/amizade-43.png" alt="Caneca com tema de amizade" sizes="(max-width: 700px) 130px, 180px" loading="eager" />
        </RouterLink>
        <span class="hero-price">Modelos prontos <strong>R$ 39,90</strong><small>frete não incluso</small></span>
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
          <div class="quick-media">
            <CatalogImage
              v-if="imagemDaColecao(colecao)"
              :src="imagemDaColecao(colecao)!"
              :alt="`Exemplo da coleção ${colecao.nome}`"
              sizes="(max-width: 700px) 45vw, 190px"
            />
          </div>
          <span class="quick-label"><AppIcon :name="colecao.icone" :size="20" /> {{ colecao.nome }}</span>
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="section container editorial-section">
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

  <section class="process-section section">
    <div class="container">
      <div class="section-title">
        <small>Do seu jeito, com clareza</small>
        <h2>Da ideia à caneca em três passos</h2>
        <p>Um atendimento simples para você saber o que acontece antes da produção.</p>
      </div>
      <div class="process-grid">
        <article v-for="passo in passos" :key="passo.numero">
          <span class="process-icon"><AppIcon :name="passo.icone" :size="25" /></span>
          <small>{{ passo.numero }}</small>
          <h3>{{ passo.titulo }}</h3>
          <p>{{ passo.texto }}</p>
        </article>
      </div>
      <p class="process-action"><RouterLink class="btn" to="/personalizada">Experimentar uma personalização</RouterLink></p>
    </div>
  </section>

  <section class="delivery-section section container">
    <DeliveryOptions />
  </section>

  <section v-if="testimonials.length" class="section testimonials"><div class="container"><div class="section-title"><h2>Quem presenteia, recomenda</h2><p>Depoimentos publicados após moderação.</p></div><div class="testimonial-grid"><blockquote v-for="item in testimonials" :key="item.id"><div class="stars" :aria-label="`${item.rating} de 5 estrelas`"><Star v-for="star in item.rating" :key="star" :size="17" fill="currentColor" /></div><p>“{{ item.quote }}”</p><cite>{{ item.author_display_name }}</cite></blockquote></div></div></section>
</template>

<style scoped>
.hero{position:relative;overflow:hidden;border-bottom:1px solid var(--line);background:
  radial-gradient(circle at 10% 18%,#fff 0 8%,transparent 30%),
  linear-gradient(115deg,#fff7fa 0%,#ffe8f0 56%,#ffd3e2 100%)}
.hero-details{position:absolute;inset:0;overflow:hidden;pointer-events:none}.detail-spark{position:absolute;z-index:1;color:#d93d75;font-family:Georgia,serif;line-height:1;opacity:.26}.detail-spark-one{left:52%;top:13%;font-size:26px;transform:rotate(12deg)}.detail-spark-two{right:5%;bottom:13%;font-size:18px;transform:rotate(-16deg)}.detail-dots{position:absolute;right:1%;top:10%;width:170px;height:145px;background-image:radial-gradient(rgba(190,48,98,.2) 1.4px,transparent 1.4px);background-size:15px 15px;mask-image:linear-gradient(135deg,transparent 5%,#000 55%,transparent 95%)}.detail-line{position:absolute;left:43%;bottom:8%;width:240px;height:80px;border-top:1px solid rgba(190,48,98,.18);border-radius:50%;transform:rotate(-8deg)}
.hero-box{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(430px,.96fr);align-items:center;gap:30px;min-height:470px;padding-top:34px;padding-bottom:34px}
.hero-box:before,.hero-box:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(201,54,104,.13)}
.hero-box:before{width:290px;height:290px;right:-110px;top:-130px}.hero-box:after{width:92px;height:92px;left:-55px;bottom:-45px}
.hero-copy{position:relative;z-index:3;max-width:650px}
.hero-copy small{color:var(--pink-dark);font-weight:950;letter-spacing:.12em;text-transform:uppercase}
.hero-copy h1{font-family:Georgia,serif;font-size:clamp(43px,4.7vw,65px);line-height:.98;margin:10px 0 16px;color:#38272e}
.hero-copy h1 span{color:var(--pink)}
.hero-copy p{color:#5f5057;font-size:16px;line-height:1.6;margin:0 0 22px;max-width:570px}
.hero-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.hero-actions .secondary{border:1px solid var(--pink-dark);background:#fff;color:var(--pink-dark)}.hero-actions .secondary:hover{background:var(--pink-soft)}
.hero-local{display:flex;align-items:center;gap:6px;margin-top:17px;color:#7a5362;font-size:12px;font-weight:850}.hero-local :deep(svg){color:var(--pink-dark)}
.hero-showcase{position:relative;z-index:2;width:100%;height:380px}
.hero-product{position:absolute;display:block;overflow:hidden;border:6px solid rgba(255,255,255,.95);border-radius:25px;background:#fff;box-shadow:0 22px 50px rgba(73,35,50,.17);transition:transform .2s ease,box-shadow .2s ease}.hero-product:hover{z-index:4;box-shadow:0 26px 55px rgba(73,35,50,.24)}.hero-product :deep(img),.hero-product :deep(.catalog-image-fallback){display:block;width:100%;height:100%;object-fit:cover}.hero-product-main{left:0;top:34px;width:285px;height:285px;transform:rotate(-4deg)}.hero-product-main:hover{transform:rotate(-2deg) translateY(-5px)}.hero-product-top{right:7px;top:0;width:180px;height:180px;transform:rotate(5deg)}.hero-product-top:hover{transform:rotate(3deg) translateY(-5px)}.hero-product-bottom{right:18px;bottom:8px;width:180px;height:180px;transform:rotate(-2deg)}.hero-product-bottom:hover{transform:translateY(-5px)}
.hero-price{position:absolute;left:42px;bottom:8px;z-index:5;display:grid;padding:10px 14px;border:1px solid #f1bfd1;border-radius:14px;background:rgba(255,255,255,.96);box-shadow:0 8px 22px rgba(73,35,50,.12);color:#6d535e;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}.hero-price strong{color:var(--pink-dark);font-size:19px;line-height:1.15;letter-spacing:0}.hero-price small{font-size:9px;font-weight:700;text-transform:none;letter-spacing:0}

.benefits{border-bottom:1px solid var(--line);background:#fff}
.benefit-row{display:grid;grid-template-columns:repeat(4,1fr)}
.benefit{display:flex;justify-content:center;align-items:center;gap:11px;padding:13px 16px}
.benefit+.benefit{border-left:1px solid var(--line)}
.benefit .icon{display:flex;color:var(--pink)}
.benefit b{display:block;color:var(--pink-dark);font-size:13px}
.benefit span{display:block;color:var(--muted);font-size:11px}
.delivery-section{padding-top:46px}

.promo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.promo{min-height:245px;border-radius:22px;position:relative;overflow:hidden;box-shadow:var(--shadow);background:#eee;display:block}
.promo-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.promo:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(45,22,31,.86),rgba(45,22,31,.12))}
.promo-copy{position:absolute;left:22px;top:50%;transform:translateY(-50%);z-index:2;color:#fff;width:54%}
.promo-copy h3{font-size:26px;line-height:1.06;margin:0 0 8px}
.promo-copy p{font-size:13px;margin:0 0 13px;color:#fff4f7}
.promo-copy span{display:inline-block;background:#fff;color:var(--pink-dark);font-weight:900;padding:9px 16px;border-radius:999px}
.editorial-section{padding-top:46px;padding-bottom:26px}

.quick{background:#fff5f8;padding:44px 0}
.quick-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.quick-card{overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:17px;text-align:center;font-size:13px;font-weight:850;box-shadow:0 7px 20px rgba(70,35,50,.06)}
.quick-card:hover{border-color:#efacc3;transform:translateY(-2px)}
.quick-media{height:112px;overflow:hidden;background:#f7edf1}.quick-media :deep(img),.quick-media :deep(.catalog-image-fallback){display:block;width:100%;height:100%;object-fit:cover;transition:transform .25s ease}.quick-card:hover .quick-media :deep(img){transform:scale(1.04)}
.quick-label{display:flex;align-items:center;justify-content:center;gap:6px;min-height:56px;padding:11px 8px}.quick-label :deep(svg){color:var(--pink)}

.ver-mais{text-align:center;margin-top:26px}
.process-section{background:linear-gradient(135deg,#fff6f9,#fff)}.process-section .section-title>small{display:block;margin-bottom:6px;color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.process-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.process-grid article{position:relative;padding:24px;border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:0 8px 25px rgba(70,35,50,.06)}.process-grid article>small{position:absolute;right:20px;top:18px;color:var(--pink-dark);font-size:25px;font-weight:950}.process-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:16px;border-radius:15px;background:var(--pink-soft);color:var(--pink-dark)}.process-grid h3{margin:0 0 7px;font-size:18px}.process-grid p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.process-action{text-align:center;margin:24px 0 0}
.testimonials{background:#fff7fa}.testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.testimonial-grid blockquote{margin:0;padding:22px;border:1px solid var(--line);border-radius:17px;background:#fff}.stars{display:flex;color:#a86800;gap:2px}.testimonial-grid p{line-height:1.6}.testimonial-grid cite{font-style:normal;color:var(--pink-dark);font-weight:850}

@media(max-width:950px){
  .hero-box{grid-template-columns:minmax(0,1fr) 400px;gap:20px}.hero-product-main{width:250px;height:250px}.hero-product-top,.hero-product-bottom{width:155px;height:155px}.hero-showcase{height:340px}
  .quick-grid{grid-template-columns:repeat(3,1fr)}
  .testimonial-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:700px){
  .detail-spark-one{left:7%;top:9%;font-size:20px}.detail-spark-two{right:7%;bottom:10%}.detail-dots{right:-55px;top:35%;opacity:.75}.detail-line{left:-70px;bottom:20%;width:210px}
  .hero-box{grid-template-columns:1fr;gap:20px;min-height:0;padding-top:38px;padding-bottom:28px}.hero-copy{text-align:center}.hero-copy h1{font-size:42px}.hero-copy p{font-size:14px;margin-left:auto;margin-right:auto}.hero-actions{justify-content:center}.hero-local{justify-content:center}.hero-showcase{height:270px;max-width:350px;margin:0 auto}.hero-product{border-width:4px;border-radius:18px}.hero-product-main{left:3px;top:18px;width:205px;height:205px}.hero-product-top{right:4px;width:130px;height:130px}.hero-product-bottom{right:10px;bottom:2px;width:130px;height:130px}.hero-price{left:28px;bottom:0;padding:8px 11px}.hero-price strong{font-size:16px}
  .benefit-row{grid-template-columns:1fr 1fr}
  .benefit:nth-child(3){border-left:0}
  .benefit:nth-child(n+3){border-top:1px solid var(--line)}
  .promo-grid{grid-template-columns:1fr}
  .promo{min-height:235px}.promo-copy{width:72%}
  .quick-grid{grid-template-columns:repeat(2,1fr)}
  .quick-media{height:125px}
  .process-grid{grid-template-columns:1fr}.process-grid article{padding:20px}
  .testimonial-grid{grid-template-columns:1fr}
}
</style>
