'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDefaultCategories() {
  return [
    { name: 'Loyer', icon: '🏠', color: 'blue', topicSlug: 'logement' },
    { name: 'Courses', icon: '🛒', color: 'green', topicSlug: null },
    { name: 'Transports', icon: '🚗', color: 'yellow', topicSlug: null },
    { name: 'Sante', icon: '💊', color: 'red', topicSlug: 'mutuelle' },
    { name: 'Assurances', icon: '🛡️', color: 'indigo', topicSlug: 'assurances' },
    { name: 'Loisirs', icon: '🎮', color: 'purple', topicSlug: null },
    { name: 'Abonnements', icon: '📱', color: 'pink', topicSlug: null },
    { name: 'Restaurants', icon: '🍽️', color: 'orange', topicSlug: null },
    { name: 'Vetements', icon: '👕', color: 'teal', topicSlug: null },
    { name: 'Autre', icon: '📦', color: 'zinc', topicSlug: null },
  ]
}

export async function getExpenseCategories() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function createExpenseCategory(
  name: string,
  icon?: string,
  color?: string,
  topicSlug?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Verifier doublon
  const { data: existing } = await supabase
    .from('expense_categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', name)
    .single()

  if (existing) {
    return { error: 'Cette categorie existe deja' }
  }

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      user_id: user.id,
      name,
      icon: icon || null,
      color: color || 'blue',
      topic_slug: topicSlug || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  return { data }
}

export async function updateExpenseCategory(
  id: string,
  updates: { name?: string; icon?: string; color?: string; topicSlug?: string }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.topicSlug !== undefined) updateData.topic_slug = updates.topicSlug

  const { data, error } = await supabase
    .from('expense_categories')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  return { data }
}

export async function deleteExpenseCategory(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { error } = await supabase
    .from('expense_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  return { success: true }
}

export async function initializeDefaultCategories() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Verifier si l'utilisateur a deja des categories
  const { data: existing } = await supabase
    .from('expense_categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { alreadyInitialized: true }
  }

  const defaults = await getDefaultCategories()
  const { error } = await supabase.from('expense_categories').insert(
    defaults.map((cat) => ({
      user_id: user.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      topic_slug: cat.topicSlug,
    }))
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
