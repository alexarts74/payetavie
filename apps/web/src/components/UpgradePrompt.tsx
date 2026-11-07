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
        <div className="glass-card p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">Fonctionnalité {planLabel}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette section est réservée aux abonnés du plan {planLabel} ({price}).
          </p>
          <Link
            href={`/pricing?required=${requiredPlan}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Voir les tarifs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentCount !== undefined && limit !== undefined && resourceLabel
              ? `Vous avez ${currentCount} ${resourceLabel} (limite : ${limit}).`
              : `Fonctionnalité réservée au plan ${planLabel}.`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Passez au plan {planLabel} pour débloquer cette fonctionnalité.
          </p>
          <Link
            href={`/pricing?required=${requiredPlan}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Passer à {planLabel}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
