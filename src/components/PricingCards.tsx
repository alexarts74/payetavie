'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Shield, Rocket } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/subscription'
import type { PlanName } from '@/types'

interface PricingCardsProps {
  currentPlan?: PlanName
  highlightPlan?: string | null
}

const plans = [
  {
    name: 'Gratuit',
    key: 'free' as PlanName,
    price: '0',
    period: 'pour toujours',
    icon: Sparkles,
    gradient: 'from-zinc-500/10 to-zinc-600/5',
    iconBg: 'bg-zinc-100 dark:bg-zinc-800',
    iconColor: 'text-zinc-500 dark:text-zinc-400',
    accent: 'zinc',
    features: [
      { label: '3 thématiques', included: true },
      { label: '5 documents', included: true },
      { label: '10 rappels actifs', included: true },
      { label: 'Checklists & guides', included: true },
      { label: 'Dépenses & budgets', included: false },
      { label: 'Facturation pro', included: false },
    ],
  },
  {
    name: 'Essentiel',
    key: 'essentiel' as PlanName,
    price: '4,99',
    period: '/mois',
    icon: Shield,
    gradient: 'from-indigo-500/15 to-violet-500/10',
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    accent: 'indigo',
    popular: true,
    features: [
      { label: 'Tout illimité', included: true },
      { label: 'Dépenses & budgets', included: true },
      { label: 'Dépenses récurrentes', included: true },
      { label: 'Export calendrier', included: true },
      { label: 'Annuaire & notifications', included: true },
      { label: 'Facturation pro', included: false },
    ],
  },
  {
    name: 'Pro',
    key: 'pro' as PlanName,
    price: '9,99',
    period: '/mois',
    icon: Rocket,
    gradient: 'from-purple-500/15 to-fuchsia-500/10',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
    accent: 'purple',
    features: [
      { label: 'Tout d\'Essentiel', included: true },
      { label: 'Factures & devis', included: true },
      { label: 'Gestion clients', included: true },
      { label: 'Profil professionnel', included: true },
      { label: 'Génération PDF', included: true },
      { label: 'Support prioritaire', included: true },
    ],
  },
]

export default function PricingCards({ currentPlan, highlightPlan }: PricingCardsProps) {
  const [loading, setLoading] = useState<PlanName | null>(null)

  const handleSelectPlan = async (planKey: PlanName) => {
    if (planKey === 'free' || planKey === currentPlan) return
    setLoading(planKey)
    const result = await createCheckoutSession(planKey as 'essentiel' | 'pro')
    if ('url' in result && result.url) {
      window.location.href = result.url
    } else {
      setLoading(null)
    }
  }

  const visiblePlans = plans
  const cols = 'md:grid-cols-3 max-w-[1200px]'

  return (
    <div className={`grid ${cols} gap-5 lg:gap-6 w-full mx-auto items-stretch`}>
      {visiblePlans.map((plan, index) => {
        const isCurrentPlan = currentPlan === plan.key
        const isHighlighted = highlightPlan === plan.key || (!highlightPlan && plan.popular)
        const Icon = plan.icon

        return (
          <div
            key={plan.key}
            className="animate-slide-up"
            style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`relative h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                isHighlighted
                  ? 'ring-2 ring-indigo-500/60 dark:ring-indigo-400/50 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-500/5 scale-[1.02]'
                  : 'ring-1 ring-[var(--glass-border)] hover:ring-[var(--glass-border-accent)] hover:shadow-md'
              }`}
            >
              {/* Gradient background layer */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} pointer-events-none`} />
              <div className="absolute inset-0 bg-[var(--glass-bg)] opacity-80 backdrop-blur-xl pointer-events-none" />
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none opacity-30 blur-3xl ${
                plan.accent === 'indigo' ? 'bg-indigo-400 dark:bg-indigo-600'
                : plan.accent === 'purple' ? 'bg-purple-400 dark:bg-purple-600'
                : 'bg-zinc-300 dark:bg-zinc-600'
              }`} />

              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                    Populaire
                  </div>
                </div>
              )}

              <div className="relative p-6 lg:p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {plan.price}
                  </span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">€</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-0.5">{plan.period}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-5" />

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.accent === 'indigo'
                            ? 'bg-indigo-500/15 dark:bg-indigo-500/25'
                            : plan.accent === 'purple'
                            ? 'bg-purple-500/15 dark:bg-purple-500/25'
                            : 'bg-emerald-500/15 dark:bg-emerald-500/25'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.accent === 'indigo'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : plan.accent === 'purple'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                          <X className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                        </div>
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? 'text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-400 dark:text-zinc-600'
                      }`}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={isCurrentPlan || loading !== null}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 cursor-default'
                      : plan.key === 'free'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      : plan.accent === 'indigo'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30'
                  }`}
                >
                  {isCurrentPlan
                    ? 'Plan actuel'
                    : loading === plan.key
                    ? 'Redirection...'
                    : plan.key === 'free'
                    ? 'Plan actuel'
                    : `Passer à ${plan.name}`}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
