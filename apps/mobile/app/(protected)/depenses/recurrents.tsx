import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { RecurringExpense, ExpenseCategory, RecurringFrequency } from '@payetavie/shared'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  quarterly: 'Trimestrielle',
  yearly: 'Annuelle',
}

const TAILWIND_TO_HEX: Record<string, string> = {
  blue: '#3b82f6', green: '#22c55e', red: '#ef4444', yellow: '#eab308',
  orange: '#f97316', purple: '#a855f7', pink: '#ec4899', indigo: '#6366f1',
  teal: '#14b8a6', zinc: '#71717a', gray: '#6b7280',
}

function resolveColor(color: string): string {
  if (color.startsWith('#')) return color
  return TAILWIND_TO_HEX[color] ?? '#6b7280'
}

interface RecurringForm {
  title: string
  amount: string
  frequency: RecurringFrequency
  start_date: string
  category_id: string
  day_of_month: string
}

export default function RecurrentsScreen() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null)
  const [form, setForm] = useState<RecurringForm>({
    title: '', amount: '', frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    category_id: '', day_of_month: '',
  })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    if (!user) return
    const [expRes, catRes] = await Promise.all([
      supabase.from('recurring_expenses').select('*, category:expense_categories(*)').eq('user_id', user.id).order('title'),
      supabase.from('expense_categories').select('*').eq('user_id', user.id).order('name'),
    ])
    setExpenses((expRes.data ?? []) as RecurringExpense[])
    setCategories(catRes.data ?? [])
  }

  useEffect(() => { loadData() }, [user])

  async function toggleActive(expense: RecurringExpense) {
    if (!user) return
    await supabase.from('recurring_expenses').update({ is_active: !expense.is_active }).eq('id', expense.id).eq('user_id', user.id)
    setExpenses((prev) => prev.map((e) => e.id === expense.id ? { ...e, is_active: !e.is_active } : e))
  }

  function openCreate() {
    setEditingExpense(null)
    setForm({ title: '', amount: '', frequency: 'monthly', start_date: new Date().toISOString().split('T')[0], category_id: '', day_of_month: '' })
    setShowModal(true)
  }

  function openEdit(expense: RecurringExpense) {
    setEditingExpense(expense)
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      start_date: expense.start_date,
      category_id: expense.category_id ?? '',
      day_of_month: expense.day_of_month?.toString() ?? '',
    })
    setShowModal(true)
  }

  function confirmDelete(expense: RecurringExpense) {
    Alert.alert('Supprimer ?', `"${expense.title}" sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteExpense(expense.id) },
    ])
  }

  async function deleteExpense(id: string) {
    if (!user) return
    await supabase.from('recurring_expenses').delete().eq('id', id).eq('user_id', user.id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  async function saveExpense() {
    if (!user) return
    if (!form.title.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return }
    if (!form.amount || isNaN(parseFloat(form.amount))) { Alert.alert('Erreur', 'Montant invalide'); return }
    setSaving(true)
    const showDay = form.frequency === 'monthly' || form.frequency === 'quarterly'
    const payload = {
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      start_date: form.start_date || new Date().toISOString().split('T')[0],
      category_id: form.category_id || null,
      day_of_month: showDay && form.day_of_month ? parseInt(form.day_of_month) : null,
    }
    if (editingExpense) {
      const { error } = await supabase.from('recurring_expenses').update(payload).eq('id', editingExpense.id).eq('user_id', user.id)
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      setExpenses((prev) => prev.map((e) => e.id === editingExpense.id ? { ...e, ...payload } : e))
    } else {
      const { data, error } = await supabase.from('recurring_expenses').insert({ user_id: user.id, ...payload }).select('*, category:expense_categories(*)').single()
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      setExpenses((prev) => [...prev, data as RecurringExpense].sort((a, b) => a.title.localeCompare(b.title)))
    }
    setSaving(false)
    setShowModal(false)
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#F5E9AF]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false) }} />}
      >
        <View className="px-4 py-6 pb-28 gap-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-gray-900">Dépenses récurrentes</Text>
            <TouchableOpacity className="w-8 h-8 bg-violet-600 rounded-full items-center justify-center" onPress={openCreate}>
              <Text className="text-white text-xl font-bold leading-none">+</Text>
            </TouchableOpacity>
          </View>

          {expenses.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-gray-500">Aucune dépense récurrente configurée</Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-3"
                onPress={() => openEdit(expense)}
                onLongPress={() => confirmDelete(expense)}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: expense.category ? resolveColor(expense.category.color) : '#e5e7eb' }}
                >
                  <Ionicons name="pricetag-outline" size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${expense.is_active ? 'text-gray-900' : 'text-gray-400'}`}>{expense.title}</Text>
                  <Text className="text-sm text-gray-500">{FREQUENCY_LABELS[expense.frequency]}</Text>
                </View>
                <Text className={`font-semibold mr-2 ${expense.is_active ? 'text-gray-900' : 'text-gray-400'}`}>{expense.amount.toFixed(2)} €</Text>
                <TouchableOpacity
                  onPress={() => toggleActive(expense)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: expense.is_active ? '#dcfce7' : '#f3f4f6' }}
                >
                  <Ionicons name={expense.is_active ? 'pause-outline' : 'play-outline'} size={14} color={expense.is_active ? '#6b7280' : '#16a34a'} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">{editingExpense ? 'Modifier' : 'Nouvelle dépense récurrente'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Titre *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Loyer"
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
                  <Text className="text-sm font-medium text-gray-700 mb-2">Fréquence</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(['weekly', 'monthly', 'quarterly', 'yearly'] as RecurringFrequency[]).map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        className={`px-3 py-2 rounded-xl border ${form.frequency === freq ? 'bg-[#EBA7CB] border-[#EBA7CB]' : 'bg-white border-gray-300'}`}
                        onPress={() => setForm((f) => ({ ...f, frequency: freq }))}
                      >
                        <Text className={`text-sm font-medium ${form.frequency === freq ? 'text-[#235037]' : 'text-gray-700'}`}>{FREQUENCY_LABELS[freq]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {(form.frequency === 'monthly' || form.frequency === 'quarterly') && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Jour du mois (optionnel)</Text>
                    <TextInput
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                      placeholder="Ex : 1 (début de mois)"
                      value={form.day_of_month}
                      onChangeText={(v) => setForm((f) => ({ ...f, day_of_month: v }))}
                      keyboardType="number-pad"
                    />
                  </View>
                )}

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Date de début</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="AAAA-MM-JJ"
                    value={form.start_date}
                    onChangeText={(v) => setForm((f) => ({ ...f, start_date: v }))}
                    keyboardType="numeric"
                  />
                </View>

                {categories.length > 0 && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie (optionnel)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2 pb-1">
                        <TouchableOpacity
                          className={`px-3 py-2 rounded-xl border ${!form.category_id ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-300'}`}
                          onPress={() => setForm((f) => ({ ...f, category_id: '' }))}
                        >
                          <Text className={`text-sm ${!form.category_id ? 'text-white' : 'text-gray-700'}`}>Aucune</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${form.category_id === cat.id ? 'border-2' : 'bg-white border-gray-300'}`}
                            style={form.category_id === cat.id ? { backgroundColor: resolveColor(cat.color) + '20', borderColor: resolveColor(cat.color) } : {}}
                            onPress={() => setForm((f) => ({ ...f, category_id: cat.id }))}
                          >
                            <Text className="text-sm font-medium text-gray-700">{cat.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${saving ? 'bg-violet-400' : 'bg-violet-600'}`}
                  onPress={saveExpense}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">{editingExpense ? 'Enregistrer' : 'Créer'}</Text>
                  }
                </TouchableOpacity>

                {editingExpense && (
                  <TouchableOpacity
                    className="rounded-xl py-3.5 items-center border border-red-300 bg-red-50"
                    onPress={() => { setShowModal(false); setTimeout(() => confirmDelete(editingExpense), 300) }}
                  >
                    <Text className="text-red-600 font-medium">Supprimer</Text>
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
