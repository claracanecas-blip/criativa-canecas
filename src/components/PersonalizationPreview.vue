<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, ImagePlus, LoaderCircle, MessageCircle, Share2, ShieldCheck, Trash2 } from '@lucide/vue'
import ArtworkPositionEditor from '@/components/ArtworkPositionEditor.vue'
import Mug3DPreview from '@/components/Mug3DPreview.vue'
import { deliveryPolicy, linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'
import { validateImageCandidate } from '@/utils/adminImages'
import { buildArtworkFilename, createPersonalizationArtworkFile } from '@/utils/personalizationExport'

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
const exportMessage = ref('')
const exportError = ref(false)
const isExporting = ref(false)
const canShareFiles = ref(false)
const hasArtwork = computed(() => Boolean(imageUrl.value || phrase.value.trim()))
const artworkFilename = computed(() => buildArtworkFilename(imageName.value))

function describeOffset(value: number, negative: string, positive: string) {
  if (value === 0) return 'centralizada'
  return `${Math.abs(value)} pontos para ${value < 0 ? negative : positive}`
}

const whatsapp = computed(() => {
  const lines = [
    'Olá! Quero criar uma caneca personalizada.',
    `Modelo escolhido: ${selectedModel.value}.`,
  ]
  if (phrase.value.trim()) lines.push(`Texto ou frase: ${phrase.value.trim()}`)
  if (imageName.value) {
    lines.push(`Foto original: “${imageName.value}”.`)
    lines.push(`Enquadramento escolhido: zoom ${imageScale.value}%; horizontal ${describeOffset(imageX.value, 'a esquerda', 'a direita')}; vertical ${describeOffset(imageY.value, 'cima', 'baixo')}.`)
  }
  if (hasArtwork.value) lines.push(`Vou anexar a prévia “${artworkFilename.value}”, gerada no gabarito 21 × 8,7 cm.`)
  if (notes.value.trim()) lines.push(`Observações: ${notes.value.trim()}`)
  if (imageName.value) lines.push('A prévia registra o enquadramento; use também a foto original para preservar a melhor qualidade.')
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

function exportOptions() {
  return {
    imageUrl: imageUrl.value,
    imageName: imageName.value,
    imageScale: imageScale.value,
    imageX: imageX.value,
    imageY: imageY.value,
    phrase: phrase.value,
  }
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

async function downloadArtwork() {
  if (!hasArtwork.value || isExporting.value) return
  isExporting.value = true
  exportError.value = false
  exportMessage.value = 'Preparando a prévia em alta resolução…'
  try {
    const file = await createPersonalizationArtworkFile(exportOptions())
    downloadFile(file)
    exportMessage.value = `Prévia “${file.name}” salva. Agora abra o WhatsApp e anexe a prévia${imageName.value ? ' e a foto original' : ''}.`
  } catch (error) {
    exportError.value = true
    exportMessage.value = error instanceof Error ? error.message : 'Não foi possível gerar a prévia.'
  } finally {
    isExporting.value = false
  }
}

async function shareArtwork() {
  if (!hasArtwork.value || isExporting.value) return
  isExporting.value = true
  exportError.value = false
  exportMessage.value = 'Preparando a prévia para compartilhar…'
  try {
    const file = await createPersonalizationArtworkFile(exportOptions())
    const shareData: ShareData = {
      files: [file],
      title: 'Prévia da caneca personalizada',
      text: 'Prévia de enquadramento da minha caneca. Também enviarei a foto original para produção.',
    }
    if (!navigator.canShare?.(shareData)) {
      downloadFile(file)
      exportMessage.value = 'O compartilhamento direto não está disponível; a prévia foi salva para você anexar no WhatsApp.'
      return
    }
    await navigator.share(shareData)
    exportMessage.value = 'Prévia compartilhada. Envie também a foto original para preservar a qualidade.'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      exportMessage.value = 'Compartilhamento cancelado. Sua personalização continua aqui.'
    } else {
      exportError.value = true
      exportMessage.value = error instanceof Error ? error.message : 'Não foi possível compartilhar a prévia.'
    }
  } finally {
    isExporting.value = false
  }
}

onMounted(() => { canShareFiles.value = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' })
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
          <span class="upload-button"><ImagePlus :size="19" /> {{ imageName ? `Trocar foto · ${imageName}` : 'Escolher foto' }}</span>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage">
          <small>JPEG, PNG ou WebP, até 10 MB.</small>
        </label>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <div v-if="imageUrl" class="adjustments">
          <ArtworkPositionEditor
            :image-url="imageUrl"
            :image-scale="imageScale"
            :image-x="imageX"
            :image-y="imageY"
            :phrase="phrase"
            @update:image-scale="imageScale = $event"
            @update:image-x="imageX = $event"
            @update:image-y="imageY = $event"
          />
          <button class="remove-image" type="button" @click="releaseImage"><Trash2 :size="16" /> Remover foto</button>
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
        <section class="send-artwork" aria-labelledby="send-artwork-title">
          <div class="send-heading">
            <small>Finalizar pelo WhatsApp</small>
            <h3 id="send-artwork-title">Envie sem perder o enquadramento</h3>
            <p v-if="hasArtwork">Salve a prévia, abra o WhatsApp e anexe a prévia{{ imageName ? ' junto da foto original' : '' }}.</p>
            <p v-else>Adicione uma foto ou frase para gerar a prévia antes de conversar.</p>
          </div>
          <div class="export-actions">
            <button type="button" :disabled="!hasArtwork || isExporting" @click="downloadArtwork">
              <LoaderCircle v-if="isExporting" class="spin" :size="18" />
              <Download v-else :size="18" />
              Baixar prévia 21 × 8,7 cm
            </button>
            <button v-if="canShareFiles" type="button" :disabled="!hasArtwork || isExporting" @click="shareArtwork"><Share2 :size="18" /> Compartilhar prévia</button>
          </div>
          <a class="preview-whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('personalized')"><MessageCircle :size="20" /> Abrir WhatsApp e enviar</a>
          <p v-if="imageName" class="attachment-note"><strong>Anexe dois arquivos:</strong> a prévia do enquadramento e a foto original <strong>{{ imageName }}</strong>.</p>
          <p v-if="exportMessage" class="export-status" :class="{ error: exportError }" role="status" aria-live="polite">{{ exportMessage }}</p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.personalization-preview{margin-top:38px;padding:28px;border:1px solid #efbfd0;border-radius:22px;background:linear-gradient(135deg,#fff7fa,#fff)}.personalization-preview>header{text-align:center;margin-bottom:24px}.personalization-preview>header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.personalization-preview h2{margin:5px 0 5px;font-size:28px}.personalization-preview>header p{max-width:650px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.5}.preview-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.9fr);gap:28px;align-items:start}.preview-form{display:grid;gap:14px}.preview-form>label{display:grid;gap:6px;color:#5e3141;font-size:12px;font-weight:900}.preview-form input[type=text],.preview-form select,.preview-form textarea{width:100%;padding:11px 12px;border:1px solid #d8c8cf;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-weight:500;outline:none}.preview-form input:focus,.preview-form select:focus,.preview-form textarea:focus{border-color:var(--pink);box-shadow:0 0 0 3px #ffe4ee}.upload-control input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.upload-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;border:1px dashed var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-control:focus-within .upload-button{outline:3px solid #ffd0e0}.upload-control small{color:var(--muted);font-weight:600}.error{margin:0;color:#9a233b;font-size:12px;font-weight:850}.adjustments{display:grid;gap:7px}.remove-image{display:flex;align-items:center;gap:5px;justify-self:start;padding:6px 2px;border:0;background:transparent;color:#8b304e;font:inherit;font-size:11px;font-weight:850;cursor:pointer}.remove-image:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.preview-result{position:sticky;top:18px}.simulation-note{display:flex;align-items:center;justify-content:center;gap:7px;color:var(--muted);font-size:11px;line-height:1.4}.send-artwork{padding:15px;border:1px solid #e8c4d1;border-radius:14px;background:#fff}.send-heading{text-align:left}.send-heading small{color:#902d4b;font-size:9px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}.send-heading h3{margin:3px 0 4px;color:#572f3d;font-size:15px}.send-heading p{margin:0;color:var(--muted);font-size:10px;line-height:1.4}.export-actions{display:grid;gap:7px;margin:12px 0 8px}.export-actions button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:9px;border:1px solid #d9aebe;border-radius:10px;background:#fff7fa;color:#812b48;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.export-actions button:hover{background:#ffedf4}.export-actions button:focus-visible,.preview-whatsapp:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.export-actions button:disabled{cursor:not-allowed;opacity:.52}.spin{animation:spin .8s linear infinite}.preview-whatsapp{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:10px;background:#087f3f;color:#fff;font-weight:900}.preview-whatsapp:hover{background:#075e35}.attachment-note,.export-status{margin:8px 0 0;text-align:center;color:var(--muted);font-size:10px;line-height:1.4}.export-status{padding:7px;border-radius:8px;background:#edf8f1;color:#0a6739;font-weight:750}.export-status.error{background:#fff0f1;color:#92243f}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:800px){.personalization-preview{padding:20px}.preview-layout{grid-template-columns:1fr}.preview-result{position:static}.personalization-preview h2{font-size:23px}.adjustments label{grid-template-columns:125px 1fr}}
</style>
