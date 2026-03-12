'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProfileType, HousingSituation, UserPreferences } from '@/types'
import { getTopicsForProfile, ALL_TOPIC_SLUGS } from '@/lib/profile-topics'
import { getUserSubscription, getPlanLimits } from '@/lib/subscription'

export async function getUserPreferences(): Promise<{ data: UserPreferences | null; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Non authentifie' }
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }

  return { data }
}

export async function completeOnboarding(
  profileType: ProfileType,
  additionalTopics: string[],
  profileInfo?: {
    birthDate?: string | null
    postalCode?: string | null
    housingSituation?: HousingSituation | null
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const baseTopics = getTopicsForProfile(profileType)
  const allTopics = [...new Set([...baseTopics, ...additionalTopics])]

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        profile_type: profileType,
        selected_topics: allTopics,
        onboarding_completed: true,
        birth_date: profileInfo?.birthDate || null,
        postal_code: profileInfo?.postalCode || null,
        housing_situation: profileInfo?.housingSituation || null,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        profile_type: 'autre',
        selected_topics: ALL_TOPIC_SLUGS,
        onboarding_completed: true,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateSelectedTopics(
  topics: string[]
): Promise<{ success: boolean; error?: string; upgradeRequired?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  // Vérifier la limite de thématiques
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)
  if (topics.length > limits.topics) {
    return {
      success: false,
      error: `Vous ne pouvez sélectionner que ${limits.topics} thématiques avec le plan gratuit. Passez au plan Essentiel pour un accès illimité.`,
      upgradeRequired: 'essentiel',
    }
  }

  const { error } = await supabase
    .from('user_preferences')
    .update({ selected_topics: topics })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePostalCode(
  postalCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const { error } = await supabase
    .from('user_preferences')
    .update({ postal_code: postalCode })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleTopic(
  topicSlug: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifie' }
  }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('selected_topics')
    .eq('user_id', user.id)
    .single()

  if (!prefs) {
    // Pas de preferences, creer avec tous les topics + celui-ci
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        profile_type: 'autre',
        selected_topics: ALL_TOPIC_SLUGS,
        onboarding_completed: true,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  }

  const currentTopics: string[] = prefs.selected_topics
  const isAdding = !currentTopics.includes(topicSlug)
  const newTopics = isAdding
    ? [...currentTopics, topicSlug]
    : currentTopics.filter((s: string) => s !== topicSlug)

  // Vérifier la limite si on ajoute un topic
  if (isAdding) {
    const { plan } = await getUserSubscription()
    const limits = getPlanLimits(plan)
    if (currentTopics.length >= limits.topics) {
      return {
        success: false,
        error: `Vous avez atteint la limite de ${limits.topics} thématiques. Passez au plan Essentiel pour un accès illimité.`,
      }
    }
  }

  const { error } = await supabase
    .from('user_preferences')
    .update({ selected_topics: newTopics })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
