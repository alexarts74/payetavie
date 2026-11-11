import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPreferences } from '@/app/actions/preferences'
import { AIDES, getAidesForProfile, type ProfileType } from '@payetavie/shared'
import AidesMoteur from '@/components/AidesMoteur'

export default async function AidesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: preferences } = await getUserPreferences()
  const profileType = (preferences?.profile_type ?? 'autre') as ProfileType

  const aidesForProfile = getAidesForProfile(profileType)

  return (
    <AidesMoteur
      aides={aidesForProfile}
      allAides={AIDES}
      profileType={profileType}
    />
  )
}
