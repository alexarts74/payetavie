import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ExpenseCategory } from '@payetavie/shared'

const COLOR_SWATCHES = [
  { hex: '#3b82f6' }, { hex: '#22c55e' }, { hex: '#ef4444' }, { hex: '#eab308' },
  { hex: '#f97316' }, { hex: '#a855f7' }, { hex: '#ec4899' }, { hex: '#6366f1' },
  { hex: '#14b8a6' }, { hex: '#71717a' },
]

const TAILWIND_TO_HEX: Record<string, string> = {
  blue: '#3b82f6', green: '#22c55e', red: '#ef4444', yellow: '#eab308',
  orange: '#f97316', purple: '#a855f7', pink: '#ec4899', indigo: '#6366f1',
  teal: '#14b8a6', zinc: '#71717a', gray: '#6b7280',
}

function resolveColor(color: string): string {
  if (color.startsWith('#')) return color
  return TAILWIND_TO_HEX[color] ?? '#6b7280'
}

const DEFAULT_CATEGORIES = [
  { name: 'Loyer', icon: '', color: '#3b82f6' },
  { name: 'Courses', icon: '', color: '#22c55e' },
  { name: 'Transports', icon: '', color: '#eab308' },
  { name: 'Santé', icon: '', color: '#ef4444' },
  { name: 'Assurances', icon: '', color: '#6366f1' },
  { name: 'Loisirs', icon: '', color: '#a855f7' },
  { name: 'Abonnements', icon: '', color: '#ec4899' },
  { name: 'Restaurants', icon: '', color: '#f97316' },
  { name: 'Vêtements', icon: '', color: '#14b8a6' },
  { name: 'Autre', icon: '', color: '#71717a' },
]

interface CategoryForm {
  name: string
  icon: string
  color: string
  monthly_budget: string
}

export default function BudgetsScreen() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [initializing, setInitializing] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [form, setForm] = useState<CategoryForm>({ name: '', icon: '', color: '#3b82f6', monthly_budget: '' })
  const [saving, setSaving] = useState(false)

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

  async function initializeDefaults() {
    if (!user) return
    setInitializing(true)
    await supabase.from('expense_categories').insert(
      DEFAULT_CATEGORIES.map((cat) => ({ user_id: user.id, ...cat }))
    )
    await loadCategories()
    setInitializing(false)
  }

  function openCreate() {
    setEditingCategory(null)
    setForm({ name: '', icon: '', color: '#3b82f6', monthly_budget: '' })
    setShowModal(true)
  }

  function openEdit(cat: ExpenseCategory) {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      icon: cat.icon ?? '',
      color: resolveColor(cat.color),
      monthly_budget: cat.monthly_budget?.toString() ?? '',
    })
    setShowModal(true)
  }

  function confirmDelete(cat: ExpenseCategory) {
    Alert.alert('Supprimer cette catégorie ?', `"${cat.name}" sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ])
  }

  async function deleteCategory(id: string) {
    if (!user) return
    await supabase.from('expense_categories').delete().eq('id', id).eq('user_id', user.id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  async function saveCategory() {
    if (!user) return
    if (!form.name.trim()) { Alert.alert('Erreur', 'Le nom est requis'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      icon: form.icon.trim() || null,
      color: form.color,
      monthly_budget: form.monthly_budget ? parseFloat(form.monthly_budget) : null,
    }
    if (editingCategory) {
      const { error } = await supabase.from('expense_categories').update(payload).eq('id', editingCategory.id).eq('user_id', user.id)
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      setCategories((prev) => prev.map((c) => c.id === editingCategory.id ? { ...c, ...payload } : c))
    } else {
      const { data, error } = await supabase.from('expense_categories').insert({ user_id: user.id, ...payload }).select().single()
      if (error) { Alert.alert('Erreur', error.message); setSaving(false); return }
      setCategories((prev) => [...prev, data as ExpenseCategory].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setSaving(false)
    setShowModal(false)
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#F5E9AF]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadCategories(); setRefreshing(false) }} />}
      >
        <View className="px-4 py-6 pb-28 gap-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-gray-900">Budgets par catégorie</Text>
            <TouchableOpacity className="w-8 h-8 bg-violet-600 rounded-full items-center justify-center" onPress={openCreate}>
              <Text className="text-white text-xl font-bold leading-none">+</Text>
            </TouchableOpacity>
          </View>

          {categories.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center gap-4">
              <Text className="text-gray-500 text-center">Aucune catégorie configurée</Text>
              <TouchableOpacity
                className={`rounded-xl px-5 py-3 ${initializing ? 'bg-violet-400' : 'bg-violet-600'}`}
                onPress={initializeDefaults}
                disabled={initializing}
              >
                {initializing
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold">Initialiser les catégories par défaut</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => openEdit(cat)}
                onLongPress={() => confirmDelete(cat)}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: resolveColor(cat.color) }}>
                    <Ionicons name="pricetag-outline" size={18} color="white" />
                  </View>
                  <Text className="font-medium text-gray-900 flex-1">{cat.name}</Text>
                  {cat.monthly_budget ? (
                    <Text className="text-gray-700 font-semibold">{cat.monthly_budget.toFixed(0)} €/mois</Text>
                  ) : (
                    <Text className="text-gray-400 text-sm">Pas de budget</Text>
                  )}
                </View>
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
                <Text className="text-xl font-bold text-gray-900">{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Nom *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Loyer"
                    value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Couleur</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {COLOR_SWATCHES.map((swatch) => (
                      <TouchableOpacity
                        key={swatch.hex}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: swatch.hex }}
                        onPress={() => setForm((f) => ({ ...f, color: swatch.hex }))}
                      >
                        {form.color === swatch.hex && <Ionicons name="checkmark" size={16} color="white" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Budget mensuel (€, optionnel)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : 800"
                    value={form.monthly_budget}
                    onChangeText={(v) => setForm((f) => ({ ...f, monthly_budget: v }))}
                    keyboardType="decimal-pad"
                  />
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${saving ? 'bg-violet-400' : 'bg-violet-600'}`}
                  onPress={saveCategory}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">{editingCategory ? 'Enregistrer' : 'Créer la catégorie'}</Text>
                  }
                </TouchableOpacity>

                {editingCategory && (
                  <TouchableOpacity
                    className="rounded-xl py-3.5 items-center border border-red-300 bg-red-50"
                    onPress={() => { setShowModal(false); setTimeout(() => confirmDelete(editingCategory), 300) }}
                  >
                    <Text className="text-red-600 font-medium">Supprimer cette catégorie</Text>
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
