<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, ImagePlus, MessageCircle, Send, ShieldCheck, Trash2, WandSparkles } from '@lucide/vue'
import { linkWhatsapp } from '@/data/site'
import { trackWhatsappClick } from '@/services/analytics'
import { validateImageCandidate } from '@/utils/adminImages'

const props = defineProps<{ models: string[] }>()

const selectedModel = ref(props.models[0] ?? 'Caneca personalizada')
const phrase = ref('')
const notes = ref('')
const selectedFile = ref<File>()
const fileInput = ref<HTMLInputElement>()
const errorMessage = ref('')
const shareMessage = ref('')
const shareError = ref(false)
const isSharing = ref(false)
const canShareOriginal = ref(false)

const imageName = computed(() => selectedFile.value?.name ?? '')

const requestText = computed(() => {
  const lines = [
    'Olá! Quero criar uma caneca personalizada.',
    `Modelo: ${selectedModel.value}`,
  ]
  if (imageName.value) lines.push(`Foto: ${imageName.value}`)
  if (phrase.value.trim()) lines.push(`Frase: ${phrase.value.trim()}`)
  if (notes.value.trim()) lines.push(`Detalhes: ${notes.value.trim()}`)
  lines.push('Podem criar um mockup para eu aprovar?')
  lines.push('Cidade/CEP: ')
  return lines.join('\n')
})

const whatsapp = computed(() => linkWhatsapp(requestText.value))

function refreshShareSupport(file?: File) {
  if (!file || typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') {
    canShareOriginal.value = false
    return
  }
  try {
    canShareOriginal.value = navigator.canShare({ files: [file] })
  } catch {
    canShareOriginal.value = false
  }
}

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
    shareMessage.value = 'Foto e pedido compartilhados. No WhatsApp, confirme o envio para a nossa conversa.'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      shareMessage.value = 'Compartilhamento cancelado. Sua foto continua selecionada somente neste navegador.'
    } else {
      shareError.value = true
      shareMessage.value = 'Não foi possível anexar automaticamente. Abra o WhatsApp abaixo e anexe a foto original na conversa.'
    }
  } finally {
    isSharing.value = false
  }
}
</script>

<template>
  <section class="personalization-request" aria-labelledby="request-title">
    <header>
      <small>Mockup feito por nós</small>
      <h2 id="request-title">Envie sua foto e conte sua ideia</h2>
      <p>Nós montamos a composição, enviamos o mockup pelo WhatsApp e só produzimos depois da sua aprovação.</p>
    </header>

    <div class="request-layout">
      <form class="request-form" @submit.prevent>
        <label>Modelo da caneca
          <select v-model="selectedModel"><option v-for="model in models" :key="model" :value="model">{{ model }}</option></select>
        </label>

        <label class="upload-control">
          <span>Foto ou imagem original</span>
          <span class="upload-button"><ImagePlus :size="19" /> {{ imageName ? `Trocar imagem · ${imageName}` : 'Escolher imagem' }}</span>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage">
          <small>Envie o arquivo com a melhor qualidade disponível. JPEG, PNG ou WebP, até 10 MB.</small>
        </label>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <div v-if="selectedFile" class="selected-file">
          <p><CheckCircle2 :size="18" /> <span><strong>Imagem pronta para enviar:</strong> {{ imageName }}</span></p>
          <p class="privacy"><ShieldCheck :size="16" /> O site não armazena nem envia sua imagem sozinho.</p>
          <button type="button" @click="removeImage"><Trash2 :size="16" /> Remover imagem</button>
        </div>

        <label>Nome ou frase <small>Opcional</small>
          <input v-model="phrase" type="text" maxlength="80" placeholder="Ex.: Melhor mãe do mundo">
        </label>
        <label>Como você imagina sua caneca?
          <textarea v-model="notes" maxlength="240" rows="4" placeholder="Ex.: fundo rosa, flores delicadas e o nome Ana em destaque"></textarea>
        </label>
      </form>

      <aside class="send-card" aria-labelledby="send-title">
        <span class="send-icon"><WandSparkles :size="25" /></span>
        <small>Próximo passo</small>
        <h3 id="send-title">Envie para criarmos o mockup</h3>
        <ol>
          <li><span>1</span><p><strong>Recebemos sua imagem</strong> e as orientações preenchidas.</p></li>
          <li><span>2</span><p><strong>Criamos o mockup</strong> com o melhor enquadramento para a caneca.</p></li>
          <li><span>3</span><p><strong>Você confere e aprova</strong> antes de produzirmos.</p></li>
        </ol>

        <button v-if="canShareOriginal" class="share-original" type="button" :disabled="isSharing" @click="shareOriginal">
          <MessageCircle :size="20" /> {{ isSharing ? 'Abrindo…' : 'Enviar foto e pedido pelo WhatsApp' }}
        </button>
        <p v-if="canShareOriginal" class="share-help">Escolha o WhatsApp e depois a conversa da Criativa. A foto e o resumo seguirão juntos.</p>

        <a v-else class="whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('personalized')">
          <MessageCircle :size="20" /> Abrir conversa no WhatsApp
        </a>
        <p v-if="!canShareOriginal" class="attachment-note">
          <Send :size="15" />
          <span v-if="imageName"><strong>Anexe a foto {{ imageName }}</strong> na conversa antes de enviar o pedido.</span>
          <span v-else>Escolha uma imagem acima ou abra a conversa e anexe a foto diretamente no WhatsApp.</span>
        </p>
        <p v-if="shareMessage" class="share-status" :class="{ error: shareError }" role="status" aria-live="polite">{{ shareMessage }}</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.personalization-request{margin-top:38px;padding:28px;border:1px solid #efbfd0;border-radius:22px;background:linear-gradient(135deg,#fff7fa,#fff)}.personalization-request>header{margin-bottom:24px;text-align:center}.personalization-request>header small,.send-card>small{color:var(--pink-dark);font-size:10px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.personalization-request h2{margin:5px 0;font-size:28px}.personalization-request>header p{max-width:680px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.5}.request-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:28px;align-items:start}.request-form{display:grid;gap:15px}.request-form>label{display:grid;gap:6px;color:#5e3141;font-size:12px;font-weight:900}.request-form label>small{color:var(--muted);font-size:10px;font-weight:650}.request-form input[type=text],.request-form select,.request-form textarea{width:100%;padding:11px 12px;border:1px solid #d8c8cf;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-weight:500;outline:none}.request-form input:focus,.request-form select:focus,.request-form textarea:focus{border-color:var(--pink);box-shadow:0 0 0 3px #ffe4ee}.upload-control input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.upload-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border:1px dashed var(--pink-dark);border-radius:10px;background:#fff;color:var(--pink-dark);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-control:focus-within .upload-button{outline:3px solid #ffd0e0}.error{margin:0;color:#9a233b;font-size:12px;font-weight:850}.selected-file{display:grid;gap:7px;padding:11px;border:1px solid #b9dfc7;border-radius:11px;background:#f1faf4}.selected-file p{display:flex;align-items:flex-start;gap:7px;margin:0;color:#0a6b3c;font-size:11px;line-height:1.4}.selected-file p svg{flex:0 0 auto}.selected-file .privacy{color:#557064;font-size:10px}.selected-file button{display:flex;align-items:center;gap:5px;justify-self:start;padding:5px 0;border:0;background:transparent;color:#84304b;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.send-card{position:sticky;top:18px;padding:22px;border:1px solid #e4b9c8;border-radius:18px;background:#fff;box-shadow:0 12px 30px rgba(83,40,57,.08)}.send-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:14px;border-radius:14px;background:#ffe8f0;color:#942d4e}.send-card h3{margin:5px 0 15px;color:#542f3c;font-size:20px}.send-card ol{display:grid;gap:12px;margin:0 0 19px;padding:0;list-style:none}.send-card li{display:grid;grid-template-columns:28px 1fr;align-items:start;gap:9px}.send-card li>span{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#f9dce6;color:#872c49;font-size:11px;font-weight:950}.send-card li p{margin:2px 0 0;color:var(--muted);font-size:11px;line-height:1.4}.send-card li strong{color:#5f3443}.share-original,.whatsapp{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:46px;padding:11px;border-radius:11px;font:inherit;font-size:12px;font-weight:900}.share-original{border:1px solid #d09bad;background:#fff3f7;color:#812b48;cursor:pointer}.share-original:disabled{cursor:wait;opacity:.6}.share-help{margin:7px 0 0;color:var(--muted);font-size:9px;line-height:1.4;text-align:center}.divider{display:flex;align-items:center;gap:8px;margin:13px 0;color:#9a7c87;font-size:9px;font-weight:900;text-transform:uppercase}.divider::before,.divider::after{content:"";height:1px;flex:1;background:#ecd9e0}.whatsapp{background:#087f3f;color:#fff}.whatsapp:hover{background:#075e35}.share-original:focus-visible,.whatsapp:focus-visible,.selected-file button:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.attachment-note{display:flex;align-items:flex-start;gap:6px;margin:10px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.attachment-note svg{flex:0 0 auto;margin-top:1px}.attachment-note strong{color:#65404e}.share-status{margin:10px 0 0;padding:8px;border-radius:8px;background:#edf8f1;color:#0a6739;font-size:10px;font-weight:750;line-height:1.4;text-align:center}.share-status.error{background:#fff0f1;color:#92243f}
.share-original{border:0;background:#087f3f;color:#fff}.share-original:hover{background:#075e35}
@media(max-width:800px){.personalization-request{padding:20px}.personalization-request h2{font-size:23px}.request-layout{grid-template-columns:1fr}.send-card{position:static}}
</style>
