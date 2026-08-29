import {
  drawPersonalizationArtwork,
  PRINT_DPI,
  PRINT_EXPORT_HEIGHT,
  PRINT_EXPORT_WIDTH,
  type ArtworkRenderOptions,
} from './mugPersonalization'

export type PersonalizationExportOptions = Omit<ArtworkRenderOptions, 'image' | 'imageWidth' | 'imageHeight'> & {
  imageUrl: string
  imageName: string
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunkType(bytes: Uint8Array, offset: number) {
  return String.fromCharCode(
    bytes[offset + 4] ?? 0,
    bytes[offset + 5] ?? 0,
    bytes[offset + 6] ?? 0,
    bytes[offset + 7] ?? 0,
  )
}

export function applyPngResolution(bytes: Uint8Array, dpi = PRINT_DPI) {
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (bytes.length < 33 || pngSignature.some((value, index) => bytes[index] !== value)) {
    throw new Error('O arquivo gerado não é um PNG válido.')
  }

  const pixelsPerMeter = Math.round(dpi / 0.0254)
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, bytes.length - offset)
    const dataLength = view.getUint32(0, false)
    const end = offset + 12 + dataLength
    if (end > bytes.length) break
    if (chunkType(bytes, offset) === 'pHYs' && dataLength === 9) {
      const updated = bytes.slice()
      const updatedView = new DataView(updated.buffer, updated.byteOffset + offset, 21)
      updatedView.setUint32(8, pixelsPerMeter, false)
      updatedView.setUint32(12, pixelsPerMeter, false)
      updatedView.setUint8(16, 1)
      updatedView.setUint32(17, crc32(updated.subarray(offset + 4, offset + 17)), false)
      return updated
    }
    offset = end
  }

  const ihdrLength = new DataView(bytes.buffer, bytes.byteOffset + 8, 4).getUint32(0, false)
  const insertionOffset = 8 + 12 + ihdrLength
  const physicalChunk = new Uint8Array(21)
  const chunkView = new DataView(physicalChunk.buffer)
  chunkView.setUint32(0, 9, false)
  physicalChunk.set([112, 72, 89, 115], 4)
  chunkView.setUint32(8, pixelsPerMeter, false)
  chunkView.setUint32(12, pixelsPerMeter, false)
  physicalChunk[16] = 1
  chunkView.setUint32(17, crc32(physicalChunk.subarray(4, 17)), false)

  const updated = new Uint8Array(bytes.length + physicalChunk.length)
  updated.set(bytes.subarray(0, insertionOffset), 0)
  updated.set(physicalChunk, insertionOffset)
  updated.set(bytes.subarray(insertionOffset), insertionOffset + physicalChunk.length)
  return updated
}

export function buildArtworkFilename(imageName: string) {
  const baseName = imageName
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'arte-personalizada'
  return `${baseName}-previa-21x8-7cm.png`
}

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível preparar a foto escolhida.'))
    image.src = imageUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Não foi possível gerar a prévia em PNG.'))
    }, 'image/png')
  })
}

export async function createPersonalizationArtworkFile(options: PersonalizationExportOptions) {
  const image = options.imageUrl ? await loadImage(options.imageUrl) : undefined
  const canvas = document.createElement('canvas')
  canvas.width = PRINT_EXPORT_WIDTH
  canvas.height = PRINT_EXPORT_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Seu navegador não conseguiu criar o arquivo da prévia.')

  drawPersonalizationArtwork(context, canvas.width, canvas.height, {
    image,
    imageWidth: image?.naturalWidth ?? 1,
    imageHeight: image?.naturalHeight ?? 1,
    imageScale: options.imageScale,
    imageX: options.imageX,
    imageY: options.imageY,
    phrase: options.phrase,
  })

  const png = await canvasToBlob(canvas)
  const calibrated = applyPngResolution(new Uint8Array(await png.arrayBuffer()))
  return new File([calibrated], buildArtworkFilename(options.imageName), {
    type: 'image/png',
    lastModified: Date.now(),
  })
}
