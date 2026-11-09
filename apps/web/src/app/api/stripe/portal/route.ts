import { createClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/pricing')
  }

  // Validate the token using a standard Supabase client (no SSR cookies)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    redirect('/pricing')
  }

  const serviceSupabase = createServiceRoleClient()
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    redirect('/pricing')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payetavie.fr'

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/profile`,
    })
    redirect(session.url)
  } catch (error) {
    if (error instanceof Error && 'digest' in error) throw error
    console.error('Stripe portal error:', error)
    redirect('/pricing')
  }
}
