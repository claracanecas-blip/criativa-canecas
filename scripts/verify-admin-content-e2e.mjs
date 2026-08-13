import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { chromium, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const projectUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
const port = Number(process.env.ADMIN_CONTENT_E2E_PORT ?? 4180)
const baseUrl = `http://127.0.0.1:${port}`

if (!projectUrl || !publishableKey || !serviceKey) {
  throw new Error('SUPABASE_URL, chave publicável e service_role são obrigatórios no ambiente.')
}

const suffix = randomBytes(6).toString('hex')
const email = `phase8-ui-${suffix}@example.invalid`
const password = `Cc!${randomBytes(18).toString('base64url')}`
const contentKey = `faq_validation_${suffix}`
const title = `Pergunta de validação ${suffix}?`
const checks = []
let userId
let server
let browser

const adminClient = createClient(projectUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

function check(name, passed, detail) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
  if (!passed) throw new Error(`${name}: ${detail}`)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Servidor de preview não respondeu.')
}

async function cleanup() {
  await adminClient.from('site_content_sections').delete().eq('content_key', contentKey)
  if (userId) {
    await adminClient.from('admin_users').delete().eq('user_id', userId)
    await adminClient.auth.admin.deleteUser(userId)
  }
}

try {
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true })
  if (createError || !created.user) throw createError ?? new Error('Usuário temporário ausente.')
  userId = created.user.id
  const { error: roleError } = await adminClient.from('admin_users').insert({ user_id: userId, role: 'admin' })
  if (roleError) throw roleError

  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'ignore', 'pipe'],
  })
  await waitForServer()
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  await page.goto(`${baseUrl}/admin/informacoes`)
  await expect(page).toHaveURL(/\/admin\/login/)
  check('rota de conteúdo exige login', true, '/admin/informacoes redirecionou para login')

  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(`${baseUrl}/admin/informacoes`)
  await expect(page.getByRole('heading', { name: 'Informações e FAQ' })).toBeVisible()
  check('administrador abre editor institucional', true, '/admin/informacoes')

  await page.getByRole('button', { name: 'Nova pergunta' }).click()
  const editor = page.locator('form.editor')
  await editor.getByLabel('Chave').fill(contentKey)
  await editor.getByRole('textbox', { name: 'Pergunta', exact: true }).fill(title)
  await editor.getByLabel('Resposta/conteúdo').fill('Resposta temporária criada para validar o fluxo administrativo completo.')
  await editor.getByLabel('Ordem').fill('999')
  await editor.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Conteúdo salvo sem publicação.')).toBeVisible()
  const { data: draft } = await adminClient.from('site_content_sections').select('status,created_by').eq('content_key', contentKey).single()
  check('editor cria rascunho com autoria', draft?.status === 'draft' && draft.created_by === userId, `${draft?.status ?? 'ausente'}`)

  await page.goto(`${baseUrl}/informacoes`)
  await expect(page.getByText(title)).toHaveCount(0)
  check('rascunho não aparece no site', true, contentKey)

  await page.goto(`${baseUrl}/admin/informacoes`)
  await page.getByRole('button', { name: `Editar ${title}` }).click()
  await page.locator('form.editor').getByLabel('Estado').selectOption('published')
  await page.locator('form.editor').getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Conteúdo salvo e publicado.')).toBeVisible()
  await page.goto(`${baseUrl}/informacoes`)
  await expect(page.getByText(title)).toBeVisible()
  check('publicação administrativa aparece no site', true, contentKey)

  await page.goto(`${baseUrl}/admin/informacoes`)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: `Excluir ${title}` }).click()
  await expect(page.getByText('Conteúdo excluído.')).toBeVisible()
  const { count } = await adminClient.from('site_content_sections').select('*', { count: 'exact', head: true }).eq('content_key', contentKey)
  check('exclusão confirmada remove o conteúdo', count === 0, `${count ?? 'desconhecido'} registro`)
} finally {
  if (browser) await browser.close().catch(() => undefined)
  if (server && !server.killed) server.kill()
  await cleanup().catch((error) => console.error(`Falha de limpeza: ${error.message}`))
}

if (checks.length !== 6 || checks.some((item) => !item.passed)) {
  throw new Error('Fluxo administrativo de conteúdo não foi concluído.')
}
