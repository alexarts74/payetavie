export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopicsShell from '@/components/TopicsShell'
import { getUserPreferences } from '@/app/actions/preferences'
import { getUserSubscription } from '@/lib/subscription'

export default async function ProfileLayout({
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

  return (
    <TopicsShell userEmail={user.email} selectedTopics={preferences?.selected_topics} plan={plan}>
      {children}
    </TopicsShell>
  )
}
