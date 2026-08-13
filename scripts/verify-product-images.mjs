import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectUrl = process.env.SUPABASE_URL
const projectRef = process.env.SUPABASE_PROJECT_REF ?? (
  projectUrl ? new URL(projectUrl).hostname.split('.')[0] : 'bqhqqgbdhglnecpfrbig'
)
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
const originalsDirectory = fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))
const variantsDirectory = fileURLToPath(new URL('../tmp/supabase-variants/', import.meta.url))
const publicBaseUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}`
const expectedCacheSeconds = '31536000'

async function listWebp(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listWebp(path, join(prefix, entry.name))
    if (!entry.isFile() || !entry.name.endsWith('.webp')) return []
    return [join(prefix, entry.name).replaceAll('\\', '/')]
  }))
  return nested.flat()
}

async function mapWithConcurrency(values, concurrency, operation) {
  const results = new Array(values.length)
  let cursor = 0
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++
      results[index] = await operation(values[index])
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}

async function listRemotePrefix(prefix) {
  const files = []
  for (let offset = 0; ; offset += 100) {
    const response = await fetch(
      `https://${projectRef}.supabase.co/storage/v1/object/list/${bucket}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          authorization: `Bearer ${serviceKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          limit: 100,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        }),
      },
    )
    if (!response.ok) {
      throw new Error(`Falha ao listar ${prefix || 'raiz'}: HTTP ${response.status} ${await response.text()}`)
    }
    const page = await response.json()
    files.push(...page
      .filter((item) => item.name.endsWith('.webp'))
      .map((item) => prefix ? `${prefix}/${item.name}` : item.name))
    if (page.length < 100) break
  }
  return files
}

const expected = [
  ...(await listWebp(originalsDirectory)),
  ...(await listWebp(variantsDirectory)),
].sort()
const duplicateExpected = expected.filter((file, index) => expected.indexOf(file) !== index)
if (duplicateExpected.length) throw new Error(`Objetos locais duplicados: ${duplicateExpected.join(', ')}`)

const checks = await mapWithConcurrency(expected, 20, async (objectPath) => {
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
  try {
    const response = await fetch(`${publicBaseUrl}/${encodedPath}`)
    const result = {
      objectPath,
      status: response.status,
      contentType: response.headers.get('content-type'),
      cacheControl: response.headers.get('cache-control'),
    }
    await response.body?.cancel()
    return result
  } catch (error) {
    return { objectPath, status: 0, error: error instanceof Error ? error.message : String(error) }
  }
})

const missing = checks.filter((check) => check.status !== 200)
const wrongType = checks.filter((check) => check.status === 200 && check.contentType !== 'image/webp')
const wrongCache = checks.filter((check) =>
  check.status === 200 && !check.cacheControl?.includes(`max-age=${expectedCacheSeconds}`),
)

let extra = []
if (serviceKey) {
  const prefixes = ['', 'card/320', 'card/640', 'social']
  const remote = (await Promise.all(prefixes.map(listRemotePrefix))).flat().sort()
  const expectedSet = new Set(expected)
  extra = remote.filter((file) => !expectedSet.has(file))
}

console.log(`Esperadas: ${expected.length}`)
console.log(`Acessíveis: ${checks.length - missing.length}`)
console.log(`Ausentes: ${missing.length}`)
console.log(`Content-Type incorreto: ${wrongType.length}`)
console.log(`Cache incorreto: ${wrongCache.length}`)
console.log(`Extras: ${serviceKey ? extra.length : 'não verificados (sem SUPABASE_SERVICE_KEY)'}`)

if (missing.length) console.error(`Ausentes: ${missing.slice(0, 20).map((item) => item.objectPath).join(', ')}`)
if (wrongType.length) console.error(`Tipos incorretos: ${wrongType.slice(0, 20).map((item) => item.objectPath).join(', ')}`)
if (wrongCache.length) console.error(`Cache incorreto: ${wrongCache.slice(0, 20).map((item) => `${item.objectPath} (${item.cacheControl})`).join(', ')}`)
if (extra.length) console.error(`Extras: ${extra.slice(0, 20).join(', ')}`)

if (missing.length || wrongType.length || wrongCache.length || extra.length) process.exitCode = 1
