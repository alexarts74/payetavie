'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getChecklistProgress(topicSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('checklist_progress')
    .select('item_index')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .eq('completed', true)

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data?.map(item => item.item_index) || [], error: null }
}

export async function toggleChecklistItem(topicSlug: string, itemIndex: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier si l'item existe déjà
  const { data: existing } = await supabase
    .from('checklist_progress')
    .select('id, completed')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .eq('item_index', itemIndex)
    .single()

  if (existing) {
    // Toggle l'état
    const newCompleted = !existing.completed
    const { error } = await supabase
      .from('checklist_progress')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/topics/${topicSlug}`)
    return { success: true, completed: newCompleted }
  } else {
    // Créer un nouvel enregistrement (marqué comme complété)
    const { error } = await supabase
      .from('checklist_progress')
      .insert({
        user_id: user.id,
        topic_slug: topicSlug,
        item_index: itemIndex,
        completed: true,
        completed_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/topics/${topicSlug}`)
    return { success: true, completed: true }
  }
}

export async function getTopicsProgress() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: {}, error: null }
  }

  const { data, error } = await supabase
    .from('checklist_progress')
    .select('topic_slug')
    .eq('user_id', user.id)
    .eq('completed', true)

  if (error) {
    return { data: {}, error: error.message }
  }

  // Compter les items complétés par topic
  const progressByTopic: Record<string, number> = {}
  for (const item of data || []) {
    progressByTopic[item.topic_slug] = (progressByTopic[item.topic_slug] || 0) + 1
  }

  return { data: progressByTopic, error: null }
}
