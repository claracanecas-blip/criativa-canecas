import assert from 'node:assert/strict'
import test from 'node:test'
import { applyPngResolution, buildArtworkFilename } from '../src/utils/personalizationExport.ts'

function minimalPng() {
  const bytes = new Uint8Array(45)
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0)
  const view = new DataView(bytes.buffer)
  view.setUint32(8, 13, false)
  bytes.set([73, 72, 68, 82], 12)
  view.setUint32(33, 0, false)
  bytes.set([73, 69, 78, 68], 37)
  return bytes
}

test('nome da prévia é seguro e identifica o gabarito', () => {
  assert.equal(buildArtworkFilename('Férias da Mãe 2026.JPG'), 'Ferias-da-Mae-2026-previa-21x8-7cm.png')
  assert.equal(buildArtworkFilename(''), 'arte-personalizada-previa-21x8-7cm.png')
})

test('PNG recebe resolução física equivalente a 300 dpi', () => {
  const calibrated = applyPngResolution(minimalPng(), 300)
  const view = new DataView(calibrated.buffer, calibrated.byteOffset, calibrated.byteLength)

  assert.equal(calibrated.length, 66)
  assert.equal(String.fromCharCode(...calibrated.subarray(37, 41)), 'pHYs')
  assert.equal(view.getUint32(41, false), 11811)
  assert.equal(view.getUint32(45, false), 11811)
  assert.equal(calibrated[49], 1)
})
