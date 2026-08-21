import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { novosProdutosAnimes } from '../src/data/animeCatalogExpansion.ts'
import { produtos } from '../src/data/produtos.ts'

const migration = await readFile(
  new URL('../supabase/migrations/20260821190000_anime_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260821190000_anime_catalog_expansion.sql', import.meta.url),
  'utf8',
)
const correctionMigration = await readFile(
  new URL('../supabase/migrations/20260821200000_correct_anime_catalog_classification.sql', import.meta.url),
  'utf8',
)
const correctionRollback = await readFile(
  new URL('../supabase/rollback/20260821200000_correct_anime_catalog_classification.sql', import.meta.url),
  'utf8',
)

test('catálogo local preserva os IDs aprovados e remove as duas artes repetidas ou incorretas', () => {
  assert.equal(novosProdutosAnimes.length, 98)
  assert.deepEqual(
    novosProdutosAnimes.map((product) => product.id),
    Array.from({ length: 100 }, (_, index) => index + 1)
      .filter((number) => ![27, 83].includes(number))
      .map((number) => `animes-${String(number).padStart(3, '0')}`),
  )
  assert.equal(new Set(novosProdutosAnimes.map((product) => product.imagem)).size, 98)
  assert.equal(produtos.animes.length, 141)
  assert.deepEqual(produtos.animes.slice(-98), novosProdutosAnimes)
})

test('seleção limita cada anime a no máximo cinco novas artes', () => {
  const totals = new Map<string, number>()
  for (const product of novosProdutosAnimes) {
    assert.ok(product.tema)
    totals.set(product.tema, (totals.get(product.tema) ?? 0) + 1)
  }

  assert.ok([...totals.values()].every((total) => total <= 5))
  assert.equal(totals.get('Spy x Family'), 5)
  assert.equal(totals.get('Demon Slayer'), 5)
  assert.equal(totals.get('Attack on Titan'), 5)
  assert.equal(totals.get('Hunter x Hunter'), 1)
  assert.equal(totals.get('Date A Live'), 2)
  assert.equal(totals.get('Fairy Tail'), undefined)
  assert.equal(totals.get('Cavaleiros do Zodíaco'), 1)
  assert.equal(totals.get('Cavaleiros do Zodíaco Dourados'), 4)
  assert.equal(novosProdutosAnimes.find((product) => product.id === 'animes-016')?.nome, 'Cavaleiros do Zodíaco 08')
  assert.equal(novosProdutosAnimes.find((product) => product.id === 'animes-017')?.nome, 'Cavaleiros do Zodíaco Dourados 13')
  assert.equal(novosProdutosAnimes.find((product) => product.id === 'animes-020')?.nome, 'Cavaleiros do Zodíaco Dourados 16')
})

test('migration cadastra 100 animes e quatro variantes por produto', () => {
  assert.match(migration, /create temporary table selected_anime_products/i)
  assert.match(migration, /Spy x Family.*generate_series\(1, 5\)/i)
  assert.match(migration, /\(100, 'Studio Ghibli'\)/i)
  assert.match(migration, /'animes'/i)
  assert.match(migration, /number \+ 42/i)
  assert.match(migration, /'original', '', 1000, 1000/i)
  assert.match(migration, /'card-320', 'card\/320\/', 320, 320/i)
  assert.match(migration, /'card-640', 'card\/640\/', 640, 640/i)
  assert.match(migration, /'social', 'social\/', 1200, 630/i)
})

test('rollback remove somente os 100 produtos e preserva as estampas', () => {
  assert.match(rollback, /generate_series\(1, 100\)/i)
  assert.match(rollback, /permanecem no Storage para rollback seguro/i)
  assert.doesNotMatch(rollback, /delete from storage\.objects/i)
})

test('correção remove Fairy Tail incorreto e Hunter duplicado sem apagar o Storage', () => {
  assert.match(correctionMigration, /'animes-027', 'animes-083'/i)
  assert.match(correctionMigration, /Cavaleiros do Zodíaco Dourados 13/i)
  assert.match(correctionMigration, /Cavaleiros do Zodíaco Dourados 16/i)
  assert.doesNotMatch(correctionMigration, /delete from storage\.objects/i)
  assert.match(correctionRollback, /Os oito WebPs removidos do catálogo permanecem no Storage/i)
  assert.match(correctionRollback, /O rollback reintroduz intencionalmente a classificação antiga/i)
})
