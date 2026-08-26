import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchAllQueryPages } from '../src/utils/paginatedQuery.ts'

test('consulta paginada reúne mais de mil registros sem truncamento', async () => {
  const source = Array.from({ length: 1_205 }, (_, id) => ({ id }))
  const requestedRanges: Array<[number, number]> = []

  const rows = await fetchAllQueryPages(async (from, to) => {
    requestedRanges.push([from, to])
    return { data: source.slice(from, to + 1), error: null }
  })

  assert.equal(rows.length, source.length)
  assert.deepEqual(rows.at(-1), { id: 1_204 })
  assert.deepEqual(requestedRanges, [[0, 999], [1_000, 1_999]])
})

test('consulta paginada interrompe e propaga falha de uma página', async () => {
  await assert.rejects(
    fetchAllQueryPages(async () => ({ data: null, error: { message: 'falha simulada' } })),
    /falha simulada/,
  )
})
