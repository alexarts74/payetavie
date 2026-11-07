import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ExpenseWithCategory } from '@payetavie/shared'

export default function DepensesScreen() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [totalMonth, setTotalMonth] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  async function loadExpenses() {
    if (!user) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('user_id', user.id)
      .gte('expense_date', startOfMonth)
      .lte('expense_date', endOfMonth)
      .order('expense_date', { ascending: false })
      .limit(50)

    const list = (data ?? []) as ExpenseWithCategory[]
    setExpenses(list)
    setTotalMonth(list.reduce((sum, e) => sum + e.amount, 0))
  }

  useEffect(() => { loadExpenses() }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    await loadExpenses()
    setRefreshing(false)
  }

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View className="px-4 py-6 gap-5">
        {/* Total du mois */}
        <View className="bg-blue-600 rounded-2xl p-5">
          <Text className="text-blue-200 text-sm mb-1 capitalize">{monthLabel}</Text>
          <Text className="text-white text-4xl font-bold">{totalMonth.toFixed(2)} €</Text>
          <Text className="text-blue-200 text-sm mt-1">Dépenses du mois</Text>
        </View>

        {/* Raccourcis */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-3 items-center shadow-sm"
            onPress={() => router.push('/(protected)/depenses/budgets')}
          >
            <Text className="text-2xl mb-1">📊</Text>
            <Text className="text-xs font-medium text-gray-700">Budgets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-3 items-center shadow-sm"
            onPress={() => router.push('/(protected)/depenses/recurrents')}
          >
            <Text className="text-2xl mb-1">🔄</Text>
            <Text className="text-xs font-medium text-gray-700">Récurrents</Text>
          </TouchableOpacity>
        </View>

        {/* Liste dépenses */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">Dépenses récentes</Text>
          {expenses.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500">Aucune dépense ce mois-ci</Text>
            </View>
          ) : (
            <View className="gap-2">
              {expenses.map((expense) => (
                <View key={expense.id} className="bg-white rounded-xl p-4 flex-row items-center shadow-sm">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: expense.category?.color ?? '#e5e7eb' }}
                  >
                    <Text className="text-lg">{expense.category?.icon ?? '💰'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{expense.title}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString('fr-FR')}
                      {expense.category ? ` · ${expense.category.name}` : ''}
                    </Text>
                  </View>
                  <Text className="font-semibold text-gray-900">{expense.amount.toFixed(2)} €</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
