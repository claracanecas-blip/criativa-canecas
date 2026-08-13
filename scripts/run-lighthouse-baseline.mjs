import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const baselineDate = process.env.BASELINE_DATE ?? new Date().toISOString().slice(0, 10)
const runId = process.env.BASELINE_RUN_ID ?? baselineDate
const runLabel = process.env.BASELINE_LABEL ?? `Baseline ${baselineDate}`
const siteUrl = process.env.BASELINE_SITE_URL ?? 'https://criativa-canecas.vercel.app'
const outputDirectory = join(projectRoot, 'docs', 'baselines', runId)
const temporaryDirectory = join(projectRoot, 'tmp', 'lighthouse-baseline')
const lighthouseCli = join(projectRoot, 'node_modules', 'lighthouse', 'cli', 'index.js')
const targets = [
  { name: 'home', path: '/' },
  { name: 'collection-series', path: '/colecao/series' },
]

await mkdir(outputDirectory, { recursive: true })
await mkdir(temporaryDirectory, { recursive: true })

function runLighthouse(url, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      lighthouseCli,
      url,
      '--quiet',
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--chrome-flags=--headless=new --disable-gpu --no-sandbox',
    ], { cwd: projectRoot, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', async (code) => {
      if (code === 0) return resolve()
      try {
        JSON.parse(await readFile(outputPath, 'utf8'))
        console.warn('Lighthouse gerou um relatório válido, mas o Windows bloqueou a limpeza temporária.')
        resolve()
      } catch {
        reject(new Error(`Lighthouse terminou com código ${code} sem gerar relatório válido`))
      }
    })
  })
}

const reports = []
for (const target of targets) {
  const outputPath = join(temporaryDirectory, `${target.name}.json`)
  await runLighthouse(new URL(target.path, siteUrl).href, outputPath)
  const report = JSON.parse(await readFile(outputPath, 'utf8'))
  const metric = (id) => ({
    value: report.audits[id]?.numericValue ?? null,
    displayValue: report.audits[id]?.displayValue ?? null,
  })
  const imageRequests = (report.audits['network-requests']?.details?.items ?? [])
    .filter((item) => item.resourceType === 'Image' || item.mimeType?.startsWith('image/'))
    .map((item) => ({
      url: item.url,
      transferSize: item.transferSize ?? null,
      resourceSize: item.resourceSize ?? null,
    }))
  const imageVariant = (url) => {
    if (url.includes('/card/320/')) return 'card-320'
    if (url.includes('/card/640/')) return 'card-640'
    if (url.includes('/social/')) return 'social'
    if (url.includes('/product-images/')) return 'original'
    return 'other'
  }
  const variantDistribution = Object.fromEntries(
    [...new Set(imageRequests.map((item) => imageVariant(item.url)))]
      .map((variant) => [variant, imageRequests.filter((item) => imageVariant(item.url) === variant).length]),
  )
  const layoutShifts = (report.audits['layout-shifts']?.details?.items ?? [])
    .slice(0, 10)
    .map((item) => ({
      score: item.score ?? null,
      selector: item.node?.selector ?? null,
      snippet: item.node?.snippet ?? null,
      sources: (item.sources ?? []).slice(0, 5).map((source) => ({
        selector: source.node?.selector ?? null,
        snippet: source.node?.snippet ?? null,
        previousRect: source.previousRect ?? null,
        currentRect: source.currentRect ?? null,
      })),
    }))
  reports.push({
    name: target.name,
    requestedUrl: report.requestedUrl,
    finalUrl: report.finalUrl,
    fetchTime: report.fetchTime,
    lighthouseVersion: report.lighthouseVersion,
    userAgent: report.userAgent,
    scores: {
      performance: Math.round((report.categories.performance.score ?? 0) * 100),
      accessibility: Math.round((report.categories.accessibility.score ?? 0) * 100),
      bestPractices: Math.round((report.categories['best-practices'].score ?? 0) * 100),
      seo: Math.round((report.categories.seo.score ?? 0) * 100),
    },
    metrics: {
      firstContentfulPaint: metric('first-contentful-paint'),
      largestContentfulPaint: metric('largest-contentful-paint'),
      totalBlockingTime: metric('total-blocking-time'),
      cumulativeLayoutShift: metric('cumulative-layout-shift'),
      speedIndex: metric('speed-index'),
      interactive: metric('interactive'),
    },
    imageRequests: {
      count: imageRequests.length,
      transferBytes: imageRequests.reduce((total, item) => total + (item.transferSize ?? 0), 0),
      variantDistribution,
      items: imageRequests,
    },
    diagnostics: {
      layoutShifts,
    },
  })
}

const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  conditions: {
    label: runLabel,
    siteUrl,
    formFactor: 'mobile',
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    note: 'Resultado laboratorial; variações entre execuções são esperadas.',
  },
  reports,
}

const markdown = `# Lighthouse — ${runLabel}

Medição móvel laboratorial. Variações entre execuções são esperadas. URL medida: \`${siteUrl}\`.

| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
${reports.map((report) => `| ${report.name} | ${report.scores.performance} | ${report.scores.accessibility} | ${report.scores.bestPractices} | ${report.scores.seo} | ${report.metrics.largestContentfulPaint.displayValue ?? '—'} | ${report.metrics.cumulativeLayoutShift.displayValue ?? '—'} | ${report.metrics.totalBlockingTime.displayValue ?? '—'} |`).join('\n')}

## Imagens requisitadas

| Página | Requisições | Transferência | Variantes |
|---|---:|---:|---|
${reports.map((report) => `| ${report.name} | ${report.imageRequests.count} | ${(report.imageRequests.transferBytes / 1024).toFixed(1)} KB | ${Object.entries(report.imageRequests.variantDistribution).map(([name, count]) => `${name}: ${count}`).join(', ') || '—'} |`).join('\n')}

O JSON preserva métricas numéricas, condições da auditoria e as URLs efetivamente requisitadas pelo navegador móvel.
`

await writeFile(
  join(outputDirectory, 'lighthouse-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
)
await writeFile(join(outputDirectory, 'LIGHTHOUSE.md'), markdown)
if (process.env.BASELINE_KEEP_RAW !== 'true') {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

for (const report of reports) {
  console.log(`${report.name}: P${report.scores.performance} A${report.scores.accessibility} B${report.scores.bestPractices} S${report.scores.seo}`)
}
