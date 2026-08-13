<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, ExternalLink, Pencil, Plus, Save, Trash2 } from '@lucide/vue'
import { informationIconNames, type InformationContentKind, type InformationContentStatus } from '@/data/informationContent'
import { getSupabaseClient } from '@/services/supabase'
import type { Tables } from '@/types/database'

type SiteContent = Tables<'site_content_sections'>
interface ContentForm {
  originalKey: string
  content_key: string
  kind: InformationContentKind
  title: string
  body: string
  icon_name: string
  status: InformationContentStatus
  display_order: number
}

const client = getSupabaseClient()
const sections = ref<SiteContent[]>([])
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const form = ref<ContentForm | null>(null)
const cards = computed(() => sections.value.filter((section) => section.kind === 'card'))
const faqs = computed(() => sections.value.filter((section) => section.kind === 'faq'))

function emptyForm(kind: InformationContentKind): ContentForm {
  return {
    originalKey: '',
    content_key: '',
    kind,
    title: '',
    body: '',
    icon_name: kind === 'card' ? 'Sparkles' : '',
    status: 'draft',
    display_order: kind === 'card' ? 50 : 150,
  }
}

function normalizeKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function edit(section: SiteContent) {
  form.value = {
    originalKey: section.content_key,
    content_key: section.content_key,
    kind: section.kind as InformationContentKind,
    title: section.title,
    body: section.body,
    icon_name: section.icon_name ?? '',
    status: section.status as InformationContentStatus,
    display_order: section.display_order,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateKind() {
  if (!form.value) return
  form.value.icon_name = form.value.kind === 'card' ? (form.value.icon_name || 'Sparkles') : ''
}

async function reload() {
  loading.value = true
  errorMessage.value = ''
  const { data, error } = await client.rpc('get_admin_site_content')
  if (error) errorMessage.value = error.message
  else sections.value = data ?? []
  loading.value = false
}

async function save() {
  if (!form.value) return
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    const contentKey = form.value.originalKey || normalizeKey(form.value.content_key || `${form.value.kind}_${form.value.title}`)
    if (!/^[a-z][a-z0-9_]{2,63}$/.test(contentKey)) throw new Error('Use uma chave com letras minúsculas, números e sublinhado.')
    const payload = {
      content_key: contentKey,
      kind: form.value.kind,
      title: form.value.title.trim(),
      body: form.value.body.trim(),
      icon_name: form.value.kind === 'card' ? form.value.icon_name : null,
      status: form.value.status,
      display_order: form.value.display_order,
    }
    const query = form.value.originalKey
      ? client.from('site_content_sections').update(payload).eq('content_key', form.value.originalKey)
      : client.from('site_content_sections').insert(payload)
    const { error } = await query
    if (error) throw error
    message.value = payload.status === 'published' ? 'Conteúdo salvo e publicado.' : 'Conteúdo salvo sem publicação.'
    form.value = null
    await reload()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao salvar o conteúdo.'
  } finally {
    saving.value = false
  }
}

async function remove(section: SiteContent) {
  if (!window.confirm(`Excluir permanentemente “${section.title}”? Para apenas ocultar, use o estado Arquivado.`)) return
  errorMessage.value = ''
  const { error } = await client.from('site_content_sections').delete().eq('content_key', section.content_key)
  if (error) errorMessage.value = error.message
  else {
    message.value = 'Conteúdo excluído.'
    if (form.value?.originalKey === section.content_key) form.value = null
    await reload()
  }
}

onMounted(reload)
</script>

<template>
  <section class="container admin">
    <div class="top-links"><RouterLink to="/admin" class="back"><ArrowLeft :size="17" /> Catálogo</RouterLink><a href="/informacoes" target="_blank"><ExternalLink :size="17" /> Ver página pública</a></div>
    <h1>Informações e FAQ</h1>
    <p class="lead">Edite textos institucionais sem alterar código. Publique somente condições comerciais oficiais; rascunhos e arquivados não aparecem no site.</p>
    <p v-if="message" class="feedback success" role="status">{{ message }}</p>
    <p v-if="errorMessage" class="feedback error" role="alert">{{ errorMessage }}</p>

    <form v-if="form" class="editor" @submit.prevent="save">
      <div class="form-heading"><h2>{{ form.originalKey ? 'Editar conteúdo' : 'Novo conteúdo' }}</h2><button type="button" @click="form = null">Cancelar</button></div>
      <div class="grid">
        <label>Tipo<select v-model="form.kind" :disabled="Boolean(form.originalKey)" @change="updateKind"><option value="card">Cartão informativo</option><option value="faq">Pergunta frequente</option></select></label>
        <label>Chave<input v-model="form.content_key" :disabled="Boolean(form.originalKey)" maxlength="64" placeholder="Gerada pelo título se ficar vazia"></label>
        <label class="wide">{{ form.kind === 'faq' ? 'Pergunta' : 'Título' }}<input v-model="form.title" minlength="2" maxlength="120" required></label>
        <label class="wide">Resposta/conteúdo<textarea v-model="form.body" minlength="10" maxlength="1000" rows="5" required /></label>
        <label v-if="form.kind === 'card'">Ícone<select v-model="form.icon_name"><option v-for="icon in informationIconNames" :key="icon" :value="icon">{{ icon }}</option></select></label>
        <label>Estado<select v-model="form.status"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
        <label>Ordem<input v-model.number="form.display_order" type="number" min="0" required></label>
      </div>
      <div class="form-actions"><button class="primary" type="submit" :disabled="saving"><Save :size="17" /> {{ saving ? 'Salvando…' : 'Salvar' }}</button></div>
    </form>

    <div class="new-actions"><button type="button" @click="form = emptyForm('card')"><Plus :size="17" /> Novo cartão</button><button type="button" @click="form = emptyForm('faq')"><Plus :size="17" /> Nova pergunta</button></div>
    <p v-if="loading" class="empty" role="status">Carregando conteúdo…</p>
    <template v-else>
      <section class="content-group"><h2>Cartões informativos <span>{{ cards.length }}</span></h2><article v-for="section in cards" :key="section.content_key"><div><strong>{{ section.title }}</strong><small>{{ section.status }} · ordem {{ section.display_order }}</small><p>{{ section.body }}</p></div><div class="row-actions"><button :aria-label="`Editar ${section.title}`" @click="edit(section)"><Pencil :size="17" /></button><button class="danger" :aria-label="`Excluir ${section.title}`" @click="remove(section)"><Trash2 :size="17" /></button></div></article><p v-if="!cards.length" class="empty">Nenhum cartão cadastrado.</p></section>
      <section class="content-group"><h2>Perguntas frequentes <span>{{ faqs.length }}</span></h2><article v-for="section in faqs" :key="section.content_key"><div><strong>{{ section.title }}</strong><small>{{ section.status }} · ordem {{ section.display_order }}</small><p>{{ section.body }}</p></div><div class="row-actions"><button :aria-label="`Editar ${section.title}`" @click="edit(section)"><Pencil :size="17" /></button><button class="danger" :aria-label="`Excluir ${section.title}`" @click="remove(section)"><Trash2 :size="17" /></button></div></article><p v-if="!faqs.length" class="empty">Nenhuma pergunta cadastrada.</p></section>
    </template>
  </section>
</template>

<style scoped>
.admin{padding:34px 0 60px}.top-links{display:flex;justify-content:space-between}.top-links a{display:inline-flex;gap:5px;align-items:center;color:var(--pink-dark);font-weight:850}.lead{color:var(--muted);max-width:760px}.feedback{padding:11px 14px;border-radius:10px}.success{background:#eaf9f1;color:#146c43}.error{background:#fff0f3;color:#91243d}.editor{border:1px solid var(--line);border-radius:16px;padding:20px;background:#fff8fa;margin:24px 0}.form-heading{display:flex;justify-content:space-between;align-items:center}.form-heading button{border:0;background:transparent;color:var(--pink-dark);font-weight:850;cursor:pointer}.grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.grid label{display:grid;gap:5px;font-size:12px;font-weight:850}.grid input,.grid textarea,.grid select{width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fff}.wide{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;margin-top:14px}.form-actions button,.new-actions button{display:inline-flex;align-items:center;gap:6px;padding:10px 15px;border:1px solid var(--line);border-radius:8px;background:#fff;font-weight:850;cursor:pointer}.form-actions .primary{background:var(--pink-dark);color:#fff}.new-actions{display:flex;gap:8px;margin:22px 0}.content-group{margin-top:28px}.content-group h2{display:flex;align-items:center;gap:8px;font-size:21px}.content-group h2 span{padding:2px 8px;border-radius:999px;background:var(--pink-soft);font-size:12px}.content-group article{display:flex;justify-content:space-between;gap:16px;padding:16px 4px;border-bottom:1px solid var(--line)}.content-group strong,.content-group small{display:block}.content-group small{margin-top:3px;color:var(--muted);font-size:11px;text-transform:uppercase}.content-group p{margin-bottom:0;color:var(--muted);line-height:1.5}.row-actions{display:flex;gap:6px;flex-shrink:0}.row-actions button{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer}.row-actions .danger{color:#a12645}.empty{text-align:center;color:var(--muted);padding:20px}@media(max-width:650px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}.new-actions{flex-direction:column}.content-group article{align-items:flex-start}.top-links{gap:12px;flex-wrap:wrap}}
</style>
