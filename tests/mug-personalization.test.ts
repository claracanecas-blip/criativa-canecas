import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateArtworkPlacement,
  MUG_TEXTURE_HEIGHT,
  MUG_TEXTURE_WIDTH,
  resolveMugAppearance,
} from '../src/utils/mugPersonalization.ts'

test('aparência 3D é consistente nas opções personalizada e com foto', () => {
  const personalized = resolveMugAppearance('Caneca personalizada')
  const withPhoto = resolveMugAppearance('Caneca personalizada com foto')

  assert.deepEqual(withPhoto, personalized)
})

test('posicionamento mantém proporção e responde a escala e deslocamento', () => {
  const centered = calculateArtworkPlacement(1600, 900, 100, 0, 0, false)
  const adjusted = calculateArtworkPlacement(1600, 900, 140, 35, -35, false)

  assert.ok(Math.abs(centered.width / centered.height - 1600 / 900) < Number.EPSILON * 2)
  assert.ok(adjusted.width > centered.width)
  assert.ok(adjusted.x + adjusted.width / 2 > MUG_TEXTURE_WIDTH / 2)
  assert.ok(adjusted.y + adjusted.height / 2 < MUG_TEXTURE_HEIGHT / 2)
})

test('posicionamento limita valores externos ao intervalo oferecido na interface', () => {
  const maximum = calculateArtworkPlacement(1000, 1000, 999, 999, 999, true)
  const clamped = calculateArtworkPlacement(1000, 1000, 170, 35, 35, true)

  assert.deepEqual(maximum, clamped)
})
