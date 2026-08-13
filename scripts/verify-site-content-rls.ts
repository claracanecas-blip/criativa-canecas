import { randomBytes } from 'node:crypto'

const projectUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!projectUrl || !anonKey || !serviceKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY são obrigatórios.')
}

const checks: Array<{ name: string; passed: boolean; detail: string }> = []
let temporaryUserId: string | undefined
const contentKey = `faq_validation_${randomBytes(6).toString('hex')}`

function headers(key: string, bearer = key) {
  return { apikey: key, authorization: `Bearer ${bearer}`, 'content-type': 'application/json' }
}

function record(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
}

async function publicRows(filter = '') {
  const response = await fetch(`${projectUrl}/rest/v1/site_content_sections?select=content_key,kind,title,body,icon_name,display_order${filter}`,
    { headers: headers(anonKey) })
  const rows = response.ok ? await response.json() as Array<{ content_key: string }> : []
  return { response, rows }
}

try {
  const initial = await publicRows('&order=display_order')
  record('anônimo lê as nove seções publicadas iniciais', initial.response.ok && initial.rows.length === 9, `HTTP ${initial.response.status}, linhas ${initial.rows.length}`)

  const anonymousPrivateRead = await fetch(`${projectUrl}/rest/v1/site_content_sections?select=created_by&limit=1`, { headers: headers(anonKey) })
  record('anônimo não lê autoria', [401, 403].includes(anonymousPrivateRead.status), `HTTP ${anonymousPrivateRead.status}`)

  const payload = { content_key: contentKey, kind: 'faq', title: 'Validação temporária?', body: 'Registro técnico removido automaticamente.', status: 'draft', display_order: 999 }
  const anonymousWrite = await fetch(`${projectUrl}/rest/v1/site_content_sections`, { method: 'POST', headers: headers(anonKey), body: JSON.stringify(payload) })
  record('anônimo não cria conteúdo', [401, 403].includes(anonymousWrite.status), `HTTP ${anonymousWrite.status}`)

  const anonymousRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_site_content`, { method: 'POST', headers: headers(anonKey), body: '{}' })
  record('anônimo não executa RPC administrativa', [401, 403, 404].includes(anonymousRpc.status), `HTTP ${anonymousRpc.status}`)

  const suffix = randomBytes(8).toString('hex')
  const email = `phase8-content-${suffix}@example.invalid`
  const password = `Cc!${randomBytes(18).toString('base64url')}`
  const createUser = await fetch(`${projectUrl}/auth/v1/admin/users`, { method: 'POST', headers: headers(serviceKey), body: JSON.stringify({ email, password, email_confirm: true }) })
  if (!createUser.ok) throw new Error(`Criação temporária: HTTP ${createUser.status}`)
  temporaryUserId = (await createUser.json() as { id: string }).id

  const signIn = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: headers(anonKey), body: JSON.stringify({ email, password }) })
  if (!signIn.ok) throw new Error(`Login temporário: HTTP ${signIn.status}`)
  const accessToken = (await signIn.json() as { access_token: string }).access_token

  const nonAdminWrite = await fetch(`${projectUrl}/rest/v1/site_content_sections`, { method: 'POST', headers: { ...headers(anonKey, accessToken), prefer: 'return=minimal' }, body: JSON.stringify(payload) })
  record('autenticado comum não cria conteúdo', [401, 403].includes(nonAdminWrite.status), `HTTP ${nonAdminWrite.status}`)

  const nonAdminRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_site_content`, { method: 'POST', headers: headers(anonKey, accessToken), body: '{}' })
  record('autenticado comum não executa RPC administrativa', [401, 403].includes(nonAdminRpc.status), `HTTP ${nonAdminRpc.status}`)

  const grantAdmin = await fetch(`${projectUrl}/rest/v1/admin_users`, { method: 'POST', headers: { ...headers(serviceKey), prefer: 'return=minimal' }, body: JSON.stringify({ user_id: temporaryUserId, role: 'admin' }) })
  if (!grantAdmin.ok) throw new Error(`Concessão temporária: HTTP ${grantAdmin.status}`)

  const adminWrite = await fetch(`${projectUrl}/rest/v1/site_content_sections`, { method: 'POST', headers: { ...headers(anonKey, accessToken), prefer: 'return=minimal' }, body: JSON.stringify(payload) })
  record('administrador cria rascunho', adminWrite.ok, `HTTP ${adminWrite.status}`)

  const adminRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_site_content`, { method: 'POST', headers: headers(anonKey, accessToken), body: '{}' })
  const adminRows = adminRpc.ok ? await adminRpc.json() as Array<{ content_key: string; created_by: string }> : []
  const adminRow = adminRows.find((row) => row.content_key === contentKey)
  record('administrador lê conteúdo e autoria pela RPC', adminRpc.ok && adminRow?.created_by === temporaryUserId, `HTTP ${adminRpc.status}, registro ${adminRow ? 'encontrado' : 'ausente'}`)

  const hiddenDraft = await publicRows(`&content_key=eq.${contentKey}`)
  record('rascunho permanece invisível ao público', hiddenDraft.response.ok && hiddenDraft.rows.length === 0, `HTTP ${hiddenDraft.response.status}, linhas ${hiddenDraft.rows.length}`)

  const publish = await fetch(`${projectUrl}/rest/v1/site_content_sections?content_key=eq.${contentKey}`, { method: 'PATCH', headers: { ...headers(anonKey, accessToken), prefer: 'return=minimal' }, body: JSON.stringify({ status: 'published' }) })
  if (!publish.ok) throw new Error(`Publicação temporária: HTTP ${publish.status}`)
  const visiblePublished = await publicRows(`&content_key=eq.${contentKey}`)
  record('conteúdo publicado fica visível sem metadados privados', visiblePublished.response.ok && visiblePublished.rows.length === 1, `HTTP ${visiblePublished.response.status}, linhas ${visiblePublished.rows.length}`)
} finally {
  await fetch(`${projectUrl}/rest/v1/site_content_sections?content_key=eq.${contentKey}`, { method: 'DELETE', headers: headers(serviceKey) }).catch(() => undefined)
  if (temporaryUserId) {
    await fetch(`${projectUrl}/rest/v1/admin_users?user_id=eq.${temporaryUserId}`, { method: 'DELETE', headers: headers(serviceKey) }).catch(() => undefined)
    await fetch(`${projectUrl}/auth/v1/admin/users/${temporaryUserId}`, { method: 'DELETE', headers: headers(serviceKey) }).catch(() => undefined)
  }
}

const cleanup = await publicRows(`&content_key=eq.${contentKey}`)
record('registro temporário foi removido', cleanup.response.ok && cleanup.rows.length === 0, `HTTP ${cleanup.response.status}, linhas ${cleanup.rows.length}`)

if (!checks.every((check) => check.passed)) throw new Error('Uma ou mais verificações de conteúdo/RLS falharam.')
