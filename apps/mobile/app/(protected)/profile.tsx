import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ProfileType } from '@payetavie/shared'

const PROFILE_LABELS: Record<ProfileType, string> = {
  etudiant: 'Étudiant',
  salarie: 'Salarié',
  independant: 'Indépendant / Freelance',
  recherche_emploi: 'En recherche d\'emploi',
  autre: 'Autre',
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profileType, setProfileType] = useState<ProfileType | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('user_preferences').select('profile_type').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfileType(data.profile_type as ProfileType) })
  }, [user])

  async function handleSignOut() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive', onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        }
      },
    ])
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6 gap-6">
        {/* Avatar */}
        <View className="items-center py-4">
          <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-3">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900">{user?.email}</Text>
          {profileType && (
            <Text className="text-gray-500 mt-1">{PROFILE_LABELS[profileType]}</Text>
          )}
        </View>

        {/* Actions */}
        <View className="gap-2">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/pricing')}
          >
            <Text className="text-2xl">⭐</Text>
            <Text className="font-medium text-gray-900">Mon abonnement</Text>
            <Text className="text-gray-400 ml-auto">›</Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          className="bg-red-50 rounded-xl p-4 items-center mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 font-medium">Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
