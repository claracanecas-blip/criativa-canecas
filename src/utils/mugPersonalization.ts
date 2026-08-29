export const MUG_TEXTURE_WIDTH = 1024
export const MUG_TEXTURE_HEIGHT = 512

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
  const maximumWidth = 760
  const maximumHeight = hasPhrase ? 300 : 390
  const baseScale = Math.min(maximumWidth / safeWidth, maximumHeight / safeHeight)
  const requestedScale = clamp(scalePercent, 70, 170) / 100
  const width = safeWidth * baseScale * requestedScale
  const height = safeHeight * baseScale * requestedScale
  const centerX = MUG_TEXTURE_WIDTH / 2 + (clamp(xPercent, -35, 35) / 35) * 180
  const baseCenterY = hasPhrase ? 210 : MUG_TEXTURE_HEIGHT / 2
  const centerY = baseCenterY + (clamp(yPercent, -35, 35) / 35) * 82

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}
