<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, Save, Trash2 } from '@lucide/vue'
import { getSupabaseClient } from '@/services/supabase'
import type { Tables } from '@/types/database'

type Testimonial = Tables<'testimonials'>
const client = getSupabaseClient()
const testimonials = ref<Testimonial[]>([])
const message = ref('')
const errorMessage = ref('')
const form = ref({ id: 0, author_display_name: '', quote: '', rating: 5, status: 'draft', display_order: 0, photo_path: '', photo_consent_reference: '' })

async function reload() {
  const { data, error } = await client.from('testimonials').select('*').order('updated_at', { ascending: false })
  if (error) errorMessage.value = error.message
  else testimonials.value = data ?? []
}
function edit(item: Testimonial) { form.value = { id: item.id, author_display_name: item.author_display_name, quote: item.quote, rating: item.rating, status: item.status, display_order: item.display_order, photo_path: item.photo_path ?? '', photo_consent_reference: item.photo_consent_reference ?? '' } }
function reset() { form.value = { id: 0, author_display_name: '', quote: '', rating: 5, status: 'draft', display_order: testimonials.value.length, photo_path: '', photo_consent_reference: '' } }
async function save() {
  message.value = ''; errorMessage.value = ''
  if (form.value.photo_path && !form.value.photo_consent_reference.trim()) { errorMessage.value = 'Foto exige referência do consentimento registrado.'; return }
  const payload = { author_display_name: form.value.author_display_name.trim(), quote: form.value.quote.trim(), rating: form.value.rating, status: form.value.status, display_order: form.value.display_order, photo_path: form.value.photo_path.trim() || null, photo_consent_reference: form.value.photo_consent_reference.trim() || null }
  const query = form.value.id ? client.from('testimonials').update(payload).eq('id', form.value.id) : client.from('testimonials').insert(payload)
  const { error } = await query
  if (error) errorMessage.value = error.message
  else { message.value = 'Depoimento salvo.'; reset(); await reload() }
}
async function remove(item: Testimonial) { if (!confirm(`Excluir o depoimento de “${item.author_display_name}”?`)) return; const { error } = await client.from('testimonials').delete().eq('id', item.id); if (error) errorMessage.value = error.message; else await reload() }
onMounted(reload)
</script>

<template><section class="container admin"><RouterLink to="/admin" class="back"><ArrowLeft :size="17" /> Catálogo</RouterLink><h1>Depoimentos moderados</h1><p class="lead">Nada é publicado automaticamente. Use apenas nome de exibição autorizado; foto exige referência do consentimento.</p><p v-if="message" class="success">{{ message }}</p><p v-if="errorMessage" class="error">{{ errorMessage }}</p><form @submit.prevent="save"><label>Nome de exibição<input v-model="form.author_display_name" minlength="2" maxlength="60" required></label><label class="wide">Depoimento<textarea v-model="form.quote" minlength="10" maxlength="500" rows="4" required /></label><label>Avaliação<select v-model.number="form.rating"><option v-for="n in 5" :key="n" :value="n">{{ n }} de 5</option></select></label><label>Estado<select v-model="form.status"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label><label>Ordem<input v-model.number="form.display_order" type="number" min="0"></label><label>Caminho da foto (opcional)<input v-model="form.photo_path"></label><label class="wide">Referência do consentimento da foto<input v-model="form.photo_consent_reference" :required="Boolean(form.photo_path)"></label><div class="actions wide"><button type="button" @click="reset">Novo/limpar</button><button class="primary" type="submit"><Save :size="17" /> Salvar</button></div></form><div class="list"><article v-for="item in testimonials" :key="item.id"><button class="content" @click="edit(item)"><strong>{{ item.author_display_name }}</strong><span>{{ item.rating }}/5 · {{ item.status }}</span><p>{{ item.quote }}</p></button><button class="trash" :aria-label="`Excluir depoimento de ${item.author_display_name}`" @click="remove(item)"><Trash2 :size="18" /></button></article><p v-if="!testimonials.length">Nenhum depoimento cadastrado.</p></div></section></template>

<style scoped>.admin{padding:34px 0 60px}.back{display:inline-flex;gap:5px;align-items:center;color:var(--pink-dark);font-weight:850}.lead{color:var(--muted);max-width:700px}.success,.error{padding:10px;border-radius:8px}.success{background:#eaf9f1;color:#146c43}.error{background:#fff0f3;color:#91243d}form{display:grid;grid-template-columns:1fr 1fr;gap:13px;padding:20px;border:1px solid var(--line);border-radius:16px;background:#fff8fa}label{display:grid;gap:5px;font-size:12px;font-weight:850}input,textarea,select{padding:10px;border:1px solid var(--line);border-radius:8px;background:#fff}.wide{grid-column:1/-1}.actions{display:flex;justify-content:flex-end;gap:8px}.actions button{display:flex;align-items:center;gap:6px;padding:10px 15px;border:1px solid var(--line);border-radius:8px;background:#fff;font-weight:850}.actions .primary{background:var(--pink-dark);color:#fff}.list{margin-top:20px}.list article{display:flex;border-bottom:1px solid var(--line);padding:12px}.content{flex:1;text-align:left;border:0;background:transparent;cursor:pointer}.content span{display:block;color:var(--muted);font-size:12px}.content p{margin-bottom:0}.trash{border:0;background:transparent;color:#9a2949;cursor:pointer}@media(max-width:650px){form{grid-template-columns:1fr}.wide{grid-column:auto}}</style>
