import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { requirePlan } from '@/lib/subscription'
import type { InvoicingStats } from '@payetavie/shared'

export default function FacturationDashboardScreen() {
  const { user } = useAuth()
  const [stats, setStats] = useState<InvoicingStats | null>(null)
  const [allowed, setAllowed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    requirePlan('pro').then((result) => {
      setAllowed(result.allowed)
      if (result.allowed) loadStats()
    })
  }, [user])

  async function loadStats() {
    if (!user) return
    const [invoices, quotations] = await Promise.all([
      supabase.from('billing_documents').select('total_ttc, status').eq('user_id', user.id).eq('type', 'invoice'),
      supabase.from('billing_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'quotation'),
    ])

    const invData = invoices.data ?? []
    setStats({
      totalRevenue: invData.filter((i) => i.status === 'payee').reduce((s, i) => s + i.total_ttc, 0),
      totalUnpaid: invData.filter((i) => i.status === 'en_retard').reduce((s, i) => s + i.total_ttc, 0),
      totalPending: invData.filter((i) => i.status === 'envoyee').reduce((s, i) => s + i.total_ttc, 0),
      invoiceCount: invData.length,
      quotationCount: quotations.count ?? 0,
    })
  }

  if (!allowed) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">🔒</Text>
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Pro</Text>
        <Text className="text-gray-500 text-center mt-2">La facturation est disponible avec le plan Pro.</Text>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadStats(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-5">
        {/* Stats CA */}
        {stats && (
          <View className="bg-blue-600 rounded-2xl p-5">
            <Text className="text-blue-200 text-sm mb-1">Chiffre d'affaires</Text>
            <Text className="text-white text-4xl font-bold">{stats.totalRevenue.toFixed(2)} €</Text>
            <View className="flex-row gap-4 mt-3">
              <View>
                <Text className="text-blue-200 text-xs">En attente</Text>
                <Text className="text-white font-semibold">{stats.totalPending.toFixed(2)} €</Text>
              </View>
              <View>
                <Text className="text-blue-200 text-xs">En retard</Text>
                <Text className="text-red-300 font-semibold">{stats.totalUnpaid.toFixed(2)} €</Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/freelance/facturation/factures/index')}
          >
            <Text className="text-2xl">🧾</Text>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Factures</Text>
              {stats && <Text className="text-sm text-gray-500">{stats.invoiceCount} facture{stats.invoiceCount !== 1 ? 's' : ''}</Text>}
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/freelance/facturation/devis/index')}
          >
            <Text className="text-2xl">📋</Text>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Devis</Text>
              {stats && <Text className="text-sm text-gray-500">{stats.quotationCount} devis</Text>}
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Nouvelle facture */}
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 items-center"
          onPress={() => router.push('/(protected)/freelance/facturation/factures/nouvelle')}
        >
          <Text className="text-white font-semibold text-base">+ Nouvelle facture</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
