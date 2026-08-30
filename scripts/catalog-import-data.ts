import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

interface BackupCollection {
  slug: string
  nome: string
  icone: string
}

interface BackupProduct {
  id: string
  nome: string
  tema?: string
  preco: number
  imagem: string
  colecao: string
}

interface CatalogBackup {
  collections: BackupCollection[]
  materializedProducts: BackupProduct[]
}

const legacyCollections: BackupCollection[] = [
  { slug: 'desenhos', nome: 'Desenhos', icone: 'Palette' },
  { slug: 'herois', nome: 'Heróis', icone: 'Sparkles' },
]

function imageFilename(path: string): string {
  const filename = path.split('/').at(-1)
  if (!filename) throw new Error(`Caminho de imagem inválido: ${path}`)
  return filename.replace(/\.(?:jpe?g|png)$/i, '.webp')
}

function skuFromId(id: string): string {
  return `CC-${id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`
}

function assertUnique(values: string[], label: string): void {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
  if (duplicates.length) throw new Error(`${label} duplicados: ${[...new Set(duplicates)].join(', ')}`)
}

export async function buildCatalogImportData() {
  const backupPath = fileURLToPath(new URL('../docs/baselines/2026-08-13/catalog-backup.json', import.meta.url))
  const backup = JSON.parse(await readFile(backupPath, 'utf8')) as CatalogBackup
  const publicSlugs = new Set(backup.collections.map((collection) => collection.slug))
  const allCollections = [...backup.collections, ...legacyCollections]

  assertUnique(allCollections.map((collection) => collection.slug), 'Slugs de coleção')
  assertUnique(backup.materializedProducts.map((product) => product.id), 'IDs de produto')

  const groupOrder = new Map<string, number>()
  const products = backup.materializedProducts.map((product) => {
    const displayOrder = groupOrder.get(product.colecao) ?? 0
    groupOrder.set(product.colecao, displayOrder + 1)
    const theme = product.tema?.trim() || product.nome
    return {
      id: product.id,
      slug: product.id,
      sku: skuFromId(product.id),
      name: product.nome,
      theme,
      description: `Caneca personalizada ${product.nome}, tema ${theme}.`,
      price: Number(product.preco.toFixed(2)),
      status: 'published',
      is_featured: false,
      display_order: displayOrder,
      seo_title: `${product.nome} | Criativa Canecas`,
      seo_description: `Conheça a caneca ${product.nome} personalizada pela Criativa Canecas.`,
    }
  })

  const productSource = new Map(backup.materializedProducts.map((product) => [product.id, product]))
  const firstImageByCollection = new Map<string, string>()
  for (const product of backup.materializedProducts) {
    if (!firstImageByCollection.has(product.colecao)) {
      firstImageByCollection.set(product.colecao, imageFilename(product.imagem))
    }
  }

  const collections = allCollections.map((collection, index) => ({
    id: collection.slug,
    slug: collection.slug,
    name: collection.nome,
    description: `Canecas da coleção ${collection.nome}.`,
    icon_name: collection.icone,
    image_path: firstImageByCollection.get(collection.slug) ?? null,
    display_order: index,
    is_published: collection.slug !== 'personalizada',
    is_listed: collection.slug !== 'personalizada' && publicSlugs.has(collection.slug),
    seo_title: `${collection.nome} | Criativa Canecas`,
    seo_description: `Explore canecas da coleção ${collection.nome} na Criativa Canecas.`,
  }))

  const productCollections = products.map((product) => {
    const source = productSource.get(product.id)
    if (!source || !allCollections.some((collection) => collection.slug === source.colecao)) {
      throw new Error(`Coleção ausente para ${product.id}`)
    }
    return {
      product_id: product.id,
      collection_id: source.colecao,
      display_order: product.display_order,
    }
  })

  const variants = [
    { name: 'original', directory: '', width: 1000, height: 1000 },
    { name: 'card-320', directory: 'card/320/', width: 320, height: 320 },
    { name: 'card-640', directory: 'card/640/', width: 640, height: 640 },
    { name: 'social', directory: 'social/', width: 1200, height: 630 },
  ] as const

  const productImages = products.flatMap((product) => {
    const source = productSource.get(product.id)
    if (!source) throw new Error(`Produto sem origem: ${product.id}`)
    const filename = imageFilename(source.imagem)
    return variants.map((variant) => ({
      id: `${product.id}--${variant.name}`,
      product_id: product.id,
      storage_path: `${variant.directory}${filename}`,
      variant: variant.name,
      alt_text: product.name,
      width: variant.width,
      height: variant.height,
      display_order: 0,
    }))
  })

  assertUnique(products.map((product) => product.sku), 'SKUs')
  assertUnique(productImages.map((image) => image.id), 'IDs de imagem')

  return {
    collections,
    products,
    product_collections: productCollections,
    product_images: productImages,
  }
}

export type CatalogImportData = Awaited<ReturnType<typeof buildCatalogImportData>>
