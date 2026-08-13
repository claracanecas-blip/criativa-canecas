import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { buildCatalogImportData } from './catalog-import-data.ts'

const projectUrl = (process.env.SUPABASE_URL ?? (
  process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co`
    : ''
)).replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const reportPath = resolve(process.env.CATALOG_VERIFY_REPORT ?? 'tmp/catalog-verify-report.json')

if (!projectUrl || !anonKey || !serviceKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY são obrigatórios.')
}

const data = await buildCatalogImportData()
const checks: Array<{ name: string; passed: boolean; detail: string }> = []
let temporaryUserId: string | undefined
const sentinelId = `phase2-rls-${Date.now()}`
const sentinelStoragePath = `__phase2-tests/${sentinelId}.webp`
const sentinelWebp = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA==', 'base64')

function record(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
}

function apiHeaders(key: string, bearer = key) {
  return {
    apikey: key,
    authorization: `Bearer ${bearer}`,
    'content-type': 'application/json',
  }
}

async function exactCount(table: string, key: string, bearer = anonKey): Promise<number> {
  const response = await fetch(`${projectUrl}/rest/v1/${table}?select=${key}`, {
    method: 'HEAD',
    headers: { ...apiHeaders(anonKey, bearer), prefer: 'count=exact' },
  })
  if (!response.ok) throw new Error(`Contagem ${table}: HTTP ${response.status} ${await response.text()}`)
  const total = response.headers.get('content-range')?.split('/').at(-1)
  if (!total || total === '*') throw new Error(`Contagem exata ausente para ${table}`)
  return Number(total)
}

async function attemptProductInsert(bearer: string): Promise<Response> {
  return fetch(`${projectUrl}/rest/v1/products`, {
    method: 'POST',
    headers: { ...apiHeaders(anonKey, bearer), prefer: 'return=minimal' },
    body: JSON.stringify({
      id: sentinelId,
      slug: sentinelId,
      sku: sentinelId.toUpperCase(),
      name: 'Sentinela RLS',
      theme: 'Teste',
      description: 'Registro temporário do teste de autorização.',
      price: 1,
      status: 'draft',
      is_featured: false,
      display_order: 0,
    }),
  })
}

async function attemptStorageUpload(bearer: string): Promise<Response> {
  return fetch(`${projectUrl}/storage/v1/object/product-images/${sentinelStoragePath}`, {
    method: 'POST',
    headers: {
      ...apiHeaders(anonKey, bearer),
      'content-type': 'image/webp',
      'x-upsert': 'false',
    },
    body: sentinelWebp,
  })
}

async function deleteStorageObject(bearer: string, apiKey = anonKey): Promise<Response> {
  return fetch(`${projectUrl}/storage/v1/object/product-images`, {
    method: 'DELETE',
    headers: apiHeaders(apiKey, bearer),
    body: JSON.stringify({ prefixes: [sentinelStoragePath] }),
  })
}

async function serviceDelete(table: string, query: string) {
  const response = await fetch(`${projectUrl}/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    headers: apiHeaders(serviceKey),
  })
  if (!response.ok) throw new Error(`Limpeza ${table}: HTTP ${response.status} ${await response.text()}`)
}

try {
  const publicCollections = await exactCount('collections', 'id')
  const publicProducts = await exactCount('products', 'id')
  const publicRelations = await exactCount('product_collections', 'product_id')
  const publicImages = await exactCount('product_images', 'id')
  const expectedPublicRelations = data.product_collections.filter((relation) =>
    data.collections.some((collection) => collection.id === relation.collection_id && collection.is_published),
  ).length

  record('leitura anônima de coleções publicadas', publicCollections === 17, `${publicCollections}/17`)
  record('leitura anônima de produtos', publicProducts === 341, `${publicProducts}/341`)
  record('leitura anônima de relações publicadas', publicRelations === expectedPublicRelations, `${publicRelations}/${expectedPublicRelations}`)
  record('leitura anônima de imagens', publicImages === 1364, `${publicImages}/1364`)

  const listedResponse = await fetch(`${projectUrl}/rest/v1/collections?is_listed=eq.true&select=id`, {
    headers: { ...apiHeaders(anonKey), prefer: 'count=exact' },
  })
  const listedCollections = listedResponse.ok ? await listedResponse.json() as unknown[] : []
  record('somente 15 coleções listadas', listedResponse.ok && listedCollections.length === 15, `HTTP ${listedResponse.status}, linhas ${listedCollections.length}`)

  const anonWrite = await attemptProductInsert(anonKey)
  record('escrita anônima negada', [401, 403].includes(anonWrite.status), `HTTP ${anonWrite.status}`)
  if (anonWrite.ok) await serviceDelete('products', `id=eq.${encodeURIComponent(sentinelId)}`)

  const anonStorageWrite = await attemptStorageUpload(anonKey)
  record('upload anônimo no Storage negado', !anonStorageWrite.ok, `HTTP ${anonStorageWrite.status}`)
  if (anonStorageWrite.ok) await deleteStorageObject(serviceKey)

  const suffix = randomBytes(8).toString('hex')
  const email = `phase2-${suffix}@example.invalid`
  const password = `Cc!${randomBytes(18).toString('base64url')}`
  const createUser = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: apiHeaders(serviceKey),
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (!createUser.ok) throw new Error(`Criação de usuário temporário: HTTP ${createUser.status} ${await createUser.text()}`)
  const user = await createUser.json() as { id: string }
  temporaryUserId = user.id

  const signIn = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: apiHeaders(anonKey),
    body: JSON.stringify({ email, password }),
  })
  if (!signIn.ok) throw new Error(`Login temporário: HTTP ${signIn.status} ${await signIn.text()}`)
  const session = await signIn.json() as { access_token: string }

  const nonAdminWrite = await attemptProductInsert(session.access_token)
  record('escrita autenticada sem admin negada', [401, 403].includes(nonAdminWrite.status), `HTTP ${nonAdminWrite.status}`)
  if (nonAdminWrite.ok) await serviceDelete('products', `id=eq.${encodeURIComponent(sentinelId)}`)

  const nonAdminStorageWrite = await attemptStorageUpload(session.access_token)
  record('upload sem admin no Storage negado', !nonAdminStorageWrite.ok, `HTTP ${nonAdminStorageWrite.status}`)
  if (nonAdminStorageWrite.ok) await deleteStorageObject(serviceKey)

  const grantAdmin = await fetch(`${projectUrl}/rest/v1/admin_users`, {
    method: 'POST',
    headers: { ...apiHeaders(serviceKey), prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: temporaryUserId, role: 'admin' }),
  })
  if (!grantAdmin.ok) throw new Error(`Concessão admin temporária: HTTP ${grantAdmin.status} ${await grantAdmin.text()}`)

  const adminWrite = await attemptProductInsert(session.access_token)
  record('escrita de administrador permitida', adminWrite.status === 201, `HTTP ${adminWrite.status}`)

  const adminStorageWrite = await attemptStorageUpload(session.access_token)
  record('upload de administrador no Storage permitido', adminStorageWrite.ok, `HTTP ${adminStorageWrite.status}`)

  const publicStorageRead = await fetch(`${projectUrl}/storage/v1/object/public/product-images/${sentinelStoragePath}`)
  record('leitura pública do objeto permitida', publicStorageRead.ok, `HTTP ${publicStorageRead.status}`)
  await publicStorageRead.body?.cancel()

  const draftVisible = await fetch(`${projectUrl}/rest/v1/products?id=eq.${encodeURIComponent(sentinelId)}&select=id`, {
    headers: apiHeaders(anonKey),
  })
  const draftRows = draftVisible.ok ? await draftVisible.json() as unknown[] : []
  record('rascunho oculto para anônimo', draftVisible.ok && draftRows.length === 0, `HTTP ${draftVisible.status}, linhas ${draftRows.length}`)

  const adminDelete = await fetch(`${projectUrl}/rest/v1/products?id=eq.${encodeURIComponent(sentinelId)}`, {
    method: 'DELETE',
    headers: apiHeaders(anonKey, session.access_token),
  })
  record('exclusão de administrador permitida', adminDelete.status === 204, `HTTP ${adminDelete.status}`)

  const adminStorageDelete = await deleteStorageObject(session.access_token)
  record('exclusão de administrador no Storage permitida', adminStorageDelete.ok, `HTTP ${adminStorageDelete.status}`)
} finally {
  await serviceDelete('products', `id=eq.${encodeURIComponent(sentinelId)}`).catch(() => undefined)
  await deleteStorageObject(serviceKey, serviceKey).catch(() => undefined)
  if (temporaryUserId) {
    await serviceDelete('admin_users', `user_id=eq.${encodeURIComponent(temporaryUserId)}`).catch(() => undefined)
    await fetch(`${projectUrl}/auth/v1/admin/users/${temporaryUserId}`, {
      method: 'DELETE',
      headers: apiHeaders(serviceKey),
    }).catch(() => undefined)
  }
}

const cleanupAdminResponse = temporaryUserId
  ? await fetch(`${projectUrl}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(temporaryUserId)}&select=user_id`, {
      headers: apiHeaders(serviceKey),
    })
  : undefined
const cleanupAdminRows = cleanupAdminResponse?.ok ? await cleanupAdminResponse.json() as unknown[] : []
record(
  'usuário administrativo temporário removido',
  Boolean(cleanupAdminResponse?.ok) && cleanupAdminRows.length === 0,
  `HTTP ${cleanupAdminResponse?.status ?? 0}, linhas ${cleanupAdminRows.length}`,
)

const cleanupProductResponse = await fetch(`${projectUrl}/rest/v1/products?id=eq.${encodeURIComponent(sentinelId)}&select=id`, {
  headers: apiHeaders(serviceKey),
})
const cleanupProductRows = cleanupProductResponse.ok ? await cleanupProductResponse.json() as unknown[] : []
record(
  'produto sentinela removido',
  cleanupProductResponse.ok && cleanupProductRows.length === 0,
  `HTTP ${cleanupProductResponse.status}, linhas ${cleanupProductRows.length}`,
)

const cleanupStorageResponse = await fetch(`${projectUrl}/storage/v1/object/list/product-images`, {
  method: 'POST',
  headers: apiHeaders(serviceKey),
  body: JSON.stringify({ prefix: '__phase2-tests', limit: 100, offset: 0 }),
})
const cleanupStorageRows = cleanupStorageResponse.ok
  ? await cleanupStorageResponse.json() as Array<{ name: string }>
  : []
const sentinelStorageName = sentinelStoragePath.split('/').at(-1)
const sentinelStorageRows = cleanupStorageRows.filter((row) => row.name === sentinelStorageName)
record(
  'objeto sentinela removido da origem',
  cleanupStorageResponse.ok && sentinelStorageRows.length === 0,
  `HTTP ${cleanupStorageResponse.status}, linhas ${sentinelStorageRows.length}`,
)

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  checks,
  passed: checks.every((check) => check.passed),
}
await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

if (!report.passed) throw new Error('Uma ou mais verificações de catálogo/RLS falharam.')
