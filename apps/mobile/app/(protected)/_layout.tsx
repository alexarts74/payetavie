import { useEffect, useRef, useState } from 'react'
import { Tabs, router } from 'expo-router'
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ACTIVE_COLOR = '#235037'
const INACTIVE_COLOR = 'rgba(35,80,55,0.35)'
const BAR_BG = '#FFFFFF'
const LINE_W = 24

type BottomTab = {
  name: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
  label: string
}

const BOTTOM_TABS: BottomTab[] = [
  { name: 'dashboard',      icon: 'home-outline',     iconActive: 'home',     label: 'Accueil' },
  { name: 'topics/index',   icon: 'layers-outline',   iconActive: 'layers',   label: 'Démarches' },
  { name: 'reminders',      icon: 'alarm-outline',    iconActive: 'alarm',    label: 'Rappels'   },
  { name: 'depenses/index', icon: 'wallet-outline',   iconActive: 'wallet',   label: 'Budget'  },
  { name: 'profile',        icon: 'person-outline',   iconActive: 'person',   label: 'Profil'  },
]

function TabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets()
  const currentName = state.routes[state.index]?.name
  const isMainTab = BOTTOM_TABS.some((t) => t.name === currentName)

  const [containerWidth, setContainerWidth] = useState(0)
  const animX = useRef(new Animated.Value(0)).current
  const activeIndex = BOTTOM_TABS.findIndex((t) => t.name === currentName)
  const slotWidth = containerWidth > 0 ? containerWidth / BOTTOM_TABS.length : 0

  useEffect(() => {
    if (slotWidth > 0 && activeIndex >= 0) {
      Animated.spring(animX, {
        toValue: activeIndex * slotWidth + slotWidth / 2 - LINE_W / 2,
        useNativeDriver: true,
        stiffness: 350,
        damping: 35,
        mass: 0.7,
      }).start()
    }
  }, [activeIndex, slotWidth])

  if (!isMainTab) return null

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 10,
        left: 16,
        right: 16,
        borderRadius: 26,
        backgroundColor: BAR_BG,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 10,
        paddingTop: 6,
        paddingBottom: 4,
      }}
    >
      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        style={{ flexDirection: 'row' }}
      >
        {BOTTOM_TABS.map((tab) => {
          const route = state.routes.find((r: any) => r.name === tab.name)
          if (!route) return null
          const isFocused = currentName === tab.name

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(tab.name)
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3 }}
            >
              <Ionicons
                name={isFocused ? tab.iconActive : tab.icon}
                size={22}
                color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text
                style={{
                  fontFamily: isFocused ? 'Jost_500Medium' : 'Jost_300Light',
                  fontSize: 10,
                  color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Animated line indicator at the bottom */}
      {slotWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 5,
            width: LINE_W,
            height: 2.5,
            borderRadius: 2,
            backgroundColor: ACTIVE_COLOR,
            transform: [{ translateX: animX }],
          }}
        />
      )}
    </View>
  )
}

const SUB_SCREEN_HEADER = {
  headerShown: true,
  headerStyle: { backgroundColor: '#F5E9AF' },
  headerTintColor: '#235037',
  headerTitleStyle: { color: '#0D0D0D', fontFamily: 'Caprasimo_400Regular' },
  headerShadowVisible: false,
  headerBackTitle: '',
  headerLeft: () => (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
      <Ionicons name="chevron-back" size={26} color="#235037" />
    </TouchableOpacity>
  ),
}

export default function ProtectedLayout() {
  const { session, loading, user } = useAuth()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login')
      return
    }
    if (!loading && session && user) {
      supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (!data || !data.onboarding_completed) {
            router.replace('/onboarding')
          } else {
            setCheckingOnboarding(false)
          }
        })
    }
  }, [session, loading, user])

  if (loading || (session && checkingOnboarding)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5E9AF' }}>
        <ActivityIndicator size="large" color="#235037" />
      </View>
    )
  }

  if (!session) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#F5E9AF' }}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}

      >
        {/* Main tabs */}
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="topics/index" />
        <Tabs.Screen name="reminders" />
        <Tabs.Screen name="depenses/index" />
        <Tabs.Screen name="profile" />

        {/* Sub-screens — not in tab bar, keep native back button */}
        <Tabs.Screen name="calendar"                                 options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Calendrier' }} />
        <Tabs.Screen name="topics/[slug]"                            options={{ href: null, ...SUB_SCREEN_HEADER }} />
        <Tabs.Screen name="annuaire"                                 options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Annuaire' }} />
        <Tabs.Screen name="pricing"                                  options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Abonnement' }} />
        <Tabs.Screen name="depenses/budgets"                         options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Budgets' }} />
        <Tabs.Screen name="depenses/recurrents"                      options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Dépenses récurrentes' }} />
        <Tabs.Screen name="freelance/clients/index"                  options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Clients' }} />
        <Tabs.Screen name="freelance/clients/[id]"                   options={{ href: null, ...SUB_SCREEN_HEADER }} />
        <Tabs.Screen name="freelance/facturation/index"              options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Facturation' }} />
        <Tabs.Screen name="freelance/facturation/factures/index"     options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Factures' }} />
        <Tabs.Screen name="freelance/facturation/factures/nouvelle"  options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Nouvelle facture' }} />
        <Tabs.Screen name="freelance/facturation/factures/[id]"      options={{ href: null, ...SUB_SCREEN_HEADER }} />
        <Tabs.Screen name="freelance/facturation/devis/index"        options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Devis' }} />
        <Tabs.Screen name="freelance/facturation/devis/nouveau"      options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Nouveau devis' }} />
        <Tabs.Screen name="freelance/facturation/devis/[id]"         options={{ href: null, ...SUB_SCREEN_HEADER }} />
        <Tabs.Screen name="freelance/profil"                         options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Profil pro' }} />
        <Tabs.Screen name="aides"                                    options={{ href: null, ...SUB_SCREEN_HEADER, title: 'Aides' }} />
      </Tabs>
    </GestureHandlerRootView>
  )
}
