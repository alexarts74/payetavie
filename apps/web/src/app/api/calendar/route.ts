import { createClient } from '@supabase/supabase-js'
import ical, { ICalCalendarMethod } from 'ical-generator'
import { getTopicTitle } from '@/lib/topic-utils'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new Response('Token manquant', { status: 400 })
  }

  // Créer un client admin Supabase pour chercher le token sans auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Chercher le token dans user_preferences
  const { data: tokenData, error: tokenError } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('calendar_token', token)
    .single()

  if (tokenError || !tokenData) {
    return new Response('Token invalide', { status: 401 })
  }

  const userId = tokenData.user_id

  // Récupérer les rappels non complétés
  const { data: reminders } = await supabase
    .from('reminders')
    .select('id, title, description, due_date, topic_slug')
    .eq('user_id', userId)
    .eq('completed', false)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  // Récupérer les documents avec date d'expiration
  const { data: documents } = await supabase
    .from('documents')
    .select('id, name, expires_at, topic_slug')
    .eq('user_id', userId)
    .not('expires_at', 'is', null)
    .order('expires_at', { ascending: true })

  const calendar = ical({
    name: 'PayeTaVie - Rappels',
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
        `Catégorie : ${getTopicTitle(reminder.topic_slug)}`,
      ].filter(Boolean).join('\n'),
      categories: [{ name: getTopicTitle(reminder.topic_slug) }],
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
      description: `Document "${doc.name}" expire ce jour.\nCatégorie : ${getTopicTitle(doc.topic_slug)}`,
      categories: [{ name: getTopicTitle(doc.topic_slug) }],
    })
  }

  return new Response(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="payetavie.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
