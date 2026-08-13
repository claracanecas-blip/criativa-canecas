/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_STORAGE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
