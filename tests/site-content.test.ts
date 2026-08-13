import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { renderInformationBody } from '../scripts/generate-seo.ts'
import { fallbackInformationContent, normalizePublicInformationContent } from '../src/data/informationContent.ts'

const migration = await readFile(new URL('../supabase/migrations/20260813221500_site_content_sections.sql', import.meta.url), 'utf8')
const rollback = await readFile(new URL('../supabase/rollback/20260813221500_site_content_sections.sql', import.meta.url), 'utf8')

test('conteúdo institucional padrão possui cartões e perguntas únicas', () => {
  assert.equal(fallbackInformationContent.length, 9)
  assert.equal(new Set(fallbackInformationContent.map((section) => section.content_key)).size, 9)
  assert.equal(fallbackInformationContent.filter((section) => section.kind === 'card').length, 4)
  assert.equal(fallbackInformationContent.filter((section) => section.kind === 'faq').length, 5)
})

test('normalização aceita somente tipos e ícones públicos conhecidos', () => {
  const rows = normalizePublicInformationContent([
    { content_key: 'faq_b', kind: 'faq', title: 'Pergunta?', body: 'Resposta suficientemente longa.', icon_name: 'ShieldCheck', display_order: 20 },
    { content_key: 'card_a', kind: 'card', title: 'Título', body: 'Conteúdo suficientemente longo.', icon_name: 'Coffee', display_order: 10 },
    { content_key: 'invalid', kind: 'other', title: 'Inválido', body: 'Não deve aparecer na saída.', icon_name: null, display_order: 0 },
  ])
  assert.deepEqual(rows.map((row) => row.content_key), ['card_a', 'faq_b'])
  assert.equal(rows[1]?.icon_name, null)
})

test('prerender institucional escapa conteúdo administrável', () => {
  const html = renderInformationBody([{ content_key: 'faq_safe', kind: 'faq', title: '<script>alert(1)</script>', body: 'Resposta & confirmação.', icon_name: null, display_order: 1 }])
  assert.doesNotMatch(html, /<script>alert/)
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(html, /Resposta &amp; confirmação/)
})

test('migration de conteúdo aplica publicação, RLS administrativa e rollback isolado', () => {
  assert.match(migration, /create table public\.site_content_sections/i)
  assert.match(migration, /status text not null default 'draft'/i)
  assert.match(migration, /site_content_sections_public_read/i)
  assert.match(migration, /using \(status = 'published'\)/i)
  assert.match(migration, /site_content_sections_admin_(insert|update|delete)/i)
  assert.match(migration, /create or replace function public\.get_admin_site_content\(\)/i)
  assert.match(migration, /if not \(select public\.is_catalog_admin\(\)\)/i)
  assert.match(migration, /grant select \(content_key, kind, title, body, icon_name, display_order\)/i)
  assert.match(rollback, /drop table if exists public\.site_content_sections/i)
  assert.doesNotMatch(rollback, /drop table if exists public\.(products|collections|testimonials)/i)
})
