import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { AIDES, getAidesForProfile } from '@payetavie/shared'
import type { Aide, ProfileType } from '@payetavie/shared'

const CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  logement: { label: 'Logement', color: '#1D4ED8', bg: '#DBEAFE' },
  emploi: { label: 'Emploi', color: '#15803D', bg: '#DCFCE7' },
  sante: { label: 'Santé', color: '#B91C1C', bg: '#FEE2E2' },
  famille: { label: 'Famille', color: '#7E22CE', bg: '#F3E8FF' },
  formation: { label: 'Formation', color: '#B45309', bg: '#FEF3C7' },
  independant: { label: 'Indépendant', color: '#235037', bg: '#EEF7F1' },
}

const PROFILE_LABELS: Record<ProfileType, string> = {
  etudiant: 'Étudiant',
  salarie: 'Salarié',
  independant: 'Indépendant',
  recherche_emploi: 'En recherche d\'emploi',
  autre: 'Autre',
}

export default function AidesScreen() {
  const [profileType, setProfileType] = useState<ProfileType>('autre')
  const [loading, setLoading] = useState(true)
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [expandedAide, setExpandedAide] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('user_preferences')
      .select('profile_type')
      .eq('user_id', user.id)
      .single()
    if (data?.profile_type) {
      setProfileType(data.profile_type as ProfileType)
    }
    setLoading(false)
  }

  const aidesForProfile = getAidesForProfile(profileType)
  const displayedAides = showAll ? AIDES : aidesForProfile
  const filtered = selectedCategorie
    ? displayedAides.filter(a => a.categorie === selectedCategorie)
    : displayedAides

  const categoriesPresentes = Array.from(new Set(displayedAides.map(a => a.categorie)))

  if (loading) {
    return (
      <View className="flex-1 bg-[#F5E9AF] items-center justify-center">
        <ActivityIndicator size="large" color="#235037" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#F5E9AF]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-14 pb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center gap-1.5 bg-[#EEF7F1] border border-[#235037]/20 rounded-full px-3 py-1">
              <Ionicons name="gift-outline" size={12} color="#235037" />
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 10, color: '#235037', letterSpacing: 1, textTransform: 'uppercase' }}>
                Aides & droits
              </Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 26, color: '#235037' }}>
            Vos aides disponibles
          </Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 13, color: '#5A6B61', marginTop: 4 }}>
            {aidesForProfile.length} aide{aidesForProfile.length !== 1 ? 's' : ''} trouvée{aidesForProfile.length !== 1 ? 's' : ''} pour le profil{' '}
            <Text style={{ fontFamily: 'Jost_500Medium', color: '#235037' }}>
              {PROFILE_LABELS[profileType]}
            </Text>
          </Text>
        </View>

        {/* Toggle tous les profils */}
        <View className="px-5 pb-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => { setShowAll(!showAll); setSelectedCategorie(null) }}
          >
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: '#5A6B61' }}>
              {showAll ? 'Mon profil uniquement' : 'Voir toutes les aides'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtres catégories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategorie(null)}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: !selectedCategorie ? '#235037' : '#EEF7F1' }}
          >
            <Text style={{
              fontFamily: 'Jost_500Medium',
              fontSize: 12,
              color: !selectedCategorie ? '#fff' : '#235037',
            }}>
              Toutes ({displayedAides.length})
            </Text>
          </TouchableOpacity>
          {categoriesPresentes.map(cat => {
            const info = CATEGORIES[cat]
            const count = displayedAides.filter(a => a.categorie === cat).length
            const isActive = selectedCategorie === cat
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategorie(isActive ? null : cat)}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: isActive ? info.bg : '#EEF7F1' }}
              >
                <Text style={{
                  fontFamily: 'Jost_500Medium',
                  fontSize: 12,
                  color: isActive ? info.color : '#5A6B61',
                }}>
                  {info.label} ({count})
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Liste des aides */}
        <View className="px-5 gap-3">
          {filtered.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="gift-outline" size={40} color="#5A6B61" />
              <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: '#5A6B61', marginTop: 12, textAlign: 'center' }}>
                Aucune aide dans cette catégorie pour votre profil.
              </Text>
            </View>
          ) : (
            filtered.map(aide => {
              const catInfo = CATEGORIES[aide.categorie]
              const isExpanded = expandedAide === aide.id
              const isEligible = aidesForProfile.some(a => a.id === aide.id)

              return (
                <View
                  key={aide.id}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ opacity: isEligible ? 1 : 0.6 }}
                >
                  <TouchableOpacity
                    className="p-5"
                    onPress={() => setExpandedAide(isExpanded ? null : aide.id)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <View className="flex-row flex-wrap items-center gap-2 mb-2">
                          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: catInfo.bg }}>
                            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 10, color: catInfo.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {catInfo.label}
                            </Text>
                          </View>
                          <View className="rounded-full px-2 py-0.5 bg-[#F5F5F5]">
                            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 10, color: '#5A6B61' }}>
                              {aide.organisme}
                            </Text>
                          </View>
                          {!isEligible && (
                            <View className="rounded-full px-2 py-0.5 bg-amber-50">
                              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 10, color: '#D97706' }}>
                                Autre profil
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 14, color: '#1a2e22', lineHeight: 20 }}>
                          {aide.titre}
                        </Text>
                        {aide.montantMax && (
                          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: '#235037', marginTop: 4 }}>
                            {aide.montantMax}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#5A6B61"
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="px-5 pb-5" style={{ borderTopWidth: 1, borderTopColor: '#E8E8E8' }}>
                      <Text style={{ fontFamily: 'Jost_300Light', fontSize: 13, color: '#5A6B61', marginTop: 16, marginBottom: 12, lineHeight: 20 }}>
                        {aide.description}
                      </Text>

                      {aide.conditions.length > 0 && (
                        <View className="mb-4">
                          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 11, color: '#1a2e22', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Conditions
                          </Text>
                          {aide.conditions.map((cond, i) => (
                            <View key={i} className="flex-row items-start gap-2 mb-1.5">
                              <View className="w-1.5 h-1.5 rounded-full bg-[#235037] mt-1.5 flex-shrink-0" />
                              <Text style={{ fontFamily: 'Jost_300Light', fontSize: 12, color: '#5A6B61', flex: 1 }}>
                                {cond}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {aide.url && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(aide.url!)}
                          className="flex-row items-center gap-1.5"
                        >
                          <Ionicons name="open-outline" size={14} color="#235037" />
                          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: '#235037' }}>
                            Accéder au site officiel
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}
