import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ExpenseWithCategory, ExpenseCategory } from '@payetavie/shared'

interface ExpenseForm {
  title: string
  amount: string
  expense_date: string
  category_id: string
  notes: string
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function DepensesScreen() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [totalMonth, setTotalMonth] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null)
  const [form, setForm] = useState<ExpenseForm>({ title: '', amount: '', expense_date: todayISO(), category_id: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    if (!user) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [expRes, catRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, category:expense_categories(*)')
        .eq('user_id', user.id)
        .gte('expense_date', startOfMonth)
        .lte('expense_date', endOfMonth)
        .order('expense_date', { ascending: false })
        .limit(100),
      supabase.from('expense_categories').select('*').eq('user_id', user.id).order('name'),
    ])

    const list = (expRes.data ?? []) as ExpenseWithCategory[]
    setExpenses(list)
    setTotalMonth(list.reduce((sum, e) => sum + Number(e.amount), 0))
    setCategories(catRes.data ?? [])
  }

  useEffect(() => { loadData() }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  function openCreate() {
    setEditingExpense(null)
    setForm({ title: '', amount: '', expense_date: todayISO(), category_id: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(expense: ExpenseWithCategory) {
    setEditingExpense(expense)
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      expense_date: expense.expense_date,
      category_id: expense.category_id ?? '',
      notes: expense.notes ?? '',
    })
    setShowModal(true)
  }

  async function saveExpense() {
    if (!user) return
    if (!form.title.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return }
    const amount = parseFloat(form.amount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) { Alert.alert('Erreur', 'Le montant doit être supérieur à 0'); return }
    if (!form.expense_date.trim()) { Alert.alert('Erreur', 'La date est requise'); return }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      amount,
      expense_date: form.expense_date.trim(),
      category_id: form.category_id || null,
      notes: form.notes.trim() || null,
    }

    if (editingExpense) {
      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', editingExpense.id)
        .eq('user_id', user.id)
        .select('*, category:expense_categories(*)')
        .single()
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      const updated = data as ExpenseWithCategory
      setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e))
      setTotalMonth((prev) => prev - Number(editingExpense.amount) + Number(updated.amount))
    } else {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ user_id: user.id, ...payload })
        .select('*, category:expense_categories(*)')
        .single()
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      const created = data as ExpenseWithCategory
      setExpenses((prev) => [created, ...prev])
      setTotalMonth((prev) => prev + Number(created.amount))
    }

    setSaving(false)
    setShowModal(false)
  }

  function confirmDelete(expense: ExpenseWithCategory) {
    Alert.alert('Supprimer cette dépense ?', `"${expense.title}" — ${expense.amount.toFixed(2)} €`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteExpense(expense) },
    ])
  }

  async function deleteExpense(expense: ExpenseWithCategory) {
    if (!user) return
    await supabase.from('expenses').delete().eq('id', expense.id).eq('user_id', user.id)
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id))
    setTotalMonth((prev) => prev - Number(expense.amount))
  }

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <>
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
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Dépenses récentes</Text>
              <TouchableOpacity
                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                onPress={openCreate}
              >
                <Text className="text-white text-xl font-bold leading-none">+</Text>
              </TouchableOpacity>
            </View>

            {expenses.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center">
                <Text className="text-gray-500">Aucune dépense ce mois-ci</Text>
              </View>
            ) : (
              <View className="gap-2">
                {expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    className="bg-white rounded-xl p-4 flex-row items-center shadow-sm"
                    onPress={() => openEdit(expense)}
                    onLongPress={() => confirmDelete(expense)}
                  >
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
                    <Text className="font-semibold text-gray-900">{Number(expense.amount).toFixed(2)} €</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal — Dépense */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">{editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Titre *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Courses, Loyer..."
                    value={form.title}
                    onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Montant (€) *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="0.00"
                    value={form.amount}
                    onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Date *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="AAAA-MM-JJ"
                    value={form.expense_date}
                    onChangeText={(v) => setForm((f) => ({ ...f, expense_date: v }))}
                    keyboardType="numeric"
                  />
                </View>

                {categories.length > 0 && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      <View className="flex-row gap-2 pb-1">
                        <TouchableOpacity
                          className={`px-3 py-2 rounded-xl border ${!form.category_id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                          onPress={() => setForm((f) => ({ ...f, category_id: '' }))}
                        >
                          <Text className={`text-sm font-medium ${!form.category_id ? 'text-white' : 'text-gray-700'}`}>Aucune</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`px-3 py-2 rounded-xl border flex-row items-center gap-1 ${form.category_id === cat.id ? 'border-blue-600' : 'bg-white border-gray-300'}`}
                            style={form.category_id === cat.id ? { backgroundColor: cat.color } : {}}
                            onPress={() => setForm((f) => ({ ...f, category_id: cat.id }))}
                          >
                            <Text className="text-sm">{cat.icon ?? '📁'}</Text>
                            <Text className={`text-sm font-medium ${form.category_id === cat.id ? 'text-white' : 'text-gray-700'}`}>{cat.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Optionnel..."
                    value={form.notes}
                    onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                  onPress={saveExpense}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">{editingExpense ? 'Enregistrer' : 'Ajouter la dépense'}</Text>
                  }
                </TouchableOpacity>

                {editingExpense && (
                  <TouchableOpacity
                    className="items-center py-3"
                    onPress={() => { setShowModal(false); setTimeout(() => confirmDelete(editingExpense), 300) }}
                  >
                    <Text className="text-red-500 font-medium">Supprimer cette dépense</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}
