import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Client } from '@payetavie/shared'

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    if (!id || !user) return
    supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setClient(data as Client)
        navigation.setOptions({ title: data.company_name })
      }
    })
  }, [id, user])

  if (!client) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    )
  }

  const fields = [
    { label: 'Entreprise', value: client.company_name },
    { label: 'Contact', value: client.contact_name },
    { label: 'Email', value: client.email },
    { label: 'Téléphone', value: client.phone },
    { label: 'Adresse', value: [client.address_line1, client.address_line2, client.postal_code, client.city].filter(Boolean).join(', ') },
    { label: 'SIRET', value: client.siret },
    { label: 'Délai de paiement', value: `${client.payment_terms_days} jours` },
    { label: 'Notes', value: client.notes },
  ]

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6 gap-4">
        <View className="items-center py-2">
          <View className="w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mb-2">
            <Text className="text-2xl">👥</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{client.company_name}</Text>
          <View className={`rounded-full px-3 py-1 mt-1 ${client.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-sm font-medium ${client.is_active ? 'text-green-700' : 'text-gray-500'}`}>
              {client.is_active ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          {fields.filter((f) => f.value).map((field, i) => (
            <View key={field.label} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <Text className="text-xs text-gray-500 mb-0.5">{field.label}</Text>
              <Text className="text-gray-900">{field.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
