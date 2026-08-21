import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260821210000_friendship_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260821210000_friendship_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local inclui as 30 novas artes de amizade sem repetir IDs ou imagens', () => {
  assert.equal(produtos.amizade.length, 72)

  const expansion = produtos.amizade.slice(42)
  assert.deepEqual(
    expansion.map((product) => product.id),
    Array.from({ length: 30 }, (_, index) => `amizade-${String(index + 43).padStart(2, '0')}`),
  )
  assert.equal(new Set(expansion.map((product) => product.id)).size, 30)
  assert.equal(new Set(expansion.map((product) => product.imagem)).size, 30)
  assert.ok(expansion.every((product) => product.tema === 'Amizade'))
})

test('migration publica 30 produtos de amizade com quatro variantes por item', () => {
  assert.match(migration, /generate_series\(43, 72\)/i)
  assert.match(migration, /'amizade'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove só amizade-43 a amizade-72 e preserva os objetos', () => {
  assert.match(rollback, /generate_series\(43, 72\)/i)
  assert.match(rollback, /120 objetos WebP permanecem no Storage/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
