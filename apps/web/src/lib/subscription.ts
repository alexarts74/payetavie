import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, PLAN_HIERARCHY, type PlanName } from '@/lib/stripe'
import type { Subscription } from '@/types'

export interface UserSubscriptionInfo {
  plan: PlanName
  isActive: boolean
  subscription: Subscription | null
}

export async function getUserSubscription(): Promise<UserSubscriptionInfo> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { plan: 'free', isActive: true, subscription: null }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!subscription) {
    return { plan: 'free', isActive: true, subscription: null }
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  const plan: PlanName = isActive ? (subscription.plan as PlanName) : 'free'

  return { plan, isActive, subscription: subscription as Subscription }
}

export function canAccess(userPlan: PlanName, requiredPlan: PlanName): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan]
}

export function getPlanLimits(plan: PlanName) {
  return PLAN_LIMITS[plan]
}

export async function requirePlan(requiredPlan: PlanName): Promise<{ allowed: true; plan: PlanName } | { allowed: false; error: string; upgradeRequired: PlanName }> {
  const { plan } = await getUserSubscription()

  if (!canAccess(plan, requiredPlan)) {
    const planLabel = requiredPlan === 'essentiel' ? 'Essentiel' : 'Pro'
    return {
      allowed: false,
      error: `Cette fonctionnalité nécessite le plan ${planLabel}.`,
      upgradeRequired: requiredPlan,
    }
  }

  return { allowed: true, plan }
}

export async function checkResourceLimit(
  resource: 'documents' | 'reminders' | 'bookmarks' | 'topics',
  userId: string,
  topicSlug?: string
): Promise<{ allowed: true; currentCount: number; limit: number } | { allowed: false; error: string; upgradeRequired: PlanName; currentCount: number; limit: number }> {
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)
  const supabase = await createClient()

  let currentCount = 0

  switch (resource) {
    case 'documents': {
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      currentCount = count ?? 0
      const limit = limits.documents
      if (currentCount >= limit) {
        return {
          allowed: false,
          error: `Vous avez atteint la limite de ${limit} documents. Passez au plan Essentiel pour en ajouter davantage.`,
          upgradeRequired: 'essentiel',
          currentCount,
          limit,
        }
      }
      return { allowed: true, currentCount, limit }
    }

    case 'reminders': {
      const { count } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', false)
      currentCount = count ?? 0
      const limit = limits.reminders
      if (currentCount >= limit) {
        return {
          allowed: false,
          error: `Vous avez atteint la limite de ${limit} rappels actifs. Passez au plan Essentiel pour en ajouter davantage.`,
          upgradeRequired: 'essentiel',
          currentCount,
          limit,
        }
      }
      return { allowed: true, currentCount, limit }
    }

    case 'bookmarks': {
      const { count } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('topic_slug', topicSlug!)
      currentCount = count ?? 0
      const limit = limits.bookmarksPerTopic
      if (currentCount >= limit) {
        return {
          allowed: false,
          error: `Vous avez atteint la limite de ${limit} favoris par thématique. Passez au plan Essentiel pour en ajouter davantage.`,
          upgradeRequired: 'essentiel',
          currentCount,
          limit,
        }
      }
      return { allowed: true, currentCount, limit }
    }

    case 'topics': {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('selected_topics')
        .eq('user_id', userId)
        .single()
      currentCount = prefs?.selected_topics?.length ?? 0
      const limit = limits.topics
      if (currentCount >= limit) {
        return {
          allowed: false,
          error: `Vous avez atteint la limite de ${limit} thématiques. Passez au plan Essentiel pour en ajouter davantage.`,
          upgradeRequired: 'essentiel',
          currentCount,
          limit,
        }
      }
      return { allowed: true, currentCount, limit }
    }
  }
}
