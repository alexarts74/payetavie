import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { Link, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@payetavie/shared'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

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
      Alert.alert("Inscription impossible", translateAuthError(error.message))
    } else {
      Alert.alert(
        'Vérifiez votre email',
        'Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-violet-600">PayeTaVie</Text>
          <Text className="text-base text-gray-500 mt-1">Créer un compte</Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="votre@email.fr"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Mot de passe</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center mt-2 ${loading ? 'bg-violet-400' : 'bg-violet-600'}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Création...' : 'Créer un compte'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 items-center">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-gray-600">
                Déjà un compte ?{' '}
                <Text className="text-violet-600 font-medium">Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
