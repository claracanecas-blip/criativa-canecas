<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, ImagePlus, LoaderCircle, MessageCircle, Share2, ShieldCheck, SlidersHorizontal, Trash2, WandSparkles } from '@lucide/vue'
import ArtworkPositionEditor from '@/components/ArtworkPositionEditor.vue'
import Mug3DPreview from '@/components/Mug3DPreview.vue'
import { deliveryPolicy, linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'
import { validateImageCandidate } from '@/utils/adminImages'
import { buildArtworkFilename, createPersonalizationArtworkFile } from '@/utils/personalizationExport'

const props = defineProps<{ models: string[] }>()

type PersonalizationMode = 'preview' | 'assisted'

const personalizationMode = ref<PersonalizationMode>('preview')
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
const isAssisted = computed(() => personalizationMode.value === 'assisted')

function describeOffset(value: number, negative: string, positive: string) {
  if (value === 0) return 'centralizada'
  return `${Math.abs(value)} pontos para ${value < 0 ? negative : positive}`
}

const whatsapp = computed(() => {
  const lines = [
    'Olá! Quero criar uma caneca personalizada.',
    `Modelo escolhido: ${selectedModel.value}.`,
    isAssisted.value
      ? 'Forma de criação: quero que a Criativa Canecas prepare o mockup para mim.'
      : 'Forma de criação: montei uma prévia no site.',
  ]
  if (phrase.value.trim()) lines.push(`Texto ou frase: ${phrase.value.trim()}`)
  if (imageName.value) {
    lines.push(`Foto original: “${imageName.value}”.`)
    if (!isAssisted.value) lines.push(`Enquadramento escolhido: zoom ${imageScale.value}%; horizontal ${describeOffset(imageX.value, 'a esquerda', 'a direita')}; vertical ${describeOffset(imageY.value, 'cima', 'baixo')}.`)
  }
  if (hasArtwork.value && !isAssisted.value) lines.push(`Vou anexar a prévia “${artworkFilename.value}”, gerada no gabarito 21 × 8,7 cm.`)
  if (notes.value.trim()) lines.push(`Observações: ${notes.value.trim()}`)
  if (imageName.value && !isAssisted.value) lines.push('A prévia registra o enquadramento; use também a foto original para preservar a melhor qualidade.')
  if (isAssisted.value) lines.push('A imagem mostrada no site é somente uma referência automática; podem propor a melhor composição para a caneca.')
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
      <h2 id="preview-title">Escolha como criar sua caneca</h2>
      <p>Veja sua foto automaticamente ou conte sua ideia para prepararmos o mockup. Nada é enviado ou armazenado pelo site.</p>
    </header>

    <fieldset class="creation-modes">
      <legend>Como você prefere personalizar?</legend>
      <label :class="{ selected: personalizationMode === 'preview' }">
        <input v-model="personalizationMode" type="radio" value="preview">
        <span class="mode-icon"><SlidersHorizontal :size="21" /></span>
        <span><strong>Quero ver e ajustar</strong><small>A foto aparece automaticamente e você só ajusta se precisar.</small></span>
      </label>
      <label :class="{ selected: personalizationMode === 'assisted' }">
        <input v-model="personalizationMode" type="radio" value="assisted">
        <span class="mode-icon"><WandSparkles :size="21" /></span>
        <span><strong>Quero que vocês criem</strong><small>Envie a foto e descreva a ideia; nós preparamos o mockup final.</small></span>
      </label>
    </fieldset>

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

        <div v-if="imageUrl" class="selected-image">
          <p><ShieldCheck :size="16" /> <span><strong>Foto adicionada.</strong> A prévia foi centralizada automaticamente.</span></p>
          <details v-if="!isAssisted" class="editor-disclosure">
            <summary><SlidersHorizontal :size="17" /> Ajustar enquadramento <small>Opcional</small></summary>
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
          </details>
          <p v-else class="assisted-hint"><WandSparkles :size="16" /> Use as observações para explicar o estilo. O enquadramento final será preparado por nós.</p>
          <button class="remove-image" type="button" @click="releaseImage"><Trash2 :size="16" /> Remover foto</button>
        </div>

        <label>Nome ou frase
          <input v-model="phrase" type="text" maxlength="80" placeholder="Ex.: Melhor mãe do mundo">
        </label>
        <label>{{ isAssisted ? 'Como você imagina sua caneca?' : 'Observações para a criação' }}
          <textarea v-model="notes" maxlength="240" rows="3" :placeholder="isAssisted ? 'Ex.: fundo rosa, flores delicadas e o nome Ana em destaque' : 'Cores, estilo, data ou outra orientação'"></textarea>
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
        <p class="simulation-note"><ShieldCheck :size="17" /> {{ isAssisted ? 'Referência automática. Nós ainda vamos preparar seu mockup final.' : 'Simulação aproximada. Você ainda receberá a arte final para aprovação.' }}</p>
        <section class="send-artwork" aria-labelledby="send-artwork-title">
          <div class="send-heading">
            <small>Finalizar pelo WhatsApp</small>
            <h3 id="send-artwork-title">{{ isAssisted ? 'Conte sua ideia para a gente' : 'Envie sem perder o enquadramento' }}</h3>
            <template v-if="isAssisted">
              <p v-if="imageName">Abra o WhatsApp e anexe a foto original. As instruções preenchidas já estarão na mensagem.</p>
              <p v-else>Descreva sua ideia e abra o WhatsApp. Você poderá anexar referências diretamente na conversa.</p>
            </template>
            <template v-else>
              <p v-if="hasArtwork">Salve a prévia, abra o WhatsApp e anexe a prévia{{ imageName ? ' junto da foto original' : '' }}.</p>
              <p v-else>Adicione uma foto ou frase para gerar a prévia antes de conversar.</p>
            </template>
          </div>
          <div v-if="!isAssisted" class="export-actions">
            <button type="button" :disabled="!hasArtwork || isExporting" @click="downloadArtwork">
              <LoaderCircle v-if="isExporting" class="spin" :size="18" />
              <Download v-else :size="18" />
              Baixar prévia 21 × 8,7 cm
            </button>
            <button v-if="canShareFiles" type="button" :disabled="!hasArtwork || isExporting" @click="shareArtwork"><Share2 :size="18" /> Compartilhar prévia</button>
          </div>
          <a class="preview-whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('personalized')"><MessageCircle :size="20" /> {{ isAssisted ? 'Pedir criação pelo WhatsApp' : 'Abrir WhatsApp e enviar' }}</a>
          <p v-if="imageName" class="attachment-note"><template v-if="isAssisted"><strong>Anexe a foto original:</strong> {{ imageName }}.</template><template v-else><strong>Anexe dois arquivos:</strong> a prévia do enquadramento e a foto original <strong>{{ imageName }}</strong>.</template></p>
          <p v-if="exportMessage" class="export-status" :class="{ error: exportError }" role="status" aria-live="polite">{{ exportMessage }}</p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.personalization-preview{margin-top:38px;padding:28px;border:1px solid #efbfd0;border-radius:22px;background:linear-gradient(135deg,#fff7fa,#fff)}.personalization-preview>header{text-align:center;margin-bottom:20px}.personalization-preview>header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.personalization-preview h2{margin:5px 0 5px;font-size:28px}.personalization-preview>header p{max-width:680px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.5}.creation-modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-width:820px;margin:0 auto 26px;padding:0;border:0}.creation-modes legend{width:100%;margin-bottom:8px;text-align:center;color:#653344;font-size:12px;font-weight:900}.creation-modes label{position:relative;display:grid;grid-template-columns:38px 1fr;align-items:center;gap:9px;min-height:78px;padding:12px;border:1px solid #dfc5ce;border-radius:14px;background:#fff;color:#5c3442;cursor:pointer}.creation-modes label.selected{border-color:#ad3157;background:#fff2f7;box-shadow:0 0 0 2px rgba(173,49,87,.1)}.creation-modes input{position:absolute;top:9px;right:9px;width:16px;height:16px;accent-color:#982c4f}.creation-modes label:focus-within{outline:3px solid #f3a8c1;outline-offset:2px}.mode-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:#ffe6ef;color:#922d4d}.creation-modes strong,.creation-modes small{display:block}.creation-modes strong{font-size:12px}.creation-modes small{margin-top:3px;color:var(--muted);font-size:10px;font-weight:650;line-height:1.35}.preview-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.9fr);gap:28px;align-items:start}.preview-form{display:grid;gap:14px}.preview-form>label{display:grid;gap:6px;color:#5e3141;font-size:12px;font-weight:900}.preview-form input[type=text],.preview-form select,.preview-form textarea{width:100%;padding:11px 12px;border:1px solid #d8c8cf;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-weight:500;outline:none}.preview-form input:focus,.preview-form select:focus,.preview-form textarea:focus{border-color:var(--pink);box-shadow:0 0 0 3px #ffe4ee}.upload-control input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.upload-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;border:1px dashed var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-control:focus-within .upload-button{outline:3px solid #ffd0e0}.upload-control small{color:var(--muted);font-weight:600}.error{margin:0;color:#9a233b;font-size:12px;font-weight:850}.selected-image{display:grid;gap:8px}.selected-image>p{display:flex;align-items:flex-start;gap:7px;margin:0;padding:9px 10px;border-radius:10px;background:#eef8f2;color:#0b6c3d;font-size:10px;line-height:1.4}.selected-image>p svg{flex:0 0 auto;margin-top:1px}.selected-image .assisted-hint{background:#fff3f7;color:#782e47}.editor-disclosure{border:1px solid #e6c6d2;border-radius:12px;background:#fff}.editor-disclosure summary{display:flex;align-items:center;gap:7px;padding:11px 12px;color:#762b45;font-size:11px;font-weight:900;cursor:pointer}.editor-disclosure summary small{margin-left:auto;padding:3px 6px;border-radius:999px;background:#f5e5eb;color:#753147;font-size:8px;text-transform:uppercase}.editor-disclosure[open] summary{border-bottom:1px solid #efd8e0}.editor-disclosure :deep(.photo-editor){border:0;border-radius:0 0 12px 12px}.remove-image{display:flex;align-items:center;gap:5px;justify-self:start;padding:6px 2px;border:0;background:transparent;color:#8b304e;font:inherit;font-size:11px;font-weight:850;cursor:pointer}.remove-image:focus-visible,.editor-disclosure summary:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.preview-result{position:sticky;top:18px}.simulation-note{display:flex;align-items:center;justify-content:center;gap:7px;color:var(--muted);font-size:11px;line-height:1.4;text-align:center}.send-artwork{padding:15px;border:1px solid #e8c4d1;border-radius:14px;background:#fff}.send-heading{text-align:left}.send-heading small{color:#902d4b;font-size:9px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}.send-heading h3{margin:3px 0 4px;color:#572f3d;font-size:15px}.send-heading p{margin:0;color:var(--muted);font-size:10px;line-height:1.4}.export-actions{display:grid;gap:7px;margin:12px 0 8px}.export-actions button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:9px;border:1px solid #d9aebe;border-radius:10px;background:#fff7fa;color:#812b48;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.export-actions button:hover{background:#ffedf4}.export-actions button:focus-visible,.preview-whatsapp:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.export-actions button:disabled{cursor:not-allowed;opacity:.52}.spin{animation:spin .8s linear infinite}.preview-whatsapp{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:12px;padding:13px;border-radius:10px;background:#087f3f;color:#fff;font-weight:900}.preview-whatsapp:hover{background:#075e35}.attachment-note,.export-status{margin:8px 0 0;text-align:center;color:var(--muted);font-size:10px;line-height:1.4}.export-status{padding:7px;border-radius:8px;background:#edf8f1;color:#0a6739;font-weight:750}.export-status.error{background:#fff0f1;color:#92243f}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:800px){.personalization-preview{padding:20px}.creation-modes{grid-template-columns:1fr;margin-bottom:22px}.preview-layout{grid-template-columns:1fr}.preview-result{position:static}.personalization-preview h2{font-size:23px}}
</style>
