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

test('catálogo possui IDs únicos e dados mínimos válidos', () => {
  const catalog = todosProdutos()
  assert.ok(catalog.length > 0)
  assert.equal(new Set(catalog.map((product) => product.id)).size, catalog.length)
  for (const product of catalog) {
    assert.ok(product.nome.trim())
    assert.ok(product.colecao.trim())
    assert.ok(product.preco > 0)
    assert.match(product.imagem, /^\.\/img\/.+\.(?:jpe?g|png)$/i)
  }
})

test('coleções públicas possuem slugs únicos', () => {
  const slugs = colecoes.map((collection) => collection.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})

test('backup é legível e reconciliado com as fontes', async () => {
  const backupContents = await readFile(backupPath, 'utf8')
  const backup = JSON.parse(backupContents)
  const summaryPath = join(baselineRoot, latestBaseline, 'baseline-summary.json')
  const summary = JSON.parse(await readFile(summaryPath, 'utf8'))
  assert.equal(backup.schemaVersion, 1)
  assert.equal(createHash('sha256').update(backupContents).digest('hex'), summary.backup.sha256)
  assert.equal(backup.collections.length, colecoes.length)
  assert.equal(backup.materializedProducts.length, todosProdutos().length)
  assert.deepEqual(Object.keys(backup.productGroups).sort(), Object.keys(produtos).sort())
  assert.deepEqual(
    backup.materializedProducts.map((product: { id: string }) => product.id).sort(),
    todosProdutos().map((product) => product.id).sort(),
  )
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
