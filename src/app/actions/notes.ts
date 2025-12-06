'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNote(topicSlug: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }
  console.log(user)

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      topic_slug: topicSlug,
      content,
    })
    .select()
    .single()

  console.log(data)
  console.log(error)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${topicSlug}`)
  return { data }
}

export async function updateNote(noteId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${data.topic_slug}`)
  return { data }
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le topic_slug avant de supprimer
  const { data: note } = await supabase
    .from('notes')
    .select('topic_slug')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  if (note) {
    revalidatePath(`/topics/${note.topic_slug}`)
  }
  return { success: true }
}

export async function getNotes(topicSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

