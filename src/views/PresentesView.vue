<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalog } from '@/composables/useCatalog'
import { linkWhatsapp } from '@/data/site'

const catalog = useCatalog()

// ocasiões de presente, cada uma apontando para uma coleção do catálogo
const ocasioes = [
  { slug: 'aniversario',  titulo: 'Aniversário' },
  { slug: 'casais',       titulo: 'Namorados' },
  { slug: 'amizade',      titulo: 'Amigo secreto' },
  { slug: 'familia',      titulo: 'Dia das Mães e dos Pais' },
  { slug: 'profissoes',   titulo: 'Colegas de trabalho' },
  { slug: 'motivacional', titulo: 'Só para animar o dia' },
]

const cards = computed(() => ocasioes
  .map((ocasiao) => {
    const colecao = catalog.colecoes.value.find((collection) => collection.slug === ocasiao.slug)
    return colecao && {
      ...ocasiao,
      icone: colecao.icone,
      nome: colecao.nome,
      total: catalog.produtosDaColecao(colecao.slug).length,
    }
  })
  .filter((card) => card !== undefined))
</script>

<template>
  <section class="section container">
    <div class="section-title">
      <h2 class="flex items-center justify-center gap-2"><AppIcon name="Gift" :size="28" /> Presentes</h2>
      <p>Escolha pela ocasião — a gente ajuda a acertar</p>
    </div>

    <div class="ocasioes">
      <RouterLink
        v-for="card in cards"
        :key="card.slug"
        class="ocasiao"
        :to="`/colecao/${card.slug}`"
      >
        <div class="icone"><AppIcon :name="card.icone" :size="32" /></div>
        <strong>{{ card.titulo }}</strong>
        <span>Coleção {{ card.nome }}</span>
      </RouterLink>
    </div>

    <div class="kit">
      <h3>Kit presente</h3>
      <p>Caneca + caixa personalizada + cartão escrito à mão. Combine tudo pelo atendimento.</p>
      <a class="btn" :href="linkWhatsapp('Olá! Quero montar um kit presente.')" target="_blank" rel="noopener">
        Montar meu kit
      </a>
    </div>
  </section>
</template>

<style scoped>
.ocasioes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.ocasiao{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;text-align:center;box-shadow:0 7px 20px rgba(70,35,50,.05)}
.ocasiao:hover{border-color:#efacc3;transform:translateY(-2px)}
.ocasiao .icone{display:flex;justify-content:center;color:var(--pink);margin-bottom:10px}
.ocasiao strong{display:block;font-size:16px}
.ocasiao span{display:block;margin-top:5px;font-size:12px;color:var(--muted)}

.kit{margin-top:40px;text-align:center;background:linear-gradient(135deg,var(--pink),var(--pink-dark));color:#fff;border-radius:22px;padding:34px 24px}
.kit h3{margin:0 0 8px;font-size:26px}
.kit p{margin:0 0 18px;color:#fff2f6}
.kit .btn{background:#fff;color:var(--pink-dark)}
.kit .btn:hover{background:#ffe8f0}

@media(max-width:950px){ .ocasioes{grid-template-columns:repeat(2,1fr)} }
@media(max-width:700px){ .ocasioes{grid-template-columns:1fr} }
</style>
