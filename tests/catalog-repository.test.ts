import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCatalogImportData } from '../scripts/catalog-import-data.ts'
import { loadCatalogWithFallback } from '../src/composables/useCatalog.ts'
import {
  mapCatalogRows,
  typescriptCatalogRepository,
  type CatalogRepository,
} from '../src/repositories/catalogRepository.ts'
import type { Tables } from '../src/types/database.ts'

test('repositório mapeia o catálogo importado com paridade de itens e imagens', async () => {
  const data = await buildCatalogImportData()
  const snapshot = mapCatalogRows({
    collections: data.collections as Tables<'collections'>[],
    products: data.products as Tables<'products'>[],
    relations: data.product_collections as Tables<'product_collections'>[],
    images: data.product_images as Tables<'product_images'>[],
  })

  assert.equal(snapshot.colecoes.length, 17)
  assert.equal(snapshot.colecoes.filter((collection) => collection.listada).length, 14)
  assert.equal(snapshot.produtos.length, 341)
  assert.ok(snapshot.produtos.every((product) => product.imagem.endsWith('.webp')))
  assert.ok(snapshot.produtos.every((product) => product.imagens?.[0] === product.imagem))
  assert.ok(snapshot.produtos.every((product) => product.colecao.length > 0))
  assert.ok(snapshot.produtos.every((product) => product.slug.length > 0 && product.sku.startsWith('CC-')))
  assert.ok(snapshot.produtos.every((product) => product.descricao.length > 0))
})

test('repositório preserva todas as imagens originais na ordem da galeria', () => {
  const snapshot = mapCatalogRows({
    collections: [],
    products: [{
      id: 'produto-galeria',
      slug: 'produto-galeria',
      sku: 'CC-GALERIA',
      name: 'Produto com galeria',
      theme: 'Galeria',
      description: 'Produto usado para validar a ordem das imagens.',
      price: 39.9,
      is_featured: false,
    }],
    relations: [],
    images: [
      { product_id: 'produto-galeria', storage_path: 'produtos/segunda.webp', variant: 'original', display_order: 2 },
      { product_id: 'produto-galeria', storage_path: 'produtos/card.webp', variant: 'card-640', display_order: 0 },
      { product_id: 'produto-galeria', storage_path: 'produtos/primeira.webp', variant: 'original', display_order: 1 },
    ],
  })

  assert.deepEqual(snapshot.produtos[0]?.imagens, ['produtos/primeira.webp', 'produtos/segunda.webp'])
  assert.equal(snapshot.produtos[0]?.imagem, 'produtos/primeira.webp')
})

test('falha do Supabase usa a cópia TypeScript sem deixar o catálogo vazio', async () => {
  const unavailableRepository: CatalogRepository = {
    async load() {
      throw new Error('falha simulada')
    },
  }

  const result = await loadCatalogWithFallback(unavailableRepository, typescriptCatalogRepository)

  assert.equal(result.state, 'fallback')
  assert.equal(result.source, 'typescript')
  assert.equal(result.snapshot.produtos.length, 721)
  assert.match(result.message ?? '', /temporariamente indisponível/)
})

test('falha de ambas as fontes produz estado recuperável de erro', async () => {
  const unavailableRepository: CatalogRepository = {
    async load() {
      throw new Error('falha simulada')
    },
  }

  const result = await loadCatalogWithFallback(unavailableRepository, unavailableRepository)

  assert.equal(result.state, 'error')
  assert.deepEqual(result.snapshot, { colecoes: [], produtos: [] })
  assert.match(result.message ?? '', /Tente novamente/)
})
