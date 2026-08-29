export const MUG_TEXTURE_WIDTH = 1024
export const MUG_TEXTURE_HEIGHT = 512
export const ARTWORK_SCALE_MIN = 70
export const ARTWORK_SCALE_MAX = 250
export const ARTWORK_OFFSET_LIMIT = 35

const ARTWORK_MAX_WIDTH = 760
const ARTWORK_MAX_HEIGHT = 390
const ARTWORK_MAX_HEIGHT_WITH_PHRASE = 300
const ARTWORK_FILL_WIDTH = 560

export type MugAppearance = {
  body: number
  handle: number
  interior: number
  rim: number
}

export type ArtworkPlacement = {
  x: number
  y: number
  width: number
  height: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function clampArtworkScale(value: number) {
  return clamp(value, ARTWORK_SCALE_MIN, ARTWORK_SCALE_MAX)
}

export function clampArtworkOffset(value: number) {
  return clamp(value, -ARTWORK_OFFSET_LIMIT, ARTWORK_OFFSET_LIMIT)
}

export function resolveMugAppearance(model: string): MugAppearance {
  void model
  return {
    body: 0xfffbfd,
    handle: 0xf7f1f4,
    interior: 0xf0e9ed,
    rim: 0xfffbfd,
  }
}

export function calculateArtworkPlacement(
  imageWidth: number,
  imageHeight: number,
  scalePercent: number,
  xPercent: number,
  yPercent: number,
  hasPhrase: boolean,
): ArtworkPlacement {
  const safeWidth = Math.max(1, imageWidth)
  const safeHeight = Math.max(1, imageHeight)
  const maximumHeight = hasPhrase ? ARTWORK_MAX_HEIGHT_WITH_PHRASE : ARTWORK_MAX_HEIGHT
  const baseScale = Math.min(ARTWORK_MAX_WIDTH / safeWidth, maximumHeight / safeHeight)
  const requestedScale = clampArtworkScale(scalePercent) / 100
  const width = safeWidth * baseScale * requestedScale
  const height = safeHeight * baseScale * requestedScale
  const centerX = MUG_TEXTURE_WIDTH / 2 + (clampArtworkOffset(xPercent) / ARTWORK_OFFSET_LIMIT) * 180
  const baseCenterY = hasPhrase ? 210 : MUG_TEXTURE_HEIGHT / 2
  const centerY = baseCenterY + (clampArtworkOffset(yPercent) / ARTWORK_OFFSET_LIMIT) * 82

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}

export function calculateFillScalePercent(imageWidth: number, imageHeight: number, hasPhrase: boolean) {
  const fitted = calculateArtworkPlacement(imageWidth, imageHeight, 100, 0, 0, hasPhrase)
  const targetHeight = hasPhrase ? ARTWORK_MAX_HEIGHT_WITH_PHRASE : ARTWORK_MAX_HEIGHT
  const requiredScale = Math.max(ARTWORK_FILL_WIDTH / fitted.width, targetHeight / fitted.height) * 100
  return Math.round(clampArtworkScale(requiredScale))
}
