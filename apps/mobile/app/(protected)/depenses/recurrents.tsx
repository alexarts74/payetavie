import { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { RecurringExpense } from '@payetavie/shared'

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  quarterly: 'Trimestrielle',
  yearly: 'Annuelle',
}

export default function RecurrentsScreen() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function loadExpenses() {
    if (!user) return
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*, category:expense_categories(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('title')
    setExpenses((data ?? []) as RecurringExpense[])
  }

  useEffect(() => { loadExpenses() }, [user])

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadExpenses(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-3">
        <Text className="text-lg font-semibold text-gray-900 mb-1">Dépenses récurrentes</Text>
        {expenses.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500">Aucune dépense récurrente active</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} className="bg-white rounded-xl p-4 shadow-sm flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: expense.category?.color ?? '#e5e7eb' }}>
                <Text className="text-lg">{expense.category?.icon ?? '🔄'}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{expense.title}</Text>
                <Text className="text-sm text-gray-500">{FREQUENCY_LABELS[expense.frequency] ?? expense.frequency}</Text>
              </View>
              <Text className="font-semibold text-gray-900">{expense.amount.toFixed(2)} €</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
