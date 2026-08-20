import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260820230000_religion_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260820230000_religion_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local publica exatamente religiao-01 a religiao-50', () => {
  const religionProducts = produtos.religiao

  assert.equal(religionProducts.length, 50)
  assert.deepEqual(
    religionProducts.map((product) => product.id),
    Array.from({ length: 50 }, (_, index) => `religiao-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(religionProducts.map((product) => product.imagem)).size, 50)
  assert.equal(religionProducts[0]?.nome, 'Fé Islâmica')
  assert.equal(religionProducts[49]?.nome, 'Unidos pelo Amor do Pai')
})

test('migration cadastra 50 artes religiosas e quatro variantes por produto', () => {
  assert.match(migration, /create temporary table selected_religion_products/i)
  assert.match(migration, /\(1, 'Fé Islâmica', 'Islâmica'\)/i)
  assert.match(migration, /\(50, 'Unidos pelo Amor do Pai', 'Cristã'\)/i)
  assert.match(migration, /'religiao'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 50 produtos de religião e preserva as estampas', () => {
  assert.match(rollback, /generate_series\(1, 50\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
