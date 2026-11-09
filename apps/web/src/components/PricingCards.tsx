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

  return (
    <div className="grid md:grid-cols-3 gap-5 lg:gap-6 w-full max-w-[1200px] mx-auto items-stretch">
      {plans.map((plan, index) => {
        const isCurrentPlan = currentPlan === plan.key
        const isHighlighted = highlightPlan === plan.key || (!highlightPlan && plan.popular)
        const Icon = plan.icon
        const isPro = plan.key === 'pro'
        const isEssentiel = plan.key === 'essentiel'

        return (
          <div
            key={plan.key}
            className="animate-slide-up"
            style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`relative h-full rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                isPro
                  ? 'bg-[#1A3D2A] border border-[#1A3D2A]'
                  : isEssentiel
                  ? 'bg-[#235037] border border-[#235037]'
                  : 'bg-white border border-[#E8E8E8]'
              } ${
                isHighlighted && !isPro && !isEssentiel
                  ? 'ring-2 ring-[#235037]/30 shadow-lg scale-[1.02]'
                  : isHighlighted
                  ? 'scale-[1.02] shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-[#EBA7CB] text-[#235037] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                    Populaire
                  </div>
                </div>
              )}

              <div className="p-6 lg:p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isPro || isEssentiel ? 'bg-white/20' : 'bg-[#EEF7F1]'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isPro || isEssentiel ? 'text-white' : 'text-[#235037]'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-bold ${
                    isPro || isEssentiel ? 'text-white' : 'text-[#1a2e22]'
                  }`}>{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${
                    isPro || isEssentiel ? 'text-white' : 'text-[#235037]'
                  }`} style={{ fontFamily: 'var(--font-caprasimo)' }}>
                    {plan.price}
                  </span>
                  <span className={`text-xl font-bold ${
                    isPro || isEssentiel ? 'text-white' : 'text-[#235037]'
                  }`}>€</span>
                  <span className={`text-sm ml-0.5 ${
                    isPro || isEssentiel ? 'text-white/70' : 'text-[#5A6B61]'
                  }`}>{plan.period}</span>
                </div>

                {/* Divider */}
                <div className={`h-px mb-5 ${
                  isPro || isEssentiel ? 'bg-white/20' : 'bg-[#E8E8E8]'
                }`} />

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isPro || isEssentiel ? 'bg-white/20' : 'bg-[#EEF7F1]'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            isPro || isEssentiel ? 'text-white' : 'text-[#235037]'
                          }`} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isPro || isEssentiel ? 'bg-white/10' : 'bg-[#E8E8E8]'
                        }`}>
                          <X className={`w-3 h-3 ${
                            isPro || isEssentiel ? 'text-white/40' : 'text-[#5A6B61]/40'
                          }`} />
                        </div>
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? isPro || isEssentiel ? 'text-white' : 'text-[#1a2e22]'
                          : isPro || isEssentiel ? 'text-white/40' : 'text-[#5A6B61]/40'
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
                      ? isPro || isEssentiel
                        ? 'bg-white/20 text-white/60 cursor-default'
                        : 'bg-[#EEF7F1] text-[#5A6B61] cursor-default'
                      : plan.key === 'free'
                      ? 'bg-[#EEF7F1] text-[#235037] hover:bg-[#235037]/10'
                      : isPro || isEssentiel
                      ? 'bg-white text-[#235037] hover:bg-white/90 shadow-sm'
                      : 'bg-[#235037] text-white hover:bg-[#1a3d2a] shadow-sm'
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
