import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const inputDirectory = fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))
const outputDirectory = fileURLToPath(new URL('../tmp/supabase-variants/', import.meta.url))
const concurrency = 6
const variants = [
  {
    directory: join('card', '320'),
    resize: { width: 320, height: 320, fit: 'inside', withoutEnlargement: true },
    webp: { quality: 78, effort: 5, smartSubsample: true },
  },
  {
    directory: join('card', '640'),
    resize: { width: 640, height: 640, fit: 'inside', withoutEnlargement: true },
    webp: { quality: 80, effort: 5, smartSubsample: true },
  },
  {
    directory: 'social',
    resize: {
      width: 1200,
      height: 630,
      fit: 'contain',
      position: 'centre',
      background: { r: 255, g: 247, b: 250, alpha: 1 },
      withoutEnlargement: false,
    },
    webp: { quality: 82, effort: 5, smartSubsample: true },
  },
]

const files = (await readdir(inputDirectory)).filter((file) => file.endsWith('.webp')).sort()
if (!files.length) throw new Error('Nenhuma imagem otimizada encontrada. Execute npm run images:optimize primeiro.')

await rm(outputDirectory, { recursive: true, force: true })
for (const variant of variants) await mkdir(join(outputDirectory, variant.directory), { recursive: true })

let cursor = 0
let generated = 0
let outputBytes = 0

async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++]
    const inputPath = join(inputDirectory, file)
    for (const variant of variants) {
      const outputPath = join(outputDirectory, variant.directory, file)
      await sharp(inputPath)
        .resize(variant.resize)
        .webp(variant.webp)
        .toFile(outputPath)
      outputBytes += (await stat(outputPath)).size
      generated += 1
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

console.log(`Origens: ${files.length}`)
console.log(`Variantes geradas: ${generated}`)
console.log(`Pastas: ${variants.map((variant) => variant.directory.replaceAll('\\', '/')).join(', ')}`)
console.log(`Tamanho total: ${(outputBytes / 1024 / 1024).toFixed(1)} MB`)
