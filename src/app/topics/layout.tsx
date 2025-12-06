import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'
import NavLinks from '@/components/NavLinks'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar fixe */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-blue-100/50 flex flex-col z-10">
        {/* Logo/Header */}
        <div className="p-4 border-b border-blue-100/50 flex-shrink-0">
          <Link href="/topics" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50 flex items-center justify-center">
              <span className="text-lg font-bold text-white">PTV</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PayeTaVie
            </h1>
          </Link>
        </div>

        {/* Navigation scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* User section en bas */}
        <div className="p-4 border-t border-blue-100/50 flex-shrink-0">
          <div className="mb-2">
            <span className="text-xs text-zinc-500 truncate block">{user.email}</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content avec marge pour la sidebar */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}

