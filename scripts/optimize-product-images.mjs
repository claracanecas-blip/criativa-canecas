import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const inputDirectory = fileURLToPath(new URL('../source-images/', import.meta.url))
const outputDirectory = fileURLToPath(new URL('../tmp/supabase-upload/', import.meta.url))
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png'])
const ignoredFiles = new Set(['logo.png'])
const concurrency = 6

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })

const files = (await readdir(inputDirectory))
  .filter((file) => supportedExtensions.has(extname(file).toLowerCase()))
  .filter((file) => !ignoredFiles.has(file.toLowerCase()))

const outputNames = files.map((file) => `${parse(file).name}.webp`)
if (new Set(outputNames).size !== outputNames.length) {
  throw new Error('Existem imagens com o mesmo nome-base e extensoes diferentes.')
}

let cursor = 0
let inputBytes = 0
let outputBytes = 0

async function worker() {
  while (cursor < files.length) {
    const index = cursor++
    const file = files[index]
    const outputName = outputNames[index]
    const inputPath = join(inputDirectory, file)
    const outputPath = join(outputDirectory, outputName)

    const inputInfo = await stat(inputPath)
    inputBytes += inputInfo.size

    await sharp(inputPath)
      .rotate()
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, smartSubsample: true })
      .toFile(outputPath)

    const outputInfo = await stat(outputPath)
    outputBytes += outputInfo.size
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

const megabytes = (bytes) => (bytes / 1024 / 1024).toFixed(1)
const reduction = ((1 - outputBytes / inputBytes) * 100).toFixed(1)

console.log(`Imagens processadas: ${files.length}`)
console.log(`Originais: ${megabytes(inputBytes)} MB`)
console.log(`WebP: ${megabytes(outputBytes)} MB`)
console.log(`Reducao: ${reduction}%`)
