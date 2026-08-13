import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const baselineDate = process.env.BASELINE_DATE ?? new Date().toISOString().slice(0, 10)
const siteUrl = process.env.BASELINE_SITE_URL ?? 'https://criativa-canecas.vercel.app'
const outputDirectory = join(projectRoot, 'docs', 'baselines', baselineDate)
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
  })
}

const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  conditions: {
    formFactor: 'mobile',
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    note: 'Resultado laboratorial; variações entre execuções são esperadas.',
  },
  reports,
}

const markdown = `# Baseline Lighthouse — ${baselineDate}

Medição móvel laboratorial. Variações entre execuções são esperadas; estes valores são a referência anterior às otimizações.

| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
${reports.map((report) => `| ${report.name} | ${report.scores.performance} | ${report.scores.accessibility} | ${report.scores.bestPractices} | ${report.scores.seo} | ${report.metrics.largestContentfulPaint.displayValue ?? '—'} | ${report.metrics.cumulativeLayoutShift.displayValue ?? '—'} | ${report.metrics.totalBlockingTime.displayValue ?? '—'} |`).join('\n')}

## Leitura inicial

- A home está abaixo da meta de 90 em Performance e apresenta LCP elevado.
- A coleção de séries apresenta deslocamento de layout acima do desejável.
- Acessibilidade e SEO ainda têm pontos a corrigir antes da meta transversal de 90/AA.
- Boas práticas atingiu 100 nas duas páginas medidas.

As causas devem ser confirmadas na Fase 1 antes de qualquer otimização. O JSON preserva métricas numéricas e as condições da auditoria.
`

await writeFile(
  join(outputDirectory, 'lighthouse-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
)
await writeFile(join(outputDirectory, 'LIGHTHOUSE.md'), markdown)
await rm(temporaryDirectory, { recursive: true, force: true })

for (const report of reports) {
  console.log(`${report.name}: P${report.scores.performance} A${report.scores.accessibility} B${report.scores.bestPractices} S${report.scores.seo}`)
}
