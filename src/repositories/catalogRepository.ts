import type { SupabaseClient } from '@supabase/supabase-js'
import { colecoes as colecoesLocais, todasColecoes } from '@/data/colecoes'
import type { CatalogSnapshot, Collection, IconName, Product } from '@/types/catalog'
import type { Database, Tables } from '@/types/database'
import { getSupabaseClient } from '@/services/supabase'
import { fetchAllQueryPages } from '@/utils/paginatedQuery'

export interface CatalogRepository {
  load(): Promise<CatalogSnapshot>
}

type CatalogCollectionRow = Pick<Tables<'collections'>, 'slug' | 'name' | 'description' | 'icon_name' | 'is_published' | 'is_listed'>
type CatalogProductRow = Pick<Tables<'products'>, 'id' | 'slug' | 'sku' | 'name' | 'theme' | 'description' | 'price' | 'is_featured'>
type CatalogRelationRow = Pick<Tables<'product_collections'>, 'product_id' | 'collection_id' | 'display_order'>
type CatalogImageRow = Pick<Tables<'product_images'>, 'product_id' | 'storage_path' | 'variant' | 'display_order'>

export interface CatalogDatabaseRows {
  collections: CatalogCollectionRow[]
  products: CatalogProductRow[]
  relations: CatalogRelationRow[]
  images: CatalogImageRow[]
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

  const originalImagesByProduct = new Map<string, string[]>()
  const originalImages = rows.images
    .filter((item) => item.variant === 'original')
    .sort((a, b) => a.display_order - b.display_order || a.storage_path.localeCompare(b.storage_path))
  for (const image of originalImages) {
    const current = originalImagesByProduct.get(image.product_id) ?? []
    current.push(image.storage_path)
    originalImagesByProduct.set(image.product_id, current)
  }

  const products = rows.products.map<Product>((product) => {
    const collectionsForProduct = collectionIdsByProduct.get(product.id) ?? []
    const images = originalImagesByProduct.get(product.id) ?? []
    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      nome: product.name,
      tema: product.theme || product.name,
      descricao: product.description,
      destaque: product.is_featured,
      preco: Number(product.price),
      imagem: images[0] ?? '',
      imagens: images,
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
      this.client.from('collections').select('slug,name,description,icon_name,is_published,is_listed').order('display_order'),
      fetchAllQueryPages<CatalogProductRow>((from, to) => this.client
        .from('products')
        .select('id,slug,sku,name,theme,description,price,is_featured')
        .eq('status', 'published')
        .order('display_order')
        .order('id')
        .range(from, to)),
      fetchAllQueryPages<CatalogRelationRow>((from, to) => this.client
        .from('product_collections')
        .select('product_id,collection_id,display_order')
        .order('display_order')
        .order('product_id')
        .order('collection_id')
        .range(from, to)),
      fetchAllQueryPages<CatalogImageRow>((from, to) => this.client
        .from('product_images')
        .select('product_id,storage_path,variant,display_order')
        .eq('variant', 'original')
        .order('display_order')
        .order('product_id')
        .range(from, to)),
    ])

    queryError('Falha ao carregar coleções', collections.error)

    return mapCatalogRows({
      collections: collections.data ?? [],
      products,
      relations,
      images,
    })
  }
}

export const typescriptCatalogRepository: CatalogRepository = {
  async load() {
    const { todosProdutos } = await import('@/data/produtos')
    return {
      colecoes: todasColecoes.map((collection) => ({
        ...collection,
        publicada: true,
        listada: colecoesLocais.some((listed) => listed.slug === collection.slug),
      })),
      produtos: todosProdutos().map((product) => ({
        ...product,
        slug: product.id,
        sku: `CC-${product.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
        descricao: `Caneca personalizada ${product.nome}, tema ${product.tema ?? product.nome}.`,
        destaque: false,
        colecoes: [product.colecao],
        imagens: [product.imagem],
      })),
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

  return new SupabaseCatalogRepository(getSupabaseClient())
}
