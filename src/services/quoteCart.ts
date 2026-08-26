import { formatarPreco } from '@/utils/currency'
import type { Product } from '@/types/catalog'

export const QUOTE_CART_STORAGE_KEY = 'criativa-canecas:quote-cart:v1'
export const QUOTE_CART_VERSION = 1
export const MAX_QUOTE_QUANTITY = 99

export interface QuoteCartItem {
  slug: string
  quantity: number
}

export interface StoredQuoteCart {
  version: typeof QUOTE_CART_VERSION
  items: QuoteCartItem[]
}

function validSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80
}

export function normalizeQuoteCart(value: unknown): StoredQuoteCart {
  if (!value || typeof value !== 'object') return { version: QUOTE_CART_VERSION, items: [] }
  const candidate = value as { version?: unknown; items?: unknown }
  if (candidate.version !== QUOTE_CART_VERSION || !Array.isArray(candidate.items)) {
    return { version: QUOTE_CART_VERSION, items: [] }
  }

  const quantities = new Map<string, number>()
  for (const item of candidate.items) {
    if (!item || typeof item !== 'object') continue
    const { slug, quantity } = item as { slug?: unknown; quantity?: unknown }
    if (!validSlug(slug) || typeof quantity !== 'number' || !Number.isFinite(quantity)) continue
    const normalizedQuantity = Math.min(MAX_QUOTE_QUANTITY, Math.max(1, Math.trunc(quantity)))
    quantities.set(slug, Math.min(MAX_QUOTE_QUANTITY, (quantities.get(slug) ?? 0) + normalizedQuantity))
  }

  return {
    version: QUOTE_CART_VERSION,
    items: [...quantities].map(([slug, quantity]) => ({ slug, quantity })),
  }
}

export function parseStoredQuoteCart(raw: string | null): StoredQuoteCart {
  if (!raw) return { version: QUOTE_CART_VERSION, items: [] }
  try {
    return normalizeQuoteCart(JSON.parse(raw))
  } catch {
    return { version: QUOTE_CART_VERSION, items: [] }
  }
}

export function quoteTotal(items: QuoteCartItem[], products: Product[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const total = items.reduce((sum, item) => sum + (bySlug.get(item.slug)?.preco ?? 0) * item.quantity, 0)
  return Math.round(total * 100) / 100
}

export function buildQuoteMessage(items: QuoteCartItem[], products: Product[], origin: string) {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const available = items.flatMap((item) => {
    const product = bySlug.get(item.slug)
    return product ? [{ item, product }] : []
  })
  if (!available.length) return 'Olá! Gostaria de solicitar um orçamento de canecas personalizadas.'

  const lines = available.flatMap(({ item, product }, index) => [
    `${index + 1}. ${item.quantity}x ${product.nome} (${product.sku}) — ${formatarPreco(product.preco * item.quantity)}`,
    `${origin.replace(/\/$/, '')}/produto/${product.slug}`,
  ])
  const total = quoteTotal(items, products)
  return [
    'Olá! Gostaria de solicitar um orçamento:',
    '',
    ...lines,
    '',
    `Total estimado: ${formatarPreco(total)}`,
    '',
    'Os valores são estimativas. Vou confirmar personalização, prazo e disponibilidade no atendimento; esta mensagem não reserva estoque nem confirma o pedido.',
  ].join('\n')
}
