import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Animated, Dimensions,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@payetavie/shared'

const GREEN = '#235037'
const SURFACE = '#F5E9AF'
const ACCENT = '#EBA7CB'
const { height: SCREEN_H } = Dimensions.get('window')

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const logoScale = useRef(new Animated.Value(0.85)).current
  const blobAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(blobAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const blobY = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] })
  const blobX = blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Connexion impossible', translateAuthError(error.message))
    } else {
      router.replace('/(protected)/dashboard')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      {/* Blobs décoratifs — hors KAV pour ne pas perturber le layout */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: ACCENT, opacity: 0.35, transform: [{ translateY: blobY }, { translateX: blobX }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 60, right: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: GREEN, opacity: 0.08, transform: [{ translateY: blobY }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: SCREEN_H * 0.3, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: GREEN, opacity: 0.07, transform: [{ translateY: blobY }] }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header / Logo */}
          <Animated.View style={{ alignItems: 'center', paddingTop: insets.top + 56, marginBottom: 48, opacity: fadeAnim, transform: [{ scale: logoScale }] }}>
            <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
              <Ionicons name="leaf" size={34} color={SURFACE} />
            </View>
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 36, color: GREEN, letterSpacing: -0.5 }}>
              PayeTaVie
            </Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.6)', marginTop: 4 }}>
              Votre assistant administratif
            </Text>
          </Animated.View>

          {/* Carte formulaire */}
          <Animated.View style={{ backgroundColor: 'white', borderRadius: 28, padding: 24, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Email */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: focusedField === 'email' ? GREEN : '#E8E8E8', borderRadius: 14, paddingHorizontal: 14, backgroundColor: focusedField === 'email' ? '#FAFFF9' : '#FAFAFA' }}>
                <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? GREEN : '#AAA'} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111' }}
                  placeholder="votre@email.fr" placeholderTextColor="#BBB"
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                  editable={!loading}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Mot de passe</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: focusedField === 'password' ? GREEN : '#E8E8E8', borderRadius: 14, paddingHorizontal: 14, backgroundColor: focusedField === 'password' ? '#FAFFF9' : '#FAFAFA' }}>
                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? GREEN : '#AAA'} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111' }}
                  placeholder="••••••••" placeholderTextColor="#BBB"
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPassword} autoComplete="password"
                  editable={!loading}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton */}
            <TouchableOpacity
              style={{ backgroundColor: loading ? 'rgba(35,80,55,0.5)' : GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: loading ? 0 : 0.25, shadowRadius: 10, elevation: 4 }}
              onPress={handleLogin} disabled={loading} activeOpacity={0.85}
            >
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white', letterSpacing: 0.2 }}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            {/* Mot de passe oublié */}
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 2 }}>
                <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 14, color: GREEN }}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Lien inscription */}
          <Animated.View style={{ alignItems: 'center', marginTop: 28, opacity: fadeAnim }}>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.7)' }}>
                  Pas encore de compte ?{' '}
                  <Text style={{ fontFamily: 'Jost_500Medium', color: GREEN }}>S'inscrire</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
