import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = await readFile(
  new URL('../supabase/migrations/20260813211500_catalog_analytics.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260813211500_catalog_analytics.sql', import.meta.url),
  'utf8',
)

test('migration de analytics mantém escrita encapsulada e leitura administrativa', () => {
  assert.match(migration, /alter table public\.analytics_daily_events enable row level security/i)
  assert.match(migration, /revoke all on public\.analytics_daily_events from anon, authenticated/i)
  assert.match(migration, /using \(\(select public\.is_catalog_admin\(\)\)\)/i)
  assert.match(migration, /security definer\s+set search_path = ''/i)
  assert.match(migration, /grant execute on function public\.record_catalog_event[^;]+to anon, authenticated/i)
  assert.match(migration, /raise exception 'invalid analytics dimensions'/i)
})

test('rollback remove somente os artefatos de analytics', () => {
  assert.match(rollback, /drop function if exists public\.record_catalog_event/i)
  assert.match(rollback, /drop table if exists public\.analytics_daily_events/i)
  assert.doesNotMatch(rollback, /drop table if exists public\.(products|collections|admin_users)/i)
})
