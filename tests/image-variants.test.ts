import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const execFileAsync = promisify(execFile)

test('gerador cria todas as variantes WebP com nomes e dimensões esperados', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'criativa-variants-'))
  const originalsDirectory = join(fixtureRoot, 'input')
  const variantsDirectory = join(fixtureRoot, 'output')
  const originalFiles = ['produto-a.webp', 'produto-b.webp']

  try {
    await mkdir(originalsDirectory, { recursive: true })
    await Promise.all(originalFiles.map((file, index) =>
      sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: index ? '#ee4b82' : '#ffffff',
        },
      }).webp().toFile(join(originalsDirectory, file)),
    ))

    await execFileAsync(process.execPath, [join(projectRoot, 'scripts', 'generate-image-variants.mjs')], {
      cwd: projectRoot,
      env: {
        ...process.env,
        IMAGE_VARIANTS_INPUT_DIR: originalsDirectory,
        IMAGE_VARIANTS_OUTPUT_DIR: variantsDirectory,
      },
    })

    const variants = [
      { directory: join(variantsDirectory, 'card', '320'), width: 320, height: 320 },
      { directory: join(variantsDirectory, 'card', '640'), width: 640, height: 640 },
      { directory: join(variantsDirectory, 'social'), width: 1200, height: 630 },
    ]

    for (const variant of variants) {
      const files = (await readdir(variant.directory)).filter((file) => file.endsWith('.webp')).sort()
      assert.deepEqual(files, originalFiles)
      for (const file of files) {
        const metadata = await sharp(join(variant.directory, file)).metadata()
        assert.equal(metadata.format, 'webp', `${variant.directory}/${file}`)
        assert.equal(metadata.width, variant.width, `${variant.directory}/${file}`)
        assert.equal(metadata.height, variant.height, `${variant.directory}/${file}`)
      }
    }
  } finally {
    try {
      await rm(fixtureRoot, { recursive: true, force: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EBUSY') throw error
    }
  }
})
