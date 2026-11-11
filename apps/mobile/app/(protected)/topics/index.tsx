import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle, getTopicIcon } from '@payetavie/shared'

type Category = {
  label: string
  slugs: string[]
}

const CATEGORIES: Category[] = [
  { label: 'Finances',                 slugs: ['impots', 'fiches-de-paie', 'assurances'] },
  { label: 'Santé',                    slugs: ['mutuelle', 'sante'] },
  { label: 'Logement',                 slugs: ['logement'] },
  { label: 'Independant',              slugs: ['urssaf', 'freelance-clients', 'freelance-facturation'] },
]

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

  const categoriesWithTopics = CATEGORIES
    .map((cat) => ({
      ...cat,
      topics: cat.slugs.filter((s) => selectedTopics.includes(s)),
    }))
    .filter((cat) => cat.topics.length > 0)

  return (
    <ScrollView
      className="flex-1 bg-[#F5E9AF]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20 }} className="px-6 pb-5">
        <Text className="text-4xl text-[#0D0D0D] tracking-tight" style={{ fontFamily: 'Caprasimo_400Regular', lineHeight: 42 }}>
          Mes démarches
        </Text>
        <Text className="text-sm text-[#71717A] mt-1.5" style={{ fontFamily: 'Jost_300Light' }}>
          Vos thématiques administratives
        </Text>
      </View>

      <View className="px-4 pb-28">
        {categoriesWithTopics.length === 0 ? (
          <View className="items-center py-12">
            <View className="w-16 h-16 bg-[#F5E9AF] border border-[#235037]/20 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="layers-outline" size={32} color="#235037" />
            </View>
            <Text className="text-lg text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>
              Aucune démarche sélectionnée
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm" style={{ fontFamily: 'Jost_300Light' }}>
              Configurez vos thématiques dans votre profil.
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#235037] px-5 py-2.5 rounded-xl"
              onPress={() => router.push('/(protected)/profile')}
            >
              <Text className="text-white text-sm" style={{ fontFamily: 'Jost_500Medium' }}>
                Aller au profil
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-5">
            {categoriesWithTopics.map((cat) => (
              <View key={cat.label}>
                {/* Category header */}
                <Text
                  className="text-xs text-[#235037] uppercase tracking-widest mb-2 px-1"
                  style={{ fontFamily: 'Jost_500Medium' }}
                >
                  {cat.label}
                </Text>

                {/* Topics card */}
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {cat.topics.map((slug, index) => (
                    <TouchableOpacity
                      key={slug}
                      className="flex-row items-center px-4 py-3.5 gap-3"
                      style={index > 0 ? { borderTopWidth: 1, borderTopColor: '#F4F4F5' } : undefined}
                      onPress={() => router.push(`/(protected)/topics/${slug}`)}
                    >
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#F5E9AF' }}
                      >
                        <Text style={{ fontSize: 18 }}>{getTopicIcon(slug)}</Text>
                      </View>
                      <Text className="flex-1 text-[#0D0D0D]" style={{ fontFamily: 'Jost_500Medium', fontSize: 15 }}>
                        {getTopicTitle(slug)}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
