import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle } from '@payetavie/shared'

type Reminder = {
  id: string
  title: string
  due_date: string | null
  completed: boolean
  topic_slug: string
  created_at: string
}

type Group = {
  key: string
  label: string
  color: string
  bgColor: string
  items: Reminder[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function groupReminders(reminders: Reminder[]): Group[] {
  const today = startOfDay(new Date())
  const todayMs = today.getTime()
  const weekMs = todayMs + 7 * 24 * 60 * 60 * 1000

  const overdue: Reminder[] = []
  const todayGroup: Reminder[] = []
  const thisWeek: Reminder[] = []
  const later: Reminder[] = []
  const noDate: Reminder[] = []
  const completed: Reminder[] = []

  for (const r of reminders) {
    if (r.completed) {
      completed.push(r)
      continue
    }
    if (!r.due_date) {
      noDate.push(r)
      continue
    }
    const ms = startOfDay(new Date(r.due_date)).getTime()
    if (ms < todayMs) {
      overdue.push(r)
    } else if (ms === todayMs) {
      todayGroup.push(r)
    } else if (ms < weekMs) {
      thisWeek.push(r)
    } else {
      later.push(r)
    }
  }

  const groups: Group[] = []
  if (overdue.length)    groups.push({ key: 'overdue',   label: 'En retard',      color: '#EF4444', bgColor: '#FEF2F2', items: overdue })
  if (todayGroup.length) groups.push({ key: 'today',     label: "Aujourd'hui",    color: '#D97706', bgColor: '#FFFBEB', items: todayGroup })
  if (thisWeek.length)   groups.push({ key: 'week',      label: 'Cette semaine',  color: '#235037', bgColor: '#F0FDF4', items: thisWeek })
  if (later.length)      groups.push({ key: 'later',     label: 'Plus tard',      color: '#6B7280', bgColor: '#F9FAFB', items: later })
  if (noDate.length)     groups.push({ key: 'nodate',    label: 'Sans date',      color: '#6B7280', bgColor: '#F9FAFB', items: noDate })
  if (completed.length)  groups.push({ key: 'completed', label: 'Complétés',      color: '#9CA3AF', bgColor: '#F9FAFB', items: completed.slice(0, 5) })
  return groups
}

export default function RemindersScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [completedExpanded, setCompletedExpanded] = useState(false)

  const overdueCount = reminders.filter((r) => {
    if (r.completed || !r.due_date) return false
    return startOfDay(new Date(r.due_date)).getTime() < startOfDay(new Date()).getTime()
  }).length

  const loadReminders = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('reminders')
      .select('id, title, due_date, completed, topic_slug, created_at')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(100)
    if (data) setReminders(data)
  }, [user])

  useEffect(() => {
    loadReminders().finally(() => setLoading(false))
  }, [loadReminders])

  async function handleRefresh() {
    setRefreshing(true)
    await loadReminders()
    setRefreshing(false)
  }

  const groups = groupReminders(reminders)

  return (
    <ScrollView
      className="flex-1 bg-[#F5E9AF]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20 }} className="px-6 pb-5 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-4xl text-[#0D0D0D] tracking-tight" style={{ fontFamily: 'Caprasimo_400Regular', lineHeight: 42 }}>
            Rappels
          </Text>
          <Text className="text-sm text-[#71717A] mt-1.5" style={{ fontFamily: 'Jost_300Light' }}>
            Vos tâches administratives
          </Text>
        </View>

        {/* Calendar button */}
        <TouchableOpacity
          className="mt-2 relative"
          onPress={() => router.push('/(protected)/calendar')}
          style={{ padding: 8 }}
        >
          <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
            <Ionicons name="calendar-outline" size={20} color="#235037" />
          </View>
          {overdueCount > 0 && (
            <View
              className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full items-center justify-center"
              style={{ minWidth: 16 }}
            >
              <Text className="text-white text-[9px]" style={{ fontFamily: 'Jost_500Medium' }}>
                {overdueCount > 9 ? '9+' : overdueCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-28">
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#235037" />
          </View>
        ) : reminders.filter((r) => !r.completed).length === 0 ? (
          /* Empty state */
          <View className="items-center py-12">
            <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm">
              <Ionicons name="alarm-outline" size={32} color="#235037" />
            </View>
            <Text className="text-lg text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>
              Aucun rappel
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm" style={{ fontFamily: 'Jost_300Light' }}>
              Ajoutez des rappels depuis vos démarches.
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#235037] px-5 py-2.5 rounded-xl flex-row items-center gap-2"
              onPress={() => router.push('/(protected)/topics/index')}
            >
              <Ionicons name="layers-outline" size={16} color="#fff" />
              <Text className="text-white text-sm" style={{ fontFamily: 'Jost_500Medium' }}>
                Voir mes démarches
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-5">
            {groups.map((group) => {
              const isCompleted = group.key === 'completed'
              const showItems = !isCompleted || completedExpanded

              return (
                <View key={group.key}>
                  {/* Group header */}
                  <TouchableOpacity
                    activeOpacity={isCompleted ? 0.6 : 1}
                    onPress={isCompleted ? () => setCompletedExpanded((v) => !v) : undefined}
                    className="flex-row items-center justify-between mb-2 px-1"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <Text
                        className="text-xs uppercase tracking-widest"
                        style={{ fontFamily: 'Jost_500Medium', color: group.color }}
                      >
                        {group.label}
                      </Text>
                      <View
                        className="rounded-full px-1.5 py-0.5"
                        style={{ backgroundColor: group.bgColor }}
                      >
                        <Text
                          className="text-[10px]"
                          style={{ fontFamily: 'Jost_500Medium', color: group.color }}
                        >
                          {group.items.length}
                        </Text>
                      </View>
                    </View>
                    {isCompleted && (
                      <Ionicons
                        name={completedExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#9CA3AF"
                      />
                    )}
                  </TouchableOpacity>

                  {/* Items */}
                  {showItems && (
                    <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      {group.items.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          className="flex-row items-center px-4 py-3.5 gap-3"
                          style={index > 0 ? { borderTopWidth: 1, borderTopColor: '#F4F4F5' } : undefined}
                          onPress={() => router.push(`/(protected)/topics/${item.topic_slug}`)}
                        >
                          {/* Icon circle */}
                          <View
                            className="w-9 h-9 rounded-full items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: group.bgColor }}
                          >
                            <Ionicons
                              name={item.completed ? 'checkmark-circle' : 'alarm-outline'}
                              size={18}
                              color={item.completed ? '#9CA3AF' : group.color}
                            />
                          </View>

                          {/* Content */}
                          <View className="flex-1 min-w-0">
                            <Text
                              className="text-[#0D0D0D]"
                              style={{
                                fontFamily: 'Jost_500Medium',
                                fontSize: 14,
                                textDecorationLine: item.completed ? 'line-through' : 'none',
                                color: item.completed ? '#9CA3AF' : '#0D0D0D',
                              }}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <View className="flex-row items-center gap-1.5 mt-0.5">
                              <Text
                                className="text-xs text-[#71717A]"
                                style={{ fontFamily: 'Jost_300Light' }}
                                numberOfLines={1}
                              >
                                {getTopicTitle(item.topic_slug)}
                              </Text>
                              {item.due_date && (
                                <>
                                  <Text className="text-[#D1D5DB] text-xs">·</Text>
                                  <Text
                                    className="text-xs"
                                    style={{
                                      fontFamily: 'Jost_300Light',
                                      color: group.key === 'overdue' ? '#EF4444' : group.key === 'today' ? '#D97706' : '#71717A',
                                    }}
                                  >
                                    {formatDate(item.due_date)}
                                  </Text>
                                </>
                              )}
                            </View>
                          </View>

                          <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )
            })}

            {/* Add reminder CTA */}
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3.5 border border-dashed border-[#235037]/30 rounded-2xl"
              onPress={() => router.push('/(protected)/topics/index')}
            >
              <Ionicons name="add-circle-outline" size={18} color="#235037" />
              <Text className="text-sm text-[#235037]" style={{ fontFamily: 'Jost_500Medium' }}>
                Ajouter depuis une démarche
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
