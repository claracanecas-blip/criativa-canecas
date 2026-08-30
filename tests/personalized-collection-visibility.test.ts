import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = await readFile(
  new URL('../supabase/migrations/20260830123000_hide_empty_personalized_collection.sql', import.meta.url),
  'utf8',
)
const rollback = await readFile(
  new URL('../supabase/rollback/20260830123000_hide_empty_personalized_collection.sql', import.meta.url),
  'utf8',
)

test('migration oculta somente a coleção vazia de personalização', () => {
  assert.match(migration, /where collection_id = 'personalizada'/i)
  assert.match(migration, /is_published = false/i)
  assert.match(migration, /is_listed = false/i)
  assert.match(migration, /where id = 'personalizada'/i)
  assert.doesNotMatch(migration, /delete from public\.(collections|products|product_collections)/i)
})

test('rollback restaura a visibilidade sem criar ou apagar dados', () => {
  assert.match(rollback, /is_published = true/i)
  assert.match(rollback, /is_listed = true/i)
  assert.match(rollback, /where id = 'personalizada'/i)
  assert.doesNotMatch(rollback, /(?:insert into|delete from) public\./i)
})
