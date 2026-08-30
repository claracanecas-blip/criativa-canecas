<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import PersonalizationPreview from '@/components/PersonalizationPreview.vue'
import { personalizationPolicy } from '@/data/site'
import type { IconName } from '@/types/catalog'

const passos = [
  { n: 1, titulo: 'Envie sua imagem', texto: 'Escolha a foto, logo ou desenho original com a melhor qualidade.' },
  { n: 2, titulo: 'Envie sua ideia',   texto: 'Foto, frase, logo ou desenho — pode mandar do jeito que tiver.' },
  { n: 3, titulo: 'Aprove a arte final', texto: 'Preparamos e confirmamos o mockup antes de imprimir.' },
  { n: 4, titulo: 'Escolha a entrega', texto: 'Combine retirada ou entrega local, ou receba pelos Correios.' },
]

const opcoes: Array<{ icone: IconName; nome: string; descricao: string; preco: string }> = [
  {
    icone: 'Coffee',
    nome: 'Caneca personalizada',
    descricao: 'Personalização com sua arte pronta, foto, frase ou logo em uma caneca de visual clássico.',
    preco: personalizationPolicy.mugPrice,
  },
]
const modelNames = opcoes.map((opcao) => opcao.nome)
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h1 class="flex items-center justify-center gap-2"><AppIcon name="Sparkles" :size="28" /> Caneca Personalizada</h1>
      <p>Você manda a ideia, a gente transforma em caneca</p>
    </div>

    <div class="passos">
      <div v-for="passo in passos" :key="passo.n" class="passo">
        <span class="numero">{{ passo.n }}</span>
        <strong>{{ passo.titulo }}</strong>
        <p>{{ passo.texto }}</p>
      </div>
    </div>

    <div class="section-title opcoes-titulo">
      <small>O que você está comprando</small>
      <h2>Caneca personalizada e valor</h2>
      <p>O valor corresponde à caneca pronta e personalizada. Não vendemos canecas sem estampa.</p>
    </div>

    <div class="opcoes">
      <article v-for="opcao in opcoes" :key="opcao.nome" class="opcao">
        <div class="opcao-cabecalho">
          <div class="icone"><AppIcon :name="opcao.icone" :size="28" /></div>
          <span class="inclusa">Estampa inclusa</span>
        </div>
        <h3>{{ opcao.nome }}</h3>
        <p>{{ opcao.descricao }}</p>
        <div class="opcao-preco">
          <small>Valor da caneca personalizada</small>
          <strong>{{ opcao.preco }}</strong>
        </div>
        <div class="taxa-arte">
          <div><span>Criação ou adaptação da arte</span><strong>+ {{ personalizationPolicy.artCreationFee }}</strong></div>
          <p>{{ personalizationPolicy.artCreationRule }}</p>
          <small>Total quando a criação ou adaptação for necessária: <strong>{{ personalizationPolicy.totalWithArtCreation }}</strong></small>
        </div>
      </article>
    </div>

    <PersonalizationPreview :models="modelNames" />

    <DeliveryOptions class="delivery" />
  </section>
</template>

<style scoped>
.passos{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.passo{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px 18px;box-shadow:0 7px 20px rgba(70,35,50,.05)}
.numero{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--pink-dark);color:#fff;font-weight:900;margin-bottom:12px}
.passo strong{display:block;margin-bottom:6px}
.passo p{margin:0;font-size:13px;color:var(--muted)}

.opcoes-titulo{margin-top:44px}.opcoes-titulo small{display:block;margin-bottom:5px;color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.opcoes-titulo p{max-width:720px;margin:8px auto 0;color:var(--muted);font-size:14px;line-height:1.55}
.opcoes{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;max-width:560px;margin:0 auto}
.opcao{display:flex;flex-direction:column;min-height:285px;background:#fff;border:1px solid #edc5d3;border-radius:18px;padding:20px;box-shadow:0 8px 24px rgba(70,35,50,.07)}
.opcao-cabecalho{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.opcao .icone{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:var(--pink-soft);color:var(--pink-dark)}.inclusa{padding:5px 8px;border-radius:999px;background:#e8f7ee;color:#08733c;font-size:10px;font-weight:900;letter-spacing:.02em;text-transform:uppercase}.opcao h3{margin:0 0 9px;font-size:17px;line-height:1.25}.opcao>p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}.opcao-preco{margin-top:auto;padding-top:18px;border-top:1px solid var(--line)}.opcao-preco small{display:block;margin-bottom:3px;color:var(--muted);font-size:10px;font-weight:750}.opcao-preco strong{color:#a12645;font-size:21px}
.taxa-arte{margin-top:13px;padding:12px;border:1px solid #efd2dc;border-radius:11px;background:#fff7fa}.taxa-arte>div{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#623746;font-size:11px;font-weight:850}.taxa-arte>div strong{flex:0 0 auto;color:#a12645;font-size:15px}.taxa-arte p{margin:6px 0 0;color:var(--muted);font-size:10px;line-height:1.45}
.taxa-arte small{display:block;margin-top:7px;color:#623746;font-size:10px;line-height:1.4}.taxa-arte small strong{color:#a12645}
.delivery{margin-top:28px}

@media(max-width:950px){
  .passos{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:700px){
  .passos{grid-template-columns:1fr}
}
</style>
