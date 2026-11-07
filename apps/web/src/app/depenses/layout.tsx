export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopicsShell from '@/components/TopicsShell'
import { getUserPreferences } from '@/app/actions/preferences'
import { getUserSubscription, canAccess } from '@/lib/subscription'

export default async function DepensesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: preferences }, { plan }] = await Promise.all([
    getUserPreferences(),
    getUserSubscription(),
  ])

  if (!preferences || !preferences.onboarding_completed) {
    redirect('/auth/register')
  }

  if (!canAccess(plan, 'essentiel')) {
    redirect('/pricing?required=essentiel')
  }

  return (
    <TopicsShell userEmail={user.email} selectedTopics={preferences?.selected_topics} plan={plan}>
      {children}
    </TopicsShell>
  )
}
