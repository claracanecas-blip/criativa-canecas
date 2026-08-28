import type { Product } from '@/types/catalog'

export type ProductSort = 'default' | 'price-asc' | 'price-desc' | 'name'
export type PriceBand = 'all' | 'under-40' | '40-50' | 'over-50'

export interface ProductFilterOptions {
  collection?: string
  theme?: string
  priceBand?: PriceBand
  sort?: ProductSort
}

function matchesPriceBand(price: number, band: PriceBand): boolean {
  if (band === 'under-40') return price < 40
  if (band === '40-50') return price >= 40 && price < 50
  if (band === 'over-50') return price >= 50
  return true
}

export function filterAndSortProducts(products: Product[], options: ProductFilterOptions): Product[] {
  const priceBand = options.priceBand ?? 'all'
  const filtered = products.filter((product) => {
    const collections = product.colecoes ?? [product.colecao]
    if (options.collection && !collections.includes(options.collection)) return false
    if (options.theme && (product.tema ?? product.nome) !== options.theme) return false
    return matchesPriceBand(product.preco, priceBand)
  })

  if (options.sort === 'price-asc') return filtered.sort((a, b) => a.preco - b.preco || a.nome.localeCompare(b.nome, 'pt-BR'))
  if (options.sort === 'price-desc') return filtered.sort((a, b) => b.preco - a.preco || a.nome.localeCompare(b.nome, 'pt-BR'))
  if (options.sort === 'name') return filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return filtered
}
