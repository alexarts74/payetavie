import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions,
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
const { height: SCREEN_H } = Dimensions.get('window')

type Step = 0 | 1 | 2 | 3

const PROFILE_OPTIONS: { type: ProfileType; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'etudiant',         label: 'Étudiant(e)',              description: "En cours d'études",                icon: 'school-outline' },
  { type: 'salarie',          label: 'Salarié(e)',               description: 'Emploi avec contrat de travail',   icon: 'briefcase-outline' },
  { type: 'independant',      label: 'Indépendant(e)',           description: 'Freelance, auto-entrepreneur',     icon: 'rocket-outline' },
  { type: 'recherche_emploi', label: "En recherche d'emploi",    description: 'Demandeur d\'emploi, en transition', icon: 'search-outline' },
  { type: 'autre',            label: 'Autre',                    description: 'Retraité(e), parent au foyer…',    icon: 'person-outline' },
]

const TOPIC_CATEGORIES = [
  { label: 'Administratif & Travail', slugs: ['impots', 'fiches-de-paie', 'assurances'] },
  { label: 'Santé', slugs: ['mutuelle', 'sante'] },
  { label: 'Logement', slugs: ['logement'] },
  { label: 'Independant', slugs: ['urssaf', 'freelance-clients', 'freelance-facturation'] },
]

function ProgressDots({ step }: { step: Step }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {([0, 1, 2, 3] as Step[]).map((i) => (
        <View
          key={i}
          style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            backgroundColor: i === step ? GREEN : i < step ? 'rgba(35,80,55,0.3)' : 'rgba(35,80,55,0.15)',
          }}
        />
      ))}
    </View>
  )
}

function useStepAnimation() {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [])

  return { fadeAnim, slideAnim }
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

  // Blob animation (shared, persistent)
  const blobAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(blobAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start()
  }, [])
  const blobY = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -16] })
  const blobX = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })

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

  const Blobs = () => (
    <>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: ACCENT, opacity: 0.3, transform: [{ translateY: blobY }, { translateX: blobX }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 80, right: 20, width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN, opacity: 0.07, transform: [{ translateY: blobY }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: SCREEN_H * 0.3, left: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: GREEN, opacity: 0.06, transform: [{ translateY: blobY }] }} />
    </>
  )

  // ── Step 0 — Bienvenue ──────────────────────────────────────────────────────
  if (step === 0) return <Step0 insets={insets} blobY={blobY} blobX={blobX} onNext={() => setStep(1)} />

  // ── Step 1 — Profil ─────────────────────────────────────────────────────────
  if (step === 1) return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      <Blobs />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Step1Content
        insets={insets}
        profileType={profileType}
        setProfileType={setProfileType}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        showPersonalInfo={showPersonalInfo}
        setShowPersonalInfo={setShowPersonalInfo}
        saving={saving}
        onContinue={() => setStep(2)}
        onSkip={skipOnboarding}
      />
      </KeyboardAvoidingView>
    </View>
  )

  // ── Step 2 — Topics ─────────────────────────────────────────────────────────
  if (step === 2) return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      <Blobs />
      <Step2Content
        insets={insets}
        baseTopics={baseTopics}
        additionalTopics={additionalTopics}
        toggleAdditionalTopic={toggleAdditionalTopic}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
      />
    </View>
  )

  // ── Step 3 — Résumé ─────────────────────────────────────────────────────────
  const profileOption = PROFILE_OPTIONS.find((p) => p.type === profileType)
  const nonFreelanceTopics = allSelectedTopics.filter((s) => !s.startsWith('freelance-'))
  const freelanceTopics = allSelectedTopics.filter((s) => s.startsWith('freelance-'))

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      <Blobs />
      <Step3Content
        insets={insets}
        profileOption={profileOption}
        allSelectedTopics={allSelectedTopics}
        nonFreelanceTopics={nonFreelanceTopics}
        freelanceTopics={freelanceTopics}
        saving={saving}
        onComplete={completeOnboarding}
        onBack={() => setStep(2)}
      />
    </View>
  )
}

// ── Composants par étape ─────────────────────────────────────────────────────

function Step0({ insets, blobY, blobX, onNext }: { insets: any; blobY: Animated.AnimatedInterpolation<string | number>; blobX: Animated.AnimatedInterpolation<string | number>; onNext: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const logoScale = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start()
  }, [])

  const features = [
    { icon: 'book-outline' as const,          title: 'Guides & checklists',    desc: 'Des étapes claires pour chaque démarche administrative' },
    { icon: 'document-outline' as const,      title: 'Stockage de documents',  desc: 'Centralise tes documents importants en un seul endroit' },
    { icon: 'notifications-outline' as const, title: 'Rappels & agenda',       desc: 'Ne rate plus aucune échéance importante' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE, paddingTop: insets.top }}>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: ACCENT, opacity: 0.3, transform: [{ translateY: blobY }, { translateX: blobX }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 160, left: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: GREEN, opacity: 0.06, transform: [{ translateY: blobY }] }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Animated.View style={{ alignItems: 'center', marginTop: 56, marginBottom: 44, opacity: fadeAnim, transform: [{ scale: logoScale }] }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 22, shadowColor: GREEN, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
            <Ionicons name="leaf" size={38} color={SURFACE} />
          </View>
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 36, color: GREEN, letterSpacing: -0.5 }}>PayeTaVie</Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 16, color: 'rgba(35,80,55,0.6)', marginTop: 6, textAlign: 'center' }}>
            Ton assistant administratif personnel
          </Text>
        </Animated.View>

        {/* Feature cards */}
        <Animated.View style={{ gap: 12, marginBottom: 40, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {features.map((f, i) => (
            <Animated.View
              key={f.icon}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 16,
                backgroundColor: 'white', borderRadius: 20, padding: 18,
                shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
                opacity: fadeAnim,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: i === 0 ? ACCENT_LIGHT : i === 1 ? 'rgba(35,80,55,0.08)' : '#FFF8E7', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ionicons name={f.icon} size={23} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 15, color: GREEN }}>{f.title}</Text>
                <Text style={{ fontFamily: 'Jost_300Light', fontSize: 13, color: '#888', lineHeight: 18, marginTop: 2 }}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={{ backgroundColor: GREEN, borderRadius: 18, paddingVertical: 17, alignItems: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 }}
            onPress={onNext} activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 17, color: 'white', letterSpacing: 0.2 }}>Commencer</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

function Step1Content({ insets, profileType, setProfileType, birthDate, setBirthDate, postalCode, setPostalCode, showPersonalInfo, setShowPersonalInfo, saving, onContinue, onSkip }: any) {
  const { fadeAnim, slideAnim } = useStepAnimation()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Animated.View style={{ paddingTop: insets.top + 24, marginBottom: 24, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ProgressDots step={1} />
        <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 30, color: GREEN, marginTop: 20, lineHeight: 38 }}>
          {'Quel est\nton profil ?'}
        </Text>
        <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: 'rgba(35,80,55,0.65)', marginTop: 8, lineHeight: 20 }}>
          Nous personnaliserons tes sujets en fonction de ta situation.
        </Text>
      </Animated.View>

      <Animated.View style={{ gap: 10, marginBottom: 20, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {PROFILE_OPTIONS.map((opt) => {
          const isSelected = profileType === opt.type
          return (
            <TouchableOpacity
              key={opt.type}
              onPress={() => setProfileType(opt.type)}
              activeOpacity={0.8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: isSelected ? GREEN : 'white', borderRadius: 18, padding: 16, shadowColor: isSelected ? GREEN : '#000', shadowOffset: { width: 0, height: isSelected ? 4 : 1 }, shadowOpacity: isSelected ? 0.2 : 0.05, shadowRadius: isSelected ? 10 : 4, elevation: isSelected ? 5 : 2 }}
            >
              <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: isSelected ? 'rgba(245,233,175,0.15)' : ACCENT_LIGHT, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ionicons name={opt.icon} size={22} color={isSelected ? SURFACE : GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 15, color: isSelected ? 'white' : GREEN }}>{opt.label}</Text>
                <Text style={{ fontFamily: 'Jost_300Light', fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.7)' : '#999', marginTop: 2 }}>{opt.description}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={SURFACE} />}
            </TouchableOpacity>
          )
        })}
      </Animated.View>

      {/* Infos personnelles */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity onPress={() => setShowPersonalInfo((v: boolean) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginBottom: 4 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(35,80,55,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={showPersonalInfo ? 'chevron-down' : 'chevron-forward'} size={14} color={GREEN} />
          </View>
          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 14, color: GREEN }}>Infos personnelles (optionnel)</Text>
        </TouchableOpacity>

        {showPersonalInfo && (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 18, gap: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Date de naissance</Text>
              <TextInput style={{ borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111', backgroundColor: '#FAFAFA' }} placeholder="JJ/MM/AAAA" placeholderTextColor="#BBB" value={birthDate} onChangeText={setBirthDate} keyboardType="numeric" />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Code postal</Text>
              <TextInput style={{ borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111', backgroundColor: '#FAFAFA' }} placeholder="75001" placeholderTextColor="#BBB" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" maxLength={5} />
            </View>
          </View>
        )}

        <View style={{ gap: 10, marginTop: 4 }}>
          <TouchableOpacity style={{ backgroundColor: profileType ? GREEN : 'rgba(35,80,55,0.3)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: profileType ? 0.25 : 0, shadowRadius: 10, elevation: profileType ? 4 : 0 }} onPress={() => profileType && onContinue()} disabled={!profileType} activeOpacity={0.85}>
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Continuer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ borderRadius: 16, paddingVertical: 13, alignItems: 'center' }} onPress={onSkip} disabled={saving}>
            {saving ? <ActivityIndicator color={GREEN} /> : <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.5)' }}>Passer</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

function Step2Content({ insets, baseTopics, additionalTopics, toggleAdditionalTopic, onBack, onNext }: any) {
  const { fadeAnim, slideAnim } = useStepAnimation()

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ marginBottom: 24, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <ProgressDots step={2} />
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 30, color: GREEN, marginTop: 20, lineHeight: 38 }}>
            {'Personnalise\ntes sujets'}
          </Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: 'rgba(35,80,55,0.65)', marginTop: 8, lineHeight: 20 }}>
            Les sujets de ton profil sont déjà ajoutés. Tu peux en ajouter d'autres.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {TOPIC_CATEGORIES.map((cat) => (
            <View key={cat.label} style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 11, color: 'rgba(35,80,55,0.5)', letterSpacing: 1, marginBottom: 10 }}>
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
                      activeOpacity={isBase ? 1 : 0.75}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isBase ? 'rgba(35,80,55,0.07)' : isExtra ? ACCENT_LIGHT : 'white', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: isBase ? 'rgba(35,80,55,0.18)' : isExtra ? ACCENT : 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
                    >
                      <Text style={{ fontSize: 20 }}>{topic?.icon ?? '📄'}</Text>
                      <Text style={{ flex: 1, fontFamily: 'Jost_500Medium', fontSize: 14, color: isActive ? GREEN : '#666' }}>
                        {topic?.title ?? slug}
                      </Text>
                      {isBase ? (
                        <View style={{ backgroundColor: 'rgba(35,80,55,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 11, color: GREEN }}>Inclus</Text>
                        </View>
                      ) : isExtra ? (
                        <Ionicons name="checkmark-circle" size={20} color={GREEN} />
                      ) : (
                        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#DDD' }} />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Fixed buttons */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 16, left: 24, right: 24, gap: 10 }}>
        <TouchableOpacity style={{ backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 }} onPress={onNext} activeOpacity={0.85}>
          <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Continuer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderRadius: 16, paddingVertical: 12, alignItems: 'center' }} onPress={onBack}>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.5)' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

function Step3Content({ insets, profileOption, allSelectedTopics, nonFreelanceTopics, freelanceTopics, saving, onComplete, onBack }: any) {
  const { fadeAnim, slideAnim } = useStepAnimation()
  const checkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(checkScale, { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }).start()
    }, 300)
  }, [])

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ marginBottom: 32, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <ProgressDots step={3} />
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 30, color: GREEN, marginTop: 20, lineHeight: 38 }}>
            {'Prêt(e) à\ncommencer !'}
          </Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: 'rgba(35,80,55,0.65)', marginTop: 8 }}>
            Voici un résumé de ta configuration.
          </Text>
        </Animated.View>

        {/* Icône succès animée */}
        <Animated.View style={{ alignItems: 'center', marginBottom: 28, transform: [{ scale: checkScale }] }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
            <Ionicons name="checkmark" size={40} color={SURFACE} />
          </View>
        </Animated.View>

        {/* Carte récap */}
        <Animated.View style={{ backgroundColor: 'white', borderRadius: 24, padding: 22, gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 4, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Profil */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: ACCENT_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={profileOption?.icon ?? 'person-outline'} size={24} color={GREEN} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Jost_300Light', fontSize: 12, color: '#AAA', letterSpacing: 0.5 }}>PROFIL</Text>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 17, color: GREEN, marginTop: 1 }}>{profileOption?.label ?? 'Autre'}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#F3F3F3' }} />

          {/* Topics */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="grid-outline" size={16} color={GREEN} />
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>
                {allSelectedTopics.length} sujet{allSelectedTopics.length > 1 ? 's' : ''} sélectionné{allSelectedTopics.length > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {nonFreelanceTopics.map((slug: string) => (
                <View key={slug} style={{ backgroundColor: ACCENT_LIGHT, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: GREEN }}>{topicMap[slug]?.title ?? slug}</Text>
                </View>
              ))}
              {freelanceTopics.map((slug: string) => (
                <View key={slug} style={{ backgroundColor: 'rgba(35,80,55,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 12, color: GREEN }}>{topicMap[slug]?.title ?? slug}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed buttons */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 16, left: 24, right: 24, gap: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: saving ? 'rgba(35,80,55,0.5)' : GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: saving ? 0 : 0.25, shadowRadius: 10, elevation: 4 }}
          onPress={onComplete} disabled={saving} activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="sparkles" size={18} color="white" />
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Lancer mon espace</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{ borderRadius: 16, paddingVertical: 12, alignItems: 'center' }} onPress={onBack} disabled={saving}>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.5)' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}
