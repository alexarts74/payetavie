import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Animated, Dimensions, type ScrollView as ScrollViewType,
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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'confirm' | null>(null)

  const scrollRef = useRef<ScrollViewType>(null)
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

  async function handleRegister() {
    if (!email || !password || !confirm) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Inscription impossible', translateAuthError(error.message))
    } else {
      Alert.alert(
        'Vérifiez votre email',
        'Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
  }

  const fieldBorder = (f: typeof focusedField) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1.5,
    borderColor: focusedField === f ? GREEN : '#E8E8E8',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: focusedField === f ? '#FAFFF9' : '#FAFAFA',
  })

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE }}>
      {/* Blobs — hors KAV */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -40, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: ACCENT, opacity: 0.3, transform: [{ translateY: blobY }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 80, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: GREEN, opacity: 0.07, transform: [{ translateY: blobY }, { translateX: blobX }] }} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: SCREEN_H * 0.25, right: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: ACCENT, opacity: 0.15, transform: [{ translateY: blobY }] }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {/* Header */}
          <Animated.View style={{ alignItems: 'center', paddingTop: insets.top + 40, marginBottom: 36, opacity: fadeAnim, transform: [{ scale: logoScale }] }}>
            <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
              <Ionicons name="leaf" size={34} color={SURFACE} />
            </View>
            <Text style={{ fontFamily: 'Caprasimo_400Regular', fontSize: 32, color: GREEN, letterSpacing: -0.5 }}>PayeTaVie</Text>
            <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.6)', marginTop: 4 }}>Créer un compte</Text>
          </Animated.View>

          {/* Carte formulaire */}
          <Animated.View style={{ backgroundColor: 'white', borderRadius: 28, padding: 24, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Email */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Email</Text>
              <View style={fieldBorder('email')}>
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
              <View style={fieldBorder('password')}>
                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? GREEN : '#AAA'} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111' }}
                  placeholder="Min. 6 caractères" placeholderTextColor="#BBB"
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPassword} autoComplete="new-password"
                  editable={!loading}
                  onFocus={() => { setFocusedField('password'); scrollRef.current?.scrollToEnd({ animated: true }) }} onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmer */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 13, color: GREEN }}>Confirmer le mot de passe</Text>
              <View style={fieldBorder('confirm')}>
                <Ionicons name="shield-checkmark-outline" size={18} color={focusedField === 'confirm' ? GREEN : '#AAA'} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontFamily: 'Jost_300Light', fontSize: 15, color: '#111' }}
                  placeholder="••••••••" placeholderTextColor="#BBB"
                  value={confirm} onChangeText={setConfirm}
                  secureTextEntry={!showConfirm} autoComplete="new-password"
                  editable={!loading}
                  onFocus={() => { setFocusedField('confirm'); scrollRef.current?.scrollToEnd({ animated: true }) }} onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#AAA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton */}
            <TouchableOpacity
              style={{ backgroundColor: loading ? 'rgba(35,80,55,0.5)' : GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: loading ? 0 : 0.25, shadowRadius: 10, elevation: 4 }}
              onPress={handleRegister} disabled={loading} activeOpacity={0.85}
            >
              <Text style={{ fontFamily: 'Jost_500Medium', fontSize: 16, color: 'white', letterSpacing: 0.2 }}>
                {loading ? 'Création…' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Lien connexion */}
          <Animated.View style={{ alignItems: 'center', marginTop: 28, opacity: fadeAnim }}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontFamily: 'Jost_300Light', fontSize: 15, color: 'rgba(35,80,55,0.7)' }}>
                  Déjà un compte ?{' '}
                  <Text style={{ fontFamily: 'Jost_500Medium', color: GREEN }}>Se connecter</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
