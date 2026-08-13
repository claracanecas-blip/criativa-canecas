import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const projectRef = process.env.SUPABASE_PROJECT_REF
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
const inputDirectory = fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))

if (!projectRef || !serviceKey) {
  throw new Error('SUPABASE_PROJECT_REF e SUPABASE_SERVICE_KEY sao obrigatorios.')
}

const remoteFiles = []
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
        prefix: '',
        limit: 100,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Falha ao listar Storage: HTTP ${response.status} ${await response.text()}`)
  }

  const page = await response.json()
  remoteFiles.push(...page.map((item) => item.name))
  if (page.length < 100) break
}

const localFiles = (await readdir(inputDirectory)).filter((file) => file.endsWith('.webp'))
const remoteSet = new Set(remoteFiles)
const localSet = new Set(localFiles)
const missing = localFiles.filter((file) => !remoteSet.has(file))
const extra = remoteFiles.filter((file) => !localSet.has(file))

console.log(`Locais: ${localFiles.length}`)
console.log(`Remotas: ${remoteFiles.length}`)
console.log(`Ausentes: ${missing.length}`)
console.log(`Extras: ${extra.length}`)

if (missing.length || extra.length) {
  if (missing.length) console.error(`Ausentes: ${missing.join(', ')}`)
  if (extra.length) console.error(`Extras: ${extra.join(', ')}`)
  process.exitCode = 1
}
