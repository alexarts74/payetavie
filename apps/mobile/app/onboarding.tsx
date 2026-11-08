import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicsForProfile, ALL_TOPIC_SLUGS, topicMap } from '@payetavie/shared'
import type { ProfileType } from '@payetavie/shared'

const GREEN = '#235037'
const SURFACE = '#F5E9AF'
const ACCENT = '#EBA7CB'
const ACCENT_LIGHT = '#FDEEF6'

type Step = 0 | 1 | 2 | 3

const PROFILE_OPTIONS: { type: ProfileType; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'etudiant',        label: 'Étudiant(e)',           description: 'En cours d'études',               icon: 'school-outline' },
  { type: 'salarie',         label: 'Salarié(e)',            description: 'Emploi avec contrat de travail',   icon: 'briefcase-outline' },
  { type: 'independant',     label: 'Indépendant(e)',        description: 'Freelance, auto-entrepreneur',     icon: 'rocket-outline' },
  { type: 'recherche_emploi', label: 'En recherche d\'emploi', description: 'Demandeur d\'emploi, en transition', icon: 'search-outline' },
  { type: 'autre',           label: 'Autre',                 description: 'Retraité(e), parent au foyer…',   icon: 'person-outline' },
]

const TOPIC_CATEGORIES = [
  { label: 'Administratif & Travail', slugs: ['impots', 'urssaf', 'fiches-de-paie', 'caf', 'assurances'] },
  { label: 'Santé', slugs: ['mutuelle', 'medecin-generaliste', 'pharmacie', 'analyses-medicales'] },
  { label: 'Logement', slugs: ['logement'] },
  { label: 'Freelance', slugs: ['freelance-clients', 'freelance-facturation'] },
]

function ProgressDots({ step }: { step: Step }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {([0, 1, 2, 3] as Step[]).map((i) => (
        <View
          key={i}
          style={{
            width: i === step ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === step ? GREEN : 'rgba(35,80,55,0.2)',
          }}
        />
      ))}
    </View>
  )
}

export default function OnboardingScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>(0)
  const [profileType, setProfileType] = useState<ProfileType | null>(null)
  const [birthDate, setBirthDate] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [additionalTopics, setAdditionalTopics] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const baseTopics = profileType ? getTopicsForProfile(profileType) : []
  const allSelectedTopics = [...new Set([...baseTopics, ...additionalTopics])]

  function toggleAdditionalTopic(slug: string) {
    if (baseTopics.includes(slug)) return
    setAdditionalTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function completeOnboarding() {
    if (!user) return
    setSaving(true)
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      profile_type: profileType ?? 'autre',
      selected_topics: allSelectedTopics,
      onboarding_completed: true,
      birth_date: birthDate || null,
      postal_code: postalCode || null,
    })
    setSaving(false)
    router.replace('/(protected)/dashboard')
  }

  async function skipOnboarding() {
    if (!user) return
    setSaving(true)
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      profile_type: 'autre',
      selected_topics: ALL_TOPIC_SLUGS,
      onboarding_completed: true,
    })
    setSaving(false)
    router.replace('/(protected)/dashboard')
  }

  // ── Step 0 — Bienvenue ──────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: SURFACE, paddingTop: insets.top }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
          {/* Logo / branding */}
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Ionicons name="leaf" size={36} color={SURFACE} />
            </View>
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 32, color: GREEN, textAlign: 'center', lineHeight: 40 }}>
              {'Bienvenue sur\nPayeTaVie'}
            </Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10, lineHeight: 24 }}>
              Ton assistant administratif personnel
            </Text>
          </View>

          {/* Feature cards */}
          <View style={{ gap: 12, marginBottom: 40 }}>
            {[
              { icon: 'book-outline' as const,      title: 'Guides & checklists',   desc: 'Des étapes claires pour chaque démarche administrative' },
              { icon: 'document-outline' as const,  title: 'Stockage de documents', desc: 'Centralise tes documents importants en un seul endroit' },
              { icon: 'notifications-outline' as const, title: 'Rappels & agenda',  desc: 'Ne rate plus aucune échéance importante' },
            ].map((f) => (
              <View
                key={f.icon}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 16,
                  backgroundColor: 'white', borderRadius: 16, padding: 16,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: ACCENT_LIGHT, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ionicons name={f.icon} size={22} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 15, color: GREEN }}>{f.title}</Text>
                  <Text style={{ fontFamily: 'Jost_300Light', fontSize: 13, color: '#777', lineHeight: 18, marginTop: 2 }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={{ backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
            onPress={() => setStep(1)}
          >
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Commencer</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  // ── Step 1 — Profil ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: SURFACE }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingTop: insets.top + 20, marginBottom: 24 }}>
            <ProgressDots step={step} />
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 28, color: GREEN, marginTop: 20, lineHeight: 36 }}>
              Quel est{'\n'}ton profil ?
            </Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: '#666', marginTop: 6 }}>
              Nous personnaliserons tes sujets en fonction de ta situation.
            </Text>
          </View>

          {/* Profile cards */}
          <View style={{ gap: 10, marginBottom: 20 }}>
            {PROFILE_OPTIONS.map((opt) => {
              const isSelected = profileType === opt.type
              return (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => setProfileType(opt.type)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    backgroundColor: isSelected ? GREEN : 'white',
                    borderRadius: 16, padding: 16,
                    borderWidth: 2, borderColor: isSelected ? GREEN : 'transparent',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    backgroundColor: isSelected ? 'rgba(245,233,175,0.2)' : ACCENT_LIGHT,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={opt.icon} size={22} color={isSelected ? SURFACE : GREEN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 15, color: isSelected ? 'white' : GREEN }}>{opt.label}</Text>
                    <Text style={{ fontFamily: 'Jost_300Light', fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.75)' : '#888', marginTop: 2 }}>{opt.description}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={22} color={SURFACE} />}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Optional personal info */}
          <TouchableOpacity
            onPress={() => setShowPersonalInfo((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginBottom: 4 }}
          >
            <Ionicons name={showPersonalInfo ? 'chevron-down' : 'chevron-forward'} size={16} color={GREEN} />
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 14, color: GREEN }}>Infos personnelles (optionnel)</Text>
          </TouchableOpacity>

          {showPersonalInfo && (
            <View style={{ gap: 12, marginBottom: 16, backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
              <View>
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: '#555', marginBottom: 6 }}>Date de naissance</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111', backgroundColor: '#FAFAFA' }}
                  placeholder="JJ/MM/AAAA"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  keyboardType="numeric"
                />
              </View>
              <View>
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: '#555', marginBottom: 6 }}>Code postal</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111', backgroundColor: '#FAFAFA' }}
                  placeholder="75001"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={{ gap: 10, marginTop: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: profileType ? GREEN : 'rgba(35,80,55,0.35)',
                borderRadius: 16, paddingVertical: 16, alignItems: 'center',
              }}
              onPress={() => profileType && setStep(2)}
              disabled={!profileType}
            >
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Continuer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
              onPress={skipOnboarding}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={GREEN} />
                : <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: '#888' }}>Passer</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ── Step 2 — Topics ─────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <View style={{ flex: 1, backgroundColor: SURFACE, paddingTop: insets.top }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}>
          <View style={{ paddingTop: 20, marginBottom: 24 }}>
            <ProgressDots step={step} />
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 28, color: GREEN, marginTop: 20, lineHeight: 36 }}>
              Personnalise{'\n'}tes sujets
            </Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: '#666', marginTop: 6 }}>
              Les sujets de ton profil sont déjà ajoutés. Tu peux en ajouter d'autres.
            </Text>
          </View>

          {TOPIC_CATEGORIES.map((cat) => (
            <View key={cat.label} style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: '#888', letterSpacing: 0.5, marginBottom: 8 }}>
                {cat.label.toUpperCase()}
              </Text>
              <View style={{ gap: 8 }}>
                {cat.slugs.map((slug) => {
                  const isBase = baseTopics.includes(slug)
                  const isExtra = additionalTopics.includes(slug)
                  const isActive = isBase || isExtra
                  const topic = topicMap[slug]
                  return (
                    <TouchableOpacity
                      key={slug}
                      onPress={() => !isBase && toggleAdditionalTopic(slug)}
                      activeOpacity={isBase ? 1 : 0.7}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: isBase ? 'rgba(35,80,55,0.08)' : isExtra ? ACCENT_LIGHT : 'white',
                        borderRadius: 14, padding: 14,
                        borderWidth: 1.5,
                        borderColor: isBase ? 'rgba(35,80,55,0.2)' : isExtra ? ACCENT : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{topic?.icon ?? '📄'}</Text>
                      <Text style={{ flex: 1, fontFamily: 'Jost_500Medium', fontSize: 14, color: isActive ? GREEN : '#555' }}>
                        {topic?.title ?? slug}
                      </Text>
                      {isBase && (
                        <View style={{ backgroundColor: 'rgba(35,80,55,0.12)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 11, color: GREEN }}>Inclus</Text>
                        </View>
                      )}
                      {isExtra && <Ionicons name="checkmark-circle" size={20} color={GREEN} />}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Fixed bottom buttons */}
        <View style={{ position: 'absolute', bottom: insets.bottom + 16, left: 24, right: 24, gap: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
            onPress={() => setStep(3)}
          >
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Continuer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}
            onPress={() => setStep(1)}
          >
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: '#888' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── Step 3 — Résumé ─────────────────────────────────────────────────────────
  const profileOption = PROFILE_OPTIONS.find((p) => p.type === profileType)
  const nonFreelanceTopics = allSelectedTopics.filter((s) => !s.startsWith('freelance-'))
  const freelanceTopics = allSelectedTopics.filter((s) => s.startsWith('freelance-'))

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}>
        <View style={{ paddingTop: 20, marginBottom: 32 }}>
          <ProgressDots step={step} />
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 28, color: GREEN, marginTop: 20, lineHeight: 36 }}>
            {'Prêt(e) à\ncommencer !'}
          </Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: '#666', marginTop: 6 }}>
            Voici un résumé de ta configuration.
          </Text>
        </View>

        {/* Summary card */}
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 }}>
          {/* Profile */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: ACCENT_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={profileOption?.icon ?? 'person-outline'} size={24} color={GREEN} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Jost_300Light', fontSize: 12, color: '#888' }}>Profil</Text>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: GREEN }}>{profileOption?.label ?? 'Autre'}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />

          {/* Topics */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="grid-outline" size={18} color={GREEN} />
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 14, color: GREEN }}>
                {allSelectedTopics.length} sujet{allSelectedTopics.length > 1 ? 's' : ''} sélectionné{allSelectedTopics.length > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {nonFreelanceTopics.map((slug) => (
                <View key={slug} style={{ backgroundColor: ACCENT_LIGHT, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: GREEN }}>{topicMap[slug]?.title ?? slug}</Text>
                </View>
              ))}
              {freelanceTopics.map((slug) => (
                <View key={slug} style={{ backgroundColor: 'rgba(35,80,55,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: GREEN }}>{topicMap[slug]?.title ?? slug}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom buttons */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 16, left: 24, right: 24, gap: 10 }}>
        <TouchableOpacity
          style={{
            backgroundColor: saving ? 'rgba(35,80,55,0.5)' : GREEN,
            borderRadius: 16, paddingVertical: 16, alignItems: 'center',
            flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}
          onPress={completeOnboarding}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : (
              <>
                <Ionicons name="sparkles" size={18} color="white" />
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Lancer mon espace</Text>
              </>
            )
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}
          onPress={() => setStep(2)}
          disabled={saving}
        >
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: '#888' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
