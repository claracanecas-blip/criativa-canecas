/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_STORAGE_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_CATALOG_SOURCE?: 'supabase' | 'typescript'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
