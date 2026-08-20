import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260820115000_pets_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260820115000_pets_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local publica exatamente pets-01 a pets-50', () => {
  const petsProducts = produtos.pets

  assert.equal(petsProducts.length, 50)
  assert.deepEqual(
    petsProducts.map((product) => product.id),
    Array.from({ length: 50 }, (_, index) => `pets-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(petsProducts.map((product) => product.imagem)).size, 50)
})

test('migration cadastra 50 produtos pets e quatro variantes', () => {
  assert.match(migration, /generate_series\(1, 50\)/i)
  assert.match(migration, /'pets'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 50 pets e preserva objetos para recuperação', () => {
  assert.match(rollback, /generate_series\(1, 50\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
