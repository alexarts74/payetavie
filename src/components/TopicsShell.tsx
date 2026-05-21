'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X, LayoutDashboard, User, Sun, Moon, HelpCircle, Wallet, Crown } from 'lucide-react'
import NavLinks from '@/components/NavLinks'
import { signOut } from '@/app/actions/auth'
import { useTheme } from '@/components/ThemeProvider'
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
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20">
      <span className="text-xs font-semibold text-white">{initials || <User className="w-3.5 h-3.5" />}</span>
    </div>
  )
}

function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
      aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-[18px] h-[18px]" />
      ) : (
        <Moon className="w-[18px] h-[18px]" />
      )}
    </button>
  )
}

function FAQButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-faq'))}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-all duration-200"
    >
      <HelpCircle className="w-4 h-4" />
      <span>FAQ</span>
    </button>
  )
}

export default function TopicsShell({ userEmail, selectedTopics, plan, children }: TopicsShellProps) {
  const canAccessEssentiel = plan === 'essentiel' || plan === 'pro'
  const canAccessPro = plan === 'pro'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  // Afficher le bouton FAQ sur les pages topic et freelance (pas dashboard, pas /topics index)
  const isTopicPage = (pathname.startsWith('/topics/') && pathname !== '/topics') || pathname.startsWith('/freelance/')

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to close mobile nav on route change
      setIsMobileNavOpen(false)
    }
    prevPathnameRef.current = pathname
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* Barre supérieure mobile */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 glass-card-heavy md:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-lg font-semibold gradient-text">
            PayeTaVie
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {isTopicPage && <FAQButton />}
          <ThemeToggleButton />
          <form action={signOut}>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
              aria-label="Déconnexion"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Top bar desktop - fixe en haut du contenu */}
      <header className="hidden md:flex fixed top-0 left-[272px] right-0 z-20 h-14 items-center justify-end px-6 glass-card-heavy">
        <div className="flex items-center gap-1">
          {isTopicPage && <FAQButton />}
          <ThemeToggleButton />
          <form action={signOut}>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
              aria-label="Déconnexion"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </form>
        </div>
      </header>

      {/* Sidebar desktop fixe */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[272px] glass-sidebar flex-col z-20">
        {/* Logo/Header */}
        <div className="px-5 py-5 border-b border-[var(--glass-border)] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 flex items-center justify-center">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text leading-tight">
                PayeTaVie
              </h1>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
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
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40 shadow-sm'
                  : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
              }`}
            >
              {pathname === '/dashboard' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-600" />
              )}
              <LayoutDashboard
                className={`w-[18px] h-[18px] transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                }`}
              />
              <span
                className={`text-[12px] font-semibold tracking-wide transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                }`}
              >
                Tableau de bord
              </span>
            </Link>

            {/* Depenses link - Essentiel+ only */}
            {canAccessEssentiel && (
              <Link
                href="/depenses"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  pathname.startsWith('/depenses')
                    ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40 shadow-sm'
                    : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                {pathname.startsWith('/depenses') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-600" />
                )}
                <Wallet
                  className={`w-[18px] h-[18px] transition-colors ${
                    pathname.startsWith('/depenses')
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`}
                />
                <span
                  className={`text-[12px] font-semibold tracking-wide transition-colors ${
                    pathname.startsWith('/depenses')
                      ? 'text-zinc-800 dark:text-zinc-200'
                      : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`}
                >
                  Depenses
                </span>
              </Link>
            )}

            {/* Séparateur */}
            <div className="py-2 px-3">
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700/60 to-transparent" />
            </div>

            {/* Titre section */}
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                Categories
              </span>
            </div>

            <NavLinks selectedTopics={selectedTopics} plan={plan} />
          </div>
        </nav>

        {/* User section en bas */}
        <div className="px-3 py-4 border-t border-[var(--glass-border)] flex-shrink-0">
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-2 rounded-xl py-2 transition-all duration-200 ${
              pathname === '/profile'
                ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40'
                : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
            }${plan !== 'pro' ? ' mb-3' : ''}`}
          >
            {userEmail ? (
              <>
                <UserInitials email={userEmail} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 truncate block leading-tight">
                    {userEmail.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate block">
                    {userEmail}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </Link>
          {plan !== 'pro' && (
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-500/20 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300">
                  {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2.5 leading-relaxed">
                {plan === 'essentiel'
                  ? 'Accédez à la facturation et aux outils freelance.'
                  : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
              </p>
              <Link
                href="/pricing"
                className="block w-full text-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors duration-200"
              >
                Voir les plans
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Menu mobile en slide-in */}
      <>
        {/* Overlay */}
        <button
          type="button"
          aria-label="Fermer le menu"
          className={`fixed inset-0 glass-overlay z-40 md:hidden transition-opacity duration-300 ease-in-out ${
            isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />

        {/* Panneau latéral */}
        <aside
          className={`fixed left-0 top-0 h-screen w-72 max-w-[80%] glass-modal z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
            <div className="px-5 py-4 border-b border-[var(--glass-border)] flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">P</span>
                </div>
                <div>
                  <span className="text-lg font-semibold gradient-text leading-tight block">
                    PayeTaVie
                  </span>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                    Ton assistant administratif
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
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
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40 shadow-sm'
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {pathname === '/dashboard' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-600" />
                  )}
                  <LayoutDashboard
                    className={`w-[18px] h-[18px] transition-colors ${
                      pathname === '/dashboard'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                    }`}
                  />
                  <span
                    className={`text-[12px] font-semibold tracking-wide transition-colors ${
                      pathname === '/dashboard'
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
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
                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40 shadow-sm'
                        : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {pathname.startsWith('/depenses') && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-600" />
                    )}
                    <Wallet
                      className={`w-[18px] h-[18px] transition-colors ${
                        pathname.startsWith('/depenses')
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-semibold tracking-wide transition-colors ${
                        pathname.startsWith('/depenses')
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                      }`}
                    >
                      Depenses
                    </span>
                  </Link>
                )}
                <div className="py-2 px-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700/60 to-transparent" />
                </div>
                <div className="px-3 pb-1">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                    Categories
                  </span>
                </div>
                <NavLinks onNavigate={() => setIsMobileNavOpen(false)} selectedTopics={selectedTopics} plan={plan} />
              </div>
            </nav>

            <div className="px-3 py-4 border-t border-[var(--glass-border)]">
              <Link
                href="/profile"
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center gap-3 px-2 rounded-xl py-2 transition-all duration-200 ${
                  pathname === '/profile'
                    ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/60 dark:to-violet-950/40'
                    : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                }${plan !== 'pro' ? ' mb-3' : ''}`}
              >
                {userEmail ? (
                  <>
                    <UserInitials email={userEmail} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 truncate block leading-tight">
                        {userEmail.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate block">
                        {userEmail}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </Link>
              {plan !== 'pro' && (
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-500/20 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300">
                      {plan === 'essentiel' ? 'Passer au Pro' : 'Débloquer plus'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2.5 leading-relaxed">
                    {plan === 'essentiel'
                      ? 'Accédez à la facturation et aux outils freelance.'
                      : 'Suivez vos dépenses, gérez vos documents et plus encore.'}
                  </p>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="block w-full text-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors duration-200"
                  >
                    Voir les plans
                  </Link>
                </div>
              )}
            </div>
          </aside>
      </>

      {/* Contenu principal */}
      <main className="pt-14 md:pt-14 md:ml-[272px] app-bg">
        {children}
      </main>
    </div>
  )
}
