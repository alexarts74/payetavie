import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPreferences } from '@/app/actions/preferences'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import { getUserSubscription } from '@/lib/subscription'
import ProfilePageContent from '@/components/ProfilePageContent'
import type { ProfilePageData } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: preferences }, { data: professionalProfile }, subscriptionInfo] = await Promise.all([
    getUserPreferences(),
    getProfessionalProfile(),
    getUserSubscription(),
  ])

  const profileData: ProfilePageData = {
    email: user.email || '',
    displayName: (user.user_metadata?.display_name as string) || null,
    profileType: preferences?.profile_type || 'autre',
    selectedTopics: preferences?.selected_topics || [],
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
  }

  return (
    <ProfilePageContent
      data={profileData}
      professionalProfile={professionalProfile}
      planTier={subscriptionInfo.plan}
      subscription={subscriptionInfo.subscription}
    />
  )
}
