import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCatalogImportData } from '../scripts/catalog-import-data.ts'

test('importação materializa catálogo completo e relações exatas', async () => {
  const data = await buildCatalogImportData()

  assert.equal(data.collections.length, 17)
  assert.equal(data.collections.filter((collection) => collection.is_published).length, 17)
  assert.equal(data.collections.filter((collection) => collection.is_listed).length, 15)
  assert.equal(data.products.length, 341)
  assert.equal(data.product_collections.length, 341)
  assert.equal(data.product_images.length, 1364)
  assert.equal(new Set(data.products.map((product) => product.id)).size, 341)
  assert.equal(new Set(data.products.map((product) => product.slug)).size, 341)
  assert.equal(new Set(data.products.map((product) => product.sku)).size, 341)
  assert.equal(new Set(data.product_images.map((image) => image.id)).size, 1364)
})

test('cada produto possui quatro variantes e uma coleção válida', async () => {
  const data = await buildCatalogImportData()
  const collectionIds = new Set(data.collections.map((collection) => collection.id))

  for (const product of data.products) {
    const images = data.product_images.filter((image) => image.product_id === product.id)
    assert.deepEqual(images.map((image) => image.variant), ['original', 'card-320', 'card-640', 'social'])
    assert.equal(data.product_collections.filter((relation) => relation.product_id === product.id).length, 1)
  }
  assert.ok(data.product_collections.every((relation) => collectionIds.has(relation.collection_id)))
})

test('migration habilita RLS e políticas positivas e negativas', async () => {
  const migration = await import('node:fs/promises').then(async ({ readFile }) => (
    await Promise.all([
      readFile(new URL('../supabase/migrations/20260813184000_catalog_schema.sql', import.meta.url), 'utf8'),
      readFile(new URL('../supabase/migrations/20260813190000_catalog_collection_visibility.sql', import.meta.url), 'utf8'),
      readFile(new URL('../supabase/migrations/20260813191500_catalog_function_hardening.sql', import.meta.url), 'utf8'),
      readFile(new URL('../supabase/migrations/20260813204000_catalog_admin_audit.sql', import.meta.url), 'utf8'),
      readFile(new URL('../supabase/migrations/20260813205500_catalog_actor_privacy.sql', import.meta.url), 'utf8'),
    ])
  ).join('\n'))

  for (const table of ['collections', 'products', 'product_collections', 'product_images', 'admin_users']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
  }
  assert.match(migration, /products_public_read/i)
  assert.match(migration, /products_admin_all/i)
  assert.match(migration, /to anon, authenticated/i)
  assert.match(migration, /is_catalog_admin/i)
  assert.match(migration, /revoke all on public\.products from anon, authenticated/i)
  assert.match(migration, /revoke all on function public\.set_catalog_updated_at\(\) from public, anon, authenticated/i)
  assert.match(migration, /product_images_admin_insert/i)
  assert.match(migration, /product_images_admin_delete/i)
  assert.match(migration, /catalog_audit_logs_admin_read/i)
  assert.match(migration, /revoke all on public\.catalog_audit_logs from anon, authenticated/i)
  assert.match(migration, /revoke all on function public\.log_catalog_change\(\) from public, anon, authenticated/i)
  assert.match(migration, /revoke select on public\.products from anon, authenticated/i)
  assert.match(migration, /grant select \([\s\S]*seo_description[\s\S]*\) on public\.products to anon, authenticated/i)
})

test('coleções legadas permanecem publicadas, mas fora da navegação', async () => {
  const data = await buildCatalogImportData()

  for (const slug of ['desenhos', 'herois']) {
    const collection = data.collections.find((item) => item.slug === slug)
    assert.ok(collection)
    assert.equal(collection.is_published, true)
    assert.equal(collection.is_listed, false)
  }
})
