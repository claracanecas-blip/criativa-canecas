import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { colecoes } from '../src/data/colecoes.ts'
import { produtos, todosProdutos } from '../src/data/produtos.ts'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const baselineRoot = join(projectRoot, 'docs', 'baselines')
const baselineDates = (await readdir(baselineRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
  .map((entry) => entry.name)
  .sort()
const latestBaseline = baselineDates.at(-1)
assert.ok(latestBaseline, 'Nenhum baseline versionado foi encontrado.')
const backupPath = join(baselineRoot, latestBaseline, 'catalog-backup.json')
const breakingBadMigration = await readFile(
  new URL('../supabase/migrations/20260830100000_clarify_breaking_bad_name.sql', import.meta.url),
  'utf8',
)
const breakingBadRollback = await readFile(
  new URL('../supabase/rollback/20260830100000_clarify_breaking_bad_name.sql', import.meta.url),
  'utf8',
)

test('catálogo possui IDs únicos e dados mínimos válidos', () => {
  const catalog = todosProdutos()
  assert.ok(catalog.length > 0)
  assert.equal(new Set(catalog.map((product) => product.id)).size, catalog.length)
  assert.equal(new Set(catalog.map((product) => product.nome)).size, catalog.length)
  for (const product of catalog) {
    assert.ok(product.nome.trim())
    assert.ok(product.colecao.trim())
    assert.ok(product.preco > 0)
    assert.match(product.imagem, /^\.\/img\/.+\.(?:jpe?g|png)$/i)
  }
})

test('artes diferentes mantêm nomes claros para o cliente', () => {
  const catalog = todosProdutos()
  assert.equal(catalog.find((product) => product.id === 'geek-16')?.nome, 'Breaking Bad — Walter e Jesse')
  assert.equal(catalog.find((product) => product.id === 'breaking-bad-1')?.nome, 'Breaking Bad 01')
  assert.match(breakingBadMigration, /geek-16.*Breaking Bad — Walter e Jesse/is)
  assert.match(breakingBadMigration, /update public\.product_images/is)
  assert.match(breakingBadRollback, /geek-16.*Breaking Bad 01/is)
})

test('coleções públicas possuem slugs únicos', () => {
  const slugs = colecoes.map((collection) => collection.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})

test('backup histórico é legível e permanece contido nas fontes atuais', async () => {
  const backupContents = await readFile(backupPath, 'utf8')
  const backup = JSON.parse(backupContents)
  const summaryPath = join(baselineRoot, latestBaseline, 'baseline-summary.json')
  const summary = JSON.parse(await readFile(summaryPath, 'utf8'))
  assert.equal(backup.schemaVersion, 1)
  assert.equal(createHash('sha256').update(backupContents).digest('hex'), summary.backup.sha256)
  assert.equal(backup.collections.length, colecoes.length)
  const currentProducts = todosProdutos()
  assert.equal(backup.materializedProducts.length, 341)
  assert.ok(currentProducts.length >= backup.materializedProducts.length)
  assert.ok(Object.keys(backup.productGroups).every((group) => group in produtos))
  const currentProductIds = new Set(currentProducts.map((product) => product.id))
  assert.ok(backup.materializedProducts.every((product: { id: string }) => currentProductIds.has(product.id)))
})

test('rotas declaradas não se repetem', async () => {
  const routerPath = fileURLToPath(new URL('../src/router/index.ts', import.meta.url))
  const source = await readFile(routerPath, 'utf8')
  const routes = [...source.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1])
  assert.ok(routes.includes('/'))
  assert.ok(routes.includes('/colecao/:slug'))
  assert.ok(routes.includes('/produto/:slug'))
  assert.equal(new Set(routes).size, routes.length)
})
