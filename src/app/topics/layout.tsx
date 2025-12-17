import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopicsShell from '@/components/TopicsShell'

export default async function TopicsLayout({
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

  return (
    <TopicsShell userEmail={user.email}>
      {children}
    </TopicsShell>
  )
}

