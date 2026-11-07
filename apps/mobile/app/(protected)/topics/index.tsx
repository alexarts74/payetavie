import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle, getTopicIcon } from '@payetavie/shared'

export default function TopicsScreen() {
  const { user } = useAuth()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function loadTopics() {
    if (!user) return
    const { data } = await supabase
      .from('user_preferences')
      .select('selected_topics')
      .eq('user_id', user.id)
      .single()
    if (data) setSelectedTopics(data.selected_topics ?? [])
  }

  useEffect(() => { loadTopics() }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    await loadTopics()
    setRefreshing(false)
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View className="px-4 py-6">
        {selectedTopics.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">📂</Text>
            <Text className="text-lg font-semibold text-gray-900">Aucun topic sélectionné</Text>
            <Text className="text-gray-500 text-center mt-2">
              Configurez vos topics dans votre profil.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {selectedTopics.map((slug) => (
              <TouchableOpacity
                key={slug}
                className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
                onPress={() => router.push(`/(protected)/topics/${slug}`)}
              >
                <Text className="text-2xl">{getTopicIcon(slug)}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{getTopicTitle(slug)}</Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
