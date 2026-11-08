import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CalEvent {
  id: string
  title: string
  date: string
  type: 'reminder' | 'document' | 'overdue'
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start, end }
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

// getDay() returns 0=Sun..6=Sat; convert to 0=Mon..6=Sun
function mondayOffset(d: Date) {
  return (d.getDay() + 6) % 7
}

export default function CalendarScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    loadEvents()
  }, [user, year, month])

  async function loadEvents() {
    if (!user) return
    const { start, end } = getMonthBounds(year, month)
    const startStr = isoDate(start)
    const endStr = isoDate(end)
    const todayStr = isoDate(today)

    const [reminders, documents] = await Promise.all([
      supabase
        .from('reminders')
        .select('id, title, due_date, topic_slug')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('due_date', startStr)
        .lte('due_date', endStr),
      supabase
        .from('documents')
        .select('id, name, expires_at, topic_slug')
        .eq('user_id', user.id)
        .not('expires_at', 'is', null)
        .gte('expires_at', startStr)
        .lte('expires_at', endStr),
    ])

    const all: CalEvent[] = []

    for (const r of reminders.data ?? []) {
      all.push({
        id: r.id,
        title: r.title,
        date: r.due_date.split('T')[0],
        type: r.due_date.split('T')[0] < todayStr ? 'overdue' : 'reminder',
      })
    }
    for (const d of documents.data ?? []) {
      all.push({
        id: d.id,
        title: d.name,
        date: d.expires_at.split('T')[0],
        type: 'document',
      })
    }

    setEvents(all)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const { start, end } = getMonthBounds(year, month)
  const daysInMonth = end.getDate()
  const offset = mondayOffset(start)
  const todayStr = isoDate(today)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  function eventsForDay(day: number): CalEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  const DOT_COLORS: Record<string, string> = {
    reminder: '#f97316',
    document: '#a855f7',
    overdue: '#ef4444',
  }

  return (
    <ScrollView className="flex-1 bg-[#F5E9AF]">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20 }} className="px-6 pb-5">
        <Text className="text-4xl font-bold text-[#0D0D0D] tracking-tight" style={{ fontFamily: 'Caprasimo_400Regular', lineHeight: 42 }}>
          Calendrier
        </Text>
        <Text className="text-sm text-[#71717A] mt-1.5" style={{ fontFamily: 'Jost_300Light' }}>
          {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}
        </Text>
      </View>
      <View className="px-4 pb-28 gap-4">
        {/* Header navigation */}
        <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
          <TouchableOpacity onPress={prevMonth} className="px-3 py-1">
            <Text className="text-violet-600 text-xl font-semibold">‹</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-gray-900 text-base">
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="px-3 py-1">
            <Text className="text-violet-600 text-xl font-semibold">›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View className="bg-white rounded-2xl shadow-sm p-3">
          {/* Day names header */}
          <View className="flex-row mb-1">
            {DAY_NAMES.map(d => (
              <View key={d} style={{ width: '14.28%' }} className="items-center py-1">
                <Text className="text-xs text-gray-400 font-medium">{d}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <View key={row} className="flex-row">
              {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                if (!day) {
                  return <View key={col} style={{ width: '14.28%' }} className="py-1" />
                }
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = isCurrentMonth && day === today.getDate()
                const dayEvents = eventsForDay(day).slice(0, 3)

                return (
                  <TouchableOpacity
                    key={col}
                    style={{ width: '14.28%' }}
                    className="items-center py-1"
                    onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                  >
                    <View className={`w-7 h-7 rounded-full items-center justify-center ${isToday ? 'bg-violet-600' : ''}`}>
                      <Text className={`text-sm ${isToday ? 'text-white font-bold' : 'text-gray-800'}`}>{day}</Text>
                    </View>
                    <View className="flex-row gap-0.5 mt-0.5" style={{ minHeight: 6 }}>
                      {dayEvents.map((e, i) => (
                        <View
                          key={i}
                          style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: DOT_COLORS[e.type] }}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View className="flex-row gap-4 justify-center">
          <View className="flex-row items-center gap-1.5">
            <View className="w-3 h-3 rounded-full bg-orange-400" />
            <Text className="text-xs text-gray-500">Rappel</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3 h-3 rounded-full bg-purple-500" />
            <Text className="text-xs text-gray-500">Doc. expirant</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3 h-3 rounded-full bg-red-500" />
            <Text className="text-xs text-gray-500">En retard</Text>
          </View>
        </View>

        {/* Selected day events */}
        {selectedDay !== null && (
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-100">
              <Text className="font-semibold text-gray-900">
                {selectedDay} {MONTH_NAMES[month]} {year}
              </Text>
            </View>
            {selectedEvents.length === 0 ? (
              <View className="px-4 py-4">
                <Text className="text-gray-400 text-sm">Aucun événement ce jour</Text>
              </View>
            ) : (
              selectedEvents.map((e, i) => (
                <View key={e.id} className={`px-4 py-3 flex-row items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT_COLORS[e.type] }} />
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm">{e.title}</Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {e.type === 'document' ? 'Document expirant' : e.type === 'overdue' ? 'Rappel en retard' : 'Rappel'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

