import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle, getTopicIcon } from '@payetavie/shared'
import type { Reminder, Document } from '@payetavie/shared'

export default function TopicDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (slug) navigation.setOptions({ title: getTopicTitle(slug) })
  }, [slug])

  async function loadData() {
    if (!user || !slug) return
    const [rem, docs] = await Promise.all([
      supabase.from('reminders').select('*').eq('user_id', user.id).eq('topic_slug', slug).order('due_date'),
      supabase.from('documents').select('*').eq('user_id', user.id).eq('topic_slug', slug).order('created_at', { ascending: false }),
    ])
    setReminders(rem.data ?? [])
    setDocuments(docs.data ?? [])
  }

  useEffect(() => { loadData() }, [user, slug])

  async function toggleReminder(id: string, completed: boolean) {
    if (!user) return
    await supabase.from('reminders').update({ completed: !completed }).eq('id', id).eq('user_id', user.id)
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed: !completed } : r))
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-6">
        {/* Header */}
        <View className="items-center py-4">
          <Text className="text-5xl mb-2">{getTopicIcon(slug ?? '')}</Text>
          <Text className="text-2xl font-bold text-gray-900">{getTopicTitle(slug ?? '')}</Text>
        </View>

        {/* Rappels */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">Rappels</Text>
          {reminders.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500">Aucun rappel pour ce topic</Text>
            </View>
          ) : (
            <View className="gap-2">
              {reminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
                  onPress={() => toggleReminder(reminder.id, reminder.completed)}
                >
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${reminder.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                    {reminder.completed && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${reminder.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {reminder.title}
                    </Text>
                    {reminder.due_date && (
                      <Text className="text-sm text-gray-500">
                        {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Documents */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">Documents</Text>
          {documents.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500">Aucun document pour ce topic</Text>
            </View>
          ) : (
            <View className="gap-2">
              {documents.map((doc) => (
                <View key={doc.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="font-medium text-gray-900">{doc.name}</Text>
                  {doc.expires_at && (
                    <Text className="text-sm text-orange-600 mt-0.5">
                      Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
