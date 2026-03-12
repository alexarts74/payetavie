import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceIdToPlan } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import Stripe from 'stripe'

function getSubscriptionPeriodDates(sub: Stripe.Subscription) {
  // In Stripe v20+, current_period_start/end are removed.
  // Use start_date and calculate based on billing_cycle_anchor.
  const startDate = sub.start_date ? new Date(sub.start_date * 1000).toISOString() : null
  const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null
  return { startDate, endDate: cancelAt }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature invalide'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription' || !session.subscription || !session.customer) break

      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer.id

      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      const sub = stripeSubscription as unknown as Stripe.Subscription
      const priceId = sub.items.data[0]?.price?.id
      const plan = priceId ? getPriceIdToPlan(priceId) : 'free'
      const userId = session.metadata?.supabase_user_id
      const { startDate, endDate } = getSubscriptionPeriodDates(sub)

      if (!userId) break

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        status: 'active',
        current_period_start: startDate,
        current_period_end: endDate,
        cancel_at_period_end: sub.cancel_at_period_end,
      }, { onConflict: 'user_id' })

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id
      const priceId = subscription.items.data[0]?.price?.id
      const plan = priceId ? getPriceIdToPlan(priceId) : 'free'
      const { startDate, endDate } = getSubscriptionPeriodDates(subscription)

      await supabase
        .from('subscriptions')
        .update({
          plan,
          status: subscription.status as string,
          current_period_start: startDate,
          current_period_end: endDate,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          cancel_at_period_end: false,
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
