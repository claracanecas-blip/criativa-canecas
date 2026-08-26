import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeSearchText } from '../src/utils/search.ts'

test('normalização de busca ignora acentos, caixa e espaços externos', () => {
  assert.equal(normalizeSearchText('  SÃO Paulo  '), 'sao paulo')
  assert.equal(normalizeSearchText('Fé Cristã'), 'fe crista')
})
