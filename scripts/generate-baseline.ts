import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colecoes } from '../src/data/colecoes.ts'
import { produtos, todosProdutos } from '../src/data/produtos.ts'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const baselineDate = process.env.BASELINE_DATE ?? new Date().toISOString().slice(0, 10)
const outputDirectory = join(projectRoot, 'docs', 'baselines', baselineDate)
const productionUrl = process.env.BASELINE_SITE_URL ?? 'https://criativa-canecas.vercel.app'
const storageUrl = (
  process.env.VITE_SUPABASE_STORAGE_URL ??
  'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images'
).replace(/\/$/, '')
const online = process.argv.includes('--online')

type FileInfo = { path: string; bytes: number }

async function listFiles(directory: string): Promise<FileInfo[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry): Promise<FileInfo[]> => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) return listFiles(path)
        if (!entry.isFile()) return []
        const info = await stat(path)
        return [{ path: relative(projectRoot, path).replaceAll('\\', '/'), bytes: info.size }]
      }),
    )
    return files.flat().sort((a, b) => a.path.localeCompare(b.path))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function currentCommit(): string {
  const gitExecutable = process.env.GIT_EXECUTABLE ??
    (process.platform === 'win32' ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git')
  try {
    return execFileSync(gitExecutable, ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'indisponivel'
  }
}

function expectedWebp(path: string): string {
  return basename(path).replace(/\.(?:jpe?g|png)$/i, '.webp')
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  operation: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length)
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

const sourcePaths = [
  'src/data/produtos.ts',
  'src/data/colecoes.ts',
  'src/data/site.ts',
]
const sourceChecksums = Object.fromEntries(
  await Promise.all(sourcePaths.map(async (path) => [path, sha256(await readFile(join(projectRoot, path)))])),
)

const routerSource = await readFile(join(projectRoot, 'src', 'router', 'index.ts'), 'utf8')
const routePaths = [...routerSource.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1])
const allProducts = todosProdutos()
const productIds = allProducts.map((product) => product.id)
const duplicateProductIds = [...new Set(productIds.filter((id, index) => productIds.indexOf(id) !== index))]
const collectionSlugs = colecoes.map((collection) => collection.slug)
const duplicateCollectionSlugs = [...new Set(
  collectionSlugs.filter((slug, index) => collectionSlugs.indexOf(slug) !== index),
)]
const imageReferences = allProducts.map((product) => expectedWebp(product.imagem))
const uniqueImageReferences = [...new Set(imageReferences)].sort()
const duplicateImageReferences = [...new Set(
  imageReferences.filter((file, index) => imageReferences.indexOf(file) !== index),
)].sort()

const optimizedFiles = (await listFiles(join(projectRoot, 'tmp', 'supabase-upload')))
  .filter((file) => extname(file.path).toLowerCase() === '.webp')
const optimizedNames = optimizedFiles.map((file) => basename(file.path)).sort()
const optimizedSet = new Set(optimizedNames)
const missingOptimizedReferences = uniqueImageReferences.filter((file) => !optimizedSet.has(file))
const unreferencedOptimizedImages = optimizedNames.filter((file) => !uniqueImageReferences.includes(file))
const originalFiles = (await listFiles(join(projectRoot, 'source-images')))
  .filter((file) => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file.path).toLowerCase()))
const buildFiles = await listFiles(join(projectRoot, 'tmp', 'baseline-dist'))

const directCollectionGroups = new Set(Object.keys(produtos))
const publicCollectionsWithoutDirectGroup = collectionSlugs.filter((slug) => !directCollectionGroups.has(slug))
const productGroupsOutsidePublicCollections = [...directCollectionGroups]
  .filter((slug) => !collectionSlugs.includes(slug))
  .sort()

const routeChecks = [
  '/',
  '/colecoes',
  '/colecao/series',
  '/personalizada',
  '/com-fotos',
  '/presentes',
  '/dia-dos-pais',
  '/busca?q=caneca',
  '/baseline-rota-inexistente',
]

const routeResults = online
  ? await mapWithConcurrency(routeChecks, 4, async (path) => {
      try {
        const response = await fetch(new URL(path, productionUrl), { redirect: 'manual' })
        return {
          path,
          status: response.status,
          contentType: response.headers.get('content-type'),
          cacheControl: response.headers.get('cache-control'),
          vercelCache: response.headers.get('x-vercel-cache'),
        }
      } catch (error) {
        return { path, status: 0, error: error instanceof Error ? error.message : String(error) }
      }
    })
  : []

const imageResults = online
  ? await mapWithConcurrency(optimizedNames, 12, async (file) => {
      try {
        const response = await fetch(`${storageUrl}/${encodeURIComponent(file)}`, { method: 'HEAD' })
        return {
          file,
          status: response.status,
          contentType: response.headers.get('content-type'),
          cacheControl: response.headers.get('cache-control'),
          contentLength: Number(response.headers.get('content-length') ?? 0),
        }
      } catch (error) {
        return { file, status: 0, error: error instanceof Error ? error.message : String(error) }
      }
    })
  : []

const generatedAt = new Date().toISOString()
const commit = currentCommit()
const backup = {
  schemaVersion: 1,
  generatedAt,
  sourceCommit: commit,
  sourceChecksums,
  collections: colecoes,
  productGroups: produtos,
  materializedProducts: allProducts,
}
const backupContents = `${JSON.stringify(backup, null, 2)}\n`

const summary = {
  schemaVersion: 1,
  generatedAt,
  sourceCommit: commit,
  productionUrl,
  storageUrl,
  counts: {
    publicCollections: colecoes.length,
    productGroups: Object.keys(produtos).length,
    products: allProducts.length,
    uniqueProductIds: new Set(productIds).size,
    uniqueImageReferences: uniqueImageReferences.length,
    optimizedImages: optimizedNames.length,
    originalImages: originalFiles.length,
    buildFiles: buildFiles.length,
    buildBytes: buildFiles.reduce((total, file) => total + file.bytes, 0),
    declaredRoutes: routePaths.length,
    remoteImagesReachable: imageResults.filter((result) => result.status === 200).length,
  },
  productCountsByGroup: Object.fromEntries(
    Object.entries(produtos).map(([group, items]) => [group, items.length]),
  ),
  anomalies: {
    duplicateProductIds,
    duplicateCollectionSlugs,
    duplicateImageReferences,
    missingOptimizedReferences,
    unreferencedOptimizedImages,
    publicCollectionsWithoutDirectGroup,
    productGroupsOutsidePublicCollections,
    unreachableRemoteImages: imageResults
      .filter((result) => result.status !== 200)
      .map((result) => ({ file: result.file, status: result.status })),
  },
  routes: routePaths,
  routeChecks: routeResults,
  imageHeaderDistribution: Object.fromEntries(
    [...new Set(imageResults.map((result) => result.cacheControl ?? 'ausente'))]
      .sort()
      .map((header) => [header, imageResults.filter((result) => (result.cacheControl ?? 'ausente') === header).length]),
  ),
  files: {
    build: buildFiles,
    optimizedImages: optimizedFiles,
    originalImages: originalFiles,
  },
  backup: {
    file: 'catalog-backup.json',
    sha256: sha256(backupContents),
  },
}

const routeTable = routeResults.length
  ? routeResults.map((result) =>
      `| \`${result.path}\` | ${result.status} | ${'contentType' in result ? result.contentType ?? '—' : '—'} | ${'cacheControl' in result ? result.cacheControl ?? '—' : '—'} |`,
    ).join('\n')
  : '| Medição online não executada | — | — | — |'

const markdown = `# Baseline técnico — ${baselineDate}

Gerado em ${generatedAt} a partir do commit \`${commit}\`.

## Inventário reconciliado

| Medida | Valor |
|---|---:|
| Coleções públicas | ${summary.counts.publicCollections} |
| Grupos com produtos | ${summary.counts.productGroups} |
| Produtos materializados | ${summary.counts.products} |
| IDs únicos | ${summary.counts.uniqueProductIds} |
| Imagens referenciadas únicas | ${summary.counts.uniqueImageReferences} |
| WebP otimizadas locais | ${summary.counts.optimizedImages} |
| Originais preservados | ${summary.counts.originalImages} |
| Imagens remotas acessíveis | ${summary.counts.remoteImagesReachable} |
| Arquivos do build limpo | ${summary.counts.buildFiles} |
| Tamanho do build limpo | ${(summary.counts.buildBytes / 1024 / 1024).toFixed(2)} MB |

As contagens de IDs estão reconciliadas quando “Produtos materializados” e “IDs únicos” são iguais. As imagens não referenciadas são mantidas no backup porque podem ser alternativas ou ativos ainda não cadastrados.

## Integridade

- IDs de produto duplicados: ${duplicateProductIds.length}
- Slugs públicos duplicados: ${duplicateCollectionSlugs.length}
- Referências sem WebP local: ${missingOptimizedReferences.length}
- Imagens remotas inacessíveis: ${summary.anomalies.unreachableRemoteImages.length}
- WebP locais sem produto atual: ${unreferencedOptimizedImages.length}
- Distribuição de cache remoto: \`${JSON.stringify(summary.imageHeaderDistribution)}\`

## Mapa e resposta das rotas

Rotas declaradas: ${routePaths.map((path) => `\`${path}\``).join(', ')}.

| Rota exercitada | HTTP | Content-Type | Cache-Control |
|---|---:|---|---|
${routeTable}

A rota inexistente retornar o HTML da SPA com HTTP 200 é o comportamento atual do rewrite da Vercel; o Vue apresenta a tela de não encontrado no cliente.

## Backup e restauração

- Backup: \`catalog-backup.json\`
- SHA-256: \`${summary.backup.sha256}\`
- Fontes protegidas por checksum: ${sourcePaths.map((path) => `\`${path}\``).join(', ')}

O backup contém coleções, grupos originais e produtos materializados com preço efetivo. Execute \`npm test\` para validar sua leitura e reconciliação. Para restauração exata do código, use o commit registrado; para a futura migração ao Supabase, importe \`materializedProducts\` e reconstrua as relações a partir de \`productGroups\`.

## Evidências relacionadas

- \`baseline-summary.json\`: inventário completo, anomalias, arquivos e cabeçalhos.
- \`lighthouse-summary.json\`: métricas Lighthouse de home e coleção.
- \`catalog-backup.json\`: backup restaurável do catálogo.
`

await mkdir(outputDirectory, { recursive: true })
await writeFile(join(outputDirectory, 'catalog-backup.json'), backupContents)
await writeFile(join(outputDirectory, 'baseline-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
await writeFile(join(outputDirectory, 'BASELINE.md'), markdown)

console.log(`Baseline: ${relative(projectRoot, outputDirectory)}`)
console.log(`Produtos: ${allProducts.length}; IDs únicos: ${new Set(productIds).size}`)
console.log(`Imagens: ${optimizedNames.length} locais; ${summary.counts.remoteImagesReachable} remotas`)
console.log(`Build limpo: ${buildFiles.length} arquivos; ${(summary.counts.buildBytes / 1024 / 1024).toFixed(2)} MB`)

if (duplicateProductIds.length || duplicateCollectionSlugs.length || missingOptimizedReferences.length) {
  process.exitCode = 1
}
if (online && summary.anomalies.unreachableRemoteImages.length) process.exitCode = 1
