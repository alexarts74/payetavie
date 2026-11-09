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
    <div className="flex min-h-screen items-center justify-center bg-[#F5E9AF]">
      <div className="text-center">
        <p className="text-[#5A6B61]">Déconnexion en cours...</p>
      </div>
    </div>
  )
}

