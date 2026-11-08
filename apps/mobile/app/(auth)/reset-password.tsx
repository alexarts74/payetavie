import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const [sessionReady, setSessionReady] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!code) {
      setSetupError('Lien invalide. Veuillez redemander un email de réinitialisation.')
      return
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setSetupError('Lien expiré ou invalide. Veuillez redemander un email de réinitialisation.')
      } else {
        setSessionReady(true)
      }
    })
  }, [code])

  async function handleSave() {
    setFormError(null)
    if (password.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (password !== confirm) {
      setFormError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setFormError(error.message)
    } else {
      await supabase.auth.signOut()
      Alert.alert(
        'Mot de passe mis à jour',
        'Votre mot de passe a été modifié. Veuillez vous reconnecter.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
  }

  if (!sessionReady && !setupError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <ActivityIndicator size="large" color="#235037" />
        <Text className="text-gray-500 mt-4">Vérification du lien...</Text>
      </View>
    )
  }

  if (setupError) {
    return (
      <View className="flex-1 bg-white justify-center px-6">
        <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4 mx-auto">
          <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
        </View>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">Lien invalide</Text>
        <Text className="text-gray-500 text-center mb-8">{setupError}</Text>
        <TouchableOpacity
          className="bg-violet-600 rounded-xl py-3.5 items-center"
          onPress={() => router.replace('/(auth)/forgot-password')}
        >
          <Text className="text-white font-semibold text-base">Redemander un lien</Text>
        </TouchableOpacity>
      </View>
    )
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
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</Text>
          <Text className="text-gray-500">
            Choisissez un mot de passe fort (minimum 6 caractères).
          </Text>
        </View>

        {formError && (
          <View className="bg-red-50 rounded-xl p-3 mb-4">
            <Text className="text-red-700 text-sm">{formError}</Text>
          </View>
        )}

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</Text>
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
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2" onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-gray-600">Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
