const defaultStorageBaseUrl =
  'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images'

const storageBaseUrl = (
  import.meta.env.VITE_SUPABASE_STORAGE_URL || defaultStorageBaseUrl
).replace(/\/$/, '')

export function productImageUrl(path: string): string {
  const filename = path.split('/').at(-1)
  if (!filename) return path

  const webpFilename = filename.replace(/\.(?:jpe?g|png)$/i, '.webp')
  return `${storageBaseUrl}/${encodeURIComponent(webpFilename)}`
}
