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

test('catálogo local acrescenta exatamente animes-001 a animes-100', () => {
  assert.equal(novosProdutosAnimes.length, 100)
  assert.deepEqual(
    novosProdutosAnimes.map((product) => product.id),
    Array.from({ length: 100 }, (_, index) => `animes-${String(index + 1).padStart(3, '0')}`),
  )
  assert.equal(new Set(novosProdutosAnimes.map((product) => product.imagem)).size, 100)
  assert.equal(produtos.animes.length, 143)
  assert.deepEqual(produtos.animes.slice(-100), novosProdutosAnimes)
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
  assert.equal(totals.get('Hunter x Hunter'), 2)
  assert.equal(totals.get('Date A Live'), 2)
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
