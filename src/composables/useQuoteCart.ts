import { computed, ref } from 'vue'
import {
  MAX_QUOTE_QUANTITY,
  QUOTE_CART_STORAGE_KEY,
  QUOTE_CART_VERSION,
  parseStoredQuoteCart,
  type QuoteCartItem,
} from '@/services/quoteCart'

const items = ref<QuoteCartItem[]>([])
const isOpen = ref(false)
const announcement = ref('')
let hydrated = false

function persist() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify({
    version: QUOTE_CART_VERSION,
    items: items.value,
  }))
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  const stored = parseStoredQuoteCart(window.localStorage.getItem(QUOTE_CART_STORAGE_KEY))
  items.value = stored.items
  persist()
}

export function useQuoteCart() {
  hydrate()

  const totalQuantity = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))

  function add(slug: string, productName = 'Produto') {
    const existing = items.value.find((item) => item.slug === slug)
    if (existing) existing.quantity = Math.min(MAX_QUOTE_QUANTITY, existing.quantity + 1)
    else items.value.push({ slug, quantity: 1 })
    items.value = [...items.value]
    announcement.value = `${productName} adicionado ao orçamento.`
    persist()
  }

  function setQuantity(slug: string, quantity: number) {
    const item = items.value.find((entry) => entry.slug === slug)
    if (!item) return
    item.quantity = Math.min(MAX_QUOTE_QUANTITY, Math.max(1, Math.trunc(quantity)))
    items.value = [...items.value]
    persist()
  }

  function remove(slug: string, productName = 'Produto') {
    items.value = items.value.filter((item) => item.slug !== slug)
    announcement.value = `${productName} removido do orçamento.`
    persist()
  }

  function clear() {
    items.value = []
    announcement.value = 'Orçamento esvaziado.'
    persist()
  }

  return {
    items,
    isOpen,
    announcement,
    totalQuantity,
    add,
    setQuantity,
    remove,
    clear,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
