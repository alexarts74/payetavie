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

  useEffect(() => {
    startTransition(async () => {
      const { data } = await getCalendarEvents(year, month)
      setEvents(data)
    })
  }, [year, month])

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

  async function handleSubscribe() {
    if (showSubscribePopover) {
      setShowSubscribePopover(false)
      return
    }
    const result = await getOrCreateCalendarToken()
    if ('data' in result) {
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

  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay < 0) startDay = 6

  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const eventsByDay: Record<number, CalendarEvent[]> = {}
  for (const event of events) {
    const eventDate = new Date(event.date)
    const day = eventDate.getDate()
    if (!eventsByDay[day]) {
      eventsByDay[day] = []
    }
    eventsByDay[day].push(event)
  }

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : []

  const isToday = (day: number) => {
    return day === today.getDate() &&
           month === today.getMonth() + 1 &&
           year === today.getFullYear()
  }

  return (
    <div className="card rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#235037]" />
          <h2 className="text-sm font-semibold text-[#235037]">Calendrier</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-1.5 rounded-lg hover:bg-[#EEF7F1] transition-colors"
            title="Exporter en .ics"
          >
            <Download className={`w-3.5 h-3.5 text-[#5A6B61] ${isExporting ? 'animate-pulse' : ''}`} />
          </button>
          <div className="relative">
            <button
              onClick={handleSubscribe}
              className="p-1.5 rounded-lg hover:bg-[#EEF7F1] transition-colors"
              title="S'abonner au calendrier"
            >
              <Link2 className="w-3.5 h-3.5 text-[#5A6B61]" />
            </button>
            {showSubscribePopover && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-lg">
                <h4 className="text-xs font-semibold text-[#1a2e22] mb-1.5">S'abonner au calendrier</h4>
                <p className="text-xs text-[#5A6B61] mb-2">
                  Collez ce lien dans Google Calendar &gt; Autres agendas &gt; À partir de l'URL
                </p>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    readOnly
                    value={webcalUrl?.replace('webcal://', `${window.location.protocol}//`) || ''}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] text-xs text-[#5A6B61] truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg bg-[#235037] text-white hover:bg-[#1a3d2a] transition-colors flex-shrink-0"
                    title="Copier le lien"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleRegenerateToken}
                  className="flex items-center gap-1 text-xs text-[#5A6B61] hover:text-[#235037] transition-colors"
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
          className="p-1 rounded-md hover:bg-[#EEF7F1] transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4 text-[#5A6B61]" />
        </button>
        <span className="text-sm font-medium text-[#235037]">
          {MONTHS_FR[month - 1]} {year}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-md hover:bg-[#EEF7F1] transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-4 h-4 text-[#5A6B61]" />
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {DAYS_FR.map(day => (
            <div
              key={day}
              className="text-center text-[10px] font-medium text-[#5A6B61] py-1"
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
                    ? 'cursor-pointer hover:bg-[#EEF7F1]'
                    : 'cursor-default'
                  }
                  ${isToday(day || 0)
                    ? 'bg-[#EEF7F1] text-[#235037] font-bold'
                    : 'text-[#1a2e22]'
                  }
                `}
              >
                <span className="text-[11px] leading-none">{day}</span>

                {/* Indicateurs d'événements */}
                {day && dayEvents.length > 0 && (
                  <div className="flex gap-px mt-0.5">
                    {hasReminder && (
                      <div className={`w-1 h-1 rounded-full ${hasOverdue ? 'bg-red-500' : 'bg-[#235037]'}`} />
                    )}
                    {hasDocument && (
                      <div className="w-1 h-1 rounded-full bg-[#D97706]" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E8E8E8]">
        <div className="flex items-center gap-1 text-[10px] text-[#5A6B61]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#235037]" />
          <span>Rappel</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#5A6B61]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          <span>Doc. expirant</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#5A6B61]">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>En retard</span>
        </div>
      </div>

      {/* Modal détails du jour */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8]">
              <h3 className="text-lg font-semibold text-[#235037]">
                {selectedDay} {MONTHS_FR[month - 1]} {year}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#EEF7F1] transition-colors"
              >
                <X className="w-5 h-5 text-[#5A6B61]" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-[#5A6B61] text-center py-4">
                  Aucun événement ce jour
                </p>
              ) : (
                selectedEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/topics/${event.topicSlug}`}
                    onClick={() => setShowModal(false)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      event.isOverdue
                        ? 'border-red-200 hover:bg-red-50'
                        : 'border-[#E8E8E8] hover:bg-[#EEF7F1]/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.isOverdue
                        ? 'bg-red-100'
                        : 'bg-[#EEF7F1]'
                    }`}>
                      {event.type === 'reminder' ? (
                        <Clock className={`w-4 h-4 ${event.isOverdue ? 'text-red-600' : 'text-[#235037]'}`} />
                      ) : (
                        <FileText className="w-4 h-4 text-[#D97706]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#1a2e22] truncate">
                          {event.title}
                        </span>
                        {event.isOverdue && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            En retard
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5A6B61]">
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
