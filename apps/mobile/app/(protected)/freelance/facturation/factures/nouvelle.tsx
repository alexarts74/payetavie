import { View, Text, TouchableOpacity } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

export default function NouvelleFactureScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Text className="text-5xl mb-4">🧾</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center">Création de facture</Text>
      <Text className="text-gray-500 text-center mt-2">
        La création de factures complètes est disponible sur l'application web.
      </Text>
      <TouchableOpacity
        className="bg-blue-600 rounded-xl px-6 py-3 mt-6"
        onPress={() => WebBrowser.openBrowserAsync(`${APP_URL}/freelance/facturation/factures/nouvelle`)}
      >
        <Text className="text-white font-semibold">Ouvrir sur le web</Text>
      </TouchableOpacity>
    </View>
  )
}
