'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProfileType } from '@/types'
import { getTopicsForProfile } from '@/lib/profile-topics'

export async function updateDisplayName(
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProfileType(
  profileType: ProfileType,
  resetTopics: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const updateData: Record<string, unknown> = { profile_type: profileType }

  if (resetTopics) {
    updateData.selected_topics = getTopicsForProfile(profileType)
  }

  const { error } = await supabase
    .from('user_preferences')
    .update(updateData)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caracteres' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
