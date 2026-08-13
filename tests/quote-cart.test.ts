import assert from 'node:assert/strict'
import test from 'node:test'
import { todosProdutos } from '../src/data/produtos.ts'
import {
  buildQuoteMessage,
  normalizeQuoteCart,
  parseStoredQuoteCart,
  quoteTotal,
} from '../src/services/quoteCart.ts'

test('carrinho persistido rejeita formato inválido, mescla duplicados e limita quantidade', () => {
  assert.deepEqual(parseStoredQuoteCart('json inválido'), { version: 1, items: [] })
  assert.deepEqual(normalizeQuoteCart({ version: 99, items: [] }), { version: 1, items: [] })
  assert.deepEqual(normalizeQuoteCart({
    version: 1,
    items: [
      { slug: 'arrow-1', quantity: 2.9 },
      { slug: 'arrow-1', quantity: 200 },
      { slug: '<script>', quantity: 1 },
      { slug: 'arrow-2', quantity: -3 },
    ],
  }), {
    version: 1,
    items: [
      { slug: 'arrow-1', quantity: 99 },
      { slug: 'arrow-2', quantity: 1 },
    ],
  })
})

test('mensagem consolidada contém quantidades, SKUs, links, total e ressalvas', () => {
  const items = [
    { slug: 'arrow-1', quantity: 2 },
    { slug: 'arrow-2', quantity: 1 },
  ]
  const selected = todosProdutos().filter((product) => items.some((item) => item.slug === product.slug))
  const message = buildQuoteMessage(items, selected, 'https://criativa-canecas.vercel.app/')

  assert.match(message, /2x Arrow 01 \(CC-ARROW-1\)/)
  assert.match(message, /1x Arrow 02 \(CC-ARROW-2\)/)
  assert.match(message, /https:\/\/criativa-canecas\.vercel\.app\/produto\/arrow-1/)
  assert.equal(quoteTotal(items, selected), 119.7)
  assert.match(message, /Total estimado: R\$\s*119,70/)
  assert.match(message, /não reserva estoque nem confirma o pedido/i)
})
