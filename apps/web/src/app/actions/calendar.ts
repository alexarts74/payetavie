'use server'

import { createClient } from '@/lib/supabase/server'
import { generateFiscalEvents } from '@payetavie/shared'
import type { ProfileType, UrssafFrequency } from '@payetavie/shared'

export interface CalendarEvent {
  id: string
  type: 'reminder' | 'document' | 'fiscal'
  title: string
  date: string
  topicSlug: string
  isOverdue?: boolean
  description?: string
}

export async function getCalendarEvents(year: number, month: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const events: CalendarEvent[] = []
  const today = new Date().toISOString().split('T')[0]

  const [remindersResult, documentsResult, prefsResult, profileResult] = await Promise.all([
    supabase
      .from('reminders')
      .select('id, title, due_date, topic_slug, completed')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gte('due_date', startDateStr)
      .lte('due_date', endDateStr)
      .order('due_date', { ascending: true }),
    supabase
      .from('documents')
      .select('id, name, expires_at, topic_slug')
      .eq('user_id', user.id)
      .not('expires_at', 'is', null)
      .gte('expires_at', startDateStr)
      .lte('expires_at', endDateStr)
      .order('expires_at', { ascending: true }),
    supabase
      .from('user_preferences')
      .select('profile_type')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('professional_profiles')
      .select('is_micro_entrepreneur, urssaf_frequency')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (remindersResult.error) {
    return { data: [], error: remindersResult.error.message }
  }
  if (documentsResult.error) {
    return { data: [], error: documentsResult.error.message }
  }

  for (const reminder of remindersResult.data || []) {
    if (reminder.due_date) {
      events.push({
        id: reminder.id,
        type: 'reminder',
        title: reminder.title,
        date: reminder.due_date,
        topicSlug: reminder.topic_slug,
        isOverdue: reminder.due_date < today,
      })
    }
  }

  for (const doc of documentsResult.data || []) {
    if (doc.expires_at) {
      events.push({
        id: doc.id,
        type: 'document',
        title: doc.name,
        date: doc.expires_at,
        topicSlug: doc.topic_slug,
        isOverdue: doc.expires_at < today,
      })
    }
  }

  // Génération des événements fiscaux selon le profil utilisateur
  const profileType = (prefsResult.data?.profile_type as ProfileType) || 'autre'
  const isMicroEntrepreneur = profileResult.data?.is_micro_entrepreneur ?? false
  const urssafFrequency = (profileResult.data?.urssaf_frequency as UrssafFrequency) || 'trimestriel'

  const fiscalEvents = generateFiscalEvents(year, month, profileType, isMicroEntrepreneur, urssafFrequency)
  for (const fe of fiscalEvents) {
    events.push({
      id: fe.id,
      type: 'fiscal',
      title: fe.title,
      date: fe.date,
      topicSlug: fe.topicSlug,
      isOverdue: fe.date < today,
      description: fe.description,
    })
  }

  events.sort((a, b) => a.date.localeCompare(b.date))

  return { data: events, error: null }
}
