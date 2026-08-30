<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CheckCircle2, ImagePlus, MessageCircle, Send, ShieldCheck, Trash2, WandSparkles } from '@lucide/vue'
import { linkWhatsapp, personalizationPolicy } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'
import { validateImageCandidate } from '@/utils/adminImages'

const props = defineProps<{ models: string[] }>()
type ServiceChoice = 'ready' | 'assisted'

const selectedModel = ref(props.models[0] ?? 'Caneca personalizada')
const serviceChoice = ref<ServiceChoice>()
const phrase = ref('')
const notes = ref('')
const selectedFile = ref<File>()
const fileInput = ref<HTMLInputElement>()
const errorMessage = ref('')
const shareMessage = ref('')
const shareError = ref(false)
const isSharing = ref(false)
const canShareOriginal = ref(false)
const offerImageUpload = ref(false)

const imageName = computed(() => selectedFile.value?.name ?? '')
const isReadyArt = computed(() => serviceChoice.value === 'ready')
const servicePrice = computed(() => isReadyArt.value
  ? personalizationPolicy.readyArtPrice
  : personalizationPolicy.assistedArtPrice)
const uploadLabel = computed(() => isReadyArt.value ? 'Arte final pronta' : 'Foto, logo ou imagem de referência')
const sendTitle = computed(() => isReadyArt.value ? 'Envie sua arte pronta para conferência' : 'Envie para criarmos o mockup')
const shareButtonLabel = computed(() => isReadyArt.value ? 'Enviar arte pronta pelo WhatsApp' : 'Enviar referência e pedido pelo WhatsApp')
const whatsappButtonLabel = computed(() => isReadyArt.value ? 'Abrir WhatsApp para enviar a arte' : 'Pedir criação pelo WhatsApp')
const serviceLabel = computed(() => isReadyArt.value ? 'Arte pronta para impressão' : 'Criação ou adaptação pela equipe')
const serviceDescription = computed(() => isReadyArt.value
  ? 'Arquivo finalizado, sem alterações de texto, cores ou montagem.'
  : 'Nossa equipe prepara a composição e envia o mockup para sua aprovação.')

const requestText = computed(() => {
  if (!serviceChoice.value) return ''

  const lines = [
    isReadyArt.value
      ? 'Olá! Quero pedir uma caneca personalizada com minha arte pronta para impressão.'
      : 'Olá! Quero pedir uma caneca personalizada com criação ou adaptação da arte pela Criativa Canecas.',
    isReadyArt.value
      ? `Opção escolhida: Arte pronta para impressão — ${servicePrice.value}.`
      : `Opção escolhida: Criação ou adaptação pela equipe — ${servicePrice.value}.`,
    `Modelo: ${selectedModel.value}`,
  ]
  if (imageName.value) lines.push(`${isReadyArt.value ? 'Arquivo da arte' : 'Arquivo de referência'}: ${imageName.value}`)
  if (!isReadyArt.value && phrase.value.trim()) lines.push(`Frase: ${phrase.value.trim()}`)
  if (notes.value.trim()) lines.push(`Detalhes: ${notes.value.trim()}`)
  if (isReadyArt.value) {
    lines.push('Minha arte já está finalizada. Não preciso de criação ou adaptação; peço apenas a conferência do arquivo antes da produção.')
  } else {
    lines.push('Preciso que vocês criem ou adaptem a composição e enviem um mockup para eu aprovar antes da produção.')
  }
  lines.push('Cidade/CEP: ')
  return lines.join('\n')
})

const whatsapp = computed(() => linkWhatsapp(requestText.value))

watch(serviceChoice, () => {
  shareMessage.value = ''
  shareError.value = false
})

function isMobileShareDevice() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return mobileUserAgent || iPadDesktopMode
}

function refreshShareSupport(file?: File) {
  if (!file || !offerImageUpload.value) {
    canShareOriginal.value = false
    return
  }
  try {
    canShareOriginal.value = navigator.canShare({ files: [file] })
  } catch {
    canShareOriginal.value = false
  }
}

onMounted(() => {
  offerImageUpload.value = isMobileShareDevice()
    && typeof navigator.canShare === 'function'
    && typeof navigator.share === 'function'
})

function removeImage() {
  selectedFile.value = undefined
  refreshShareSupport()
  shareMessage.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function selectImage(event: Event) {
  errorMessage.value = ''
  shareMessage.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const validationError = validateImageCandidate(file)
  if (validationError) {
    errorMessage.value = validationError
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  selectedFile.value = file
  refreshShareSupport(file)
}

async function shareOriginal() {
  const file = selectedFile.value
  if (!file || !canShareOriginal.value || isSharing.value) return
  isSharing.value = true
  shareError.value = false
  shareMessage.value = 'Abrindo as opções de compartilhamento…'
  try {
    await navigator.share({
      files: [file],
      title: 'Pedido de caneca personalizada',
      text: requestText.value,
    })
    shareMessage.value = `${isReadyArt.value ? 'Arte pronta' : 'Referência'} e pedido compartilhados. No WhatsApp, confirme o envio para a nossa conversa.`
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      shareMessage.value = `Compartilhamento cancelado. ${isReadyArt.value ? 'Sua arte' : 'Sua referência'} continua selecionada somente neste navegador.`
    } else {
      shareError.value = true
      shareMessage.value = `Não foi possível anexar automaticamente. Abra o WhatsApp abaixo e anexe ${isReadyArt.value ? 'a arte pronta' : 'a foto, logo ou referência'} na conversa.`
    }
  } finally {
    isSharing.value = false
  }
}
</script>

<template>
  <section class="personalization-request" aria-labelledby="request-title">
    <header>
      <small>Caneca com estampa inclusa</small>
      <h2 id="request-title">Escolha como quer personalizar</h2>
      <p>Escolha uma opção para ver somente os campos, o valor e a mensagem do seu pedido. As duas incluem caneca e estampa; não vendemos canecas sem estampa.</p>
    </header>

    <fieldset class="service-choice">
      <legend>O que você precisa?</legend>
      <label :class="{ selected: serviceChoice === 'ready' }">
        <input v-model="serviceChoice" type="radio" name="service-choice" value="ready">
        <span class="choice-copy">
          <small>Minha arte já está finalizada</small>
          <strong>Vou enviar a arte pronta</strong>
          <span>Sem alterações de texto, cores ou montagem. Conferimos o arquivo antes da produção.</span>
        </span>
        <b>{{ personalizationPolicy.readyArtPrice }}</b>
      </label>
      <label :class="{ selected: serviceChoice === 'assisted' }">
        <input v-model="serviceChoice" type="radio" name="service-choice" value="assisted">
        <span class="choice-copy">
          <small>Preciso de ajuda com a composição</small>
          <strong>Quero criação ou adaptação</strong>
          <span>Criamos ou adaptamos sua ideia e enviamos o mockup para aprovação.</span>
        </span>
        <b>{{ personalizationPolicy.assistedArtPrice }}</b>
      </label>
    </fieldset>

    <p v-if="!serviceChoice" class="choice-required" role="status">Escolha uma das opções acima para continuar.</p>

    <div v-else class="request-layout">
      <form class="request-form" @submit.prevent>
        <label v-if="models.length > 1">Modelo da caneca
          <select v-model="selectedModel"><option v-for="model in models" :key="model" :value="model">{{ model }}</option></select>
        </label>

        <template v-if="offerImageUpload">
          <label class="upload-control">
            <span>{{ serviceChoice ? uploadLabel : 'Arte, foto ou imagem' }}</span>
            <span class="upload-button"><ImagePlus :size="19" /> {{ imageName ? `Trocar imagem · ${imageName}` : 'Escolher imagem' }}</span>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage">
            <small>Envie o arquivo com a melhor qualidade disponível. JPEG, PNG ou WebP, até 10 MB.</small>
          </label>
          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

          <div v-if="selectedFile" class="selected-file">
            <p><CheckCircle2 :size="18" /> <span><strong>Arquivo pronto para enviar:</strong> {{ imageName }}</span></p>
            <p class="privacy"><ShieldCheck :size="16" /> O site não armazena nem envia sua imagem sozinho.</p>
            <button type="button" @click="removeImage"><Trash2 :size="16" /> Remover imagem</button>
          </div>
        </template>

        <template v-if="serviceChoice === 'assisted'">
          <label>Nome ou frase <small>Opcional</small>
            <input v-model="phrase" type="text" maxlength="80" placeholder="Ex.: Melhor mãe do mundo">
          </label>
          <label>Como você imagina sua caneca?
            <textarea v-model="notes" maxlength="240" rows="4" placeholder="Ex.: fundo rosa, flores delicadas e o nome Ana em destaque"></textarea>
          </label>
        </template>
        <label v-else>Observação sobre a arte pronta <small>Opcional</small>
          <textarea v-model="notes" maxlength="240" rows="4" placeholder="Ex.: confirmar somente o enquadramento na caneca"></textarea>
        </label>
      </form>

      <aside class="send-card" aria-labelledby="send-title">
        <span class="send-icon"><WandSparkles :size="25" /></span>
        <small>Sua opção</small>
        <div class="selected-service">
          <strong>{{ serviceLabel }}</strong>
          <b>{{ servicePrice }}</b>
          <p>{{ serviceDescription }}</p>
        </div>
        <h3 id="send-title">{{ sendTitle }}</h3>
        <ol v-if="serviceChoice === 'ready'">
          <li><span>1</span><p><strong>Recebemos sua arte final</strong> pelo WhatsApp.</p></li>
          <li><span>2</span><p><strong>Conferimos o arquivo</strong> para confirmar se está adequado à produção.</p></li>
          <li><span>3</span><p><strong>Você confirma os detalhes</strong> antes de produzirmos.</p></li>
        </ol>
        <ol v-else-if="serviceChoice === 'assisted'">
          <li><span>1</span><p><strong>Recebemos sua imagem</strong> e as orientações preenchidas.</p></li>
          <li><span>2</span><p><strong>Criamos o mockup</strong> com o melhor enquadramento para a caneca.</p></li>
          <li><span>3</span><p><strong>Você confere e aprova</strong> antes de produzirmos.</p></li>
        </ol>

        <button v-if="canShareOriginal" class="share-original" type="button" :disabled="isSharing" @click="shareOriginal">
          <MessageCircle :size="20" /> {{ isSharing ? 'Abrindo…' : shareButtonLabel }}
        </button>
        <p v-if="canShareOriginal" class="share-help">Escolha o WhatsApp e depois a conversa da Criativa. O arquivo e o resumo seguirão juntos.</p>

        <a v-else class="whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('personalized')">
          <MessageCircle :size="20" /> {{ whatsappButtonLabel }}
        </a>
        <p v-if="!canShareOriginal" class="attachment-note">
          <Send :size="15" />
          <span v-if="imageName">A conversa abrirá com o resumo pronto. <strong>Anexe {{ isReadyArt ? 'a arte' : 'a referência' }} {{ imageName }}</strong> antes de enviar.</span>
          <span v-else>A conversa abrirá com a opção escolhida. Anexe {{ isReadyArt ? 'sua arte pronta' : 'sua foto, logo ou referência' }} diretamente no WhatsApp.</span>
        </p>
        <p v-if="shareMessage" class="share-status" :class="{ error: shareError }" role="status" aria-live="polite">{{ shareMessage }}</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.personalization-request{margin-top:24px;padding:28px;border:1px solid #efbfd0;border-radius:22px;background:linear-gradient(135deg,#fff7fa,#fff)}
.personalization-request>header{margin-bottom:22px;text-align:center}
.personalization-request>header small,.send-card>small{color:var(--pink-dark);font-size:10px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}
.personalization-request h2{margin:5px 0;font-size:28px}
.personalization-request>header p{max-width:680px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.5}
.service-choice{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0;padding:0;border:0}
.service-choice legend{width:100%;margin-bottom:9px;color:#5e3141;font-size:13px;font-weight:950;text-align:center}
.service-choice label{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:11px;min-height:145px;padding:18px;border:1px solid #ddc9d0;border-radius:15px;background:#fff;color:#5e3141;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}
.service-choice label:hover{border-color:#d28ca5;transform:translateY(-1px)}
.service-choice label.selected{border-color:var(--pink-dark);background:#fff4f8;box-shadow:0 0 0 3px #f7d5e1}
.service-choice input{margin-top:4px;accent-color:var(--pink-dark)}
.service-choice label:has(input:focus-visible){outline:3px solid #f3a8c1;outline-offset:3px}
.choice-copy{display:grid;gap:5px;min-width:0}
.choice-copy>small{color:var(--pink-dark);font-size:9px;font-weight:900;letter-spacing:.04em;text-transform:uppercase}
.choice-copy>strong{font-size:16px;line-height:1.25}
.choice-copy>span{color:var(--muted);font-size:11px;line-height:1.45}
.service-choice label>b{color:#a12645;font-size:20px;white-space:nowrap}
.choice-required{margin:14px 0 0;padding:11px;border-radius:10px;background:#fff4f8;color:#704150;font-size:11px;line-height:1.5;text-align:center}
.request-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:28px;align-items:start;margin-top:26px;padding-top:26px;border-top:1px solid #efd5de}
.request-form{display:grid;gap:15px}
.request-form>label{display:grid;gap:6px;color:#5e3141;font-size:12px;font-weight:900}
.request-form label>small{color:var(--muted);font-size:10px;font-weight:650}
.request-form input[type=text],.request-form select,.request-form textarea{width:100%;padding:11px 12px;border:1px solid #d8c8cf;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-weight:500;outline:none}
.request-form input:focus,.request-form select:focus,.request-form textarea:focus{border-color:var(--pink);box-shadow:0 0 0 3px #ffe4ee}
.upload-control input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.upload-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border:1px dashed var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.upload-control:focus-within .upload-button{outline:3px solid #ffd0e0}
.error{margin:0;color:#9a233b;font-size:12px;font-weight:850}
.selected-file{display:grid;gap:7px;padding:11px;border:1px solid #b9dfc7;border-radius:11px;background:#f1faf4}
.selected-file p{display:flex;align-items:flex-start;gap:7px;margin:0;color:#0a6b3c;font-size:11px;line-height:1.4}
.selected-file p svg{flex:0 0 auto}.selected-file .privacy{color:#557064;font-size:10px}
.selected-file button{display:flex;align-items:center;gap:5px;justify-self:start;padding:5px 0;border:0;background:transparent;color:#84304b;font:inherit;font-size:10px;font-weight:900;cursor:pointer}
.send-card{position:sticky;top:18px;padding:22px;border:1px solid #e4b9c8;border-radius:18px;background:#fff;box-shadow:0 12px 30px rgba(83,40,57,.08)}
.send-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:14px;border-radius:14px;background:#ffe8f0;color:#942d4e}
.selected-service{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 12px;margin:5px 0 18px;padding:12px;border-radius:11px;background:#fff3f7;color:#5f3443}
.selected-service>strong{font-size:12px}.selected-service>b{color:#a12645;font-size:17px;white-space:nowrap}.selected-service>p{grid-column:1/-1;margin:0;color:var(--muted);font-size:10px;line-height:1.4}
.send-card h3{margin:0 0 15px;color:#542f3c;font-size:20px}
.send-card ol{display:grid;gap:12px;margin:0 0 19px;padding:0;list-style:none}
.send-card li{display:grid;grid-template-columns:28px 1fr;align-items:start;gap:9px}
.send-card li>span{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#f9dce6;color:#872c49;font-size:11px;font-weight:950}
.send-card li p{margin:2px 0 0;color:var(--muted);font-size:11px;line-height:1.4}.send-card li strong{color:#5f3443}
.share-original,.whatsapp{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:46px;padding:11px;border:0;border-radius:11px;background:#087f3f;color:#fff;font:inherit;font-size:12px;font-weight:900}
.share-original{cursor:pointer}.share-original:disabled{cursor:wait;opacity:.6}.share-original:hover,.whatsapp:hover{background:#075e35}
.share-original:focus-visible,.whatsapp:focus-visible,.selected-file button:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}
.share-help{margin:7px 0 0;color:var(--muted);font-size:9px;line-height:1.4;text-align:center}
.attachment-note{display:flex;align-items:flex-start;gap:6px;margin:10px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.attachment-note svg{flex:0 0 auto;margin-top:1px}.attachment-note strong{color:#65404e}
.share-status{margin:10px 0 0;padding:8px;border-radius:8px;background:#edf8f1;color:#0a6739;font-size:10px;font-weight:750;line-height:1.4;text-align:center}.share-status.error{background:#fff0f1;color:#92243f}
@media(max-width:800px){.personalization-request{padding:20px}.personalization-request h2{font-size:23px}.service-choice{grid-template-columns:1fr}.service-choice label{min-height:0;padding:15px}.request-layout{grid-template-columns:1fr}.send-card{position:static}}
@media(max-width:430px){.service-choice label{grid-template-columns:auto minmax(0,1fr)}.service-choice label>b{grid-column:2;font-size:18px}}
</style>
