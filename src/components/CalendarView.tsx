'use client'

import { useState, useEffect, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, FileText, X, Download, Link2, Copy, Check, RefreshCw } from 'lucide-react'
import { getCalendarEvents, CalendarEvent } from '@/app/actions/calendar'
import { exportAllRemindersToIcs } from '@/app/actions/calendar-export'
import { getOrCreateCalendarToken, regenerateCalendarToken } from '@/app/actions/calendar-tokens'
import { getTopicTitle, getTopicIcon } from '@/lib/topic-utils'
import Link from 'next/link'

const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

interface CalendarViewProps {
  initialYear?: number
  initialMonth?: number
}

export default function CalendarView({ initialYear, initialMonth }: CalendarViewProps) {
  const today = new Date()
  const [year, setYear] = useState(initialYear || today.getFullYear())
  const [month, setMonth] = useState(initialMonth || today.getMonth() + 1)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isPending, startTransition] = useTransition()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSubscribePopover, setShowSubscribePopover] = useState(false)
  const [webcalUrl, setWebcalUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Charger les événements au chargement et quand le mois change
  useEffect(() => {
    startTransition(async () => {
      const { data } = await getCalendarEvents(year, month)
      setEvents(data)
    })
  }, [year, month])

  // Navigation
  function goToPreviousMonth() {
    if (month === 1) {
      setYear(y => y - 1)
      setMonth(12)
    } else {
      setMonth(m => m - 1)
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear(y => y + 1)
      setMonth(1)
    } else {
      setMonth(m => m + 1)
    }
  }

  // Export .ics
  async function handleExport() {
    setIsExporting(true)
    try {
      const result = await exportAllRemindersToIcs()
      if ('data' in result) {
        const blob = new Blob([result.data], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'payetavie-rappels.ics'
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setIsExporting(false)
    }
  }

  // S'abonner webcal
  async function handleSubscribe() {
    if (showSubscribePopover) {
      setShowSubscribePopover(false)
      return
    }
    const result = await getOrCreateCalendarToken()
    if ('data' in result) {
      const baseUrl = window.location.origin
      setWebcalUrl(`webcal://${window.location.host}/api/calendar?token=${result.data}`)
      setShowSubscribePopover(true)
      setCopied(false)
    }
  }

  async function handleCopyUrl() {
    if (!webcalUrl) return
    const httpUrl = webcalUrl.replace('webcal://', `${window.location.protocol}//`)
    await navigator.clipboard.writeText(httpUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerateToken() {
    const result = await regenerateCalendarToken()
    if ('data' in result) {
      setWebcalUrl(`webcal://${window.location.host}/api/calendar?token=${result.data}`)
      setCopied(false)
    }
  }

  // Générer la grille du calendrier
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // En JS, dimanche = 0, mais on veut lundi = 0
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay < 0) startDay = 6

  // Créer les cellules du calendrier
  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }
  // Compléter la dernière semaine
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  // Grouper les événements par jour
  const eventsByDay: Record<number, CalendarEvent[]> = {}
  for (const event of events) {
    const eventDate = new Date(event.date)
    const day = eventDate.getDate()
    if (!eventsByDay[day]) {
      eventsByDay[day] = []
    }
    eventsByDay[day].push(event)
  }

  // Événements du jour sélectionné
  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : []

  // Vérifier si c'est aujourd'hui
  const isToday = (day: number) => {
    return day === today.getDate() &&
           month === today.getMonth() + 1 &&
           year === today.getFullYear()
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Calendrier</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Exporter en .ics"
          >
            <Download className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 ${isExporting ? 'animate-pulse' : ''}`} />
          </button>
          <div className="relative">
            <button
              onClick={handleSubscribe}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="S'abonner au calendrier"
            >
              <Link2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            </button>
            {showSubscribePopover && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">S'abonner au calendrier</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                  Collez ce lien dans Google Calendar &gt; Autres agendas &gt; À partir de l'URL
                </p>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    readOnly
                    value={webcalUrl?.replace('webcal://', `${window.location.protocol}//`) || ''}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
                    title="Copier le lien"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleRegenerateToken}
                  className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Régénérer le lien
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </button>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {MONTHS_FR[month - 1]} {year}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {DAYS_FR.map(day => (
            <div
              key={day}
              className="text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cellules du calendrier */}
        <div className="grid grid-cols-7 gap-px">
          {cells.map((day, index) => {
            const dayEvents = day ? eventsByDay[day] || [] : []
            const hasReminder = dayEvents.some(e => e.type === 'reminder')
            const hasDocument = dayEvents.some(e => e.type === 'document')
            const hasOverdue = dayEvents.some(e => e.isOverdue)

            return (
              <button
                key={index}
                onClick={() => {
                  if (day && dayEvents.length > 0) {
                    setSelectedDay(day)
                    setShowModal(true)
                  }
                }}
                disabled={!day || dayEvents.length === 0}
                className={`
                  relative flex flex-col items-center justify-center h-8 rounded text-xs transition-all
                  ${!day ? 'cursor-default' : ''}
                  ${day && dayEvents.length > 0
                    ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    : 'cursor-default'
                  }
                  ${isToday(day || 0)
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-zinc-700 dark:text-zinc-300'
                  }
                `}
              >
                <span className="text-[11px] leading-none">{day}</span>

                {/* Indicateurs d'événements */}
                {day && dayEvents.length > 0 && (
                  <div className="flex gap-px mt-0.5">
                    {hasReminder && (
                      <div className={`w-1 h-1 rounded-full ${hasOverdue ? 'bg-red-500' : 'bg-indigo-500'}`} />
                    )}
                    {hasDocument && (
                      <div className="w-1 h-1 rounded-full bg-indigo-300 dark:bg-indigo-600" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Rappel</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-600" />
          <span>Doc. expirant</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>En retard</span>
        </div>
      </div>

      {/* Modal détails du jour */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {selectedDay} {MONTHS_FR[month - 1]} {year}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-400 text-center py-4">
                  Aucun événement ce jour
                </p>
              ) : (
                selectedEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/topics/${event.topicSlug}`}
                    onClick={() => setShowModal(false)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      event.type === 'reminder'
                        ? event.isOverdue
                          ? 'border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        : 'border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.type === 'reminder'
                        ? event.isOverdue
                          ? 'bg-red-100 dark:bg-red-900/50'
                          : 'bg-indigo-100 dark:bg-indigo-900/50'
                        : 'bg-indigo-100 dark:bg-indigo-900/50'
                    }`}>
                      {event.type === 'reminder' ? (
                        <Clock className={`w-4 h-4 ${
                          event.isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`} />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {event.title}
                        </span>
                        {event.isOverdue && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            En retard
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-400">
                        <span>{getTopicIcon(event.topicSlug)}</span>
                        <span>{getTopicTitle(event.topicSlug)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
