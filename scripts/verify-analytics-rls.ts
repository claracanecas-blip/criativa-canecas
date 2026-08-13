import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

const projectUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const reportPath = resolve(process.env.ANALYTICS_VERIFY_REPORT ?? 'tmp/analytics-rls-report.json')

if (!projectUrl || !anonKey || !serviceKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY são obrigatórios.')
}

const checks: Array<{ name: string; passed: boolean; detail: string }> = []
let temporaryUserId: string | undefined
let previousRow: { event_count: number; last_seen_at: string } | undefined
const eventFilter = 'event_name=eq.client_error&dimension_1=eq.analytics_delivery&dimension_2=eq.other'

function record(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
}

function headers(key: string, bearer = key) {
  return { apikey: key, authorization: `Bearer ${bearer}`, 'content-type': 'application/json' }
}

async function fetchServiceRow() {
  const response = await fetch(`${projectUrl}/rest/v1/analytics_daily_events?${eventFilter}&select=event_count,last_seen_at`, {
    headers: headers(serviceKey),
  })
  if (!response.ok) throw new Error(`Leitura de controle: HTTP ${response.status}`)
  return (await response.json() as Array<{ event_count: number; last_seen_at: string }>)[0]
}

async function callEvent(eventName: string, dimension1: string, dimension2: string, bearer = anonKey) {
  return fetch(`${projectUrl}/rest/v1/rpc/record_catalog_event`, {
    method: 'POST',
    headers: headers(anonKey, bearer),
    body: JSON.stringify({
      p_event_name: eventName,
      p_dimension_1: dimension1,
      p_dimension_2: dimension2,
    }),
  })
}

try {
  previousRow = await fetchServiceRow()
  const validEvent = await callEvent('client_error', 'analytics_delivery', 'other')
  record('RPC anônima aceita evento válido', validEvent.ok, `HTTP ${validEvent.status}`)

  const updatedRow = await fetchServiceRow()
  record(
    'evento válido é agregado sem identificador de visitante',
    updatedRow?.event_count === (previousRow?.event_count ?? 0) + 1,
    `contador ${previousRow?.event_count ?? 0} → ${updatedRow?.event_count ?? 0}`,
  )

  const invalidEvent = await callEvent('search', 'texto-livre-do-cliente', '1')
  record('RPC rejeita dimensão livre/PII', invalidEvent.status === 400, `HTTP ${invalidEvent.status}`)

  const directRead = await fetch(`${projectUrl}/rest/v1/analytics_daily_events?select=event_name&limit=1`, {
    headers: headers(anonKey),
  })
  record('leitura anônima direta negada', [401, 403].includes(directRead.status), `HTTP ${directRead.status}`)

  const directWrite = await fetch(`${projectUrl}/rest/v1/analytics_daily_events`, {
    method: 'POST',
    headers: headers(anonKey),
    body: JSON.stringify({ event_name: 'search', dimension_1: '1', dimension_2: '1' }),
  })
  record('escrita anônima direta negada', [401, 403].includes(directWrite.status), `HTTP ${directWrite.status}`)

  const suffix = randomBytes(8).toString('hex')
  const email = `phase6-${suffix}@example.invalid`
  const password = `Cc!${randomBytes(18).toString('base64url')}`
  const createUser = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: headers(serviceKey),
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (!createUser.ok) throw new Error(`Criação temporária: HTTP ${createUser.status}`)
  const user = await createUser.json() as { id: string }
  temporaryUserId = user.id

  const signIn = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(anonKey),
    body: JSON.stringify({ email, password }),
  })
  if (!signIn.ok) throw new Error(`Login temporário: HTTP ${signIn.status}`)
  const session = await signIn.json() as { access_token: string }

  const nonAdminRead = await fetch(`${projectUrl}/rest/v1/analytics_daily_events?select=event_name&limit=1`, {
    headers: headers(anonKey, session.access_token),
  })
  const nonAdminRows = nonAdminRead.ok ? await nonAdminRead.json() as unknown[] : []
  record('autenticado sem admin não lê métricas', nonAdminRead.ok && nonAdminRows.length === 0, `HTTP ${nonAdminRead.status}, linhas ${nonAdminRows.length}`)

  const grantAdmin = await fetch(`${projectUrl}/rest/v1/admin_users`, {
    method: 'POST',
    headers: { ...headers(serviceKey), prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: temporaryUserId, role: 'admin' }),
  })
  if (!grantAdmin.ok) throw new Error(`Concessão temporária: HTTP ${grantAdmin.status}`)

  const adminRead = await fetch(`${projectUrl}/rest/v1/analytics_daily_events?${eventFilter}&select=event_count`, {
    headers: headers(anonKey, session.access_token),
  })
  const adminRows = adminRead.ok ? await adminRead.json() as unknown[] : []
  record('administrador lê métricas agregadas', adminRead.ok && adminRows.length === 1, `HTTP ${adminRead.status}, linhas ${adminRows.length}`)
} finally {
  if (previousRow) {
    await fetch(`${projectUrl}/rest/v1/analytics_daily_events?${eventFilter}`, {
      method: 'PATCH',
      headers: headers(serviceKey),
      body: JSON.stringify(previousRow),
    }).catch(() => undefined)
  } else {
    await fetch(`${projectUrl}/rest/v1/analytics_daily_events?${eventFilter}`, {
      method: 'DELETE',
      headers: headers(serviceKey),
    }).catch(() => undefined)
  }
  if (temporaryUserId) {
    await fetch(`${projectUrl}/rest/v1/admin_users?user_id=eq.${temporaryUserId}`, {
      method: 'DELETE',
      headers: headers(serviceKey),
    }).catch(() => undefined)
    await fetch(`${projectUrl}/auth/v1/admin/users/${temporaryUserId}`, {
      method: 'DELETE',
      headers: headers(serviceKey),
    }).catch(() => undefined)
  }
}

const restoredRow = await fetchServiceRow()
record(
  'dado de controle restaurado após o teste',
  previousRow ? restoredRow?.event_count === previousRow.event_count : restoredRow === undefined,
  previousRow ? `contador ${restoredRow?.event_count ?? 'ausente'}` : 'linha removida',
)

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  checks,
  passed: checks.every((check) => check.passed),
}
await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
if (!report.passed) throw new Error('Uma ou mais verificações de analytics/RLS falharam.')
