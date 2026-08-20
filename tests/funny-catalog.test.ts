import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260820233000_funny_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260820233000_funny_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local publica exatamente divertidas-01 a divertidas-36', () => {
  const funnyProducts = produtos.divertidas

  assert.equal(funnyProducts.length, 36)
  assert.deepEqual(
    funnyProducts.map((product) => product.id),
    Array.from({ length: 36 }, (_, index) => `divertidas-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(funnyProducts.map((product) => product.imagem)).size, 36)
  assert.equal(funnyProducts[0]?.nome, 'Vem Ni Mim')
  assert.equal(funnyProducts[35]?.nome, 'Surte e Atirei o Pau na Dona Chica')
})

test('migration cadastra 36 artes divertidas e quatro variantes por produto', () => {
  assert.match(migration, /create temporary table selected_funny_products/i)
  assert.match(migration, /\(1, 'Vem Ni Mim', 'Frases'\)/i)
  assert.match(migration, /\(36, 'Surte e Atirei o Pau na Dona Chica', 'Gatos'\)/i)
  assert.match(migration, /'divertidas'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 36 produtos divertidos e preserva as estampas', () => {
  assert.match(rollback, /generate_series\(1, 36\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
