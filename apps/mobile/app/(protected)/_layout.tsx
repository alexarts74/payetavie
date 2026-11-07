import { useEffect } from 'react'
import { Drawer } from 'expo-router/drawer'
import { router } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuth } from '@/contexts/AuthContext'
import { View, ActivityIndicator } from 'react-native'

export default function ProtectedLayout() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login')
    }
  }, [session, loading])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!session) return null

  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          drawerActiveTintColor: '#2563eb',
          drawerInactiveTintColor: '#6b7280',
        }}
      >
        <Drawer.Screen name="dashboard" options={{ title: 'Tableau de bord', drawerLabel: 'Tableau de bord' }} />
        <Drawer.Screen name="topics/index" options={{ title: 'Mes topics', drawerLabel: 'Mes topics' }} />
        <Drawer.Screen name="depenses/index" options={{ title: 'Dépenses', drawerLabel: 'Dépenses' }} />
        <Drawer.Screen name="profile" options={{ title: 'Mon profil', drawerLabel: 'Mon profil' }} />
        <Drawer.Screen name="pricing" options={{ title: 'Abonnement', drawerLabel: 'Abonnement' }} />
        {/* Hidden screens (no drawer entry) */}
        <Drawer.Screen name="topics/[slug]" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="depenses/budgets" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="depenses/recurrents" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/clients/index" options={{ title: 'Clients', drawerLabel: 'Clients (Freelance)' }} />
        <Drawer.Screen name="freelance/clients/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/index" options={{ title: 'Facturation', drawerLabel: 'Facturation' }} />
        <Drawer.Screen name="freelance/facturation/factures/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/factures/nouvelle" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/factures/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/devis/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/devis/nouveau" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="freelance/facturation/devis/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  )
}
