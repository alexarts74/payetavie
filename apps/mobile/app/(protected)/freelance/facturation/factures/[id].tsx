import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useNavigation, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { BillingDocumentWithItems } from '@payetavie/shared'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100' },
  envoyee:   { label: 'Envoyée', color: 'text-blue-600', bg: 'bg-blue-100' },
  payee:     { label: 'Payée', color: 'text-green-600', bg: 'bg-green-100' },
  en_retard: { label: 'En retard', color: 'text-red-600', bg: 'bg-red-100' },
  annulee:   { label: 'Annulée', color: 'text-gray-400', bg: 'bg-gray-100' },
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [invoice, setInvoice] = useState<BillingDocumentWithItems | null>(null)

  useEffect(() => {
    if (!id || !user) return
    supabase.from('billing_documents').select('*, items:billing_document_items(*), client:clients(*)')
      .eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setInvoice(data as unknown as BillingDocumentWithItems)
          navigation.setOptions({ title: data.document_number })
        }
      })
  }, [id, user])

  async function viewPdf() {
    if (!id) return
    await WebBrowser.openBrowserAsync(`${APP_URL}/api/freelance/invoices/${id}/pdf`)
  }

  if (!invoice) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    )
  }

  const status = STATUS_LABELS[invoice.status] ?? STATUS_LABELS.brouillon

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6 gap-5">
        {/* Header */}
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-2xl font-bold text-gray-900">{invoice.document_number}</Text>
            <View className={`rounded-full px-3 py-1 ${status.bg}`}>
              <Text className={`text-sm font-medium ${status.color}`}>{status.label}</Text>
            </View>
          </View>
          {invoice.client && (
            <Text className="text-gray-700 font-medium">{invoice.client.company_name}</Text>
          )}
          <Text className="text-gray-500 text-sm mt-1">
            {new Date(invoice.document_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Lignes */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="font-semibold text-gray-900">Prestations</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={item.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <Text className="text-gray-900">{item.description}</Text>
              <View className="flex-row justify-between mt-1">
                <Text className="text-sm text-gray-500">{item.quantity} × {item.unit_price.toFixed(2)} €</Text>
                <Text className="text-sm font-medium text-gray-900">{item.line_total.toFixed(2)} €</Text>
              </View>
            </View>
          ))}
          <View className="px-4 py-3 border-t border-gray-200">
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">HT</Text>
              <Text className="text-gray-900">{invoice.total_ht.toFixed(2)} €</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-500 text-sm">TVA ({invoice.tva_rate}%)</Text>
              <Text className="text-gray-900">{invoice.tva_amount.toFixed(2)} €</Text>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
              <Text className="font-bold text-gray-900">TTC</Text>
              <Text className="font-bold text-gray-900 text-lg">{invoice.total_ttc.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 items-center"
          onPress={viewPdf}
        >
          <Text className="text-white font-semibold">Voir le PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
