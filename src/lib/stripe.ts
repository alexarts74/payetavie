import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}

// Keep backward-compatible export as a getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type PlanName = 'free' | 'essentiel' | 'pro'

export const PLAN_LIMITS = {
  free:      { topics: 3, documents: 5, reminders: 10, bookmarksPerTopic: 5 },
  essentiel: { topics: Infinity, documents: Infinity, reminders: Infinity, bookmarksPerTopic: Infinity },
  pro:       { topics: Infinity, documents: Infinity, reminders: Infinity, bookmarksPerTopic: Infinity },
} as const

export function getPlanPriceId(plan: 'essentiel' | 'pro'): string {
  if (plan === 'essentiel') return process.env.STRIPE_ESSENTIEL_PRICE_ID!
  return process.env.STRIPE_PRO_PRICE_ID!
}

export const PLAN_PRICES = {
  essentiel: { monthly: 4.99 },
  pro:       { monthly: 9.99 },
} as const

export const PLAN_HIERARCHY: Record<PlanName, number> = {
  free: 0,
  essentiel: 1,
  pro: 2,
}

export function getPriceIdToPlan(priceId: string): PlanName {
  if (priceId === process.env.STRIPE_ESSENTIEL_PRICE_ID) return 'essentiel'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}
