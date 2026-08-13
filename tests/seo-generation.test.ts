import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderSeoHtml } from '../scripts/generate-seo.ts'

test('prerender substitui metadados-base e injeta canonical, Open Graph e JSON-LD seguros', () => {
  const template = '<!doctype html><html><head><title>Base</title><meta data-criativa-dynamic-meta name="description" content="Base"><link data-criativa-dynamic-meta rel="canonical" href="https://criativa-canecas.vercel.app/"><script data-criativa-dynamic-meta type="application/ld+json">{"base":true}</script></head><body><div id="app"></div></body></html>'
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
  assert.equal(html.match(/rel="canonical"/g)?.length, 1)
  assert.doesNotMatch(html, /href="https:\/\/criativa-canecas\.vercel\.app\/"/)
  assert.doesNotMatch(html, /"base":true/)
  assert.match(html, /property="og:type" content="product"/)
  assert.match(html, /type="application\/ld\+json"/)
  assert.doesNotMatch(html, /<\/script><script>/)
  assert.match(html, /<div id="app"><main><h1>Teste<\/h1><\/main><\/div>/)
})
