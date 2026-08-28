import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_SITE_ORIGIN,
  deliveryPolicy,
  linkWhatsapp,
  normalizeSiteOrigin,
  officialSiteOrigin,
  officialSiteUrl,
  site,
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

test('identidade e WhatsApp oficiais permanecem centralizados', () => {
  assert.equal(site.responsavel, 'Viccenze Pfitscher da Costa')
  assert.equal(site.telefone, '(48) 99199-2341')
  assert.match(linkWhatsapp('Teste'), /^https:\/\/wa\.me\/5548991992341\?text=Teste$/)
})

test('política de entrega mantém preço, atendimento local e envio centralizados', () => {
  assert.match(deliveryPolicy.priceNote, /frete não está incluído/i)
  assert.equal(deliveryPolicy.local.title, 'Araranguá')
  assert.match(deliveryPolicy.local.subtitle, /entrega ou retirada local/i)
  assert.match(deliveryPolicy.local.description, /mimo especial, conforme disponibilidade/i)
  assert.match(deliveryPolicy.shipping.subtitle, /Correios/i)
  assert.match(deliveryPolicy.shipping.description, /frete.*CEP/i)
  assert.match(deliveryPolicy.contactPrompt, /cidade\/CEP/i)
})
