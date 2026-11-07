// Shared Stripe constants — no SDK dependency
// SDK-specific code stays in apps/web/src/lib/stripe.ts

export type PlanName = 'free' | 'essentiel' | 'pro'

export const PLAN_LIMITS = {
  free:      { topics: 3, documents: 5, reminders: 10, bookmarksPerTopic: 5 },
  essentiel: { topics: Infinity, documents: Infinity, reminders: Infinity, bookmarksPerTopic: Infinity },
  pro:       { topics: Infinity, documents: Infinity, reminders: Infinity, bookmarksPerTopic: Infinity },
} as const

export const PLAN_PRICES = {
  essentiel: { monthly: 4.99 },
  pro:       { monthly: 9.99 },
} as const

export const PLAN_HIERARCHY: Record<PlanName, number> = {
  free: 0,
  essentiel: 1,
  pro: 2,
}
