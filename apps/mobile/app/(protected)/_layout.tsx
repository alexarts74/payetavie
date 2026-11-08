import { useEffect, useRef, useState } from 'react'
import { Tabs, router } from 'expo-router'
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'

type BottomTab = {
  name: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
  label: string
}

const BOTTOM_TABS: BottomTab[] = [
  { name: 'dashboard',      icon: 'home-outline',     iconActive: 'home',     label: 'Accueil'  },
  { name: 'topics/index',   icon: 'grid-outline',     iconActive: 'grid',     label: 'Topics'   },
  { name: 'calendar',       icon: 'calendar-outline', iconActive: 'calendar', label: 'Agenda'   },
  { name: 'depenses/index', icon: 'wallet-outline',   iconActive: 'wallet',   label: 'Budget'   },
  { name: 'profile',        icon: 'person-outline',   iconActive: 'person',   label: 'Profil'   },
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
        toValue: activeIndex * slotWidth,
        useNativeDriver: true,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }).start()
    }
  }, [activeIndex, slotWidth])

  if (!isMainTab) return null

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 12,
        left: 16,
        right: 16,
        borderRadius: 28,
        overflow: 'hidden',
        // Subtle border via shadow trick on iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      {/* Frosted glass base */}
      <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Dark tinted overlay for depth */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8, 8, 12, 0.45)' }]} />

      {/* Thin top highlight (glass edge) */}
      <View style={[StyleSheet.absoluteFill, {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }]} pointerEvents="none" />

      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 6 }}
      >
        {/* Animated glass pill */}
        {slotWidth > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              left: 6,
              width: slotWidth,
              height: '100%',
              transform: [{ translateX: animX }],
            }}
            pointerEvents="none"
          >
            <View
              style={{
                flex: 1,
                marginHorizontal: 2,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.28)',
                // Inner shimmer top highlight
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}
            />
          </Animated.View>
        )}

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
              activeOpacity={0.75}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <Ionicons
                name={isFocused ? tab.iconActive : tab.icon}
                size={isFocused ? 18 : 22}
                color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
              />
              {isFocused && (
                <Text style={{ color: '#FFFFFF', fontFamily: 'Jost_500Medium', fontSize: 14 }}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
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
}

export default function ProtectedLayout() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) router.replace('/(auth)/login')
  }, [session, loading])

  if (loading) {
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
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="depenses/index" />
        <Tabs.Screen name="profile" />

        {/* Sub-screens — not in tab bar, keep native back button */}
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
      </Tabs>
    </GestureHandlerRootView>
  )
}
