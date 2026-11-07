'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe, getPlanPriceId, type PlanName } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(planName: 'essentiel' | 'pro') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Cherche un customer Stripe existant ou en crée un
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = existingSub?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    // Upsert la row subscription avec le customer ID
    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
    const serviceSupabase = createServiceRoleClient()
    await serviceSupabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      plan: 'free',
      status: 'active',
    }, { onConflict: 'user_id' })
  }

  const priceId = getPlanPriceId(planName)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/profile?upgrade=success`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { supabase_user_id: user.id },
  })

  if (!session.url) {
    return { error: 'Impossible de créer la session de paiement' }
  }

  return { url: session.url }
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return { error: 'Aucun abonnement trouvé' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/profile`,
  })

  redirect(session.url)
}

export async function getSubscriptionInfo() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { plan: 'free' as PlanName, subscription: null }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!subscription) {
    return { plan: 'free' as PlanName, subscription: null }
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  const plan: PlanName = isActive ? (subscription.plan as PlanName) : 'free'

  return { plan, subscription }
}
