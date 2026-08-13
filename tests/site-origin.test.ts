import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_SITE_ORIGIN,
  normalizeSiteOrigin,
  officialSiteOrigin,
  officialSiteUrl,
} from '../src/data/site.ts'

test('origem oficial remove caminho e barra final sem aceitar protocolos inseguros', () => {
  assert.equal(normalizeSiteOrigin('https://canecas.example/loja/'), 'https://canecas.example')
  assert.equal(normalizeSiteOrigin('http://localhost:4173/'), 'http://localhost:4173')
  assert.equal(normalizeSiteOrigin('http://canecas.example'), DEFAULT_SITE_ORIGIN)
  assert.equal(normalizeSiteOrigin('javascript:alert(1)'), DEFAULT_SITE_ORIGIN)
  assert.equal(normalizeSiteOrigin('valor inválido'), DEFAULT_SITE_ORIGIN)
})

test('URLs públicas usam a origem oficial padrão fora do bundle Vite', () => {
  assert.equal(officialSiteOrigin(), DEFAULT_SITE_ORIGIN)
  assert.equal(officialSiteUrl('/produto/arrow-1'), `${DEFAULT_SITE_ORIGIN}/produto/arrow-1`)
  assert.equal(officialSiteUrl('colecoes'), `${DEFAULT_SITE_ORIGIN}/colecoes`)
})
