import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle, getTopicIcon } from '@payetavie/shared'

export default function TopicsScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
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
      className="flex-1 bg-[#F5E9AF]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20 }} className="px-6 pb-5">
        <Text className="text-4xl font-bold text-[#0D0D0D] tracking-tight" style={{ fontFamily: 'Caprasimo_400Regular', lineHeight: 42 }}>
          Mes topics
        </Text>
        <Text className="text-sm text-[#71717A] mt-1.5" style={{ fontFamily: 'Jost_300Light' }}>
          Vos thématiques administratives
        </Text>
      </View>
      <View className="px-4 pb-28">
        {selectedTopics.length === 0 ? (
          <View className="items-center py-12">
            <View className="w-16 h-16 bg-violet-50 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="folder-open-outline" size={32} color="#235037" />
            </View>
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
                className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
                onPress={() => router.push(`/(protected)/topics/${slug}`)}
              >
                <View className="w-9 h-9 bg-violet-50 rounded-[9px] items-center justify-center">
                  <Ionicons name="folder-open-outline" size={18} color="#235037" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{getTopicTitle(slug)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
