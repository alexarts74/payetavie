import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Client } from '@payetavie/shared'

interface ClientForm {
  company_name: string
  contact_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  siret: string
  payment_terms_days: string
  notes: string
}

function clientToForm(c: Client): ClientForm {
  return {
    company_name: c.company_name ?? '',
    contact_name: c.contact_name ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    address_line1: c.address_line1 ?? '',
    address_line2: c.address_line2 ?? '',
    city: c.city ?? '',
    postal_code: c.postal_code ?? '',
    siret: c.siret ?? '',
    payment_terms_days: String(c.payment_terms_days ?? 30),
    notes: c.notes ?? '',
  }
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [client, setClient] = useState<Client | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ClientForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setClient(data as Client)
        navigation.setOptions({
          title: data.company_name,
          headerRight: () => (
            <TouchableOpacity onPress={() => { setForm(clientToForm(data as Client)); setEditing(true) }} className="mr-4">
              <Text className="text-white font-medium">Modifier</Text>
            </TouchableOpacity>
          ),
        })
      }
    })
  }, [id, user])

  async function toggleActive() {
    if (!client || !user) return
    setToggling(true)
    const { data, error } = await supabase
      .from('clients')
      .update({ is_active: !client.is_active })
      .eq('id', client.id)
      .eq('user_id', user.id)
      .select()
      .single()
    setToggling(false)
    if (!error && data) setClient(data as Client)
  }

  async function saveEdit() {
    if (!client || !user || !form) return
    setSaving(true)
    const { data, error } = await supabase
      .from('clients')
      .update({
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address_line1: form.address_line1.trim() || null,
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        siret: form.siret.trim() || null,
        payment_terms_days: parseInt(form.payment_terms_days) || 30,
        notes: form.notes.trim() || null,
      })
      .eq('id', client.id)
      .eq('user_id', user.id)
      .select()
      .single()
    setSaving(false)
    if (error) { Alert.alert('Erreur', error.message); return }
    const updated = data as Client
    setClient(updated)
    navigation.setOptions({ title: updated.company_name })
    setEditing(false)
  }

  function set(key: keyof ClientForm, value: string) {
    setForm(f => f ? { ...f, [key]: value } : f)
  }

  if (!client) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    )
  }

  const fields = [
    { label: 'Entreprise', value: client.company_name },
    { label: 'Contact', value: client.contact_name },
    { label: 'Email', value: client.email },
    { label: 'Téléphone', value: client.phone },
    { label: 'Adresse', value: [client.address_line1, client.address_line2, client.postal_code, client.city].filter(Boolean).join(', ') },
    { label: 'SIRET', value: client.siret },
    { label: 'Délai de paiement', value: `${client.payment_terms_days} jours` },
    { label: 'Notes', value: client.notes },
  ]

  return (
    <>
      <ScrollView className="flex-1 bg-[#F5E9AF]">
        <View className="px-4 py-6 pb-28 gap-4">
          <View className="items-center py-2">
            <View className="w-16 h-16 rounded-2xl bg-violet-100 items-center justify-center mb-2">
              <Ionicons name="people-outline" size={28} color="#235037" />
            </View>
            <Text className="text-xl font-bold text-gray-900">{client.company_name}</Text>
            <View className={`rounded-full px-3 py-1 mt-1 ${client.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-sm font-medium ${client.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                {client.is_active ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {fields.filter((f) => f.value).map((field, i) => (
              <View key={field.label} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <Text className="text-xs text-gray-500 mb-0.5">{field.label}</Text>
                <Text className="text-gray-900">{field.value}</Text>
              </View>
            ))}
          </View>

          {/* Toggle actif/inactif */}
          <TouchableOpacity
            className={`rounded-2xl py-3 items-center ${client.is_active ? 'bg-gray-200' : 'bg-green-100'}`}
            onPress={toggleActive}
            disabled={toggling}
          >
            <Text className={`font-medium ${client.is_active ? 'text-gray-700' : 'text-green-700'}`}>
              {toggling ? '...' : client.is_active ? 'Désactiver ce client' : 'Réactiver ce client'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal édition */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#F5E9AF]">
          <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text className="text-violet-600">Annuler</Text>
            </TouchableOpacity>
            <Text className="font-semibold text-gray-900">Modifier le client</Text>
            <TouchableOpacity onPress={saveEdit} disabled={saving || !form?.company_name.trim()}>
              <Text className={saving || !form?.company_name.trim() ? 'text-gray-400' : 'text-violet-600 font-semibold'}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
          {form && (
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
              <View className="px-4 py-6 gap-4">
                <ClientFormField label="Nom de l'entreprise *" value={form.company_name} onChangeText={v => set('company_name', v)} />
                <ClientFormField label="Contact" value={form.contact_name} onChangeText={v => set('contact_name', v)} />
                <ClientFormField label="Email" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
                <ClientFormField label="Téléphone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
                <ClientFormField label="Adresse ligne 1" value={form.address_line1} onChangeText={v => set('address_line1', v)} />
                <ClientFormField label="Adresse ligne 2" value={form.address_line2} onChangeText={v => set('address_line2', v)} />
                <ClientFormField label="Ville" value={form.city} onChangeText={v => set('city', v)} />
                <ClientFormField label="Code postal" value={form.postal_code} onChangeText={v => set('postal_code', v)} keyboardType="numeric" />
                <ClientFormField label="SIRET" value={form.siret} onChangeText={v => set('siret', v)} keyboardType="numeric" />
                <ClientFormField label="Délai de paiement (jours)" value={form.payment_terms_days} onChangeText={v => set('payment_terms_days', v)} keyboardType="numeric" />
                <ClientFormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline />
              </View>
            </ScrollView>
          )}
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
