import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, useNavigation } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { requirePlan } from '@/lib/subscription'
import type { Client } from '@payetavie/shared'

interface ClientForm {
  company_name: string
  contact_name: string
  email: string
  phone: string
  address_line1: string
  city: string
  postal_code: string
  siret: string
  payment_terms_days: string
  notes: string
}

const EMPTY_FORM: ClientForm = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  address_line1: '',
  city: '',
  postal_code: '',
  siret: '',
  payment_terms_days: '30',
  notes: '',
}

export default function ClientsScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [clients, setClients] = useState<Client[]>([])
  const [allowed, setAllowed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requirePlan('pro').then((result) => {
      setAllowed(result.allowed)
      if (result.allowed) loadClients()
    })
  }, [user])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => { setForm(EMPTY_FORM); setCreating(true) }} className="mr-4">
          <Text className="text-white text-2xl font-light">+</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  async function loadClients() {
    if (!user) return
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('company_name')
    setClients(data ?? [])
  }

  async function createClient() {
    if (!user || !form.company_name.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address_line1: form.address_line1.trim() || null,
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        siret: form.siret.trim() || null,
        payment_terms_days: parseInt(form.payment_terms_days) || 30,
        notes: form.notes.trim() || null,
        is_active: true,
      })
      .select()
      .single()
    setSaving(false)
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setClients(prev => [...prev, data as Client].sort((a, b) => a.company_name.localeCompare(b.company_name)))
    setCreating(false)
  }

  function set(key: keyof ClientForm, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  if (!allowed) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center px-6">
        <View className="w-20 h-20 bg-violet-50 rounded-full items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={36} color="#235037" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Pro</Text>
        <Text className="text-gray-500 text-center mt-2">La gestion des clients est disponible avec le plan Pro.</Text>
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
    <>
      <ScrollView
        className="flex-1 bg-[#F5E9AF]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadClients(); setRefreshing(false) }} />}
      >
        <View className="px-4 py-6 pb-28 gap-3">
          <Text className="text-lg font-semibold text-gray-900">Clients</Text>
          {clients.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-gray-500">Aucun client enregistré</Text>
            </View>
          ) : (
            clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => router.push(`/(protected)/freelance/clients/${client.id}`)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{client.company_name}</Text>
                    {client.contact_name && <Text className="text-sm text-gray-500">{client.contact_name}</Text>}
                    {client.email && <Text className="text-sm text-gray-500">{client.email}</Text>}
                  </View>
                  <View className="items-end gap-1">
                    <View className={`rounded-full px-2 py-0.5 ${client.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Text className={`text-xs font-medium ${client.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                        {client.is_active ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                    <Text className="text-gray-400">›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal création */}
      <Modal visible={creating} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#F5E9AF]">
          <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => setCreating(false)}>
              <Text className="text-violet-600">Annuler</Text>
            </TouchableOpacity>
            <Text className="font-semibold text-gray-900">Nouveau client</Text>
            <TouchableOpacity onPress={createClient} disabled={saving || !form.company_name.trim()}>
              <Text className={saving || !form.company_name.trim() ? 'text-gray-400' : 'text-violet-600 font-semibold'}>
                {saving ? 'Création...' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6 gap-4">
              <ClientFormField label="Nom de l'entreprise *" value={form.company_name} onChangeText={v => set('company_name', v)} />
              <ClientFormField label="Contact" value={form.contact_name} onChangeText={v => set('contact_name', v)} />
              <ClientFormField label="Email" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
              <ClientFormField label="Téléphone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
              <ClientFormField label="Adresse" value={form.address_line1} onChangeText={v => set('address_line1', v)} />
              <ClientFormField label="Ville" value={form.city} onChangeText={v => set('city', v)} />
              <ClientFormField label="Code postal" value={form.postal_code} onChangeText={v => set('postal_code', v)} keyboardType="numeric" />
              <ClientFormField label="SIRET" value={form.siret} onChangeText={v => set('siret', v)} keyboardType="numeric" />
              <ClientFormField label="Délai de paiement (jours)" value={form.payment_terms_days} onChangeText={v => set('payment_terms_days', v)} keyboardType="numeric" />
              <ClientFormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

function ClientFormField({
  label, value, onChangeText, keyboardType, autoCapitalize, multiline,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  multiline?: boolean
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-gray-500">{label}</Text>
      <TextInput
        className="bg-white rounded-xl px-3 py-2.5 text-gray-900 shadow-sm"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        multiline={multiline}
        style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : undefined}
      />
    </View>
  )
}
