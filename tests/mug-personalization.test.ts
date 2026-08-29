import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ARTWORK_SCALE_MAX,
  calculateArtworkPlacement,
  calculateArtworkQuality,
  calculateFillScalePercent,
  MUG_TEXTURE_HEIGHT,
  MUG_TEXTURE_WIDTH,
  PRINT_EXPORT_HEIGHT,
  PRINT_EXPORT_WIDTH,
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
  const clamped = calculateArtworkPlacement(1000, 1000, ARTWORK_SCALE_MAX, 35, 35, true)

  assert.deepEqual(maximum, clamped)
})

test('preenchimento amplia fotos verticais sem ultrapassar o limite seguro', () => {
  const portraitScale = calculateFillScalePercent(900, 1600, false)
  const landscapeScale = calculateFillScalePercent(1600, 900, false)

  assert.ok(portraitScale > 100)
  assert.equal(portraitScale, ARTWORK_SCALE_MAX)
  assert.equal(landscapeScale, 100)
})

test('gabarito de exportação corresponde a 21 por 8,7 cm em 300 dpi', () => {
  assert.equal(PRINT_EXPORT_WIDTH, 2480)
  assert.equal(PRINT_EXPORT_HEIGHT, 1028)
  assert.equal(MUG_TEXTURE_WIDTH / MUG_TEXTURE_HEIGHT, PRINT_EXPORT_WIDTH / PRINT_EXPORT_HEIGHT)
})

test('qualidade considera o enquadramento e alerta sobre ampliação excessiva', () => {
  assert.equal(calculateArtworkQuality(4000, 3000, 100, false).level, 'good')
  const enlarged = calculateArtworkQuality(400, 400, ARTWORK_SCALE_MAX, false)
  assert.equal(enlarged.level, 'low')
  assert.ok(enlarged.effectiveDpi < 100)
})
