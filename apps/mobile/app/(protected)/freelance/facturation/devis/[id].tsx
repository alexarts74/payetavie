import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { BillingDocumentWithItems } from '@payetavie/shared'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

export default function DevisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [quotation, setQuotation] = useState<BillingDocumentWithItems | null>(null)

  useEffect(() => {
    if (!id || !user) return
    supabase.from('billing_documents').select('*, items:billing_document_items(*), client:clients(*)')
      .eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setQuotation(data as unknown as BillingDocumentWithItems)
          navigation.setOptions({ title: data.document_number })
        }
      })
  }, [id, user])

  async function viewPdf() {
    if (!id) return
    await WebBrowser.openBrowserAsync(`${APP_URL}/api/freelance/quotations/${id}/pdf`)
  }

  if (!quotation) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6 gap-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{quotation.document_number}</Text>
          {quotation.client && <Text className="text-gray-700 font-medium">{quotation.client.company_name}</Text>}
          <Text className="text-gray-500 text-sm mt-1">
            {new Date(quotation.document_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="font-semibold text-gray-900">Prestations</Text>
          </View>
          {quotation.items.map((item, i) => (
            <View key={item.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <Text className="text-gray-900">{item.description}</Text>
              <View className="flex-row justify-between mt-1">
                <Text className="text-sm text-gray-500">{item.quantity} × {item.unit_price.toFixed(2)} €</Text>
                <Text className="text-sm font-medium text-gray-900">{item.line_total.toFixed(2)} €</Text>
              </View>
            </View>
          ))}
          <View className="px-4 py-3 border-t border-gray-200">
            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
              <Text className="font-bold text-gray-900">Total TTC</Text>
              <Text className="font-bold text-gray-900 text-lg">{quotation.total_ttc.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="bg-blue-600 rounded-xl py-4 items-center" onPress={viewPdf}>
          <Text className="text-white font-semibold">Voir le PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
