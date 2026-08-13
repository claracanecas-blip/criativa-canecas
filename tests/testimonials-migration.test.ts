import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = await readFile(new URL('../supabase/migrations/20260813214500_moderated_testimonials.sql', import.meta.url), 'utf8')
const hardening = await readFile(new URL('../supabase/migrations/20260813215000_testimonials_admin_hardening.sql', import.meta.url), 'utf8')

test('depoimentos exigem moderação e consentimento para foto', () => {
  assert.match(migration, /status text not null default 'draft'/i)
  assert.match(migration, /photo_path is null or \(photo_consent_reference is not null/i)
  assert.match(migration, /using \(status = 'published'\)/i)
  assert.match(migration, /testimonials_admin_(insert|update|delete)/i)
  assert.match(hardening, /testimonials_admin_read/i)
  assert.match(hardening, /grant usage, select on sequence public\.testimonials_id_seq/i)
})
