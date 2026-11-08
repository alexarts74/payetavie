import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { BillingDocumentWithItems } from '@payetavie/shared'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100' },
  envoye:    { label: 'Envoyé',    color: 'text-blue-600', bg: 'bg-blue-100' },
  accepte:   { label: 'Accepté',  color: 'text-green-600', bg: 'bg-green-100' },
  refuse:    { label: 'Refusé',   color: 'text-red-600',   bg: 'bg-red-100' },
  facture:   { label: 'Facturé',  color: 'text-purple-600', bg: 'bg-purple-100' },
}

export default function DevisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [quotation, setQuotation] = useState<BillingDocumentWithItems | null>(null)

  async function transition(newStatus: string) {
    if (!id || !user || !quotation) return
    const { data, error } = await supabase
      .from('billing_documents')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, items:billing_document_items(*), client:clients(*)')
      .single()
    if (!error && data) setQuotation(data as unknown as BillingDocumentWithItems)
  }

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
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    )
  }

  const status = STATUS_LABELS[quotation.status] ?? STATUS_LABELS.brouillon

  return (
    <ScrollView className="flex-1 bg-[#F5E9AF]">
      <View className="px-4 py-6 pb-28 gap-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-2xl font-bold text-gray-900">{quotation.document_number}</Text>
            <View className={`rounded-full px-3 py-1 ${status.bg}`}>
              <Text className={`text-sm font-medium ${status.color}`}>{status.label}</Text>
            </View>
          </View>
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

        <TouchableOpacity className="bg-violet-600 rounded-2xl py-4 items-center" onPress={viewPdf}>
          <Text className="text-white font-semibold">Voir le PDF</Text>
        </TouchableOpacity>

        {/* Transitions de statut */}
        {quotation.status === 'brouillon' && (
          <TouchableOpacity className="bg-violet-600 rounded-2xl py-3 items-center" onPress={() => transition('envoye')}>
            <Text className="text-white font-semibold">Marquer comme envoyé</Text>
          </TouchableOpacity>
        )}
        {quotation.status === 'envoye' && (
          <View className="gap-2">
            <TouchableOpacity className="bg-green-600 rounded-2xl py-3 items-center" onPress={() => transition('accepte')}>
              <Text className="text-white font-semibold">Accepté</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 rounded-2xl py-3 items-center"
              onPress={() => Alert.alert('Refuser le devis', 'Confirmer le refus ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Confirmer', style: 'destructive', onPress: () => transition('refuse') },
              ])}
            >
              <Text className="text-gray-700 font-semibold">Refusé</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
