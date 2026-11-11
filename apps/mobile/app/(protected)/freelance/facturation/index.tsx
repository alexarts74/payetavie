import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { requirePlan } from '@/lib/subscription'
import type { InvoicingStats } from '@payetavie/shared'
import { ME_THRESHOLDS } from '@payetavie/shared'

interface MeStats {
  caEncaisse: number
  caAttente: number
  threshold: number
  projectedYearEnd: number | null
  activityType: 'services' | 'commerce' | 'mixte'
}

interface UrssafStats {
  totalHT: number
  period: string
  dueDate: string
  cotisationsEstimees: number
  taux: number
  activityType: 'services' | 'commerce' | 'mixte'
}

export default function FacturationDashboardScreen() {
  const { user } = useAuth()
  const [stats, setStats] = useState<InvoicingStats | null>(null)
  const [meStats, setMeStats] = useState<MeStats | null>(null)
  const [urssafStats, setUrssafStats] = useState<UrssafStats | null>(null)
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
    const currentYear = new Date().getFullYear()
    const [invoices, quotations, profileRes] = await Promise.all([
      supabase.from('billing_documents').select('total_ht, total_ttc, status, document_date').eq('user_id', user.id).eq('type', 'invoice'),
      supabase.from('billing_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'quotation'),
      supabase.from('professional_profiles').select('is_micro_entrepreneur, activity_type').eq('user_id', user.id).maybeSingle(),
    ])

    const invData = invoices.data ?? []
    setStats({
      totalRevenue: invData.filter((i) => i.status === 'payee').reduce((s, i) => s + i.total_ttc, 0),
      totalUnpaid: invData.filter((i) => i.status === 'en_retard').reduce((s, i) => s + i.total_ttc, 0),
      totalPending: invData.filter((i) => i.status === 'envoyee').reduce((s, i) => s + i.total_ttc, 0),
      invoiceCount: invData.length,
      quotationCount: quotations.count ?? 0,
    })

    // Jauge plafond micro-entrepreneur
    const profile = profileRes.data
    if (profile?.is_micro_entrepreneur) {
      const activityType = (profile.activity_type as 'services' | 'commerce' | 'mixte') || 'services'
      const threshold = ME_THRESHOLDS[activityType]
      const yearInvoices = invData.filter(i => i.document_date?.startsWith(String(currentYear)))
      const caEncaisse = yearInvoices.filter(i => i.status === 'payee').reduce((s, i) => s + Number(i.total_ht || 0), 0)
      const caAttente = yearInvoices.filter(i => i.status === 'envoyee' || i.status === 'en_retard').reduce((s, i) => s + Number(i.total_ht || 0), 0)
      const monthsElapsed = new Date().getMonth() + 1
      const projectedYearEnd = caEncaisse > 0 ? Math.round((caEncaisse / monthsElapsed) * 12) : null
      setMeStats({ caEncaisse, caAttente, threshold, projectedYearEnd, activityType })

      // Widget URSSAF
      const URSSAF_RATES = { services: 0.221, commerce: 0.128, mixte: 0.221 } as const
      const taux = URSSAF_RATES[activityType]
      const now = new Date()
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
      const startMonth = (currentQuarter - 1) * 3 + 1
      const endMonth = currentQuarter * 3
      const startDate = `${currentYear}-${String(startMonth).padStart(2, '0')}-01`
      const nextDate = endMonth === 12 ? `${currentYear + 1}-01-01` : `${currentYear}-${String(endMonth + 1).padStart(2, '0')}-01`
      const quarterInvoices = invData.filter(i => i.document_date >= startDate && i.document_date < nextDate && (i.status === 'payee' || i.status === 'envoyee'))
      const totalHT = quarterInvoices.reduce((s, i) => s + Number(i.total_ht || 0), 0)
      const cotisationsEstimees = Math.round(totalHT * taux * 100) / 100
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      const period = `T${currentQuarter} ${currentYear} (${monthNames[startMonth - 1]}–${monthNames[endMonth - 1]})`
      const dueMonth = endMonth + 1 > 12 ? 1 : endMonth + 1
      const dueYear = endMonth + 1 > 12 ? currentYear + 1 : currentYear
      const lastDay = new Date(dueYear, dueMonth, 0).getDate()
      const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${lastDay}`
      setUrssafStats({ totalHT: Math.round(totalHT * 100) / 100, period, dueDate, cotisationsEstimees, taux, activityType })
    }
  }

  if (!allowed) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center px-6">
        <View className="w-20 h-20 bg-violet-50 rounded-full items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={36} color="#235037" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Pro</Text>
        <Text className="text-gray-500 text-center mt-2">La facturation est disponible avec le plan Pro.</Text>
        <TouchableOpacity
          className="bg-violet-600 rounded-xl px-6 py-3 mt-6"
          onPress={() => router.push('/(protected)/pricing')}
        >
          <Text className="text-white font-semibold">Voir les plans</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F5E9AF]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadStats(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 pb-28 gap-5">
        {/* Stats CA */}
        {stats && (
          <View className="bg-violet-600 rounded-2xl p-5">
            <Text className="text-violet-200 text-sm mb-1">Chiffre d'affaires</Text>
            <Text className="text-white text-4xl font-bold">{stats.totalRevenue.toFixed(2)} €</Text>
            <View className="flex-row gap-4 mt-3">
              <View>
                <Text className="text-violet-200 text-xs">En attente</Text>
                <Text className="text-white font-semibold">{stats.totalPending.toFixed(2)} €</Text>
              </View>
              <View>
                <Text className="text-violet-200 text-xs">En retard</Text>
                <Text className="text-red-300 font-semibold">{stats.totalUnpaid.toFixed(2)} €</Text>
              </View>
            </View>
          </View>
        )}

        {/* Jauge plafond micro-entrepreneur */}
        {meStats && <MicroEntrepreneurGaugeMobile stats={meStats} />}

        {/* Widget URSSAF */}
        {urssafStats && <UrssafWidgetMobile stats={urssafStats} />}

        {/* Navigation */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/freelance/facturation/factures/index')}
          >
            <View className="w-9 h-9 bg-violet-50 rounded-[9px] items-center justify-center">
              <Ionicons name="receipt-outline" size={18} color="#235037" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Factures</Text>
              {stats && <Text className="text-sm text-gray-500">{stats.invoiceCount} facture{stats.invoiceCount !== 1 ? 's' : ''}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/freelance/facturation/devis/index')}
          >
            <View className="w-9 h-9 bg-violet-50 rounded-[9px] items-center justify-center">
              <Ionicons name="document-outline" size={18} color="#235037" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Devis</Text>
              {stats && <Text className="text-sm text-gray-500">{stats.quotationCount} devis</Text>}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/freelance/profil')}
          >
            <View className="w-9 h-9 bg-violet-50 rounded-[9px] items-center justify-center">
              <Ionicons name="business-outline" size={18} color="#235037" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Profil professionnel</Text>
              <Text className="text-sm text-gray-500">SIRET, IBAN, préfixes</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* CTA Nouvelle facture */}
        <TouchableOpacity
          className="bg-violet-600 rounded-2xl py-4 items-center"
          onPress={() => router.push('/(protected)/freelance/facturation/factures/nouvelle')}
        >
          <Text className="text-white font-semibold text-base">+ Nouvelle facture</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function UrssafWidgetMobile({ stats }: { stats: UrssafStats }) {
  const { totalHT, period, dueDate, cotisationsEstimees, taux, activityType } = stats
  const dueDateObj = new Date(dueDate)
  const dueDateFormatted = dueDateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const isUrgent = dueDateObj <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const activityLabel = activityType === 'services' ? 'Services' : activityType === 'commerce' ? 'Commerce' : 'Mixte'

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
          <Ionicons name="calculator-outline" size={16} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">Déclaration URSSAF</Text>
          <Text className="text-xs text-gray-500">{period} · {activityLabel}</Text>
        </View>
        {isUrgent && (
          <View className="bg-amber-100 rounded-full px-2 py-0.5">
            <Text className="text-[10px] font-semibold text-amber-700">Bientôt</Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 bg-green-50 rounded-xl p-2.5">
          <Text className="text-xs text-gray-400">CA HT</Text>
          <Text className="text-sm font-semibold text-gray-900">{totalHT.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
        </View>
        <View className="flex-1 bg-blue-50 rounded-xl p-2.5">
          <Text className="text-xs text-gray-400">Cotisations ({(taux * 100).toFixed(1)}%)</Text>
          <Text className="text-sm font-semibold text-blue-700">{cotisationsEstimees.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
        </View>
        <View className={`flex-1 rounded-xl p-2.5 ${isUrgent ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <Text className="text-xs text-gray-400">Limite</Text>
          <Text className={`text-sm font-semibold ${isUrgent ? 'text-amber-700' : 'text-gray-900'}`}>{dueDateFormatted}</Text>
        </View>
      </View>
    </View>
  )
}

function MicroEntrepreneurGaugeMobile({ stats }: { stats: MeStats }) {
  const { caEncaisse, caAttente, threshold, projectedYearEnd, activityType } = stats
  const totalFacture = caEncaisse + caAttente
  const percentageEncaisse = Math.min((caEncaisse / threshold) * 100, 100)
  const percentageTotal = Math.min((totalFacture / threshold) * 100, 100)

  const isWarning = percentageTotal >= 70 && percentageTotal < 90
  const isDanger = percentageTotal >= 90
  const barColor = isDanger ? '#EF4444' : isWarning ? '#D97706' : '#235037'

  const thresholdLabel =
    activityType === 'services' ? 'Services' : activityType === 'commerce' ? 'Commerce' : 'Mixte'

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
          <Ionicons name="trending-up" size={16} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">Plafond micro-entrepreneur</Text>
          <Text className="text-xs text-gray-500">{thresholdLabel} — {threshold.toLocaleString('fr-FR')} €</Text>
        </View>
        <Text className="text-sm font-bold" style={{ color: barColor }}>
          {percentageEncaisse.toFixed(0)}%
        </Text>
      </View>

      {/* Barre */}
      <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <View style={{ width: `${percentageTotal}%`, height: '100%', backgroundColor: barColor, opacity: 0.25, position: 'absolute' }} />
        <View style={{ width: `${percentageEncaisse}%`, height: '100%', backgroundColor: barColor }} />
      </View>

      {/* Chiffres */}
      <View className="flex-row gap-2">
        <View className="flex-1 bg-gray-50 rounded-xl p-2.5">
          <Text className="text-xs text-gray-400">Encaissé</Text>
          <Text className="text-sm font-semibold text-gray-900">{caEncaisse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-xl p-2.5">
          <Text className="text-xs text-gray-400">En attente</Text>
          <Text className="text-sm font-semibold text-amber-600">{caAttente.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-xl p-2.5">
          <Text className="text-xs text-gray-400">Restant</Text>
          <Text className="text-sm font-semibold text-gray-900">{Math.max(0, threshold - totalFacture).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
        </View>
      </View>

      {projectedYearEnd !== null && (
        <View className="bg-blue-50 rounded-xl p-3 flex-row gap-2">
          <Ionicons name="information-circle-outline" size={14} color="#2563eb" />
          <Text className="text-xs text-blue-700 flex-1">
            Projection fin d&apos;année :{' '}
            <Text className="font-semibold">{projectedYearEnd.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</Text>
            {projectedYearEnd > threshold ? ' — au-dessus du plafond.' : ''}
          </Text>
        </View>
      )}

      {(isWarning || isDanger) && (
        <View className={`rounded-xl p-3 flex-row gap-2 ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}>
          <Ionicons name="warning-outline" size={14} color={isDanger ? '#dc2626' : '#d97706'} />
          <Text className={`text-xs flex-1 ${isDanger ? 'text-red-700' : 'text-amber-700'}`}>
            {isDanger
              ? 'Vous approchez ou dépassez le plafond. Anticipez votre passage en régime réel.'
              : 'Attention — vous approchez du plafond.'}
          </Text>
        </View>
      )}
    </View>
  )
}
