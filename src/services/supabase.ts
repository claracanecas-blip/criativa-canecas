import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let client: SupabaseClient<Database> | null = null

export function supabaseConfiguration() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  }
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client

  const { url, publishableKey } = supabaseConfiguration()
  if (!url || !publishableKey) {
    throw new Error('Configuração pública do Supabase ausente')
  }

  client = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}
