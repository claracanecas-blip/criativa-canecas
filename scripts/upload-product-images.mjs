import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectUrl = process.env.SUPABASE_URL
const projectRef = process.env.SUPABASE_PROJECT_REF ?? (
  projectUrl ? new URL(projectUrl).hostname.split('.')[0] : undefined
)
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
const inputDirectory = process.env.PRODUCT_IMAGES_INPUT_DIR
  ?? fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))
const variantsDirectory = process.env.PRODUCT_IMAGE_VARIANTS_DIR
  ?? fileURLToPath(new URL('../tmp/supabase-variants/', import.meta.url))
const concurrency = 8

if (!projectRef || !serviceKey) {
  throw new Error('SUPABASE_PROJECT_REF e SUPABASE_SERVICE_KEY sao obrigatorios.')
}

async function listWebp(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listWebp(path, join(prefix, entry.name))
    if (!entry.isFile() || !entry.name.endsWith('.webp')) return []
    return [{ localPath: path, objectPath: join(prefix, entry.name).replaceAll('\\', '/') }]
  }))
  return nested.flat()
}

const files = [
  ...(await listWebp(inputDirectory)),
  ...(await listWebp(variantsDirectory)),
].sort((a, b) => a.objectPath.localeCompare(b.objectPath))
let cursor = 0
let uploaded = 0

async function upload(file) {
  const contents = await readFile(file.localPath)
  const encodedPath = file.objectPath.split('/').map(encodeURIComponent).join('/')
  const objectPath = `${bucket}/${encodedPath}`
  const response = await fetch(
    `https://${projectRef}.supabase.co/storage/v1/object/${objectPath}`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'cache-control': 'max-age=31536000',
        'content-type': 'image/webp',
        'x-upsert': 'true',
      },
      body: contents,
    },
  )

  if (!response.ok) {
    throw new Error(`${file.objectPath}: HTTP ${response.status} ${await response.text()}`)
  }

  uploaded += 1
  if (uploaded % 50 === 0 || uploaded === files.length) {
    console.log(`Enviadas ${uploaded}/${files.length}`)
  }
}

async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++]
    await upload(file)
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))
console.log(`Upload concluido: ${uploaded} imagens em ${bucket}.`)
