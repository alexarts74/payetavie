import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { PLAN_PRICES, PLAN_LIMITS } from '@payetavie/shared'
import { getUserSubscription } from '@/lib/subscription'
import type { UserSubscription } from '@/lib/subscription'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

export default function PricingScreen() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  useEffect(() => {
    getUserSubscription().then(setSubscription)
  }, [])

  async function handleUpgrade(plan: 'essentiel' | 'pro') {
    // Open Stripe Checkout in in-app browser
    await WebBrowser.openBrowserAsync(`${APP_URL}/pricing?plan=${plan}`)
  }

  const plans = [
    {
      id: 'free' as const,
      name: 'Gratuit',
      price: '0 €',
      period: '',
      features: [
        `${PLAN_LIMITS.free.topics} topics`,
        `${PLAN_LIMITS.free.documents} documents`,
        `${PLAN_LIMITS.free.reminders} rappels`,
      ],
      cta: null,
    },
    {
      id: 'essentiel' as const,
      name: 'Essentiel',
      price: `${PLAN_PRICES.essentiel.monthly} €`,
      period: '/mois',
      features: ['Topics illimités', 'Documents illimités', 'Rappels illimités'],
      cta: 'Passer à Essentiel',
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: `${PLAN_PRICES.pro.monthly} €`,
      period: '/mois',
      features: ['Tout Essentiel', 'Module Freelance', 'Facturation & Devis', 'Gestion clients'],
      cta: 'Passer à Pro',
    },
  ]

  return (
    <ScrollView className="flex-1 bg-[#F5E9AF]">
      <View className="px-4 py-6 pb-28 gap-4">
        <View className="items-center py-4">
          <Text className="text-2xl font-bold text-gray-900">Choisir un plan</Text>
          {subscription && (
            <Text className="text-gray-500 mt-1">
              Plan actuel : <Text className="font-semibold capitalize">{subscription.plan}</Text>
            </Text>
          )}
        </View>

        {plans.map((plan) => {
          const isCurrent = subscription?.plan === plan.id
          return (
            <View
              key={plan.id}
              className={`rounded-2xl p-5 shadow-sm ${plan.id === 'pro' ? 'bg-violet-600' : 'bg-white'} ${isCurrent ? 'ring-2 ring-violet-500' : ''}`}
            >
              {isCurrent && (
                <View className="bg-green-100 rounded-full px-3 py-1 self-start mb-3">
                  <Text className="text-green-700 text-xs font-medium">Plan actuel</Text>
                </View>
              )}
              <View className="flex-row items-baseline gap-1 mb-1">
                <Text className={`text-3xl font-bold ${plan.id === 'pro' ? 'text-white' : 'text-gray-900'}`}>{plan.price}</Text>
                <Text className={`text-sm ${plan.id === 'pro' ? 'text-violet-200' : 'text-gray-500'}`}>{plan.period}</Text>
              </View>
              <Text className={`text-lg font-semibold mb-3 ${plan.id === 'pro' ? 'text-white' : 'text-gray-900'}`}>{plan.name}</Text>
              <View className="gap-1.5 mb-4">
                {plan.features.map((f) => (
                  <View key={f} className="flex-row items-center gap-1.5">
                    <Ionicons name="checkmark-circle" size={14} color={plan.id === 'pro' ? '#EBA7CB' : '#235037'} />
                    <Text className={`text-sm flex-1 ${plan.id === 'pro' ? 'text-violet-100' : 'text-gray-600'}`}>{f}</Text>
                  </View>
                ))}
              </View>
              {plan.cta && !isCurrent && (
                <TouchableOpacity
                  className={`rounded-2xl py-3 items-center ${plan.id === 'pro' ? 'bg-white' : 'bg-violet-600'}`}
                  onPress={() => handleUpgrade(plan.id as 'essentiel' | 'pro')}
                >
                  <Text className={`font-semibold ${plan.id === 'pro' ? 'text-violet-600' : 'text-white'}`}>{plan.cta}</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
