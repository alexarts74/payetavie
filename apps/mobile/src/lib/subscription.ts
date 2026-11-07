import { PLAN_HIERARCHY, PLAN_LIMITS } from '@payetavie/shared'
import type { PlanName } from '@payetavie/shared'
import { supabase } from './supabase'

export type { PlanName }
export { PLAN_HIERARCHY, PLAN_LIMITS }

export interface UserSubscription {
  plan: PlanName
  isActive: boolean
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

export async function getUserSubscription(): Promise<UserSubscription> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: 'free', isActive: false, cancelAtPeriodEnd: false, currentPeriodEnd: null }

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, cancel_at_period_end, current_period_end')
    .eq('user_id', user.id)
    .single()

  if (!data) return { plan: 'free', isActive: false, cancelAtPeriodEnd: false, currentPeriodEnd: null }

  const isActive = data.status === 'active' || data.status === 'trialing'
  return {
    plan: (isActive ? data.plan : 'free') as PlanName,
    isActive,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    currentPeriodEnd: data.current_period_end,
  }
}

export function canAccess(userPlan: PlanName, requiredPlan: PlanName): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan]
}

export async function requirePlan(requiredPlan: PlanName): Promise<
  { allowed: true; plan: PlanName } | { allowed: false; error: string; upgradeRequired: boolean }
> {
  const { plan, isActive } = await getUserSubscription()
  const activePlan = isActive ? plan : 'free'

  if (canAccess(activePlan, requiredPlan)) {
    return { allowed: true, plan: activePlan }
  }

  return {
    allowed: false,
    error: `Cette fonctionnalité nécessite le plan ${requiredPlan}.`,
    upgradeRequired: true,
  }
}
