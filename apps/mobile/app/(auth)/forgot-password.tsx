import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <View className="flex-1 bg-white justify-center px-6">
        <Text className="text-5xl text-center mb-4">📧</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">Email envoyé !</Text>
        <Text className="text-gray-500 text-center mb-8">
          Vérifiez votre boîte mail et suivez le lien pour réinitialiser votre mot de passe.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold text-base">Retour à la connexion</Text>
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
          <Text className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</Text>
          <Text className="text-gray-500">
            Saisissez votre email pour recevoir un lien de réinitialisation.
          </Text>
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

          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center mt-2 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleReset}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2" onPress={() => router.back()}>
            <Text className="text-gray-600">Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
