'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBookmark(
  topicSlug: string,
  resourceName: string,
  resourceUrl: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier si le bookmark existe déjà
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .eq('resource_url', resourceUrl)
    .single()

  if (existing) {
    return { error: 'Cette ressource est déjà en favoris' }
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      topic_slug: topicSlug,
      resource_name: resourceName,
      resource_url: resourceUrl,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${topicSlug}`)
  return { data }
}

export async function removeBookmark(bookmarkId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le topic_slug avant de supprimer
  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('topic_slug')
    .eq('id', bookmarkId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  if (bookmark) {
    revalidatePath(`/topics/${bookmark.topic_slug}`)
  }
  return { success: true }
}

export async function getBookmarks(topicSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function isBookmarked(topicSlug: string, resourceUrl: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .eq('resource_url', resourceUrl)
    .single()

  return !!data
}

