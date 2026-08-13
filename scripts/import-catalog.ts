import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { buildCatalogImportData, type CatalogImportData } from './catalog-import-data.ts'

const projectUrl = (process.env.SUPABASE_URL ?? (
  process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co`
    : ''
)).replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const reportPath = resolve(process.env.CATALOG_IMPORT_REPORT ?? 'tmp/catalog-import-report.json')
const batchSize = 250

if (!projectUrl || !serviceKey) {
  throw new Error('SUPABASE_URL (ou SUPABASE_PROJECT_REF) e SUPABASE_SERVICE_KEY são obrigatórios.')
}

const headers = {
  apikey: serviceKey,
  authorization: `Bearer ${serviceKey}`,
  'content-type': 'application/json',
}

async function upsertRows(table: keyof CatalogImportData, rows: Array<Record<string, unknown>>, conflict: string) {
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize)
    const response = await fetch(`${projectUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
      method: 'POST',
      headers: { ...headers, prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(batch),
    })
    if (!response.ok) {
      throw new Error(`${table} lote ${offset}: HTTP ${response.status} ${await response.text()}`)
    }
  }
}

async function remoteIds(table: keyof CatalogImportData, key: string): Promise<string[]> {
  const values: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${projectUrl}/rest/v1/${table}?select=${key}&order=${key}.asc`, {
      headers: { ...headers, range: `${offset}-${offset + 999}` },
    })
    if (!response.ok) throw new Error(`Leitura de ${table}: HTTP ${response.status} ${await response.text()}`)
    const page = await response.json() as Array<Record<string, string>>
    values.push(...page.map((row) => row[key]))
    if (page.length < 1000) break
  }
  return values
}

const data = await buildCatalogImportData()
await upsertRows('collections', data.collections, 'id')
await upsertRows('products', data.products, 'id')
await upsertRows('product_collections', data.product_collections, 'product_id,collection_id')
await upsertRows('product_images', data.product_images, 'id')

const keys: Record<keyof CatalogImportData, string> = {
  collections: 'id',
  products: 'id',
  product_collections: 'product_id',
  product_images: 'id',
}
const reconciliation: Record<string, { expected: number; remote: number; exact: boolean }> = {}
for (const table of Object.keys(data) as Array<keyof CatalogImportData>) {
  const key = keys[table]
  const expectedValues = data[table].map((row) => String((row as Record<string, unknown>)[key])).sort()
  const actualValues = (await remoteIds(table, key)).sort()
  reconciliation[table] = {
    expected: expectedValues.length,
    remote: actualValues.length,
    exact: JSON.stringify(expectedValues) === JSON.stringify(actualValues),
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  reconciliation,
}
await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

for (const [table, result] of Object.entries(reconciliation)) {
  console.log(`${table}: ${result.remote}/${result.expected} (exato: ${result.exact ? 'sim' : 'não'})`)
}
if (Object.values(reconciliation).some((result) => !result.exact)) {
  throw new Error('Reconciliação remota divergiu; nenhum registro extra foi removido automaticamente.')
}
