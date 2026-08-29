<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ImagePlus, MessageCircle, ShieldCheck, Trash2 } from '@lucide/vue'
import Mug3DPreview from '@/components/Mug3DPreview.vue'
import { deliveryPolicy, linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'
import { validateImageCandidate } from '@/utils/adminImages'

const props = defineProps<{ models: string[] }>()

const selectedModel = ref(props.models[0] ?? 'Caneca personalizada')
const phrase = ref('')
const notes = ref('')
const imageUrl = ref('')
const imageName = ref('')
const imageScale = ref(100)
const imageX = ref(0)
const imageY = ref(0)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement>()

const whatsapp = computed(() => {
  const lines = [
    'Olá! Quero criar uma caneca personalizada.',
    `Modelo escolhido: ${selectedModel.value}.`,
  ]
  if (phrase.value.trim()) lines.push(`Texto ou frase: ${phrase.value.trim()}`)
  if (imageName.value) lines.push(`Tenho a imagem “${imageName.value}” e vou enviá-la nesta conversa.`)
  if (notes.value.trim()) lines.push(`Observações: ${notes.value.trim()}`)
  lines.push('A prévia do site é apenas uma simulação; quero aprovar a arte final antes da produção.')
  lines.push(deliveryPolicy.contactPrompt)
  return linkWhatsapp(lines.join('\n'))
})

function releaseImage() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = ''
  imageName.value = ''
  imageScale.value = 100
  imageX.value = 0
  imageY.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

function selectImage(event: Event) {
  errorMessage.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const validationError = validateImageCandidate(file)
  if (validationError) {
    errorMessage.value = validationError
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  releaseImage()
  imageUrl.value = URL.createObjectURL(file)
  imageName.value = file.name
}

onBeforeUnmount(releaseImage)
</script>

<template>
  <section class="personalization-preview" aria-labelledby="preview-title">
    <header>
      <small>Experimente sua ideia</small>
      <h2 id="preview-title">Monte sua prévia em 3D</h2>
      <p>Escolha o modelo, envie uma imagem, ajuste a estampa e gire a caneca. Nada é enviado ou armazenado pelo site.</p>
    </header>

    <div class="preview-layout">
      <form class="preview-form" @submit.prevent>
        <label>Modelo da caneca
          <select v-model="selectedModel"><option v-for="model in models" :key="model" :value="model">{{ model }}</option></select>
        </label>

        <label class="upload-control">
          <span>Imagem ou foto</span>
          <span class="upload-button"><ImagePlus :size="19" /> {{ imageName || 'Escolher imagem' }}</span>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage">
          <small>JPEG, PNG ou WebP, até 10 MB.</small>
        </label>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <div v-if="imageUrl" class="adjustments">
          <label>Tamanho da imagem <input v-model.number="imageScale" type="range" min="70" max="170" step="5"></label>
          <label>Posição horizontal <input v-model.number="imageX" type="range" min="-35" max="35" step="1"></label>
          <label>Posição vertical <input v-model.number="imageY" type="range" min="-35" max="35" step="1"></label>
          <button type="button" @click="releaseImage"><Trash2 :size="16" /> Remover imagem</button>
        </div>

        <label>Nome ou frase
          <input v-model="phrase" type="text" maxlength="80" placeholder="Ex.: Melhor mãe do mundo">
        </label>
        <label>Observações para a criação
          <textarea v-model="notes" maxlength="240" rows="3" placeholder="Cores, estilo, data ou outra orientação"></textarea>
        </label>
      </form>

      <div class="preview-result">
        <Mug3DPreview
          :image-url="imageUrl"
          :image-scale="imageScale"
          :image-x="imageX"
          :image-y="imageY"
          :phrase="phrase"
          :model="selectedModel"
        />
        <p class="simulation-note"><ShieldCheck :size="17" /> Simulação aproximada. Você ainda receberá a arte final para aprovação.</p>
        <a class="preview-whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('personalized')"><MessageCircle :size="20" /> Continuar pelo WhatsApp</a>
        <p v-if="imageName" class="attachment-note">Depois de abrir o WhatsApp, envie também o arquivo <strong>{{ imageName }}</strong>.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.personalization-preview{margin-top:38px;padding:28px;border:1px solid #efbfd0;border-radius:22px;background:linear-gradient(135deg,#fff7fa,#fff)}.personalization-preview>header{text-align:center;margin-bottom:24px}.personalization-preview>header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.personalization-preview h2{margin:5px 0 5px;font-size:28px}.personalization-preview>header p{max-width:650px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.5}.preview-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.9fr);gap:28px;align-items:start}.preview-form{display:grid;gap:14px}.preview-form label{display:grid;gap:6px;color:#5e3141;font-size:12px;font-weight:900}.preview-form input[type=text],.preview-form select,.preview-form textarea{width:100%;padding:11px 12px;border:1px solid #d8c8cf;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-weight:500;outline:none}.preview-form input:focus,.preview-form select:focus,.preview-form textarea:focus{border-color:var(--pink);box-shadow:0 0 0 3px #ffe4ee}.upload-control input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.upload-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;border:1px dashed var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-control:focus-within .upload-button{outline:3px solid #ffd0e0}.upload-control small{color:var(--muted);font-weight:600}.error{margin:0;color:#9a233b;font-size:12px;font-weight:850}.adjustments{display:grid;gap:8px;padding:12px;border-radius:12px;background:#fff}.adjustments label{grid-template-columns:145px 1fr;align-items:center;font-size:11px}.adjustments button{display:flex;align-items:center;gap:5px;justify-self:start;border:0;background:transparent;color:#8b304e;font-weight:800;cursor:pointer}.preview-result{position:sticky;top:18px}.simulation-note{display:flex;align-items:center;justify-content:center;gap:7px;color:var(--muted);font-size:11px;line-height:1.4}.preview-whatsapp{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:10px;background:#087f3f;color:#fff;font-weight:900}.preview-whatsapp:hover{background:#075e35}.attachment-note{margin:8px 0 0;text-align:center;color:var(--muted);font-size:11px;line-height:1.4}
@media(max-width:800px){.personalization-preview{padding:20px}.preview-layout{grid-template-columns:1fr}.preview-result{position:static}.personalization-preview h2{font-size:23px}.adjustments label{grid-template-columns:125px 1fr}}
</style>
