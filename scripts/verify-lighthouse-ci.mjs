import { spawn } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const viteCli = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const lighthouseScript = join(projectRoot, 'scripts', 'run-lighthouse-baseline.mjs')
const outputDirectory = join(projectRoot, 'tmp', 'lighthouse-ci')
const siteUrl = 'http://127.0.0.1:4174'

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(siteUrl)
      if (response.ok) return
    } catch {
      // O preview ainda está inicializando.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Preview não iniciou a tempo para a auditoria Lighthouse')
}

function runAudit() {
  return new Promise((resolve, reject) => {
    const audit = spawn(process.execPath, [lighthouseScript], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        BASELINE_SITE_URL: siteUrl,
        BASELINE_INCLUDE_PRODUCT: 'true',
        BASELINE_LABEL: 'CI Fase 6',
        BASELINE_OUTPUT_DIR: 'tmp/lighthouse-ci',
      },
    })
    audit.once('error', reject)
    audit.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Lighthouse terminou com código ${code}`)))
  })
}

await rm(outputDirectory, { recursive: true, force: true })
const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4174'], {
  cwd: projectRoot,
  stdio: 'inherit',
})

try {
  await waitForServer()
  await runAudit()
  const summary = JSON.parse(await readFile(join(outputDirectory, 'lighthouse-summary.json'), 'utf8'))
  const failures = summary.reports.flatMap((report) =>
    Object.entries(report.scores)
      .filter(([, score]) => score < 90)
      .map(([category, score]) => `${report.name}/${category}: ${score}`),
  )
  if (failures.length) throw new Error(`Lighthouse abaixo de 90: ${failures.join(', ')}`)
  console.log('Lighthouse CI aprovado: todas as categorias >= 90.')
} finally {
  preview.kill()
}
