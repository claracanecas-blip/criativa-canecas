<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import PersonalizationPreview from '@/components/PersonalizationPreview.vue'
import type { IconName } from '@/types/catalog'

const passos = [
  { n: 1, titulo: 'Escolha o modelo', texto: 'Caneca branca, mágica (muda com o calor) ou colorida.' },
  { n: 2, titulo: 'Envie sua arte',   texto: 'Foto, frase, logo ou desenho — pode mandar do jeito que tiver.' },
  { n: 3, titulo: 'Aprove a prévia',  texto: 'Enviamos uma simulação antes de imprimir.' },
  { n: 4, titulo: 'Escolha a entrega', texto: 'Combine retirada ou entrega local, ou receba pelos Correios.' },
]

const opcoes: Array<{ icone: IconName; nome: string; preco: string }> = [
  { icone: 'Coffee', nome: 'Caneca branca',  preco: 'R$ 39,90' },
  { icone: 'WandSparkles', nome: 'Caneca mágica',  preco: 'R$ 54,90' },
  { icone: 'Palette', nome: 'Caneca colorida', preco: 'R$ 44,90' },
  { icone: 'Camera', nome: 'Com foto',        preco: 'R$ 42,90' },
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
      <h2>Modelos e valores</h2>
    </div>

    <div class="opcoes">
      <div v-for="opcao in opcoes" :key="opcao.nome" class="opcao">
        <div class="icone"><AppIcon :name="opcao.icone" :size="30" /></div>
        <strong>{{ opcao.nome }}</strong>
        <span>{{ opcao.preco }}</span>
      </div>
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

.opcoes-titulo{margin-top:44px}
.opcoes{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.opcao{background:var(--pink-soft);border:1px solid var(--line);border-radius:16px;padding:20px;text-align:center}
.opcao .icone{display:flex;justify-content:center;color:var(--pink);margin-bottom:8px}
.opcao span{display:block;margin-top:6px;color:#a12645;font-weight:900;font-size:18px}
.delivery{margin-top:28px}

@media(max-width:950px){
  .passos,.opcoes{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:700px){
  .passos,.opcoes{grid-template-columns:1fr}
}
</style>
