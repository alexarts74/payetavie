'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReminder(
  topicSlug: string,
  title: string,
  description?: string,
  dueDate?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      topic_slug: topicSlug,
      title,
      description,
      due_date: dueDate || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${topicSlug}`)
  return { data }
}

export async function updateReminder(
  reminderId: string,
  updates: {
    title?: string
    description?: string
    dueDate?: string | null
    completed?: boolean
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
  if (updates.completed !== undefined) updateData.completed = updates.completed

  const { data, error } = await supabase
    .from('reminders')
    .update(updateData)
    .eq('id', reminderId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${data.topic_slug}`)
  return { data }
}

export async function deleteReminder(reminderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le topic_slug avant de supprimer
  const { data: reminder } = await supabase
    .from('reminders')
    .select('topic_slug')
    .eq('id', reminderId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  if (reminder) {
    revalidatePath(`/topics/${reminder.topic_slug}`)
  }
  return { success: true }
}

export async function getReminders(topicSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

