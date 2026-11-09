import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Animated, Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'

const GREEN = '#235037'
const SURFACE = '#F5E9AF'
const ACCENT = '#EBA7CB'
const { height: SCREEN_H } = Dimensions.get('window')

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const blobAnim = useRef(new Animated.Value(0)).current
  const successScale = useRef(new Animated.Value(0.5)).current
  const successFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(blobAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  useEffect(() => {
    if (sent) {
      Animated.parallel([
        Animated.timing(successFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      ]).start()
    }
  }, [sent])

  const blobY = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] })
  const blobX = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'payetavie://reset-password',
    })
    setLoading(false)
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      setSent(true)
    }
  }

  // ── Écran succès ────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: ACCENT, opacity: 0.3, transform: [{ translateY: blobY }] }} />
        <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: GREEN, opacity: 0.07, transform: [{ translateY: blobY }] }} />
        <Animated.View style={{ alignItems: 'center', opacity: successFade, transform: [{ scale: successScale }] }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
            <Ionicons name="mail" size={40} color={SURFACE} />
          </View>
          <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 28, color: GREEN, textAlign: 'center', marginBottom: 12 }}>
            Email envoyé !
          </Text>
          <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
            Vérifiez votre boîte mail et suivez{'\n'}le lien pour réinitialiser votre mot de passe.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: GREEN, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 32, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 }}
            onPress={() => router.back()} activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white' }}>Retour à la connexion</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      {/* Blobs — hors KAV */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: ACCENT, opacity: 0.3, transform: [{ translateY: blobY }, { translateX: blobX }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: SCREEN_H * 0.3, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: GREEN, opacity: 0.07, transform: [{ translateY: blobY }] }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back + header */}
          <Animated.View style={{ paddingTop: insets.top + 20, marginBottom: 40, opacity: fadeAnim }}>
            <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 36, alignSelf: 'flex-start' }}>
              <Ionicons name="chevron-back" size={20} color={GREEN} />
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 15, color: GREEN }}>Retour</Text>
            </TouchableOpacity>

            <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}>
              <Ionicons name="key-outline" size={28} color={SURFACE} />
            </View>
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 28, color: GREEN, lineHeight: 36 }}>
              {'Mot de passe\noublié ?'}
            </Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 14, color: 'rgba(35,80,55,0.65)', marginTop: 8, lineHeight: 20 }}>
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </Text>
          </Animated.View>

          {/* Carte formulaire */}
          <Animated.View style={{ backgroundColor: 'white', borderRadius: 28, padding: 24, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: focused ? GREEN : '#E8E8E8', borderRadius: 14, paddingHorizontal: 14, backgroundColor: focused ? '#FAFFF9' : '#FAFAFA' }}>
                <Ionicons name="mail-outline" size={18} color={focused ? GREEN : '#AAA'} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111' }}
                  placeholder="votre@email.fr" placeholderTextColor="#BBB"
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                  editable={!loading}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: loading ? 'rgba(35,80,55,0.5)' : GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: loading ? 0 : 0.25, shadowRadius: 10, elevation: 4 }}
              onPress={handleReset} disabled={loading} activeOpacity={0.85}
            >
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white', letterSpacing: 0.2 }}>
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
