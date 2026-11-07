import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { requirePlan } from '@/lib/subscription'
import type { Client } from '@payetavie/shared'

export default function ClientsScreen() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [allowed, setAllowed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    requirePlan('pro').then((result) => {
      setAllowed(result.allowed)
      if (result.allowed) loadClients()
    })
  }, [user])

  async function loadClients() {
    if (!user) return
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('company_name')
    setClients(data ?? [])
  }

  if (!allowed) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">🔒</Text>
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Pro</Text>
        <Text className="text-gray-500 text-center mt-2">La gestion des clients est disponible avec le plan Pro.</Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-6 py-3 mt-6"
          onPress={() => router.push('/(protected)/pricing')}
        >
          <Text className="text-white font-semibold">Voir les plans</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadClients(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-3">
        <Text className="text-lg font-semibold text-gray-900">Clients</Text>
        {clients.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500">Aucun client enregistré</Text>
          </View>
        ) : (
          clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              className="bg-white rounded-xl p-4 shadow-sm"
              onPress={() => router.push(`/(protected)/freelance/clients/${client.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{client.company_name}</Text>
                  {client.contact_name && <Text className="text-sm text-gray-500">{client.contact_name}</Text>}
                  {client.email && <Text className="text-sm text-gray-500">{client.email}</Text>}
                </View>
                <View className="items-end gap-1">
                  <View className={`rounded-full px-2 py-0.5 ${client.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text className={`text-xs font-medium ${client.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {client.is_active ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                  <Text className="text-gray-400">›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}
