'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X, LayoutDashboard, User, HelpCircle, Wallet, Crown } from 'lucide-react'
import NavLinks from '@/components/NavLinks'
import GlobalSearch from '@/components/GlobalSearch'
import { signOut } from '@/app/actions/auth'
import type { PlanName } from '@/types'

type TopicsShellProps = {
  userEmail: string | null | undefined
  selectedTopics?: string[]
  plan?: PlanName
  children: React.ReactNode
}

function UserInitials({ email }: { email: string }) {
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <div className="w-8 h-8 rounded-lg bg-[#235037] flex items-center justify-center">
      <span className="text-xs font-semibold text-white">{initials || <User className="w-3.5 h-3.5" />}</span>
    </div>
  )
}

function FAQButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-faq'))}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#235037] bg-[#EEF7F1] hover:bg-[#235037]/10 border border-[#235037]/20 transition-all duration-200"
    >
      <HelpCircle className="w-4 h-4" />
      <span>FAQ</span>
    </button>
  )
}

export default function TopicsShell({ userEmail, selectedTopics, plan, children }: TopicsShellProps) {
  const canAccessEssentiel = plan === 'essentiel' || plan === 'pro'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  const isTopicPage = (pathname.startsWith('/topics/') && pathname !== '/topics') || pathname.startsWith('/freelance/')

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to close mobile nav on route change
      setIsMobileNavOpen(false)
    }
    prevPathnameRef.current = pathname
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#F5E9AF]">
      {/* Barre supérieure mobile */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center gap-2 px-4 py-3 bg-white border-b border-[#E8E8E8] md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-[18px] bg-[#235037] flex items-center justify-center">
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
          </div>
        </Link>

        <GlobalSearch
          selectedTopics={selectedTopics}
          plan={plan}
          className="flex-1 min-w-0"
        />

        <div className="flex items-center gap-1 flex-shrink-0">
          {isTopicPage && <FAQButton />}
          <form action={signOut}>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#5A6B61] hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label="Déconnexion"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-[#235037] hover:bg-[#EEF7F1] transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Top bar desktop */}
      <header className="hidden md:flex fixed top-0 left-[272px] right-0 z-20 h-14 items-center justify-between px-6 bg-white border-b border-[#E8E8E8]">
        <GlobalSearch
          selectedTopics={selectedTopics}
          plan={plan}
          className="w-full max-w-[280px]"
        />
        <div className="flex items-center gap-1">
          {isTopicPage && <FAQButton />}
          <form action={signOut}>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#5A6B61] hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label="Déconnexion"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </form>
        </div>
      </header>

      {/* Sidebar desktop fixe */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[272px] bg-white border-r border-[#E8E8E8] flex-col z-20">
        {/* Logo/Header */}
        <div className="px-5 py-5 border-b border-[#E8E8E8] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[22px] bg-[#235037] flex items-center justify-center">
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#235037] leading-tight" style={{ fontFamily: 'var(--font-caprasimo)' }}>
                PayeTaVie
              </h1>
              <p className="text-[10px] text-[#5A6B61] font-medium tracking-wide">
                Ton assistant administratif
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation scrollable */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {/* Dashboard link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                pathname === '/dashboard'
                  ? 'bg-[#EEF7F1]'
                  : 'hover:bg-[#F5E9AF]/60'
              }`}
            >
              {pathname === '/dashboard' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#235037]" />
              )}
              <LayoutDashboard
                className={`w-[18px] h-[18px] transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#235037]'
                    : 'text-[#5A6B61] group-hover:text-[#235037]'
                }`}
              />
              <span
                className={`text-[12px] font-semibold tracking-wide transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#235037]'
                    : 'text-[#5A6B61] group-hover:text-[#235037]'
                }`}
              >
                Tableau de bord
              </span>
            </Link>

            {/* Dépenses link */}
            {canAccessEssentiel && (
              <Link
                href="/depenses"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  pathname.startsWith('/depenses')
                    ? 'bg-[#EEF7F1]'
                    : 'hover:bg-[#F5E9AF]/60'
                }`}
              >
                {pathname.startsWith('/depenses') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#235037]" />
                )}
                <Wallet
                  className={`w-[18px] h-[18px] transition-colors ${
                    pathname.startsWith('/depenses')
                      ? 'text-[#235037]'
                      : 'text-[#5A6B61] group-hover:text-[#235037]'
                  }`}
                />
                <span
                  className={`text-[12px] font-semibold tracking-wide transition-colors ${
                    pathname.startsWith('/depenses')
                      ? 'text-[#235037]'
                      : 'text-[#5A6B61] group-hover:text-[#235037]'
                  }`}
                >
                  Dépenses
                </span>
              </Link>
            )}

            {/* Séparateur */}
            <div className="py-2 px-3">
              <div className="h-px bg-[#E8E8E8]" />
            </div>

            {/* Titre section */}
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold text-[#5A6B61] uppercase tracking-widest">
                Categories
              </span>
            </div>

            <NavLinks selectedTopics={selectedTopics} plan={plan} />
          </div>
        </nav>

        {/* User section en bas */}
        <div className="px-3 py-4 border-t border-[#E8E8E8] flex-shrink-0">
          {plan !== 'pro' && (
            <div className="rounded-xl bg-[#EEF7F1] border border-[#235037]/15 p-3 mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-[#235037]" />
                <span className="text-[12px] font-semibold text-[#235037]">
                  {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                </span>
              </div>
              <p className="text-[11px] text-[#5A6B61] mb-2.5 leading-relaxed">
                {plan === 'essentiel'
                  ? 'Accédez à la facturation et aux outils freelance.'
                  : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
              </p>
              <Link
                href="/pricing"
                className="block w-full text-center px-3 py-1.5 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white text-[12px] font-medium transition-colors duration-200"
              >
                Voir les plans
              </Link>
            </div>
          )}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-2 rounded-xl py-2 transition-all duration-200 ${
              pathname === '/profile'
                ? 'bg-[#EEF7F1]'
                : 'hover:bg-[#F5E9AF]/60'
            }`}
          >
            {userEmail ? (
              <>
                <UserInitials email={userEmail} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#235037] truncate block leading-tight">
                    {userEmail.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-[#5A6B61] truncate block">
                    {userEmail}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#EEF7F1] flex items-center justify-center">
                <User className="w-4 h-4 text-[#5A6B61]" />
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Menu mobile en slide-in */}
      <>
        {/* Overlay */}
        <button
          type="button"
          aria-label="Fermer le menu"
          className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out bg-black/35 ${
            isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />

        {/* Panneau latéral */}
        <aside
          className={`fixed left-0 top-0 h-screen w-72 max-w-[80%] bg-white z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
            <div className="px-5 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <div className="w-9 h-9 rounded-[18px] bg-[#235037] flex items-center justify-center">
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#235037] leading-tight block" style={{ fontFamily: 'var(--font-caprasimo)' }}>
                    PayeTaVie
                  </span>
                  <span className="text-[9px] text-[#5A6B61] font-medium tracking-wide">
                    Ton assistant administratif
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-[#5A6B61] hover:text-[#235037] hover:bg-[#EEF7F1] transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    pathname === '/dashboard'
                      ? 'bg-[#EEF7F1]'
                      : 'hover:bg-[#F5E9AF]/60'
                  }`}
                >
                  {pathname === '/dashboard' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#235037]" />
                  )}
                  <LayoutDashboard
                    className={`w-[18px] h-[18px] transition-colors ${
                      pathname === '/dashboard'
                        ? 'text-[#235037]'
                        : 'text-[#5A6B61] group-hover:text-[#235037]'
                    }`}
                  />
                  <span
                    className={`text-[12px] font-semibold tracking-wide transition-colors ${
                      pathname === '/dashboard'
                        ? 'text-[#235037]'
                        : 'text-[#5A6B61] group-hover:text-[#235037]'
                    }`}
                  >
                    Tableau de bord
                  </span>
                </Link>
                {canAccessEssentiel && (
                  <Link
                    href="/depenses"
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      pathname.startsWith('/depenses')
                        ? 'bg-[#EEF7F1]'
                        : 'hover:bg-[#F5E9AF]/60'
                    }`}
                  >
                    {pathname.startsWith('/depenses') && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#235037]" />
                    )}
                    <Wallet
                      className={`w-[18px] h-[18px] transition-colors ${
                        pathname.startsWith('/depenses')
                          ? 'text-[#235037]'
                          : 'text-[#5A6B61] group-hover:text-[#235037]'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-semibold tracking-wide transition-colors ${
                        pathname.startsWith('/depenses')
                          ? 'text-[#235037]'
                          : 'text-[#5A6B61] group-hover:text-[#235037]'
                      }`}
                    >
                      Dépenses
                    </span>
                  </Link>
                )}
                <div className="py-2 px-3">
                  <div className="h-px bg-[#E8E8E8]" />
                </div>
                <div className="px-3 pb-1">
                  <span className="text-[10px] font-semibold text-[#5A6B61] uppercase tracking-widest">
                    Categories
                  </span>
                </div>
                <NavLinks onNavigate={() => setIsMobileNavOpen(false)} selectedTopics={selectedTopics} plan={plan} />
              </div>
            </nav>

            <div className="px-3 py-4 border-t border-[#E8E8E8]">
              {plan !== 'pro' && (
                <div className="rounded-xl bg-[#EEF7F1] border border-[#235037]/15 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-[#235037]" />
                    <span className="text-[12px] font-semibold text-[#235037]">
                      {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6B61] mb-2.5 leading-relaxed">
                    {plan === 'essentiel'
                      ? 'Accédez à la facturation et aux outils freelance.'
                      : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
                  </p>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="block w-full text-center px-3 py-1.5 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white text-[12px] font-medium transition-colors duration-200"
                  >
                    Voir les plans
                  </Link>
                </div>
              )}
              <Link
                href="/profile"
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center gap-3 px-2 rounded-xl py-2 transition-all duration-200 ${
                  pathname === '/profile'
                    ? 'bg-[#EEF7F1]'
                    : 'hover:bg-[#F5E9AF]/60'
                }`}
              >
                {userEmail ? (
                  <>
                    <UserInitials email={userEmail} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#235037] truncate block leading-tight">
                        {userEmail.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-[#5A6B61] truncate block">
                        {userEmail}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#EEF7F1] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#5A6B61]" />
                  </div>
                )}
              </Link>
            </div>
          </aside>
      </>

      {/* Contenu principal */}
      <main className="pt-14 md:pt-14 md:ml-[272px] bg-[#F5E9AF]">
        {children}
      </main>
    </div>
  )
}
