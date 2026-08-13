import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const originalsDirectory = join(projectRoot, 'tmp', 'supabase-upload')
const variants = [
  { directory: join(projectRoot, 'tmp', 'supabase-variants', 'card', '320'), width: 320, height: 320 },
  { directory: join(projectRoot, 'tmp', 'supabase-variants', 'card', '640'), width: 640, height: 640 },
  { directory: join(projectRoot, 'tmp', 'supabase-variants', 'social'), width: 1200, height: 630 },
]

const originalFiles = (await readdir(originalsDirectory)).filter((file) => file.endsWith('.webp')).sort()

test('cada origem possui todas as variantes com os mesmos nomes', async () => {
  assert.equal(originalFiles.length, 358)
  for (const variant of variants) {
    const files = (await readdir(variant.directory)).filter((file) => file.endsWith('.webp')).sort()
    assert.deepEqual(files, originalFiles)
  }
})

test('variantes possuem dimensões e formato esperados', async () => {
  for (const variant of variants) {
    for (const file of originalFiles) {
      const metadata = await sharp(join(variant.directory, file)).metadata()
      assert.equal(metadata.format, 'webp', `${variant.directory}/${file}`)
      assert.equal(metadata.width, variant.width, `${variant.directory}/${file}`)
      assert.equal(metadata.height, variant.height, `${variant.directory}/${file}`)
    }
  }
})
