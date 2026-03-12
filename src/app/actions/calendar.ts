'use server'

import { createClient } from '@/lib/supabase/server'

export interface CalendarEvent {
  id: string
  type: 'reminder' | 'document'
  title: string
  date: string
  topicSlug: string
  isOverdue?: boolean
}

export async function getCalendarEvents(year: number, month: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  // Calculer les dates de début et fin du mois
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const events: CalendarEvent[] = []
  const today = new Date().toISOString().split('T')[0]

  // Récupérer les rappels du mois
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, title, due_date, topic_slug, completed')
    .eq('user_id', user.id)
    .eq('completed', false)
    .gte('due_date', startDateStr)
    .lte('due_date', endDateStr)
    .order('due_date', { ascending: true })

  if (remindersError) {
    return { data: [], error: remindersError.message }
  }

  // Ajouter les rappels aux événements
  for (const reminder of reminders || []) {
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

  // Récupérer les documents expirant ce mois
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, name, expires_at, topic_slug')
    .eq('user_id', user.id)
    .not('expires_at', 'is', null)
    .gte('expires_at', startDateStr)
    .lte('expires_at', endDateStr)
    .order('expires_at', { ascending: true })

  if (documentsError) {
    return { data: [], error: documentsError.message }
  }

  // Ajouter les documents aux événements
  for (const doc of documents || []) {
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

  // Trier par date
  events.sort((a, b) => a.date.localeCompare(b.date))

  return { data: events, error: null }
}
