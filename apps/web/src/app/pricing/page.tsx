import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'
import PricingCards from '@/components/PricingCards'
import type { PlanName } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>
}) {
  const params = await searchParams
  const requiredPlan = params.required as PlanName | undefined

  let currentPlan: PlanName = 'free'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { plan } = await getUserSubscription()
      currentPlan = plan
    }
  } catch {
    // Not authenticated, show as free
  }

  return (
    <div className="min-h-screen bg-[#F5E9AF] flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href={currentPlan !== 'free' ? '/dashboard' : '/'}
            className="inline-flex items-center gap-1.5 text-sm text-[#5A6B61] hover:text-[#235037] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#235037] mb-2">
            Choisissez votre plan
          </h1>
          <p className="text-sm sm:text-base text-[#5A6B61] max-w-xl mx-auto">
            {requiredPlan
              ? `La fonctionnalité que vous souhaitez utiliser nécessite le plan ${requiredPlan === 'essentiel' ? 'Essentiel' : 'Pro'}.`
              : 'Des plans simples et transparents pour vous accompagner dans votre vie administrative.'}
          </p>
        </div>

        <PricingCards currentPlan={currentPlan} highlightPlan={requiredPlan || null} />

        <p className="mt-6 text-center text-xs text-[#5A6B61]">
          Tous les prix sont en euros, TTC. Annulation possible à tout moment.
        </p>
      </div>
    </div>
  )
}
