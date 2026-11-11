import { useEffect, useState, type ReactNode } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { requirePlan } from '@/lib/subscription'

interface ProfessionalProfile {
  id?: string
  user_id: string
  business_name: string | null
  siret: string | null
  tva_number: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  iban: string | null
  bic: string | null
  default_payment_terms_days: number | null
  invoice_prefix: string | null
  quotation_prefix: string | null
  hourly_rate: number | null
  is_micro_entrepreneur: boolean
  activity_type: 'services' | 'commerce' | 'mixte'
  urssaf_frequency: 'mensuel' | 'trimestriel'
}

const EMPTY_PROFILE: Omit<ProfessionalProfile, 'user_id'> = {
  business_name: null,
  siret: null,
  tva_number: null,
  address_line1: null,
  address_line2: null,
  postal_code: null,
  city: null,
  iban: null,
  bic: null,
  default_payment_terms_days: 30,
  invoice_prefix: null,
  quotation_prefix: null,
  hourly_rate: null,
  is_micro_entrepreneur: false,
  activity_type: 'services',
  urssaf_frequency: 'trimestriel',
}

export default function ProfilProfessionnelScreen() {
  const { user } = useAuth()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Omit<ProfessionalProfile, 'user_id'>>(EMPTY_PROFILE)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requirePlan('pro').then(r => {
      setAllowed(r.allowed)
      if (r.allowed) loadProfile()
    })
  }, [user])

  async function loadProfile() {
    if (!user) return
    const { data } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setProfile(data as ProfessionalProfile)
      setForm({ ...EMPTY_PROFILE, ...data })
    }
  }

  function openEdit() {
    setForm(profile ? { ...EMPTY_PROFILE, ...profile } : EMPTY_PROFILE)
    setEditing(true)
  }

  async function save() {
    if (!user) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      business_name: form.business_name || null,
      siret: form.siret || null,
      tva_number: form.tva_number || null,
      address_line1: form.address_line1 || null,
      address_line2: form.address_line2 || null,
      postal_code: form.postal_code || null,
      city: form.city || null,
      iban: form.iban || null,
      bic: form.bic || null,
      default_payment_terms_days: form.default_payment_terms_days ?? 30,
      invoice_prefix: form.invoice_prefix || null,
      quotation_prefix: form.quotation_prefix || null,
      hourly_rate: form.hourly_rate,
      is_micro_entrepreneur: form.is_micro_entrepreneur,
      activity_type: form.activity_type,
      urssaf_frequency: form.urssaf_frequency,
    }
    const { data, error } = await supabase
      .from('professional_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()
    setSaving(false)
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setProfile(data as ProfessionalProfile)
    setEditing(false)
  }

  function set(key: keyof Omit<ProfessionalProfile, 'user_id'>, value: string | boolean | number | null) {
    setForm(f => ({ ...f, [key]: value }))
  }

  if (allowed === null) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center">
        <ActivityIndicator size="large" color="#235037" />
      </View>
    )
  }

  if (!allowed) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center px-6">
        <View className="w-20 h-20 bg-violet-50 rounded-full items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={36} color="#235037" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Pro</Text>
        <Text className="text-gray-500 text-center mt-2">Le profil professionnel est disponible avec le plan Pro.</Text>
        <TouchableOpacity
          className="bg-violet-600 rounded-xl px-6 py-3 mt-6"
          onPress={() => router.push('/(protected)/pricing')}
        >
          <Text className="text-white font-semibold">Voir les plans</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const p = profile

  return (
    <>
      <ScrollView className="flex-1 bg-[#F5E9AF]">
        <View className="px-4 py-6 pb-28 gap-5">
          {/* Header */}
          <View className="bg-white rounded-2xl p-5 shadow-sm items-center gap-2">
            <View className="w-16 h-16 bg-violet-50 rounded-2xl items-center justify-center">
              <Ionicons name="business-outline" size={32} color="#235037" />
            </View>
            <Text className="text-xl font-bold text-gray-900">{p?.business_name ?? 'Profil non configuré'}</Text>
            {p?.is_micro_entrepreneur && (
              <View className="bg-orange-100 rounded-full px-3 py-1">
                <Text className="text-orange-700 text-xs font-medium">Micro-entrepreneur — TVA non applicable</Text>
              </View>
            )}
          </View>

          {/* Informations générales */}
          <Section title="Informations générales" rows={[
            { label: 'Nom commercial', value: p?.business_name },
            { label: 'SIRET', value: p?.siret },
            { label: 'N° TVA', value: p?.tva_number },
          ]} />

          {/* Adresse */}
          <Section title="Adresse" rows={[
            { label: 'Adresse', value: [p?.address_line1, p?.address_line2].filter(Boolean).join(', ') || undefined },
            { label: 'Code postal', value: p?.postal_code },
            { label: 'Ville', value: p?.city },
          ]} />

          {/* Paiement */}
          <Section title="Paiement" rows={[
            { label: 'IBAN', value: p?.iban },
            { label: 'BIC', value: p?.bic },
            { label: 'Délai paiement', value: p?.default_payment_terms_days ? `${p.default_payment_terms_days} jours` : undefined },
          ]} />

          {/* Facturation */}
          <Section title="Facturation" rows={[
            { label: 'Préfixe factures', value: p?.invoice_prefix },
            { label: 'Préfixe devis', value: p?.quotation_prefix },
            { label: 'Taux horaire', value: p?.hourly_rate ? `${p.hourly_rate} €/h` : undefined },
          ]} />

          <TouchableOpacity
            className="bg-violet-600 rounded-2xl py-4 items-center"
            onPress={openEdit}
          >
            <Text className="text-white font-semibold">Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#F5E9AF]">
          <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text className="text-blue-600">Annuler</Text>
            </TouchableOpacity>
            <Text className="font-semibold text-gray-900">Profil professionnel</Text>
            <TouchableOpacity onPress={save} disabled={saving}>
              <Text className={saving ? 'text-gray-400' : 'text-blue-600 font-semibold'}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6 gap-6">
              <FormSection title="Informations générales">
                <FormField label="Nom commercial" value={form.business_name ?? ''} onChangeText={v => set('business_name', v)} />
                <FormField label="SIRET" value={form.siret ?? ''} onChangeText={v => set('siret', v)} keyboardType="numeric" />
                <FormField label="N° TVA" value={form.tva_number ?? ''} onChangeText={v => set('tva_number', v)} />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-gray-700">Micro-entrepreneur</Text>
                  <Switch
                    value={form.is_micro_entrepreneur}
                    onValueChange={v => set('is_micro_entrepreneur', v)}
                    trackColor={{ true: '#2563eb' }}
                  />
                </View>
                {form.is_micro_entrepreneur && (
                  <>
                    <View className="gap-1.5">
                      <Text className="text-xs text-gray-500">Type d'activité</Text>
                      <View className="flex-row gap-2 flex-wrap">
                        {(['services', 'commerce', 'mixte'] as const).map(type => (
                          <TouchableOpacity
                            key={type}
                            onPress={() => set('activity_type', type)}
                            className={`px-3 py-1.5 rounded-lg ${form.activity_type === type ? 'bg-violet-600' : 'bg-gray-100'}`}
                          >
                            <Text className={`text-xs font-medium ${form.activity_type === type ? 'text-white' : 'text-gray-600'}`}>
                              {type === 'services' ? 'Services (77 700 €)' : type === 'commerce' ? 'Commerce (188 700 €)' : 'Mixte'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View className="gap-1.5">
                      <Text className="text-xs text-gray-500">Fréquence URSSAF</Text>
                      <View className="flex-row gap-2">
                        {(['trimestriel', 'mensuel'] as const).map(freq => (
                          <TouchableOpacity
                            key={freq}
                            onPress={() => set('urssaf_frequency', freq)}
                            className={`px-3 py-1.5 rounded-lg ${form.urssaf_frequency === freq ? 'bg-violet-600' : 'bg-gray-100'}`}
                          >
                            <Text className={`text-xs font-medium ${form.urssaf_frequency === freq ? 'text-white' : 'text-gray-600'}`}>
                              {freq === 'trimestriel' ? 'Trimestriel' : 'Mensuel'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </FormSection>

              <FormSection title="Adresse">
                <FormField label="Adresse ligne 1" value={form.address_line1 ?? ''} onChangeText={v => set('address_line1', v)} />
                <FormField label="Adresse ligne 2" value={form.address_line2 ?? ''} onChangeText={v => set('address_line2', v)} />
                <FormField label="Code postal" value={form.postal_code ?? ''} onChangeText={v => set('postal_code', v)} keyboardType="numeric" />
                <FormField label="Ville" value={form.city ?? ''} onChangeText={v => set('city', v)} />
              </FormSection>

              <FormSection title="Paiement">
                <FormField label="IBAN" value={form.iban ?? ''} onChangeText={v => set('iban', v)} autoCapitalize="characters" />
                <FormField label="BIC" value={form.bic ?? ''} onChangeText={v => set('bic', v)} autoCapitalize="characters" />
                <FormField
                  label="Délai paiement (jours)"
                  value={form.default_payment_terms_days?.toString() ?? '30'}
                  onChangeText={v => set('default_payment_terms_days', parseInt(v) || 30)}
                  keyboardType="numeric"
                />
              </FormSection>

              <FormSection title="Facturation">
                <FormField label="Préfixe factures" value={form.invoice_prefix ?? ''} onChangeText={v => set('invoice_prefix', v)} placeholder="FAC-" />
                <FormField label="Préfixe devis" value={form.quotation_prefix ?? ''} onChangeText={v => set('quotation_prefix', v)} placeholder="DEV-" />
                <FormField
                  label="Taux horaire (€)"
                  value={form.hourly_rate?.toString() ?? ''}
                  onChangeText={v => set('hourly_rate', parseFloat(v) || null)}
                  keyboardType="decimal-pad"
                />
              </FormSection>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

function Section({ title, rows: rawRows }: { title: string; rows: { label: string; value: string | null | undefined }[] }) {
  const rows = rawRows.filter(r => r.value)
  if (rows.length === 0) return null
  return (
    <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="font-semibold text-gray-900">{title}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={r.label} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
          <Text className="text-xs text-gray-500 mb-0.5">{r.label}</Text>
          <Text className="text-gray-900">{r.value}</Text>
        </View>
      ))}
    </View>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-700 text-sm uppercase tracking-wide px-1">{title}</Text>
      <View className="bg-white rounded-2xl shadow-sm p-4 gap-3">
        {children}
      </View>
    </View>
  )
}

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  autoCapitalize,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'
  placeholder?: string
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-gray-500">{label}</Text>
      <TextInput
        className="bg-gray-100 rounded-xl px-3 py-2.5 text-gray-900"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  )
}
