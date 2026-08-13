import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = await readFile(new URL('../supabase/migrations/20260813214500_moderated_testimonials.sql', import.meta.url), 'utf8')
const hardening = await readFile(new URL('../supabase/migrations/20260813215000_testimonials_admin_hardening.sql', import.meta.url), 'utf8')
const privacy = await readFile(new URL('../supabase/migrations/20260813215500_testimonials_privacy.sql', import.meta.url), 'utf8')

test('depoimentos exigem moderação e consentimento para foto', () => {
  assert.match(migration, /status text not null default 'draft'/i)
  assert.match(migration, /photo_path is null or \(photo_consent_reference is not null/i)
  assert.match(migration, /using \(status = 'published'\)/i)
  assert.match(migration, /testimonials_admin_(insert|update|delete)/i)
  assert.match(hardening, /testimonials_admin_read/i)
  assert.match(hardening, /grant usage, select on sequence public\.testimonials_id_seq/i)
})

test('metadados privados de depoimentos exigem acesso administrativo', () => {
  assert.match(privacy, /revoke select on public\.testimonials from authenticated/i)
  assert.match(privacy, /grant select \(id, author_display_name, quote, rating, photo_path, display_order\)/i)
  assert.match(privacy, /create or replace function public\.get_admin_testimonials\(\)/i)
  assert.match(privacy, /security definer/i)
  assert.match(privacy, /if not \(select public\.is_catalog_admin\(\)\)/i)
  assert.match(privacy, /revoke all on function public\.get_admin_testimonials\(\) from public, anon/i)
})
