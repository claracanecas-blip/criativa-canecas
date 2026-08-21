import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { chromium, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const projectUrl = (process.env.SUPABASE_URL ?? (
  process.env.SUPABASE_PROJECT_REF ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co` : ''
)).replace(/\/$/, '')
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
const reportPath = resolve(process.env.ADMIN_E2E_REPORT ?? 'tmp/admin-e2e-report.json')
const port = Number(process.env.ADMIN_E2E_PORT ?? 4178)
const baseUrl = `http://127.0.0.1:${port}`

if (!projectUrl || !publishableKey || !serviceKey) {
  throw new Error('SUPABASE_URL/ref, chave publicável e service_role são obrigatórios no ambiente.')
}

const suffix = randomBytes(6).toString('hex')
const email = `phase4-${suffix}@example.invalid`
const password = `Cc!${randomBytes(18).toString('base64url')}`
const collectionId = `phase4-${suffix}`
const productName = `Caneca Sentinela ${suffix}`
const productId = `caneca-sentinela-${suffix}`
const checks = []
let userId
let server
let browser

const adminClient = createClient(projectUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function check(name, passed, detail) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
  if (!passed) throw new Error(`${name}: ${detail}`)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Servidor de preview não respondeu.')
}

async function cleanup() {
  const { data: images } = await adminClient
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId)
  if (images?.length) {
    await adminClient.storage.from('product-images').remove(images.map((image) => image.storage_path))
  } else {
    const { data: rootFiles } = await adminClient.storage.from('product-images').list('', { search: productId })
    const { data: card320Files } = await adminClient.storage.from('product-images').list('card/320', { search: productId })
    const { data: card640Files } = await adminClient.storage.from('product-images').list('card/640', { search: productId })
    const { data: socialFiles } = await adminClient.storage.from('product-images').list('social', { search: productId })
    const paths = [
      ...(rootFiles ?? []).map((file) => file.name),
      ...(card320Files ?? []).map((file) => `card/320/${file.name}`),
      ...(card640Files ?? []).map((file) => `card/640/${file.name}`),
      ...(socialFiles ?? []).map((file) => `social/${file.name}`),
    ].filter((path) => path.includes(productId))
    if (paths.length) await adminClient.storage.from('product-images').remove(paths)
  }
  await adminClient.from('products').delete().eq('id', productId)
  await adminClient.from('collections').delete().eq('id', collectionId)
  await adminClient.from('catalog_audit_logs').delete().in('entity_id', [productId, collectionId])
  if (userId) {
    await adminClient.from('admin_users').delete().eq('user_id', userId)
    await adminClient.auth.admin.deleteUser(userId)
  }
}

try {
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createError || !created.user) throw createError ?? new Error('Usuário temporário ausente.')
  userId = created.user.id
  const { error: roleError } = await adminClient.from('admin_users').insert({ user_id: userId, role: 'admin' })
  if (roleError) throw roleError

  server = spawn(process.execPath, [
    'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port),
  ], { cwd: process.cwd(), stdio: ['ignore', 'ignore', 'pipe'] })
  await waitForServer()

  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  await page.goto(`${baseUrl}/admin`)
  await expect(page).toHaveURL(/\/admin\/login/)
  check('rota administrativa exige login', true, '/admin redirecionou para /admin/login')

  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(`${baseUrl}/admin`)
  await expect(page.getByText('693', { exact: true }).first()).toBeVisible()
  check('administrador autenticado abre painel', true, '693 produtos carregados')

  await page.getByRole('button', { name: /Coleções/ }).click()
  await page.getByRole('button', { name: 'Novo', exact: true }).click()
  const collectionEditor = page.locator('form.editor')
  await collectionEditor.getByLabel('Nome').fill(`Coleção Sentinela ${suffix}`)
  await collectionEditor.getByLabel('Slug').fill(collectionId)
  await collectionEditor.getByLabel('Descrição', { exact: true }).fill('Coleção temporária do teste administrativo.')
  await collectionEditor.getByLabel('Publicada por URL').check()
  await collectionEditor.getByLabel('Listada na navegação').check()
  await collectionEditor.getByRole('button', { name: 'Salvar coleção' }).click()
  await expect(page.getByText(/Coleção .* salva/)).toBeVisible()
  check('CRUD cria coleção', true, collectionId)

  await page.getByRole('button', { name: /Produtos/ }).click()
  await page.getByRole('button', { name: 'Novo', exact: true }).click()
  const productEditor = page.locator('form.editor')
  await productEditor.getByLabel('Nome').fill(productName)
  await productEditor.getByLabel('Nome').blur()
  await productEditor.getByLabel('SKU').fill(`CC-PHASE4-${suffix.toUpperCase()}`)
  await productEditor.getByLabel('Tema').fill('Teste administrativo')
  await productEditor.getByLabel('Descrição', { exact: true }).fill('Produto temporário do ciclo criar, publicar e visualizar.')
  await productEditor.getByLabel('Estado').selectOption('published')
  await productEditor.getByLabel(`Coleção Sentinela ${suffix}`).check()
  const png = await sharp({
    create: { width: 900, height: 900, channels: 3, background: '#ee4b82' },
  }).png().toBuffer()
  await productEditor.locator('input[type=file]').setInputFiles({
    name: `${productId}.png`, mimeType: 'image/png', buffer: png,
  })
  await productEditor.getByRole('button', { name: 'Salvar produto' }).click()
  await expect(page.getByText(/Produto .* salvo/)).toBeVisible({ timeout: 30_000 })
  check('CRUD publica produto com variantes', true, productId)

  const { count: variantCount } = await adminClient
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
  check('upload gerou quatro variantes', variantCount === 4, `${variantCount}/4`)

  await page.goto(`${baseUrl}/colecao/${collectionId}`)
  await expect(page.getByText(productName, { exact: true })).toBeVisible()
  check('produto publicado aparece no catálogo', true, `/colecao/${collectionId}`)

  await page.goto(`${baseUrl}/admin`)
  await page.getByPlaceholder('Buscar produto, SKU ou tema').fill(productId)
  const productRow = page.locator('tbody tr').filter({ hasText: productName })
  page.once('dialog', (dialog) => dialog.accept())
  await productRow.getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText(/Produto .* excluído/)).toBeVisible()
  check('CRUD exclui produto com confirmação', true, 'metadados removidos e objetos preservados até limpeza')

  await page.getByRole('button', { name: /Coleções/ }).click()
  await page.getByPlaceholder('Buscar coleção').fill(collectionId)
  const collectionRow = page.locator('tbody tr').filter({ hasText: collectionId })
  page.once('dialog', (dialog) => dialog.accept())
  await collectionRow.getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText(/Coleção .* excluída/)).toBeVisible()
  check('CRUD exclui coleção vazia com confirmação', true, collectionId)

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(`${baseUrl}/admin/login`)
  check('logout encerra sessão administrativa', true, '/admin/login')
} finally {
  if (browser) await browser.close().catch(() => undefined)
  if (server && !server.killed) server.kill()
  await cleanup().catch((error) => console.error(`Falha de limpeza: ${error.message}`))
  await mkdir(dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    passed: checks.length === 9 && checks.every((item) => item.passed),
    checks,
  }, null, 2)}\n`)
}
