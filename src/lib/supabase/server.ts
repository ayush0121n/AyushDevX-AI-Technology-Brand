import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Server-side Supabase admin client using the service role key.
 *
 * ⚠️ NEVER expose this to the browser — server-side / TanStack Start
 *    server functions only. The service role key bypasses RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing server-side Supabase env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Server-side Supabase anon client.
 * Use inside TanStack Start server functions when you want RLS enforced.
 * Pass the user's JWT as the Authorization header to identify the user.
 */
export function createServerClient(accessToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing server-side Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  })
}
