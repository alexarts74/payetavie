import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  remindersCount: number
  documentsCount: number
  bookmarksCount: number
  upcomingReminders: { id: string; title: string; due_date: string | null; topic_slug: string }[]
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadStats() {
    if (!user) return

    const [reminders, documents, bookmarks, upcoming] = await Promise.all([
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', false),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reminders').select('id, title, due_date, topic_slug').eq('user_id', user.id).eq('completed', false).not('due_date', 'is', null).order('due_date').limit(5),
    ])

    setStats({
      remindersCount: reminders.count ?? 0,
      documentsCount: documents.count ?? 0,
      bookmarksCount: bookmarks.count ?? 0,
      upcomingReminders: upcoming.data ?? [],
    })
  }

  useEffect(() => { loadStats() }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const statCards = [
    { label: 'Rappels en attente', value: stats?.remindersCount ?? '—', color: 'bg-orange-100', textColor: 'text-orange-700' },
    { label: 'Documents', value: stats?.documentsCount ?? '—', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { label: 'Favoris', value: stats?.bookmarksCount ?? '—', color: 'bg-purple-100', textColor: 'text-purple-700' },
  ]

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View className="px-4 py-6 gap-6">
        {/* Stat cards */}
        <View className="flex-row gap-3">
          {statCards.map((card) => (
            <View key={card.label} className={`flex-1 rounded-2xl p-4 ${card.color}`}>
              <Text className={`text-2xl font-bold ${card.textColor}`}>{String(card.value)}</Text>
              <Text className="text-xs text-gray-600 mt-1">{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Prochains rappels */}
        {stats && stats.upcomingReminders.length > 0 && (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Prochains rappels</Text>
            <View className="gap-2">
              {stats.upcomingReminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm"
                  onPress={() => router.push(`/(protected)/topics/${reminder.topic_slug}`)}
                >
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900" numberOfLines={1}>{reminder.title}</Text>
                    {reminder.due_date && (
                      <Text className="text-sm text-gray-500 mt-0.5">
                        {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-400 ml-2">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Accès rapide */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">Accès rapide</Text>
          <View className="gap-2">
            {[
              { label: 'Mes topics', href: '/(protected)/topics/index' as const, emoji: '📂' },
              { label: 'Mes dépenses', href: '/(protected)/depenses/index' as const, emoji: '💰' },
              { label: 'Mon profil', href: '/(protected)/profile' as const, emoji: '👤' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
                onPress={() => router.push(item.href)}
              >
                <Text className="text-2xl">{item.emoji}</Text>
                <Text className="font-medium text-gray-900">{item.label}</Text>
                <Text className="text-gray-400 ml-auto">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
