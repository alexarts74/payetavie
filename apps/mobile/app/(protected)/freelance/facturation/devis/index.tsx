import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { BillingDocument } from '@payetavie/shared'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100' },
  envoye:    { label: 'Envoyé', color: 'text-blue-600', bg: 'bg-blue-100' },
  accepte:   { label: 'Accepté', color: 'text-green-600', bg: 'bg-green-100' },
  refuse:    { label: 'Refusé', color: 'text-red-600', bg: 'bg-red-100' },
  facture:   { label: 'Facturé', color: 'text-purple-600', bg: 'bg-purple-100' },
}

export default function DevisListScreen() {
  const { user } = useAuth()
  const [quotations, setQuotations] = useState<BillingDocument[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function loadQuotations() {
    if (!user) return
    const { data } = await supabase
      .from('billing_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'quotation')
      .order('document_date', { ascending: false })
    setQuotations(data ?? [])
  }

  useEffect(() => { loadQuotations() }, [user])

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadQuotations(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-semibold text-gray-900">Devis</Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-xl px-4 py-2"
            onPress={() => router.push('/(protected)/freelance/facturation/devis/nouveau')}
          >
            <Text className="text-white font-medium text-sm">+ Nouveau</Text>
          </TouchableOpacity>
        </View>
        {quotations.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500">Aucun devis</Text>
          </View>
        ) : (
          quotations.map((q) => {
            const status = STATUS_LABELS[q.status] ?? STATUS_LABELS.brouillon
            return (
              <TouchableOpacity
                key={q.id}
                className="bg-white rounded-xl p-4 shadow-sm"
                onPress={() => router.push(`/(protected)/freelance/facturation/devis/${q.id}`)}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900">{q.document_number}</Text>
                  <View className={`rounded-full px-2 py-0.5 ${status.bg}`}>
                    <Text className={`text-xs font-medium ${status.color}`}>{status.label}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    {new Date(q.document_date).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text className="font-semibold text-gray-900">{q.total_ttc.toFixed(2)} €</Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}
