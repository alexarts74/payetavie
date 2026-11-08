import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { requirePlan } from '@/lib/subscription'

interface AnnuaireRecord {
  id: string
  nom: string
  adresse: string
  telephone: string | null
  email: string | null
  horaires: string | null
}

const CATEGORIES = [
  { label: 'Impôts', icon: 'business-outline', types: ['sip', 'centre_impots_foncier'] },
  { label: 'CAF', icon: 'people-outline', types: ['caf'] },
  { label: 'Santé (CPAM)', icon: 'medkit-outline', types: ['cpam'] },
  { label: 'Emploi', icon: 'briefcase-outline', types: ['pole_emploi'] },
  { label: 'URSSAF', icon: 'document-text-outline', types: ['urssaf'] },
  { label: 'Logement (ADIL)', icon: 'home-outline', types: ['adil'] },
  { label: 'Préfecture', icon: 'library-outline', types: ['prefecture', 'sous_prefecture'] },
  { label: 'CROUS', icon: 'school-outline', types: ['crous'] },
]

function parseJsonField(raw: string | null): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const item = parsed[0]
      if (typeof item === 'string') return item
      if (item?.valeur) return item.valeur
      if (item?.numero) return item.numero
    }
    if (typeof parsed === 'string') return parsed
  } catch {
    return raw
  }
  return null
}

export default function AnnuaireScreen() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [codePostal, setCodePostal] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [results, setResults] = useState<AnnuaireRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    requirePlan('essentiel').then(r => setAllowed(r.allowed))
  }, [])

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
        <Text className="text-xl font-semibold text-gray-900 text-center">Fonctionnalité Essentiel</Text>
        <Text className="text-gray-500 text-center mt-2">L'annuaire des administrations est disponible à partir du plan Essentiel.</Text>
        <TouchableOpacity
          className="bg-violet-600 rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.push('/(protected)/pricing')}
        >
          <Text className="text-white font-semibold">Voir les plans</Text>
        </TouchableOpacity>
      </View>
    )
  }

  async function search() {
    if (!codePostal || codePostal.length !== 5 || selectedCategory === null) return
    setLoading(true)
    setSearched(true)
    setResults([])

    const cat = CATEGORIES[selectedCategory]
    const allResults: AnnuaireRecord[] = []

    for (const type of cat.types) {
      try {
        const where = encodeURIComponent(`pivot LIKE "${type}" AND adresse LIKE "${codePostal}"`)
        const url = `https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=${where}&limit=10`
        const res = await fetch(url)
        const json = await res.json()

        for (const r of json.results ?? []) {
          const fields = r
          allResults.push({
            id: fields.id ?? Math.random().toString(),
            nom: fields.nom ?? '',
            adresse: parseJsonField(fields.adresse ? JSON.stringify(fields.adresse) : null) ?? '',
            telephone: parseJsonField(fields.telephone ? JSON.stringify(fields.telephone) : null),
            email: parseJsonField(fields.adresse_courriel ? JSON.stringify(fields.adresse_courriel) : null),
            horaires: parseJsonField(fields.plage_ouverture ? JSON.stringify(fields.plage_ouverture) : null),
          })
        }
      } catch {
        // skip errors per type
      }
    }

    setResults(allResults)
    setLoading(false)
  }

  return (
    <ScrollView className="flex-1 bg-[#F5E9AF]" keyboardShouldPersistTaps="handled">
      <View className="px-4 py-6 pb-28 gap-4">
        {/* Code postal */}
        <View className="bg-white rounded-2xl p-4 shadow-sm gap-2">
          <Text className="font-medium text-gray-900 mb-1">Code postal</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
            placeholder="75001"
            keyboardType="numeric"
            maxLength={5}
            value={codePostal}
            onChangeText={setCodePostal}
          />
        </View>

        {/* Catégories */}
        <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
          <Text className="font-medium text-gray-900">Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {CATEGORIES.map((cat, i) => (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setSelectedCategory(i)}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    selectedCategory === i
                      ? 'bg-[#EBA7CB] border-[#EBA7CB]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Ionicons name={cat.icon as any} size={13} color={selectedCategory === i ? '#235037' : '#235037'} />
                  <Text className={`text-sm font-medium ${selectedCategory === i ? 'text-[#235037]' : 'text-gray-700'}`}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Bouton */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${codePostal.length === 5 && selectedCategory !== null ? 'bg-violet-600' : 'bg-violet-300'}`}
          onPress={search}
          disabled={codePostal.length !== 5 || selectedCategory === null || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Rechercher</Text>
          )}
        </TouchableOpacity>

        {/* Résultats */}
        {searched && !loading && (
          results.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-gray-400">Aucun résultat pour ce code postal</Text>
            </View>
          ) : (
            <View className="gap-3">
              <Text className="text-sm text-gray-500">{results.length} résultat{results.length !== 1 ? 's' : ''}</Text>
              {results.map((r) => (
                <View key={r.id} className="bg-white rounded-2xl p-4 shadow-sm gap-2">
                  <Text className="font-semibold text-gray-900">{r.nom}</Text>
                  {r.adresse ? <View className="flex-row items-start gap-1.5"><Ionicons name="location-outline" size={13} color="#6b7280" style={{ marginTop: 2 }} /><Text className="text-sm text-gray-600 flex-1">{r.adresse}</Text></View> : null}
                  {r.telephone ? <View className="flex-row items-center gap-1.5"><Ionicons name="call-outline" size={13} color="#6b7280" /><Text className="text-sm text-gray-600">{r.telephone}</Text></View> : null}
                  {r.email ? <View className="flex-row items-center gap-1.5"><Ionicons name="mail-outline" size={13} color="#6b7280" /><Text className="text-sm text-gray-600">{r.email}</Text></View> : null}
                  {r.horaires ? <View className="flex-row items-start gap-1.5"><Ionicons name="time-outline" size={13} color="#9ca3af" style={{ marginTop: 2 }} /><Text className="text-sm text-gray-500 flex-1">{r.horaires}</Text></View> : null}
                </View>
              ))}
            </View>
          )
        )}
      </View>
    </ScrollView>
  )
}
