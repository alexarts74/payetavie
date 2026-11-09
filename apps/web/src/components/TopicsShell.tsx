'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X, LayoutDashboard, User, HelpCircle, Wallet, Crown, PanelLeft } from 'lucide-react'
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
    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  const isTopicPage = (pathname.startsWith('/topics/') && pathname !== '/topics') || pathname.startsWith('/freelance/')

  useEffect(() => {
    const stored = localStorage.getItem('payetavie-sidebar')
    if (stored !== null) setIsSidebarOpen(stored === 'true')
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      localStorage.setItem('payetavie-sidebar', String(!prev))
      return !prev
    })
  }

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

      {/* Sidebar desktop flottante */}
      <aside className={`hidden md:flex fixed left-4 top-4 bottom-4 bg-[#235037] rounded-2xl shadow-xl flex-col z-20 overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[260px]' : 'w-[72px]'}`}>
        {/* Logo/Header */}
        <div className={`border-b border-white/10 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-5 py-5 flex items-center justify-between' : 'py-5 flex flex-col items-center gap-2'}`}>
          <Link href="/dashboard" className={`flex items-center gap-3 min-w-0 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-[18px] bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-caprasimo)' }}>PayeTaVie</h1>
                <p className="text-[10px] text-white/50 font-medium tracking-wide">Ton assistant administratif</p>
              </div>
            )}
          </Link>
          {isSidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
              aria-label="Réduire le menu"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation scrollable */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {/* Dashboard link */}
            {isSidebarOpen ? (
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${pathname === '/dashboard' ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                {pathname === '/dashboard' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#EBA7CB]" />}
                <LayoutDashboard className="w-[18px] h-[18px] text-white/80 transition-colors group-hover:text-white" />
                <span className="text-[12px] font-semibold tracking-wide transition-colors text-white/80 group-hover:text-white">Tableau de bord</span>
              </Link>
            ) : (
              <Link href="/dashboard" title="Tableau de bord" className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${pathname === '/dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <LayoutDashboard className="w-[18px] h-[18px] text-white" />
              </Link>
            )}

            {/* Dépenses link */}
            {canAccessEssentiel && (
              isSidebarOpen ? (
                <Link
                  href="/depenses"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${pathname.startsWith('/depenses') ? 'bg-white/15' : 'hover:bg-white/10'}`}
                >
                  {pathname.startsWith('/depenses') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#EBA7CB]" />}
                  <Wallet className="w-[18px] h-[18px] text-white/80 transition-colors group-hover:text-white" />
                  <span className="text-[12px] font-semibold tracking-wide transition-colors text-white/80 group-hover:text-white">Dépenses</span>
                </Link>
              ) : (
                <Link href="/depenses" title="Dépenses" className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${pathname.startsWith('/depenses') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <Wallet className="w-[18px] h-[18px] text-white" />
                </Link>
              )
            )}

            {/* Séparateur + titre section */}
            <div className="py-2 px-3">
              <div className="h-px bg-white/10" />
            </div>
            {isSidebarOpen && (
              <div className="px-3 pb-1">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Categories</span>
              </div>
            )}

            <NavLinks selectedTopics={selectedTopics} plan={plan} isCollapsed={!isSidebarOpen} />
          </div>
        </nav>

        {/* Bouton rouvrir — visible uniquement en mode réduit */}
        {!isSidebarOpen && (
          <div className="px-2 pb-2 flex justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Ouvrir le menu"
            >
              <PanelLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* User section en bas */}
        <div className={`border-t border-white/10 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-3 py-4' : 'px-2 py-4 flex justify-center'}`}>
          {isSidebarOpen ? (
            <>
              {plan !== 'pro' && (
                <div className="rounded-xl bg-white/10 border border-white/15 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-[#EBA7CB]" />
                    <span className="text-[12px] font-semibold text-white">
                      {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-2.5 leading-relaxed">
                    {plan === 'essentiel'
                      ? 'Accédez à la facturation et aux outils freelance.'
                      : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
                  </p>
                  <Link
                    href="/pricing"
                    className="block w-full text-center px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-[#235037] text-[12px] font-semibold transition-colors duration-200"
                  >
                    Voir les plans
                  </Link>
                </div>
              )}
              <Link
                href="/profile"
                className={`flex items-center gap-3 px-2 rounded-xl py-2 transition-all duration-200 ${
                  pathname === '/profile' ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                {userEmail ? (
                  <>
                    <UserInitials email={userEmail} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-white truncate block leading-tight">
                        {userEmail.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-white/50 truncate block">
                        {userEmail}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </Link>
            </>
          ) : (
            <Link
              href="/profile"
              title="Profil"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                pathname === '/profile' ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
            >
              {userEmail ? (
                <UserInitials email={userEmail} />
              ) : (
                <User className="w-4 h-4 text-white/70" />
              )}
            </Link>
          )}
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
          className={`fixed left-0 top-0 h-screen w-72 max-w-[80%] bg-[#235037] z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <div className="w-9 h-9 rounded-[18px] bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white leading-tight block" style={{ fontFamily: 'var(--font-caprasimo)' }}>
                    PayeTaVie
                  </span>
                  <span className="text-[9px] text-white/50 font-medium tracking-wide">
                    Ton assistant administratif
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
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
                      ? 'bg-white/15'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {pathname === '/dashboard' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#EBA7CB]" />
                  )}
                  <LayoutDashboard className="w-[18px] h-[18px] text-white/80 group-hover:text-white transition-colors" />
                  <span className="text-[12px] font-semibold tracking-wide text-white/80 group-hover:text-white transition-colors">
                    Tableau de bord
                  </span>
                </Link>
                {canAccessEssentiel && (
                  <Link
                    href="/depenses"
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      pathname.startsWith('/depenses')
                        ? 'bg-white/15'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {pathname.startsWith('/depenses') && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#EBA7CB]" />
                    )}
                    <Wallet className="w-[18px] h-[18px] text-white/80 group-hover:text-white transition-colors" />
                    <span className="text-[12px] font-semibold tracking-wide text-white/80 group-hover:text-white transition-colors">
                      Dépenses
                    </span>
                  </Link>
                )}
                <div className="py-2 px-3">
                  <div className="h-px bg-white/10" />
                </div>
                <div className="px-3 pb-1">
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                    Categories
                  </span>
                </div>
                <NavLinks onNavigate={() => setIsMobileNavOpen(false)} selectedTopics={selectedTopics} plan={plan} />
              </div>
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
              {plan !== 'pro' && (
                <div className="rounded-xl bg-white/10 border border-white/15 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-[#EBA7CB]" />
                    <span className="text-[12px] font-semibold text-white">
                      {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-2.5 leading-relaxed">
                    {plan === 'essentiel'
                      ? 'Accédez à la facturation et aux outils freelance.'
                      : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
                  </p>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="block w-full text-center px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-[#235037] text-[12px] font-semibold transition-colors duration-200"
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
                    ? 'bg-white/15'
                    : 'hover:bg-white/10'
                }`}
              >
                {userEmail ? (
                  <>
                    <UserInitials email={userEmail} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-white truncate block leading-tight">
                        {userEmail.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-white/50 truncate block">
                        {userEmail}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </Link>
            </div>
          </aside>
      </>

      {/* Contenu principal */}
      <main className={`pt-14 md:pt-0 bg-[#F5E9AF] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[292px]' : 'md:ml-[88px]'}`}>
        {/* Top bar desktop — dans le flux, pas sticky */}
        <div className="hidden md:flex h-14 items-center justify-between px-6">
          <GlobalSearch
            selectedTopics={selectedTopics}
            plan={plan}
            className="w-full max-w-[360px]"
          />
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
        {children}
      </main>
    </div>
  )
}
