import { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { topicMap } from '@payetavie/shared'
import type { ProfileType } from '@payetavie/shared'
import { getUserSubscription, canAccess } from '@/lib/subscription'
import type { PlanName } from '@/lib/subscription'

const PROFILE_LABELS: Record<ProfileType, string> = {
  etudiant: 'Étudiant',
  salarie: 'Salarié',
  independant: 'Indépendant / Freelance',
  recherche_emploi: "En recherche d'emploi",
  autre: 'Autre',
}

const NON_FREELANCE_SLUGS = Object.keys(topicMap).filter((s) => !s.startsWith('freelance-'))
const FREE_TOPIC_LIMIT = 3

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const insets = useSafeAreaInsets()
  const [profileType, setProfileType] = useState<ProfileType | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [plan, setPlan] = useState<PlanName>('free')

  const [displayName, setDisplayName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)

  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [showTopicsModal, setShowTopicsModal] = useState(false)
  const [draftTopics, setDraftTopics] = useState<string[]>([])
  const [savingTopics, setSavingTopics] = useState(false)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.user_metadata?.display_name ?? '')
    supabase.from('user_preferences').select('profile_type, selected_topics').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfileType(data.profile_type as ProfileType)
          setSelectedTopics(data.selected_topics ?? [])
        }
      })
  }, [user])

  useFocusEffect(useCallback(() => {
    getUserSubscription().then(({ plan: p }) => setPlan(p))
  }, []))

  async function handleSignOut() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login') } },
    ])
  }

  async function saveDisplayName() {
    if (!displayName.trim()) return
    setSavingName(true)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setSavingName(false)
    if (error) { Alert.alert('Erreur', error.message); return }
    setEditingName(false)
  }

  async function savePassword() {
    if (!newPassword || newPassword.length < 6) { Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères'); return }
    if (newPassword !== confirmPassword) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) { Alert.alert('Erreur', error.message); return }
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordSection(false)
    Alert.alert('Succès', 'Mot de passe mis à jour')
  }

  async function saveProfileType(type: ProfileType) {
    if (!user) return
    setProfileType(type)
    await supabase.from('user_preferences').update({ profile_type: type }).eq('user_id', user.id)
  }

  function openTopicsModal() {
    setDraftTopics([...selectedTopics])
    setShowTopicsModal(true)
  }

  function toggleDraftTopic(slug: string) {
    setDraftTopics((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (!canAccess(plan, 'essentiel') && prev.length >= FREE_TOPIC_LIMIT) {
        Alert.alert('Limite atteinte', `Le plan gratuit est limité à ${FREE_TOPIC_LIMIT} topics.`)
        return prev
      }
      return [...prev, slug]
    })
  }

  async function saveTopics() {
    if (!user) return
    setSavingTopics(true)
    await supabase.from('user_preferences').update({ selected_topics: draftTopics }).eq('user_id', user.id)
    setSelectedTopics(draftTopics)
    setSavingTopics(false)
    setShowTopicsModal(false)
  }

  const topicsForModal = canAccess(plan, 'pro') ? Object.keys(topicMap) : NON_FREELANCE_SLUGS
  const canAccessEssentiel = canAccess(plan, 'essentiel')
  const canAccessPro = canAccess(plan, 'pro')

  return (
    <>
      <ScrollView className="flex-1 bg-[#F5E9AF]">
        {/* Header */}
        <View style={{ paddingTop: insets.top + 20 }} className="px-6 pb-5">
          <Text className="text-4xl font-bold text-[#0D0D0D] tracking-tight" style={{ fontFamily: 'Caprasimo_400Regular', lineHeight: 42 }}>
            Mon profil
          </Text>
          <Text className="text-sm text-[#71717A] mt-1.5" style={{ fontFamily: 'Jost_300Light' }}>
            Gérez vos informations et préférences
          </Text>
        </View>
        <View className="px-4 pb-28 gap-5">
          {/* Avatar */}
          <View className="items-center py-4">
            <View className="w-20 h-20 rounded-full bg-[#FDEEF6] items-center justify-center mb-3">
              <Ionicons name="person" size={38} color="#235037" />
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              {user?.user_metadata?.display_name || user?.email}
            </Text>
            {user?.user_metadata?.display_name && (
              <Text className="text-sm text-gray-500 mt-0.5">{user.email}</Text>
            )}
            {profileType && <Text className="text-gray-500 mt-1">{PROFILE_LABELS[profileType]}</Text>}
          </View>

          {/* Accès rapide */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Jost_500Medium' }}>Accès rapide</Text>

            {/* Annuaire */}
            <TouchableOpacity
              className={`flex-row items-center gap-3 py-2.5 ${!canAccessEssentiel ? 'opacity-60' : ''}`}
              onPress={() => canAccessEssentiel ? router.push('/(protected)/annuaire') : router.push('/(protected)/pricing')}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 bg-[#FDEEF6] rounded-[9px] items-center justify-center">
                <Ionicons name="map-outline" size={18} color="#235037" />
              </View>
              <Text className="flex-1 text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>Annuaire des administrations</Text>
              {!canAccessEssentiel ? (
                <View className="bg-[#EBA7CB] rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#235037]" style={{ fontFamily: 'Jost_500Medium' }}>Essentiel</Text>
                </View>
              ) : (
                <Text className="text-gray-400 text-base">›</Text>
              )}
            </TouchableOpacity>

            {/* Freelance section */}
            {canAccessPro ? (
              <>
                <View className="border-t border-gray-100 my-1" />
                <TouchableOpacity className="flex-row items-center gap-3 py-2.5" onPress={() => router.push('/(protected)/freelance/clients')} activeOpacity={0.7}>
                  <View className="w-9 h-9 bg-[#FDEEF6] rounded-[9px] items-center justify-center">
                    <Ionicons name="people-outline" size={18} color="#235037" />
                  </View>
                  <Text className="flex-1 text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>Mes clients</Text>
                  <Text className="text-gray-400 text-base">›</Text>
                </TouchableOpacity>
                <View className="border-t border-gray-100 my-1" />
                <TouchableOpacity className="flex-row items-center gap-3 py-2.5" onPress={() => router.push('/(protected)/freelance/facturation')} activeOpacity={0.7}>
                  <View className="w-9 h-9 bg-[#FDEEF6] rounded-[9px] items-center justify-center">
                    <Ionicons name="receipt-outline" size={18} color="#235037" />
                  </View>
                  <Text className="flex-1 text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>Facturation</Text>
                  <Text className="text-gray-400 text-base">›</Text>
                </TouchableOpacity>
                <View className="border-t border-gray-100 my-1" />
                <TouchableOpacity className="flex-row items-center gap-3 py-2.5" onPress={() => router.push('/(protected)/freelance/profil')} activeOpacity={0.7}>
                  <View className="w-9 h-9 bg-[#FDEEF6] rounded-[9px] items-center justify-center">
                    <Ionicons name="briefcase-outline" size={18} color="#235037" />
                  </View>
                  <Text className="flex-1 text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>Profil professionnel</Text>
                  <Text className="text-gray-400 text-base">›</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="bg-[#F5E9AF] rounded-xl p-3 mt-2 flex-row items-center gap-3">
                <Ionicons name="lock-closed-outline" size={18} color="#235037" />
                <View className="flex-1">
                  <Text className="text-sm text-[#235037]" style={{ fontFamily: 'Jost_500Medium' }}>Espace Freelance</Text>
                  <Text className="text-xs text-[#235037]/70 mt-0.5" style={{ fontFamily: 'Jost_300Light' }}>Clients, facturation, profil pro</Text>
                </View>
                <TouchableOpacity className="bg-[#235037] rounded-lg px-3 py-1.5" onPress={() => router.push('/(protected)/pricing')}>
                  <Text className="text-white text-xs" style={{ fontFamily: 'Jost_500Medium' }}>Passer Pro</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Mon compte */}
          <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
            <Text className="font-semibold text-gray-900" style={{ fontFamily: 'Jost_500Medium' }}>Mon compte</Text>

            {/* Nom d'affichage */}
            {editingName ? (
              <View className="gap-2">
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Votre prénom ou pseudo"
                  autoFocus
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 py-2.5 rounded-xl border border-gray-300 items-center" onPress={() => setEditingName(false)}>
                    <Text className="text-gray-700 font-medium">Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2.5 rounded-xl items-center ${savingName ? 'bg-[#235037]/70' : 'bg-[#235037]'}`}
                    onPress={saveDisplayName}
                    disabled={savingName}
                  >
                    {savingName ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-medium">Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity className="flex-row items-center justify-between py-1" onPress={() => setEditingName(true)}>
                <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Jost_300Light' }}>
                  {displayName || "Ajouter un nom d'affichage"}
                </Text>
                <Text className="text-[#235037] text-sm font-medium">Nom › </Text>
              </TouchableOpacity>
            )}

            <View className="border-t border-gray-100" />

            {/* Mot de passe */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-1"
              onPress={() => setShowPasswordSection((v) => !v)}
            >
              <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Jost_300Light' }}>••••••••</Text>
              <Text className="text-[#235037] text-sm font-medium">Mot de passe › </Text>
            </TouchableOpacity>
            {showPasswordSection && (
              <View className="gap-3">
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  className={`rounded-xl py-3 items-center ${savingPassword ? 'bg-[#235037]/70' : 'bg-[#235037]'}`}
                  onPress={savePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-semibold">Mettre à jour</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Type de profil */}
          <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
            <Text className="font-semibold text-gray-900">Type de profil</Text>
            <View className="flex-row flex-wrap gap-2">
              {(Object.keys(PROFILE_LABELS) as ProfileType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`px-3 py-2 rounded-xl border ${profileType === type ? 'bg-[#235037] border-[#235037]' : 'bg-gray-50 border-gray-200'}`}
                  onPress={() => saveProfileType(type)}
                >
                  <Text className={`text-sm font-medium ${profileType === type ? 'text-white' : 'text-gray-700'}`}>{PROFILE_LABELS[type]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Topics sélectionnés */}
          <View className="bg-white rounded-2xl p-4 shadow-sm gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-gray-900">Topics sélectionnés</Text>
              <TouchableOpacity onPress={openTopicsModal}>
                <Text className="text-[#235037] text-sm font-medium">Gérer</Text>
              </TouchableOpacity>
            </View>
            {selectedTopics.length === 0 ? (
              <Text className="text-gray-500 text-sm">Aucun topic sélectionné</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {selectedTopics.filter((s) => !s.startsWith('freelance-')).map((slug) => (
                  <View key={slug} className="bg-[#FDEEF6] rounded-lg px-3 py-1.5">
                    <Text className="text-[#235037] text-sm font-medium">{topicMap[slug]?.title ?? slug}</Text>
                  </View>
                ))}
              </View>
            )}
            {!canAccessEssentiel && (
              <Text className="text-xs text-gray-400">{selectedTopics.filter((s) => !s.startsWith('freelance-')).length}/{FREE_TOPIC_LIMIT} topics (plan gratuit)</Text>
            )}
          </View>

          {/* Mon abonnement */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={() => router.push('/(protected)/pricing')}
          >
            <View className="w-9 h-9 bg-[#FDEEF6] rounded-[9px] items-center justify-center">
              <Ionicons name="star-outline" size={18} color="#235037" />
            </View>
            <Text className="font-medium text-gray-900">Mon abonnement</Text>
            <Text className="text-gray-400 ml-auto">›</Text>
          </TouchableOpacity>

          {/* Déconnexion */}
          <TouchableOpacity className="bg-red-50 rounded-2xl p-4 items-center mt-2" onPress={handleSignOut}>
            <Text className="text-red-600 font-medium">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal — Topics */}
      <Modal visible={showTopicsModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTopicsModal(false)}>
        <View className="flex-1 bg-white">
          <View className="px-4 pt-6 pb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Mes topics</Text>
              <TouchableOpacity onPress={() => setShowTopicsModal(false)}>
                <Text className="text-gray-500 text-base">Annuler</Text>
              </TouchableOpacity>
            </View>
            {!canAccessEssentiel && (
              <View className="bg-orange-50 rounded-xl p-3">
                <Text className="text-orange-700 text-sm">Plan gratuit : maximum {FREE_TOPIC_LIMIT} topics</Text>
              </View>
            )}
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <View className="gap-2 pb-4">
              {topicsForModal.map((slug) => {
                const isSelected = draftTopics.includes(slug)
                const topic = topicMap[slug]
                return (
                  <TouchableOpacity
                    key={slug}
                    className={`bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm border ${isSelected ? 'border-[#235037]' : 'border-transparent'}`}
                    onPress={() => toggleDraftTopic(slug)}
                  >
                    <View className="w-8 h-8 bg-[#FDEEF6] rounded-lg items-center justify-center flex-shrink-0">
                      <Ionicons name="folder-outline" size={16} color="#235037" />
                    </View>
                    <Text className="flex-1 font-medium text-gray-900">{topic?.title ?? slug}</Text>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-[#235037] bg-[#235037]' : 'border-gray-300'}`}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <View className="px-4 pb-8 pt-2">
            <TouchableOpacity
              className={`rounded-xl py-3.5 items-center ${savingTopics ? 'bg-[#235037]/70' : 'bg-[#235037]'}`}
              onPress={saveTopics}
              disabled={savingTopics}
            >
              {savingTopics
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-semibold text-base">Enregistrer ({draftTopics.length} topics)</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}
