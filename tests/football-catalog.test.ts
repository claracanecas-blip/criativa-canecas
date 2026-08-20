import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260820210000_football_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260820210000_football_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local publica exatamente futebol-01 a futebol-50', () => {
  const footballProducts = produtos.futebol

  assert.equal(footballProducts.length, 50)
  assert.deepEqual(
    footballProducts.map((product) => product.id),
    Array.from({ length: 50 }, (_, index) => `futebol-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(footballProducts.map((product) => product.imagem)).size, 50)
  assert.equal(footballProducts[0]?.nome, 'Flamengo 01')
  assert.equal(footballProducts[49]?.nome, 'Chelsea 02')
})

test('migration cadastra 50 produtos de futebol e quatro variantes', () => {
  assert.match(migration, /create temporary table selected_football_products/i)
  assert.match(migration, /\(50, 'Chelsea', 2\)/i)
  assert.match(migration, /'futebol'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 50 produtos novos e preserva objetos', () => {
  assert.match(rollback, /generate_series\(1, 50\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
