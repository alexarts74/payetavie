'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <p className="text-zinc-600 dark:text-zinc-400">Déconnexion en cours...</p>
      </div>
    </div>
  )
}

