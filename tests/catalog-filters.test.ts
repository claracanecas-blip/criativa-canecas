import assert from 'node:assert/strict'
import test from 'node:test'
import { filterAndSortProducts } from '../src/utils/catalogFilters.ts'
import type { Product } from '../src/types/catalog.ts'

const products: Product[] = [
  { id: 'b', slug: 'b', sku: 'CC-B', nome: 'Beta', imagem: 'b.webp', tema: 'Tema B', preco: 54.9, colecao: 'presentes', colecoes: ['presentes'], descricao: '', destaque: false },
  { id: 'a', slug: 'a', sku: 'CC-A', nome: 'Ágata', imagem: 'a.webp', tema: 'Tema A', preco: 39.9, colecao: 'series', colecoes: ['series', 'presentes'], descricao: '', destaque: false },
  { id: 'c', slug: 'c', sku: 'CC-C', nome: 'Caneca C', imagem: 'c.webp', tema: 'Tema A', preco: 44.9, colecao: 'series', colecoes: ['series'], descricao: '', destaque: false },
]

test('filtra produtos por coleção, tema e faixas de preço reais', () => {
  assert.deepEqual(filterAndSortProducts(products, { collection: 'series' }).map((item) => item.id), ['a', 'c'])
  assert.deepEqual(filterAndSortProducts(products, { theme: 'Tema A', priceBand: '40-50' }).map((item) => item.id), ['c'])
  assert.deepEqual(filterAndSortProducts(products, { priceBand: 'over-50' }).map((item) => item.id), ['b'])
})

test('ordena sem alterar a lista de origem', () => {
  assert.deepEqual(filterAndSortProducts(products, { sort: 'price-asc' }).map((item) => item.id), ['a', 'c', 'b'])
  assert.deepEqual(filterAndSortProducts(products, { sort: 'price-desc' }).map((item) => item.id), ['b', 'c', 'a'])
  assert.deepEqual(filterAndSortProducts(products, { sort: 'name' }).map((item) => item.id), ['a', 'b', 'c'])
  assert.deepEqual(products.map((item) => item.id), ['b', 'a', 'c'])
})
