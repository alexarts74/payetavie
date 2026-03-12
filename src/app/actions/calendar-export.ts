'use server'

import { createClient } from '@/lib/supabase/server'
import ical, { ICalCalendarMethod } from 'ical-generator'
import { getTopicTitle } from '@/lib/topic-utils'
import { requirePlan } from '@/lib/subscription'

export async function exportAllRemindersToIcs(): Promise<{ data: string } | { error: string }> {
  const planCheck = await requirePlan('essentiel')
  if (!planCheck.allowed) {
    return { error: planCheck.error }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer tous les rappels non complétés
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, title, description, due_date, topic_slug')
    .eq('user_id', user.id)
    .eq('completed', false)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  if (remindersError) {
    return { error: remindersError.message }
  }

  // Récupérer tous les documents avec date d'expiration
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, name, expires_at, topic_slug')
    .eq('user_id', user.id)
    .not('expires_at', 'is', null)
    .order('expires_at', { ascending: true })

  if (documentsError) {
    return { error: documentsError.message }
  }

  const calendar = ical({
    name: 'PayeTaVie - Rappels',
    timezone: 'Europe/Paris',
    method: ICalCalendarMethod.PUBLISH,
  })

  // Ajouter les rappels
  for (const reminder of reminders || []) {
    if (!reminder.due_date) continue
    const date = new Date(reminder.due_date)
    calendar.createEvent({
      id: `reminder-${reminder.id}`,
      start: date,
      allDay: true,
      summary: `📌 ${reminder.title}`,
      description: [
        reminder.description || '',
        `Catégorie : ${getTopicTitle(reminder.topic_slug)}`,
      ].filter(Boolean).join('\n'),
      categories: [{ name: getTopicTitle(reminder.topic_slug) }],
    })
  }

  // Ajouter les documents expirants
  for (const doc of documents || []) {
    if (!doc.expires_at) continue
    const date = new Date(doc.expires_at)
    calendar.createEvent({
      id: `document-${doc.id}`,
      start: date,
      allDay: true,
      summary: `📄 Expiration : ${doc.name}`,
      description: `Document "${doc.name}" expire ce jour.\nCatégorie : ${getTopicTitle(doc.topic_slug)}`,
      categories: [{ name: getTopicTitle(doc.topic_slug) }],
    })
  }

  return { data: calendar.toString() }
}

export async function exportTopicRemindersToIcs(topicSlug: string): Promise<{ data: string } | { error: string }> {
  const planCheck2 = await requirePlan('essentiel')
  if (!planCheck2.allowed) {
    return { error: planCheck2.error }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, title, description, due_date, topic_slug')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .eq('completed', false)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  if (remindersError) {
    return { error: remindersError.message }
  }

  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, name, expires_at, topic_slug')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .not('expires_at', 'is', null)
    .order('expires_at', { ascending: true })

  if (documentsError) {
    return { error: documentsError.message }
  }

  const topicTitle = getTopicTitle(topicSlug)

  const calendar = ical({
    name: `PayeTaVie - ${topicTitle}`,
    timezone: 'Europe/Paris',
    method: ICalCalendarMethod.PUBLISH,
  })

  for (const reminder of reminders || []) {
    if (!reminder.due_date) continue
    const date = new Date(reminder.due_date)
    calendar.createEvent({
      id: `reminder-${reminder.id}`,
      start: date,
      allDay: true,
      summary: `📌 ${reminder.title}`,
      description: [
        reminder.description || '',
        `Catégorie : ${topicTitle}`,
      ].filter(Boolean).join('\n'),
      categories: [{ name: topicTitle }],
    })
  }

  for (const doc of documents || []) {
    if (!doc.expires_at) continue
    const date = new Date(doc.expires_at)
    calendar.createEvent({
      id: `document-${doc.id}`,
      start: date,
      allDay: true,
      summary: `📄 Expiration : ${doc.name}`,
      description: `Document "${doc.name}" expire ce jour.\nCatégorie : ${topicTitle}`,
      categories: [{ name: topicTitle }],
    })
  }

  return { data: calendar.toString() }
}
