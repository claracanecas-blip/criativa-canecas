import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeCatalogSlug, validateImageCandidate } from '../src/utils/adminImages.ts'

test('normaliza slug administrativo com caracteres acentuados', () => {
  assert.equal(normalizeCatalogSlug('  Caneca Café & Amor  '), 'caneca-cafe-amor')
  assert.equal(normalizeCatalogSlug('Heróis / Séries 2026'), 'herois-series-2026')
})

test('validação administrativa aceita somente imagens suportadas até 10 MB', () => {
  assert.equal(validateImageCandidate({ name: 'caneca.webp', type: 'image/webp', size: 1024 }), null)
  assert.match(validateImageCandidate({ name: 'arte.svg', type: 'image/svg+xml', size: 1024 }) ?? '', /JPEG, PNG ou WebP/)
  assert.match(validateImageCandidate({ name: 'grande.jpg', type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 }) ?? '', /10 MB/)
  assert.match(validateImageCandidate({ name: 'vazio.png', type: 'image/png', size: 0 }) ?? '', /vazio/)
})
