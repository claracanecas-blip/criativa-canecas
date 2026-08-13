<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import ProdutoCard from '@/components/ProdutoCard.vue'
import EstadoVazio from '@/components/EstadoVazio.vue'
import { produtosDaColecao } from '@/data/produtos'

const itens = produtosDaColecao('com-fotos')

const dicas = [
  'Use fotos nítidas, de preferência na horizontal.',
  'Evite imagens salvas de status ou muito comprimidas.',
  'Dá para juntar várias fotos em uma colagem — é só pedir.',
  'Frases e datas podem entrar junto com a foto, sem custo extra.',
]
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h2 class="flex items-center justify-center gap-2"><AppIcon name="Camera" :size="28" /> Canecas com Foto</h2>
      <p>Uma lembrança que acompanha o café de todo dia</p>
    </div>

    <div v-if="itens.length" class="grid">
      <ProdutoCard v-for="produto in itens" :key="produto.id" :produto="produto" />
    </div>

    <EstadoVazio
      v-else
      icone="Camera"
      titulo="Envie a sua foto"
      texto="Cada caneca com foto é feita sob encomenda. Mande a imagem pelo WhatsApp e devolvemos a prévia antes de imprimir."
      mensagem="Olá! Quero uma caneca com foto."
    />

    <div class="dicas">
      <h3>Dicas para a foto ficar perfeita</h3>
      <ul>
        <li v-for="dica in dicas" :key="dica">{{ dica }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.dicas{margin-top:40px;background:var(--pink-soft);border:1px solid var(--line);border-radius:18px;padding:24px}
.dicas h3{margin:0 0 12px;font-size:19px}
.dicas ul{margin:0;padding-left:20px;color:var(--muted)}
.dicas li{margin:7px 0;font-size:14px}
</style>
