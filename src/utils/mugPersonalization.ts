export const PRINT_WIDTH_CM = 21
export const PRINT_HEIGHT_CM = 8.7
export const PRINT_DPI = 300
export const PRINT_EXPORT_WIDTH = Math.round((PRINT_WIDTH_CM / 2.54) * PRINT_DPI)
export const PRINT_EXPORT_HEIGHT = Math.round((PRINT_HEIGHT_CM / 2.54) * PRINT_DPI)
export const MUG_TEXTURE_WIDTH = PRINT_EXPORT_WIDTH / 2
export const MUG_TEXTURE_HEIGHT = PRINT_EXPORT_HEIGHT / 2
export const ARTWORK_SCALE_MIN = 70
export const ARTWORK_SCALE_MAX = 250
export const ARTWORK_OFFSET_LIMIT = 35
export const ARTWORK_HANDLE_GUARD_RATIO = 0.03

export const ARTWORK_SAFE_LEFT = MUG_TEXTURE_WIDTH * ARTWORK_HANDLE_GUARD_RATIO
export const ARTWORK_SAFE_WIDTH = MUG_TEXTURE_WIDTH * (1 - ARTWORK_HANDLE_GUARD_RATIO * 2)
const ARTWORK_SAFE_RIGHT = ARTWORK_SAFE_LEFT + ARTWORK_SAFE_WIDTH
const ARTWORK_MAX_WIDTH = ARTWORK_SAFE_WIDTH
const ARTWORK_MAX_HEIGHT = MUG_TEXTURE_HEIGHT * 0.9
const ARTWORK_MAX_HEIGHT_WITH_PHRASE = MUG_TEXTURE_HEIGHT * (300 / 512)
const ARTWORK_HORIZONTAL_TRAVEL = MUG_TEXTURE_WIDTH * (180 / 1024)
const ARTWORK_VERTICAL_TRAVEL = MUG_TEXTURE_HEIGHT * (82 / 512)
const ARTWORK_PHRASE_CENTER_Y = MUG_TEXTURE_HEIGHT * (210 / 512)
const ARTWORK_AUTOMATIC_SCALE_MAX = 140

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

export type ArtworkQuality = {
  level: 'good' | 'warning' | 'low'
  effectiveDpi: number
}

export type ArtworkRenderOptions = {
  image?: CanvasImageSource
  imageWidth: number
  imageHeight: number
  imageScale: number
  imageX: number
  imageY: number
  phrase: string
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

function constrainCenter(center: number, size: number, start: number, end: number) {
  const availableSize = end - start
  if (size <= availableSize) return clamp(center, start + size / 2, end - size / 2)
  return clamp(center, end - size / 2, start + size / 2)
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
  const requestedCenterX = MUG_TEXTURE_WIDTH / 2 + (clampArtworkOffset(xPercent) / ARTWORK_OFFSET_LIMIT) * ARTWORK_HORIZONTAL_TRAVEL
  const baseCenterY = hasPhrase ? ARTWORK_PHRASE_CENTER_Y : MUG_TEXTURE_HEIGHT / 2
  const requestedCenterY = baseCenterY + (clampArtworkOffset(yPercent) / ARTWORK_OFFSET_LIMIT) * ARTWORK_VERTICAL_TRAVEL
  const centerX = constrainCenter(requestedCenterX, width, ARTWORK_SAFE_LEFT, ARTWORK_SAFE_RIGHT)
  const centerY = constrainCenter(requestedCenterY, height, 0, MUG_TEXTURE_HEIGHT)

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
  const requiredScale = Math.max(ARTWORK_SAFE_WIDTH / fitted.width, targetHeight / fitted.height) * 100
  return Math.round(clampArtworkScale(requiredScale))
}

export function calculateAutomaticScalePercent(imageWidth: number, imageHeight: number, hasPhrase: boolean) {
  return Math.min(ARTWORK_AUTOMATIC_SCALE_MAX, Math.max(100, calculateFillScalePercent(imageWidth, imageHeight, hasPhrase)))
}

export function calculateArtworkQuality(
  imageWidth: number,
  imageHeight: number,
  scalePercent: number,
  hasPhrase: boolean,
): ArtworkQuality {
  const placement = calculateArtworkPlacement(imageWidth, imageHeight, scalePercent, 0, 0, hasPhrase)
  const requiredWidth = placement.width * (PRINT_EXPORT_WIDTH / MUG_TEXTURE_WIDTH)
  const requiredHeight = placement.height * (PRINT_EXPORT_HEIGHT / MUG_TEXTURE_HEIGHT)
  const resolutionRatio = Math.min(imageWidth / requiredWidth, imageHeight / requiredHeight)
  const effectiveDpi = Math.max(1, Math.min(PRINT_DPI, Math.round(PRINT_DPI * resolutionRatio)))
  const level = resolutionRatio >= 1 ? 'good' : resolutionRatio >= 0.67 ? 'warning' : 'low'
  return { level, effectiveDpi }
}

function wrapPhrase(context: CanvasRenderingContext2D, phrase: string, maximumWidth: number) {
  const words = phrase.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (current && context.measureText(candidate).width > maximumWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

export function drawPersonalizationArtwork(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: ArtworkRenderOptions,
) {
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  context.save()
  context.scale(canvasWidth / MUG_TEXTURE_WIDTH, canvasHeight / MUG_TEXTURE_HEIGHT)
  context.beginPath()
  context.rect(ARTWORK_SAFE_LEFT, 0, ARTWORK_SAFE_WIDTH, MUG_TEXTURE_HEIGHT)
  context.clip()
  const hasPhrase = Boolean(options.phrase.trim())

  if (options.image) {
    const placement = calculateArtworkPlacement(
      options.imageWidth,
      options.imageHeight,
      options.imageScale,
      options.imageX,
      options.imageY,
      hasPhrase,
    )
    context.drawImage(options.image, placement.x, placement.y, placement.width, placement.height)
  }

  if (hasPhrase) {
    const fontSize = options.image ? 50 : 68
    context.font = `900 ${fontSize}px Arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineJoin = 'round'
    const lines = wrapPhrase(context, options.phrase, ARTWORK_SAFE_WIDTH - 30)
    const lineHeight = fontSize * 1.08
    const totalHeight = lines.length * lineHeight
    const centerY = options.image ? MUG_TEXTURE_HEIGHT * (425 / 512) : MUG_TEXTURE_HEIGHT / 2
    const firstY = centerY - totalHeight / 2 + lineHeight / 2
    for (const [index, line] of lines.entries()) {
      const y = firstY + index * lineHeight
      context.strokeStyle = 'rgba(255, 255, 255, .92)'
      context.lineWidth = 12
      context.strokeText(line, MUG_TEXTURE_WIDTH / 2, y)
      context.fillStyle = '#872643'
      context.fillText(line, MUG_TEXTURE_WIDTH / 2, y)
    }
  }

  context.restore()
}
