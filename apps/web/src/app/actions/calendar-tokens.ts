'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrCreateCalendarToken(): Promise<{ data: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Chercher un token existant dans user_preferences
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('calendar_token')
    .eq('user_id', user.id)
    .single()

  if (existing?.calendar_token) {
    return { data: existing.calendar_token }
  }

  // Le token est généré par défaut via gen_random_uuid(), mais si null, forcer une valeur
  const { data: updated, error } = await supabase
    .from('user_preferences')
    .update({ calendar_token: crypto.randomUUID() })
    .eq('user_id', user.id)
    .select('calendar_token')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: updated.calendar_token }
}

export async function regenerateCalendarToken(): Promise<{ data: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data: updated, error } = await supabase
    .from('user_preferences')
    .update({ calendar_token: crypto.randomUUID() })
    .eq('user_id', user.id)
    .select('calendar_token')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: updated.calendar_token }
}
