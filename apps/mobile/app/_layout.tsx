import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, Caprasimo_400Regular } from '@expo-google-fonts/caprasimo'
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost'
import { AuthProvider } from '@/contexts/AuthContext'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  )
}
