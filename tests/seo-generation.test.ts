import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderSeoHtml } from '../scripts/generate-seo.ts'

test('prerender injeta metadados, canonical, Open Graph e JSON-LD seguros', () => {
  const template = '<!doctype html><html><head><title>Base</title><meta name="description" content="Base"></head><body><div id="app"></div></body></html>'
  const html = renderSeoHtml(template, {
    title: 'Caneca <Teste> | Criativa Canecas',
    description: 'Descrição & segura',
    canonical: 'https://criativa-canecas.vercel.app/produto/teste',
    image: 'https://example.com/teste.webp',
    type: 'product',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Product', name: '</script><script>' }],
  }, '<main><h1>Teste</h1></main>')

  assert.match(html, /<title>Caneca &lt;Teste&gt; \| Criativa Canecas<\/title>/)
  assert.match(html, /rel="canonical" href="https:\/\/criativa-canecas\.vercel\.app\/produto\/teste"/)
  assert.match(html, /property="og:type" content="product"/)
  assert.match(html, /type="application\/ld\+json"/)
  assert.doesNotMatch(html, /<\/script><script>/)
  assert.match(html, /<div id="app"><main><h1>Teste<\/h1><\/main><\/div>/)
})
