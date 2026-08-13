import assert from 'node:assert/strict'
import test from 'node:test'
import {
  analyticsEnabled,
  collectionSource,
  productSource,
  resultCountBucket,
  routeGroup,
  searchLengthBucket,
} from '../src/services/analytics.ts'

test('analytics só habilita no hostname oficial em produção', () => {
  assert.equal(analyticsEnabled({ production: true, hostname: 'criativa-canecas.vercel.app' }), true)
  assert.equal(analyticsEnabled({ production: false, hostname: 'criativa-canecas.vercel.app' }), false)
  assert.equal(analyticsEnabled({ production: true, hostname: 'localhost' }), false)
  assert.equal(analyticsEnabled({ production: true, hostname: 'preview.vercel.app' }), false)
  assert.equal(analyticsEnabled({ production: true, hostname: 'loja.exemplo.com.br' }, 'loja.exemplo.com.br'), true)
  assert.equal(analyticsEnabled({ production: true, hostname: 'criativa-canecas.vercel.app' }, 'loja.exemplo.com.br'), false)
})

test('busca vira somente faixas numéricas sem carregar o texto consultado', () => {
  assert.equal(searchLengthBucket(1), '1')
  assert.equal(searchLengthBucket(3), '2-3')
  assert.equal(searchLengthBucket(10), '4-10')
  assert.equal(searchLengthBucket(80), '11+')
  assert.equal(resultCountBucket(0), '0')
  assert.equal(resultCountBucket(1), '1')
  assert.equal(resultCountBucket(5), '2-5')
  assert.equal(resultCountBucket(20), '6-20')
  assert.equal(resultCountBucket(341), '21+')
})

test('origens e grupos de rota são reduzidos a valores fechados', () => {
  assert.equal(routeGroup('admin'), 'admin')
  assert.equal(routeGroup('produto'), 'product')
  assert.equal(productSource('produto'), 'related')
  assert.equal(collectionSource('busca'), 'search')
  assert.equal(productSource(undefined), 'direct')
})
