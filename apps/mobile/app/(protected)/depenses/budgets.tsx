import { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ExpenseCategory } from '@payetavie/shared'

export default function BudgetsScreen() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function loadCategories() {
    if (!user) return
    const { data } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setCategories(data ?? [])
  }

  useEffect(() => { loadCategories() }, [user])

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadCategories(); setRefreshing(false) }} />}
    >
      <View className="px-4 py-6 gap-3">
        <Text className="text-lg font-semibold text-gray-900 mb-1">Budgets par catégorie</Text>
        {categories.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500">Aucune catégorie configurée</Text>
          </View>
        ) : (
          categories.map((cat) => (
            <View key={cat.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: cat.color }}>
                  <Text className="text-lg">{cat.icon ?? '📁'}</Text>
                </View>
                <Text className="font-medium text-gray-900 flex-1">{cat.name}</Text>
                {cat.monthly_budget && (
                  <Text className="text-gray-700 font-semibold">{cat.monthly_budget.toFixed(0)} €/mois</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
