const defaultStorageBaseUrl =
  'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images'

const storageBaseUrl = (
  import.meta.env?.VITE_SUPABASE_STORAGE_URL || defaultStorageBaseUrl
).replace(/\/$/, '')

export type ProductImageVariant = 'original' | 'card-320' | 'card-640' | 'social'

const variantDirectories: Record<ProductImageVariant, string> = {
  original: '',
  'card-320': 'card/320',
  'card-640': 'card/640',
  social: 'social',
}

function productImageFilename(path: string): string | undefined {
  const filename = path.split('/').at(-1)
  if (!filename) return undefined

  return filename.replace(/\.(?:jpe?g|png)$/i, '.webp')
}

export function productImageUrl(
  path: string,
  variant: ProductImageVariant = 'original',
): string {
  const webpFilename = productImageFilename(path)
  if (!webpFilename) return path

  const directory = variantDirectories[variant]
  return `${storageBaseUrl}/${directory ? `${directory}/` : ''}${encodeURIComponent(webpFilename)}`
}

export function productImageSrcset(path: string): string {
  return [
    `${productImageUrl(path, 'card-320')} 320w`,
    `${productImageUrl(path, 'card-640')} 640w`,
    `${productImageUrl(path)} 1000w`,
  ].join(', ')
}
