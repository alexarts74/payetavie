import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js'

export type StorageAdapter = {
  getItem: (key: string) => string | null | Promise<string | null>
  setItem: (key: string, value: string) => void | Promise<void>
  removeItem: (key: string) => void | Promise<void>
}

export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: { storage?: StorageAdapter }
): SupabaseClient {
  const clientOptions: SupabaseClientOptions<'public'> = {}

  if (options?.storage) {
    clientOptions.auth = {
      storage: options.storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }

  return createClient(url, anonKey, clientOptions)
}
