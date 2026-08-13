import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface ImageCandidate {
  name: string
  size: number
  type: string
}

export interface PreparedImageVariant {
  variant: 'original' | 'card-320' | 'card-640' | 'social'
  path: string
  blob: Blob
  width: number
  height: number
}

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maximumBytes = 10 * 1024 * 1024

export function normalizeCatalogSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateImageCandidate(file: ImageCandidate): string | null {
  if (!acceptedTypes.has(file.type)) return 'Use uma imagem JPEG, PNG ou WebP.'
  if (file.size <= 0) return 'O arquivo de imagem está vazio.'
  if (file.size > maximumBytes) return 'A imagem deve ter no máximo 10 MB.'
  return null
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('O navegador não conseguiu gerar a variante WebP.'))
      else resolve(blob)
    }, 'image/webp', 0.86)
  })
}

async function resizeCover(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponível para processar a imagem.')

  const scale = Math.max(width / bitmap.width, height / bitmap.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (bitmap.width - sourceWidth) / 2
  const sourceY = (bitmap.height - sourceHeight) / 2
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height)
  return canvasBlob(canvas)
}

export async function prepareProductImageVariants(
  file: File,
  productSlug: string,
): Promise<PreparedImageVariant[]> {
  const validationError = validateImageCandidate(file)
  if (validationError) throw new Error(validationError)

  const bitmap = await createImageBitmap(file)
  try {
    if (bitmap.width < 640 || bitmap.height < 640) {
      throw new Error('A imagem precisa ter pelo menos 640 × 640 pixels.')
    }

    const filename = `${normalizeCatalogSlug(productSlug)}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`
    const definitions = [
      { variant: 'original', directory: '', width: 1000, height: 1000 },
      { variant: 'card-320', directory: 'card/320/', width: 320, height: 320 },
      { variant: 'card-640', directory: 'card/640/', width: 640, height: 640 },
      { variant: 'social', directory: 'social/', width: 1200, height: 630 },
    ] as const

    return Promise.all(definitions.map(async (definition) => ({
      variant: definition.variant,
      path: `${definition.directory}${filename}`,
      blob: await resizeCover(bitmap, definition.width, definition.height),
      width: definition.width,
      height: definition.height,
    })))
  } finally {
    bitmap.close()
  }
}

export async function uploadProductImageVariants(
  client: SupabaseClient<Database>,
  productId: string,
  productName: string,
  variants: PreparedImageVariant[],
): Promise<void> {
  const uploadedPaths: string[] = []
  try {
    for (const variant of variants) {
      const { error } = await client.storage.from('product-images').upload(variant.path, variant.blob, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      })
      if (error) throw error
      uploadedPaths.push(variant.path)
    }

    const { error } = await client.from('product_images').upsert(
      variants.map((variant) => ({
        id: `${productId}--${variant.variant}`,
        product_id: productId,
        storage_path: variant.path,
        variant: variant.variant,
        alt_text: productName,
        width: variant.width,
        height: variant.height,
        display_order: 0,
      })),
      { onConflict: 'id' },
    )
    if (error) throw error
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from('product-images').remove(uploadedPaths)
    throw error
  }
}
