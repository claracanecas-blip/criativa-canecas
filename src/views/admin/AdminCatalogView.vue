<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ExternalLink, LogOut, PackagePlus, Pencil, RefreshCw, Save, Trash2, X } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useCatalog } from '@/composables/useCatalog'
import { currentAdmin, signOutAdmin } from '@/services/adminAuth'
import {
  deleteCollection,
  deleteProduct,
  loadAdminCatalog,
  saveCollection,
  saveProduct,
  type AdminCatalog,
  type CollectionForm,
  type ProductForm,
} from '@/services/adminCatalog'
import { getSupabaseClient } from '@/services/supabase'
import { normalizeCatalogSlug, validateImageCandidate } from '@/utils/adminImages'

const router = useRouter()
const publicCatalog = useCatalog()
const client = getSupabaseClient()
const catalog = ref<AdminCatalog>({ collections: [], products: [] })
const activeTab = ref<'products' | 'collections'>('products')
const search = ref('')
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const adminEmail = ref('')
const productForm = ref<ProductForm | null>(null)
const collectionForm = ref<CollectionForm | null>(null)
const imageFile = ref<File | null>(null)
const imageInputKey = ref(0)

const iconNames = [
  'BriefcaseBusiness', 'Cake', 'Camera', 'Church', 'Clapperboard', 'Coffee', 'Dog',
  'Dumbbell', 'Gamepad2', 'Handshake', 'Heart', 'Palette', 'Smile', 'Sparkles', 'Tv',
] as const

const filteredProducts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')
  if (!query) return catalog.value.products
  return catalog.value.products.filter((product) =>
    `${product.name} ${product.sku} ${product.slug} ${product.theme}`.toLocaleLowerCase('pt-BR').includes(query),
  )
})

const filteredCollections = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')
  if (!query) return catalog.value.collections
  return catalog.value.collections.filter((collection) =>
    `${collection.name} ${collection.slug}`.toLocaleLowerCase('pt-BR').includes(query),
  )
})

async function reload() {
  loading.value = true
  errorMessage.value = ''
  try {
    catalog.value = await loadAdminCatalog(client)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar o painel.'
  } finally {
    loading.value = false
  }
}

function newProduct() {
  productForm.value = {
    id: '', slug: '', sku: '', name: '', theme: '', description: '', price: 39.9,
    status: 'draft', is_featured: false, display_order: 0, seo_title: '',
    seo_description: '', collectionIds: [], existingImagePath: null,
  }
  imageFile.value = null
  imageInputKey.value++
}

function editProduct(product: AdminCatalog['products'][number]) {
  productForm.value = {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    theme: product.theme,
    description: product.description,
    price: Number(product.price),
    status: product.status as ProductForm['status'],
    is_featured: product.is_featured,
    display_order: product.display_order,
    seo_title: product.seo_title ?? '',
    seo_description: product.seo_description ?? '',
    collectionIds: [...product.collectionIds],
    existingImagePath: product.imagePath,
  }
  imageFile.value = null
  imageInputKey.value++
}

function deriveProductIdentity() {
  if (!productForm.value || productForm.value.id) return
  productForm.value.slug = normalizeCatalogSlug(productForm.value.slug || productForm.value.name)
  productForm.value.id = productForm.value.slug
  if (!productForm.value.sku) productForm.value.sku = `CC-${productForm.value.slug.toUpperCase()}`
}

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (!file) {
    imageFile.value = null
    return
  }
  const validationError = validateImageCandidate(file)
  if (validationError) {
    errorMessage.value = validationError
    imageFile.value = null
    imageInputKey.value++
    return
  }
  errorMessage.value = ''
  imageFile.value = file
}

async function submitProduct() {
  if (!productForm.value) return
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    deriveProductIdentity()
    if (!productForm.value.slug || !productForm.value.id) throw new Error('Informe um nome e um slug válidos.')
    await saveProduct(client, productForm.value, imageFile.value)
    message.value = `Produto “${productForm.value.name}” salvo.`
    productForm.value = null
    await Promise.all([reload(), publicCatalog.refresh()])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao salvar o produto.'
  } finally {
    saving.value = false
  }
}

async function removeProduct(product: AdminCatalog['products'][number]) {
  if (!window.confirm(`Excluir permanentemente “${product.name}”? As imagens no Storage serão preservadas para evitar perda acidental.`)) return
  saving.value = true
  errorMessage.value = ''
  try {
    await deleteProduct(client, product.id)
    message.value = `Produto “${product.name}” excluído; arquivos de imagem preservados.`
    await Promise.all([reload(), publicCatalog.refresh()])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao excluir o produto.'
  } finally {
    saving.value = false
  }
}

function newCollection() {
  collectionForm.value = {
    slug: '', name: '', description: '', icon_name: 'Sparkles', display_order: catalog.value.collections.length,
    is_published: false, is_listed: false, seo_title: '', seo_description: '',
  }
}

function editCollection(collection: AdminCatalog['collections'][number]) {
  collectionForm.value = {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    icon_name: collection.icon_name,
    display_order: collection.display_order,
    is_published: collection.is_published,
    is_listed: collection.is_listed,
    seo_title: collection.seo_title ?? '',
    seo_description: collection.seo_description ?? '',
  }
}

async function submitCollection() {
  if (!collectionForm.value) return
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    if (!collectionForm.value.id) collectionForm.value.slug = normalizeCatalogSlug(collectionForm.value.slug || collectionForm.value.name)
    if (!collectionForm.value.slug) throw new Error('Informe um nome e um slug válidos.')
    await saveCollection(client, collectionForm.value)
    message.value = `Coleção “${collectionForm.value.name}” salva.`
    collectionForm.value = null
    await Promise.all([reload(), publicCatalog.refresh()])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao salvar a coleção.'
  } finally {
    saving.value = false
  }
}

async function removeCollection(collection: AdminCatalog['collections'][number]) {
  if (!window.confirm(`Excluir a coleção “${collection.name}”? A ação só será permitida se ela estiver vazia.`)) return
  saving.value = true
  errorMessage.value = ''
  try {
    await deleteCollection(client, collection.id)
    message.value = `Coleção “${collection.name}” excluída.`
    await Promise.all([reload(), publicCatalog.refresh()])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao excluir a coleção.'
  } finally {
    saving.value = false
  }
}

async function logout() {
  await signOutAdmin()
  await router.replace('/admin/login')
}

onMounted(async () => {
  const admin = await currentAdmin()
  adminEmail.value = admin?.user.email ?? ''
  await reload()
})
</script>

<template>
  <section class="admin-shell container">
    <header class="admin-heading">
      <div><small>Área protegida</small><h1>Catálogo</h1><p>{{ adminEmail }}</p></div>
      <button class="secondary-button" type="button" @click="logout"><LogOut :size="17" /> Sair</button>
    </header>

    <p v-if="message" class="feedback success" role="status">{{ message }}</p>
    <p v-if="errorMessage" class="feedback error" role="alert">{{ errorMessage }}</p>

    <nav class="tabs" aria-label="Seções administrativas">
      <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'; collectionForm = null">Produtos <span>{{ catalog.products.length }}</span></button>
      <button :class="{ active: activeTab === 'collections' }" @click="activeTab = 'collections'; productForm = null">Coleções <span>{{ catalog.collections.length }}</span></button>
    </nav>

    <form v-if="productForm" class="editor" @submit.prevent="submitProduct">
      <div class="editor-title"><div><small>{{ productForm.existingImagePath || productForm.id ? 'Editar produto' : 'Novo produto' }}</small><h2>{{ productForm.name || 'Produto sem nome' }}</h2></div><button type="button" class="icon-button" aria-label="Fechar" @click="productForm = null"><X /></button></div>
      <div class="form-grid">
        <label>Nome<input v-model="productForm.name" required @blur="deriveProductIdentity"></label>
        <label>Slug<input v-model="productForm.slug" required :disabled="Boolean(productForm.id)"></label>
        <label>SKU<input v-model="productForm.sku" required></label>
        <label>Tema<input v-model="productForm.theme" required></label>
        <label>Preço (R$)<input v-model.number="productForm.price" type="number" min="0" step="0.01" required></label>
        <label>Estado<select v-model="productForm.status"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
        <label>Ordem<input v-model.number="productForm.display_order" type="number" min="0" required></label>
        <label class="checkbox"><input v-model="productForm.is_featured" type="checkbox"> Produto em destaque</label>
        <label class="wide">Descrição<textarea v-model="productForm.description" rows="3" required /></label>
        <fieldset class="wide"><legend>Coleções</legend><div class="check-grid"><label v-for="collection in catalog.collections" :key="collection.id" class="checkbox"><input v-model="productForm.collectionIds" type="checkbox" :value="collection.id"> {{ collection.name }}</label></div></fieldset>
        <label>SEO — título<input v-model="productForm.seo_title"></label>
        <label>SEO — descrição<input v-model="productForm.seo_description"></label>
        <label class="wide">Imagem JPEG, PNG ou WebP (até 10 MB; mínimo 640 × 640)<input :key="imageInputKey" type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage"><small v-if="productForm.existingImagePath">Imagem atual: {{ productForm.existingImagePath }}</small><small v-if="imageFile">Nova imagem: {{ imageFile.name }}</small></label>
      </div>
      <div class="editor-actions"><button class="secondary-button" type="button" @click="productForm = null">Cancelar</button><button class="primary-button" type="submit" :disabled="saving"><Save :size="17" /> {{ saving ? 'Salvando…' : 'Salvar produto' }}</button></div>
    </form>

    <form v-if="collectionForm" class="editor" @submit.prevent="submitCollection">
      <div class="editor-title"><div><small>{{ collectionForm.id ? 'Editar coleção' : 'Nova coleção' }}</small><h2>{{ collectionForm.name || 'Coleção sem nome' }}</h2></div><button type="button" class="icon-button" aria-label="Fechar" @click="collectionForm = null"><X /></button></div>
      <div class="form-grid">
        <label>Nome<input v-model="collectionForm.name" required></label>
        <label>Slug<input v-model="collectionForm.slug" required :disabled="Boolean(collectionForm.id)"></label>
        <label>Ícone<select v-model="collectionForm.icon_name"><option v-for="icon in iconNames" :key="icon" :value="icon">{{ icon }}</option></select></label>
        <label>Ordem<input v-model.number="collectionForm.display_order" type="number" min="0" required></label>
        <label class="checkbox"><input v-model="collectionForm.is_published" type="checkbox"> Publicada por URL</label>
        <label class="checkbox"><input v-model="collectionForm.is_listed" type="checkbox"> Listada na navegação</label>
        <label class="wide">Descrição<textarea v-model="collectionForm.description" rows="3" /></label>
        <label>SEO — título<input v-model="collectionForm.seo_title"></label>
        <label>SEO — descrição<input v-model="collectionForm.seo_description"></label>
      </div>
      <div class="editor-actions"><button class="secondary-button" type="button" @click="collectionForm = null">Cancelar</button><button class="primary-button" type="submit" :disabled="saving"><Save :size="17" /> {{ saving ? 'Salvando…' : 'Salvar coleção' }}</button></div>
    </form>

    <div class="toolbar">
      <input v-model="search" type="search" :placeholder="activeTab === 'products' ? 'Buscar produto, SKU ou tema' : 'Buscar coleção'">
      <button class="secondary-button" type="button" :disabled="loading" @click="reload"><RefreshCw :size="17" /> Atualizar</button>
      <button class="primary-button" type="button" @click="activeTab === 'products' ? newProduct() : newCollection()"><PackagePlus :size="17" /> Novo</button>
    </div>

    <div v-if="loading" class="panel-state" role="status">Carregando dados administrativos…</div>
    <div v-else-if="activeTab === 'products'" class="table-wrap">
      <table><thead><tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Estado</th><th>Coleções</th><th>Ações</th></tr></thead><tbody>
        <tr v-for="product in filteredProducts" :key="product.id"><td><strong>{{ product.name }}</strong><small>{{ product.slug }}</small></td><td>{{ product.sku }}</td><td>{{ Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td><td><span class="status" :class="product.status">{{ product.status }}</span></td><td>{{ product.collectionIds.length }}</td><td class="actions"><a v-if="product.status === 'published'" :href="`/colecao/${product.collectionIds[0] ?? ''}`" target="_blank" aria-label="Abrir no site"><ExternalLink :size="17" /></a><button aria-label="Editar" @click="editProduct(product)"><Pencil :size="17" /></button><button class="danger" aria-label="Excluir" @click="removeProduct(product)"><Trash2 :size="17" /></button></td></tr>
      </tbody></table><p v-if="!filteredProducts.length" class="panel-state">Nenhum produto encontrado.</p>
    </div>
    <div v-else class="table-wrap">
      <table><thead><tr><th>Coleção</th><th>Slug</th><th>Ordem</th><th>Publicação</th><th>Ações</th></tr></thead><tbody>
        <tr v-for="collection in filteredCollections" :key="collection.id"><td><strong>{{ collection.name }}</strong></td><td>{{ collection.slug }}</td><td>{{ collection.display_order }}</td><td>{{ collection.is_published ? 'Publicada' : 'Rascunho' }} · {{ collection.is_listed ? 'Listada' : 'Oculta' }}</td><td class="actions"><a v-if="collection.is_published" :href="`/colecao/${collection.slug}`" target="_blank" aria-label="Abrir no site"><ExternalLink :size="17" /></a><button aria-label="Editar" @click="editCollection(collection)"><Pencil :size="17" /></button><button class="danger" aria-label="Excluir" @click="removeCollection(collection)"><Trash2 :size="17" /></button></td></tr>
      </tbody></table><p v-if="!filteredCollections.length" class="panel-state">Nenhuma coleção encontrada.</p>
    </div>
  </section>
</template>

<style scoped>
.admin-shell{padding-block:30px 60px}.admin-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.admin-heading small,.editor-title small{color:var(--pink-dark);font-weight:900;text-transform:uppercase;letter-spacing:.08em}.admin-heading h1{margin:2px 0;font-size:34px}.admin-heading p{margin:0;color:var(--muted);font-size:13px}
.tabs{display:flex;gap:8px;border-bottom:1px solid var(--line);margin-bottom:20px}.tabs button{border:0;border-bottom:3px solid transparent;background:transparent;padding:12px 18px;font-weight:900;cursor:pointer}.tabs button.active{color:var(--pink-dark);border-color:var(--pink)}.tabs span{background:var(--pink-soft);border-radius:999px;padding:2px 7px;margin-left:4px;font-size:11px}
.feedback{padding:11px 14px;border-radius:10px;font-size:13px;font-weight:750}.feedback.success{background:#eaf9f1;color:#146c43}.feedback.error{background:#fff0f3;color:#91243d}
.toolbar{display:flex;gap:10px;margin:18px 0}.toolbar>input{flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 13px}.primary-button,.secondary-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;padding:10px 15px;font-weight:850;cursor:pointer}.primary-button{border:1px solid var(--pink);background:var(--pink);color:#fff}.secondary-button{border:1px solid var(--line);background:#fff;color:var(--ink)}button:disabled{opacity:.55;cursor:not-allowed}
.editor{border:1px solid var(--line);border-radius:18px;background:#fff8fa;padding:22px;margin-bottom:22px}.editor-title{display:flex;justify-content:space-between;align-items:flex-start}.editor-title h2{margin:3px 0 18px}.icon-button{border:0;background:transparent;color:var(--muted);cursor:pointer}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.form-grid>label{display:grid;gap:6px;font-size:12px;font-weight:850}.form-grid input:not([type=checkbox]),.form-grid select,.form-grid textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:10px;background:#fff}.form-grid input:focus,.form-grid select:focus,.form-grid textarea:focus{outline:2px solid #f5a8c1;outline-offset:1px}.wide{grid-column:1/-1}.checkbox{display:flex!important;align-items:center;gap:7px}.checkbox input{accent-color:var(--pink)}fieldset{border:1px solid var(--line);border-radius:10px;padding:12px}legend{font-size:12px;font-weight:850}.check-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.editor-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}
.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid #f0e7eb;white-space:nowrap}th{background:#fff7fa;font-size:11px;text-transform:uppercase;letter-spacing:.04em}td strong,td small{display:block}td small{color:var(--muted);margin-top:3px}.actions{display:flex;gap:5px}.actions a,.actions button{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer}.actions .danger{color:#b12748}.status{display:inline-block;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:850;background:#f1edf0}.status.published{color:#146c43;background:#eaf9f1}.status.archived{color:#725c63}.status.draft{color:#855f00;background:#fff7d6}.panel-state{text-align:center;padding:32px;color:var(--muted)}
@media(max-width:700px){.admin-heading{align-items:flex-start}.toolbar{flex-wrap:wrap}.toolbar>input{flex-basis:100%}.form-grid{grid-template-columns:1fr}.wide{grid-column:auto}.check-grid{grid-template-columns:1fr 1fr}.editor{padding:16px}.editor-actions{flex-direction:column-reverse}.editor-actions button{width:100%}}
</style>
