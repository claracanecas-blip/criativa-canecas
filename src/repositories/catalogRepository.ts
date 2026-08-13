import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { colecoes as colecoesLocais, todasColecoes } from '@/data/colecoes'
import { todosProdutos } from '@/data/produtos'
import type { CatalogSnapshot, Collection, IconName, Product } from '@/types/catalog'
import type { Database, Tables } from '@/types/database'

export interface CatalogRepository {
  load(): Promise<CatalogSnapshot>
}

export interface CatalogDatabaseRows {
  collections: Tables<'collections'>[]
  products: Tables<'products'>[]
  relations: Tables<'product_collections'>[]
  images: Tables<'product_images'>[]
}

const knownIcons = new Set<IconName>(todasColecoes.map((collection) => collection.icone))

function iconName(value: string): IconName {
  return knownIcons.has(value as IconName) ? value as IconName : 'Sparkles'
}

export function mapCatalogRows(rows: CatalogDatabaseRows): CatalogSnapshot {
  const localBySlug = new Map(todasColecoes.map((collection) => [collection.slug, collection]))
  const collections = rows.collections.map<Collection>((collection) => ({
    slug: collection.slug,
    nome: collection.name,
    icone: iconName(collection.icon_name),
    to: localBySlug.get(collection.slug)?.to,
    descricao: collection.description,
    publicada: collection.is_published,
    listada: collection.is_listed,
  }))

  const collectionIdsByProduct = new Map<string, string[]>()
  for (const relation of [...rows.relations].sort((a, b) => a.display_order - b.display_order)) {
    const current = collectionIdsByProduct.get(relation.product_id) ?? []
    current.push(relation.collection_id)
    collectionIdsByProduct.set(relation.product_id, current)
  }

  const originalImageByProduct = new Map(
    rows.images
      .filter((image) => image.variant === 'original')
      .map((image) => [image.product_id, image.storage_path]),
  )

  const products = rows.products.map<Product>((product) => {
    const collectionsForProduct = collectionIdsByProduct.get(product.id) ?? []
    return {
      id: product.id,
      nome: product.name,
      tema: product.theme || product.name,
      preco: Number(product.price),
      imagem: originalImageByProduct.get(product.id) ?? '',
      colecao: collectionsForProduct[0] ?? '',
      colecoes: collectionsForProduct,
    }
  })

  return { colecoes: collections, produtos: products }
}

function queryError(label: string, error: { message: string } | null): void {
  if (error) throw new Error(`${label}: ${error.message}`)
}

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async load(): Promise<CatalogSnapshot> {
    const [collections, products, relations, images] = await Promise.all([
      this.client.from('collections').select('*').order('display_order'),
      this.client.from('products').select('*').eq('status', 'published').order('display_order').range(0, 999),
      this.client.from('product_collections').select('*').order('display_order').range(0, 999),
      this.client.from('product_images').select('*').eq('variant', 'original').order('display_order').range(0, 999),
    ])

    queryError('Falha ao carregar coleções', collections.error)
    queryError('Falha ao carregar produtos', products.error)
    queryError('Falha ao carregar relações', relations.error)
    queryError('Falha ao carregar imagens', images.error)

    return mapCatalogRows({
      collections: collections.data ?? [],
      products: products.data ?? [],
      relations: relations.data ?? [],
      images: images.data ?? [],
    })
  }
}

export const typescriptCatalogRepository: CatalogRepository = {
  async load() {
    return {
      colecoes: todasColecoes.map((collection) => ({
        ...collection,
        publicada: true,
        listada: colecoesLocais.some((listed) => listed.slug === collection.slug),
      })),
      produtos: todosProdutos().map((product) => ({ ...product, colecoes: [product.colecao] })),
    }
  },
}

export function configuredCatalogRepository(): CatalogRepository {
  if (import.meta.env.VITE_CATALOG_SOURCE === 'typescript') return typescriptCatalogRepository

  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    return {
      async load() {
        throw new Error('Configuração pública do Supabase ausente')
      },
    }
  }

  return new SupabaseCatalogRepository(createClient<Database>(url, publishableKey))
}
