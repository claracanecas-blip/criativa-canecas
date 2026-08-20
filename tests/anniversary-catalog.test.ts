import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260816200000_anniversary_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260816200000_anniversary_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local mantém os sete aniversários e acrescenta somente 08 a 23', () => {
  const anniversaryProducts = produtos.aniversario

  assert.equal(anniversaryProducts.length, 23)
  assert.deepEqual(
    anniversaryProducts.map((product) => product.id),
    Array.from({ length: 23 }, (_, index) => `aniversario-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(anniversaryProducts.map((product) => product.imagem)).size, 23)
})

test('migration cadastra 16 produtos e quatro variantes sem recriar 01 a 07', () => {
  assert.match(migration, /generate_series\(8, 23\)/i)
  assert.doesNotMatch(migration, /generate_series\(1, 23\)/i)
  assert.match(migration, /'aniversario'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os aniversários novos e preserva objetos para recuperação', () => {
  assert.match(rollback, /generate_series\(8, 23\)/i)
  assert.doesNotMatch(rollback, /generate_series\(1, 23\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
