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
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Ambient background — tinted base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/40 dark:from-[#0c0c18] dark:via-[#0e0f1e] dark:to-[#110c1c]" />
      <div className="absolute top-[-30%] left-[-15%] w-[65%] h-[90%] rounded-full bg-indigo-300/20 dark:bg-indigo-600/15 blur-[120px]" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[75%] rounded-full bg-purple-300/20 dark:bg-purple-600/12 blur-[120px]" />
      <div className="absolute top-[10%] right-[20%] w-[30%] h-[40%] rounded-full bg-violet-200/15 dark:bg-violet-500/10 blur-[100px]" />
      <div className="absolute bottom-[15%] left-[10%] w-[20%] h-[25%] rounded-full bg-blue-200/10 dark:bg-blue-600/8 blur-[80px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <Link
            href={currentPlan !== 'free' ? '/dashboard' : '/'}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            <span className="gradient-text">Choisissez votre plan</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            {requiredPlan
              ? `La fonctionnalité que vous souhaitez utiliser nécessite le plan ${requiredPlan === 'essentiel' ? 'Essentiel' : 'Pro'}.`
              : 'Des plans simples et transparents pour vous accompagner dans votre vie administrative.'}
          </p>
        </div>

        <PricingCards currentPlan={currentPlan} highlightPlan={requiredPlan || null} />

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Tous les prix sont en euros, TTC. Annulation possible à tout moment.
        </p>
      </div>
    </div>
  )
}
