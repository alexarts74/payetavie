'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import NavLinks from '@/components/NavLinks'
import { signOut } from '@/app/actions/auth'

type TopicsShellProps = {
  userEmail: string | null
  children: React.ReactNode
}

export default function TopicsShell({ userEmail, children }: TopicsShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Barre supérieure mobile */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-blue-100/50 md:hidden">
        <Link href="/topics" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/40 flex items-center justify-center">
            <span className="text-sm font-bold text-white">PTV</span>
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PayeTaVie
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar desktop fixe */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-blue-100/50 flex-col z-20">
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
          {userEmail && (
            <div className="mb-2">
              <span className="text-xs text-zinc-500 truncate block">{userEmail}</span>
            </div>
          )}
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

      {/* Menu mobile en slide-in */}
      {isMobileNavOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />

          {/* Panneau latéral */}
          <aside className="fixed left-0 top-0 h-screen w-72 max-w-[80%] bg-white shadow-2xl shadow-blue-500/30 z-50 flex flex-col md:hidden">
            <div className="p-4 border-b border-blue-100/60 flex items-center justify-between">
              <Link
                href="/topics"
                className="flex items-center gap-3"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/40 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">PTV</span>
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PayeTaVie
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <NavLinks onNavigate={() => setIsMobileNavOpen(false)} />
            </nav>

            <div className="p-4 border-t border-blue-100/60">
              {userEmail && (
                <div className="mb-2">
                  <span className="text-xs text-zinc-500 truncate block">
                    {userEmail}
                  </span>
                </div>
              )}
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
        </>
      )}

      {/* Contenu principal */}
      <main className="pt-14 md:pt-0 md:ml-64">
        {children}
      </main>
    </div>
  )
}


