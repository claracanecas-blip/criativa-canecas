<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from '@lucide/vue'
import CatalogImage from '@/components/ui/CatalogImage.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useQuoteCart } from '@/composables/useQuoteCart'
import { formatarPreco } from '@/data/produtos'
import { linkWhatsapp } from '@/data/site'
import { buildQuoteMessage, quoteTotal } from '@/services/quoteCart'
import { trackWhatsappClick } from '@/services/analytics'

const dialog = ref<HTMLDialogElement>()
const catalog = useCatalog()
const cart = useQuoteCart()
const resolvedItems = computed(() => cart.items.value.flatMap((entry) => {
  const product = catalog.buscarProduto(entry.slug)
  return product ? [{ ...entry, product }] : []
}))
const total = computed(() => quoteTotal(cart.items.value, catalog.produtos.value))
const whatsapp = computed(() => linkWhatsapp(buildQuoteMessage(
  cart.items.value,
  catalog.produtos.value,
  window.location.origin,
)))

watch(cart.isOpen, async (open) => {
  await nextTick()
  if (open && !dialog.value?.open) dialog.value?.showModal()
  if (!open && dialog.value?.open) dialog.value.close()
})

function close() {
  cart.close()
}

function handleBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

function confirmClear() {
  if (window.confirm('Remover todos os itens do orçamento?')) cart.clear()
}
</script>

<template>
  <p class="sr-only" aria-live="polite">{{ cart.announcement.value }}</p>
  <Teleport to="body">
    <dialog ref="dialog" class="quote-dialog" aria-labelledby="quote-title" @click="handleBackdrop" @cancel.prevent="close" @close="cart.close">
      <section class="quote-panel">
        <header class="quote-header">
          <div>
            <span><ShoppingBag :size="18" /> Orçamento</span>
            <h2 id="quote-title">Sua seleção</h2>
          </div>
          <button type="button" class="icon-button" aria-label="Fechar orçamento" @click="close"><X :size="22" /></button>
        </header>

        <div v-if="resolvedItems.length" class="quote-items">
          <article v-for="entry in resolvedItems" :key="entry.slug" class="quote-item">
            <RouterLink :to="`/produto/${entry.slug}`" @click="close">
              <CatalogImage class="quote-image" :src="entry.product.imagem" :alt="entry.product.nome" sizes="80px" />
            </RouterLink>
            <div class="quote-copy">
              <RouterLink :to="`/produto/${entry.slug}`" @click="close"><strong>{{ entry.product.nome }}</strong></RouterLink>
              <small>{{ entry.product.sku }}</small>
              <span>{{ formatarPreco(entry.product.preco * entry.quantity) }}</span>
              <div class="quantity" :aria-label="`Quantidade de ${entry.product.nome}`">
                <button type="button" :aria-label="`Diminuir ${entry.product.nome}`" :disabled="entry.quantity === 1" @click="cart.setQuantity(entry.slug, entry.quantity - 1)"><Minus :size="16" /></button>
                <output :aria-label="`${entry.quantity} unidades`">{{ entry.quantity }}</output>
                <button type="button" :aria-label="`Aumentar ${entry.product.nome}`" :disabled="entry.quantity === 99" @click="cart.setQuantity(entry.slug, entry.quantity + 1)"><Plus :size="16" /></button>
              </div>
            </div>
            <button type="button" class="remove-button" :aria-label="`Remover ${entry.product.nome}`" @click="cart.remove(entry.slug, entry.product.nome)"><Trash2 :size="18" /></button>
          </article>
        </div>

        <div v-else class="quote-empty">
          <ShoppingBag :size="48" :stroke-width="1.5" />
          <h3>Seu orçamento está vazio</h3>
          <p>Adicione os modelos que você gostou. Não é preciso criar conta.</p>
          <RouterLink class="btn" to="/colecoes" @click="close">Explorar coleções</RouterLink>
        </div>

        <footer v-if="resolvedItems.length" class="quote-footer">
          <div class="quote-total"><span>Total estimado</span><strong>{{ formatarPreco(total) }}</strong></div>
          <p>Valores, personalização, prazo e disponibilidade serão confirmados no atendimento. A seleção não reserva estoque nem confirma o pedido.</p>
          <a class="quote-whatsapp" :href="whatsapp" target="_blank" rel="noopener" @click="trackWhatsappClick('header_order')"><MessageCircle :size="20" /> Enviar lista pelo WhatsApp</a>
          <button type="button" class="clear-button" @click="confirmClear">Limpar seleção</button>
        </footer>
      </section>
    </dialog>
  </Teleport>
</template>

<style scoped>
.quote-dialog{width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent}.quote-dialog::backdrop{background:rgba(28,20,24,.55)}.quote-panel{position:fixed;inset:0 0 0 auto;width:min(470px,100%);display:flex;flex-direction:column;background:#fff;box-shadow:-20px 0 60px rgba(35,24,29,.2)}.quote-header{display:flex;align-items:flex-start;justify-content:space-between;padding:24px;border-bottom:1px solid var(--line)}.quote-header span{display:flex;align-items:center;gap:6px;color:var(--pink-dark);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.quote-header h2{margin:4px 0 0;font-size:28px}.icon-button,.remove-button{display:grid;place-items:center;border:0;background:transparent;color:var(--muted);cursor:pointer}.icon-button{width:42px;height:42px;border-radius:50%}.icon-button:hover,.remove-button:hover{background:var(--pink-soft);color:var(--pink-dark)}.quote-items{flex:1;overflow:auto;padding:8px 24px}.quote-item{display:grid;grid-template-columns:80px 1fr auto;gap:13px;padding:16px 0;border-bottom:1px solid var(--line)}.quote-image{width:80px;height:80px;border-radius:10px;object-fit:cover}.quote-copy{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0}.quote-copy strong{display:block;line-height:1.25}.quote-copy small{color:var(--muted)}.quote-copy>span{color:var(--pink-dark);font-weight:900}.quantity{display:flex;align-items:center;border:1px solid var(--line);border-radius:8px;margin-top:6px;overflow:hidden}.quantity button{display:grid;place-items:center;width:34px;height:31px;border:0;background:#fff;cursor:pointer}.quantity button:hover:not(:disabled){background:var(--pink-soft)}.quantity button:disabled{opacity:.35;cursor:not-allowed}.quantity output{min-width:34px;text-align:center;font-weight:900}.remove-button{width:36px;height:36px;border-radius:8px}.quote-empty{margin:auto;text-align:center;padding:35px;color:var(--muted)}.quote-empty svg{color:var(--pink-dark)}.quote-empty h3{margin:14px 0 5px;color:var(--ink)}.quote-empty p{line-height:1.5}.quote-footer{padding:20px 24px 24px;border-top:1px solid var(--line);background:#fff}.quote-total{display:flex;align-items:center;justify-content:space-between}.quote-total span{font-weight:800}.quote-total strong{font-size:25px;color:var(--pink-dark)}.quote-footer p{font-size:11px;line-height:1.45;color:var(--muted)}.quote-whatsapp{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:10px;background:#087f3f;color:#fff;font-weight:900}.quote-whatsapp:hover{background:#075e35}.clear-button{display:block;margin:12px auto 0;border:0;background:transparent;color:#8b304e;text-decoration:underline;cursor:pointer}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:600px){.quote-panel{top:auto;height:min(86vh,760px);border-radius:20px 20px 0 0}.quote-header{padding:18px}.quote-items{padding-inline:18px}.quote-footer{padding:16px 18px 20px}}
</style>
