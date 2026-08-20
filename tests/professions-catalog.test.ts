import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260820220000_professions_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260820220000_professions_catalog_expansion.sql', import.meta.url),
  'utf8',
)

test('catálogo local publica exatamente profissoes-01 a profissoes-50', () => {
  const professionProducts = produtos.profissoes

  assert.equal(professionProducts.length, 50)
  assert.deepEqual(
    professionProducts.map((product) => product.id),
    Array.from({ length: 50 }, (_, index) => `profissoes-${String(index + 1).padStart(2, '0')}`),
  )
  assert.equal(new Set(professionProducts.map((product) => product.imagem)).size, 50)
  assert.equal(new Set(professionProducts.map((product) => product.tema)).size, 50)
  assert.equal(professionProducts[0]?.nome, 'Administração 01')
  assert.equal(professionProducts[49]?.nome, 'Veterinária 01')
})

test('migration cadastra 50 profissões e quatro variantes por produto', () => {
  assert.match(migration, /create temporary table selected_profession_products/i)
  assert.match(migration, /\(50, 'Veterinária'\)/i)
  assert.match(migration, /'profissoes'/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 50 produtos de profissões e preserva as estampas', () => {
  assert.match(rollback, /generate_series\(1, 50\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})
