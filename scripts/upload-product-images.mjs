import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRef = process.env.SUPABASE_PROJECT_REF
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
const inputDirectory = fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))
const concurrency = 8

if (!projectRef || !serviceKey) {
  throw new Error('SUPABASE_PROJECT_REF e SUPABASE_SERVICE_KEY sao obrigatorios.')
}

const files = (await readdir(inputDirectory)).filter((file) => file.endsWith('.webp'))
let cursor = 0
let uploaded = 0

async function upload(file) {
  const contents = await readFile(join(inputDirectory, file))
  const objectPath = `${bucket}/${encodeURIComponent(file)}`
  const response = await fetch(
    `https://${projectRef}.supabase.co/storage/v1/object/${objectPath}`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'cache-control': 'max-age=31536000, immutable',
        'content-type': 'image/webp',
        'x-upsert': 'true',
      },
      body: contents,
    },
  )

  if (!response.ok) {
    throw new Error(`${file}: HTTP ${response.status} ${await response.text()}`)
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
