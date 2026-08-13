import { randomBytes } from 'node:crypto'

const projectUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!projectUrl || !anonKey || !serviceKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY são obrigatórios.')
}

const checks: Array<{ name: string; passed: boolean; detail: string }> = []
let temporaryUserId: string | undefined
let temporaryTestimonialId: number | undefined

function record(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail })
  console.log(`${passed ? 'OK' : 'FALHA'} ${name}: ${detail}`)
}

function headers(key: string, bearer = key) {
  return { apikey: key, authorization: `Bearer ${bearer}`, 'content-type': 'application/json' }
}

try {
  const publicRead = await fetch(`${projectUrl}/rest/v1/testimonials?select=id,author_display_name,quote,rating,photo_path,display_order&limit=1`, {
    headers: headers(anonKey),
  })
  record('anônimo pode consultar somente a projeção pública', publicRead.ok, `HTTP ${publicRead.status}`)

  const anonymousPrivateRead = await fetch(`${projectUrl}/rest/v1/testimonials?select=photo_consent_reference&limit=1`, {
    headers: headers(anonKey),
  })
  record('anônimo não lê referência de consentimento', [401, 403].includes(anonymousPrivateRead.status), `HTTP ${anonymousPrivateRead.status}`)

  const anonymousRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_testimonials`, {
    method: 'POST',
    headers: headers(anonKey),
    body: '{}',
  })
  record('anônimo não executa RPC administrativa', [401, 403, 404].includes(anonymousRpc.status), `HTTP ${anonymousRpc.status}`)

  const suffix = randomBytes(8).toString('hex')
  const email = `phase8-privacy-${suffix}@example.invalid`
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

  const nonAdminPrivateRead = await fetch(`${projectUrl}/rest/v1/testimonials?select=photo_consent_reference&limit=1`, {
    headers: headers(anonKey, session.access_token),
  })
  record('autenticado comum não lê referência de consentimento', [401, 403].includes(nonAdminPrivateRead.status), `HTTP ${nonAdminPrivateRead.status}`)

  const nonAdminRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_testimonials`, {
    method: 'POST',
    headers: headers(anonKey, session.access_token),
    body: '{}',
  })
  record('autenticado comum não executa RPC administrativa', [401, 403].includes(nonAdminRpc.status), `HTTP ${nonAdminRpc.status}`)

  const grantAdmin = await fetch(`${projectUrl}/rest/v1/admin_users`, {
    method: 'POST',
    headers: { ...headers(serviceKey), prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: temporaryUserId, role: 'admin' }),
  })
  if (!grantAdmin.ok) throw new Error(`Concessão temporária: HTTP ${grantAdmin.status}`)

  const createTestimonial = await fetch(`${projectUrl}/rest/v1/testimonials`, {
    method: 'POST',
    headers: { ...headers(serviceKey), prefer: 'return=representation' },
    body: JSON.stringify({
      author_display_name: 'Validação temporária',
      quote: 'Registro técnico removido automaticamente.',
      rating: 5,
      status: 'draft',
      created_by: temporaryUserId,
      updated_by: temporaryUserId,
    }),
  })
  if (!createTestimonial.ok) throw new Error(`Depoimento temporário: HTTP ${createTestimonial.status}`)
  const [testimonial] = await createTestimonial.json() as Array<{ id: number }>
  temporaryTestimonialId = testimonial.id

  const adminRpc = await fetch(`${projectUrl}/rest/v1/rpc/get_admin_testimonials`, {
    method: 'POST',
    headers: headers(anonKey, session.access_token),
    body: '{}',
  })
  const adminRows = adminRpc.ok ? await adminRpc.json() as Array<{ id: number; created_by: string }> : []
  const ownRow = adminRows.find((row) => row.id === temporaryTestimonialId)
  record('administrador lê registro completo pela RPC', adminRpc.ok && ownRow?.created_by === temporaryUserId, `HTTP ${adminRpc.status}, registro ${ownRow ? 'encontrado' : 'ausente'}`)

  const hiddenDraft = await fetch(`${projectUrl}/rest/v1/testimonials?id=eq.${temporaryTestimonialId}&select=id`, {
    headers: headers(anonKey),
  })
  const hiddenRows = hiddenDraft.ok ? await hiddenDraft.json() as unknown[] : []
  record('rascunho administrativo permanece invisível ao público', hiddenDraft.ok && hiddenRows.length === 0, `HTTP ${hiddenDraft.status}, linhas ${hiddenRows.length}`)
} finally {
  if (temporaryTestimonialId !== undefined) {
    await fetch(`${projectUrl}/rest/v1/testimonials?id=eq.${temporaryTestimonialId}`, {
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

if (!checks.every((check) => check.passed)) {
  throw new Error('Uma ou mais verificações de depoimentos/RLS falharam.')
}
