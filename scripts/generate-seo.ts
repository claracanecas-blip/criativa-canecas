import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from 'vite'
import { buildCatalogImportData } from './catalog-import-data.ts'

interface SeoCollection {
  id: string
  slug: string
  name: string
  description: string
  image_path: string | null
  updated_at?: string
}

interface SeoProduct {
  id: string
  slug: string
  sku: string
  name: string
  theme: string
  description: string
  price: number
  updated_at?: string
  collectionIds: string[]
  imagePath: string
}

export interface SeoCatalog {
  collections: SeoCollection[]
  products: SeoProduct[]
}

const siteUrl = 'https://criativa-canecas.vercel.app'
const storageUrl = 'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}

function escapeXml(value: string): string {
  return escapeHtml(value)
}

function imageUrl(path: string, variant: 'original' | 'social' = 'original'): string {
  const filename = path.split('/').at(-1) ?? path
  return `${storageUrl}/${variant === 'social' ? 'social/' : ''}${encodeURIComponent(filename)}`
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function renderSeoHtml(
  template: string,
  meta: { title: string; description: string; canonical: string; image: string; type: 'website' | 'product'; jsonLd: unknown[] },
  body: string,
): string {
  const head = [
    `<meta data-criativa-dynamic-meta name="description" content="${escapeHtml(meta.description)}">`,
    `<link data-criativa-dynamic-meta rel="canonical" href="${escapeHtml(meta.canonical)}">`,
    `<meta data-criativa-dynamic-meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta data-criativa-dynamic-meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta data-criativa-dynamic-meta property="og:url" content="${escapeHtml(meta.canonical)}">`,
    `<meta data-criativa-dynamic-meta property="og:type" content="${meta.type}">`,
    `<meta data-criativa-dynamic-meta property="og:site_name" content="Criativa Canecas">`,
    `<meta data-criativa-dynamic-meta property="og:image" content="${escapeHtml(meta.image)}">`,
    '<meta data-criativa-dynamic-meta name="twitter:card" content="summary_large_image">',
    `<meta data-criativa-dynamic-meta name="twitter:image" content="${escapeHtml(meta.image)}">`,
    ...meta.jsonLd.map((value) => `<script data-criativa-dynamic-meta type="application/ld+json">${safeJson(value)}</script>`),
  ].join('\n  ')

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/\s*<meta[^>]+name="description"[^>]*>/i, '')
    .replace('</head>', `  ${head}\n</head>`)
    .replace('<div id="app"></div>', `<div id="app">${body}</div>`)
}

async function remoteCatalog(url: string, key: string): Promise<SeoCatalog> {
  const client = createClient(url, key, { auth: { persistSession: false } })
  const [collections, products, relations, images] = await Promise.all([
    client.from('collections').select('id,slug,name,description,image_path,updated_at').eq('is_published', true).order('display_order'),
    client.from('products').select('id,slug,sku,name,theme,description,price,updated_at').eq('status', 'published').order('display_order').range(0, 999),
    client.from('product_collections').select('product_id,collection_id,display_order').order('display_order').range(0, 999),
    client.from('product_images').select('product_id,storage_path,variant').eq('variant', 'original').range(0, 999),
  ])
  for (const result of [collections, products, relations, images]) {
    if (result.error) throw result.error
  }
  const relationMap = new Map<string, string[]>()
  for (const relation of relations.data ?? []) {
    const ids = relationMap.get(relation.product_id) ?? []
    ids.push(relation.collection_id)
    relationMap.set(relation.product_id, ids)
  }
  const imageMap = new Map((images.data ?? []).map((image) => [image.product_id, image.storage_path]))
  return {
    collections: collections.data ?? [],
    products: (products.data ?? []).map((product) => ({
      ...product,
      price: Number(product.price),
      collectionIds: relationMap.get(product.id) ?? [],
      imagePath: imageMap.get(product.id) ?? '',
    })),
  }
}

async function fallbackCatalog(): Promise<SeoCatalog> {
  const data = await buildCatalogImportData()
  const relations = new Map<string, string[]>()
  for (const relation of data.product_collections) {
    const ids = relations.get(relation.product_id) ?? []
    ids.push(relation.collection_id)
    relations.set(relation.product_id, ids)
  }
  const images = new Map(data.product_images.filter((image) => image.variant === 'original').map((image) => [image.product_id, image.storage_path]))
  return {
    collections: data.collections.filter((collection) => collection.is_published).map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      image_path: collection.image_path,
    })),
    products: data.products.filter((product) => product.status === 'published').map((product) => ({
      ...product,
      collectionIds: relations.get(product.id) ?? [],
      imagePath: images.get(product.id) ?? '',
    })),
  }
}

export async function generateSeoAssets(outputDirectory = resolve('dist')): Promise<{ products: number; collections: number }> {
  const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
  let catalog: SeoCatalog
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    try {
      catalog = await remoteCatalog(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)
    } catch (error) {
      console.warn(`Supabase indisponível no build SEO; usando backup: ${error instanceof Error ? error.message : error}`)
      catalog = await fallbackCatalog()
    }
  } else {
    catalog = await fallbackCatalog()
  }

  if (!catalog.products.length || !catalog.collections.length) throw new Error('Catálogo vazio durante geração SEO.')
  const template = await readFile(resolve(outputDirectory, 'index.html'), 'utf8')
  for (const product of catalog.products) {
    const canonical = `${siteUrl}/produto/${product.slug}`
    const socialImage = imageUrl(product.imagePath, 'social')
    const jsonLd = [
      {
        '@context': 'https://schema.org', '@type': 'Product', name: product.name,
        description: product.description, sku: product.sku, image: [imageUrl(product.imagePath)],
        brand: { '@type': 'Brand', name: 'Criativa Canecas' },
        offers: { '@type': 'Offer', url: canonical, priceCurrency: 'BRL', price: product.price.toFixed(2) },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Coleções', item: `${siteUrl}/colecoes` },
          { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
        ],
      },
    ]
    const body = `<main><article><h1>${escapeHtml(product.name)}</h1><p>Código ${escapeHtml(product.sku)}</p><p>${escapeHtml(product.description)}</p><p>R$ ${product.price.toFixed(2).replace('.', ',')}</p><img src="${escapeHtml(imageUrl(product.imagePath))}" alt="${escapeHtml(product.name)}" width="1000" height="1000"></article></main>`
    const html = renderSeoHtml(template, { title: `${product.name} | Criativa Canecas`, description: product.description, canonical, image: socialImage, type: 'product', jsonLd }, body)
    const directory = resolve(outputDirectory, 'produto')
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, `${product.slug}.html`), html)
  }

  for (const collection of catalog.collections) {
    const canonical = `${siteUrl}/colecao/${collection.slug}`
    const firstProduct = catalog.products.find((product) => product.collectionIds.includes(collection.id))
    const image = imageUrl(firstProduct?.imagePath ?? collection.image_path ?? 'logo.webp', 'social')
    const products = catalog.products.filter((product) => product.collectionIds.includes(collection.id))
    const body = `<main><section><h1>${escapeHtml(collection.name)}</h1><p>${escapeHtml(collection.description)}</p><ul>${products.slice(0, 40).map((product) => `<li><a href="/produto/${escapeHtml(product.slug)}">${escapeHtml(product.name)}</a></li>`).join('')}</ul></section></main>`
    const jsonLd = [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Coleções', item: `${siteUrl}/colecoes` },
        { '@type': 'ListItem', position: 3, name: collection.name, item: canonical },
      ],
    }]
    const html = renderSeoHtml(template, { title: `${collection.name} | Criativa Canecas`, description: collection.description, canonical, image, type: 'website', jsonLd }, body)
    const directory = resolve(outputDirectory, 'colecao')
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, `${collection.slug}.html`), html)
  }

  const informationCanonical = `${siteUrl}/informacoes`
  const informationHtml = renderSeoHtml(template, {
    title: 'Informações e cuidados | Criativa Canecas',
    description: 'Saiba como funciona a personalização, produção, entrega, cuidados e atendimento da Criativa Canecas.',
    canonical: informationCanonical,
    image: imageUrl('logo.webp', 'social'),
    type: 'website',
    jsonLd: [],
  }, '<main><article><h1>Informações e cuidados</h1><p>Orientações sobre personalização, produção, entrega, conservação e atendimento.</p><h2>Perguntas frequentes</h2><p>Valores, prazos e disponibilidade são confirmados pelo atendimento antes do pedido.</p></article></main>')
  await writeFile(resolve(outputDirectory, 'informacoes.html'), informationHtml)

  const urls = [
    { loc: siteUrl },
    { loc: `${siteUrl}/colecoes` },
    { loc: informationCanonical },
    ...catalog.collections.map((collection) => ({ loc: `${siteUrl}/colecao/${collection.slug}`, lastmod: collection.updated_at })),
    ...catalog.products.map((product) => ({ loc: `${siteUrl}/produto/${product.slug}`, lastmod: product.updated_at })),
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(url.lastmod.slice(0, 10))}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
  await writeFile(resolve(outputDirectory, 'sitemap.xml'), sitemap)
  await writeFile(resolve(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
  await writeFile(resolve(outputDirectory, 'seo-build-report.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), products: catalog.products.length, collections: catalog.collections.length, urls: urls.length }, null, 2)}\n`)

  console.log(`SEO gerado: ${catalog.products.length} produtos, ${catalog.collections.length} coleções, ${urls.length} URLs.`)
  return { products: catalog.products.length, collections: catalog.collections.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await generateSeoAssets()
}
