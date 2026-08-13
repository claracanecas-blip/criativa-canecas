import { getSupabaseClient } from '@/services/supabase'

export async function currentAdmin() {
  const client = getSupabaseClient()
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError || !session) return null

  const { data, error } = await client
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error || data?.role !== 'admin') return null
  return { session, user: session.user }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw error
}
