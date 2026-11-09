'use client'

import { Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { PlanName } from '@/types'

interface UpgradePromptProps {
  requiredPlan: PlanName
  currentCount?: number
  limit?: number
  resourceLabel?: string
  variant?: 'inline' | 'full-page'
}

const PLAN_LABELS: Record<PlanName, string> = {
  free: 'Gratuit',
  essentiel: 'Essentiel',
  pro: 'Pro',
}

const PLAN_PRICES: Record<string, string> = {
  essentiel: '4,99€/mois',
  pro: '9,99€/mois',
}

export default function UpgradePrompt({
  requiredPlan,
  currentCount,
  limit,
  resourceLabel,
  variant = 'inline',
}: UpgradePromptProps) {
  const planLabel = PLAN_LABELS[requiredPlan]
  const price = PLAN_PRICES[requiredPlan]

  if (variant === 'full-page') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EBA7CB]/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-[#235037]" />
          </div>
          <h2 className="text-2xl font-bold text-[#235037]">Fonctionnalité {planLabel}</h2>
          <p className="text-[#5A6B61]">
            Cette section est réservée aux abonnés du plan {planLabel} ({price}).
          </p>
          <Link
            href={`/pricing?required=${requiredPlan}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-2xl font-medium transition-colors"
          >
            Voir les tarifs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-4 border border-[#EBA7CB]/40 bg-[#FDEEF6]">
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 text-[#235037] mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-[#1a2e22]">
            {currentCount !== undefined && limit !== undefined && resourceLabel
              ? `Vous avez ${currentCount} ${resourceLabel} (limite : ${limit}).`
              : `Fonctionnalité réservée au plan ${planLabel}.`}
          </p>
          <p className="text-xs text-[#5A6B61]">
            Passez au plan {planLabel} pour débloquer cette fonctionnalité.
          </p>
          <Link
            href={`/pricing?required=${requiredPlan}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#235037] hover:text-[#1a3d2a]"
          >
            Passer à {planLabel}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
