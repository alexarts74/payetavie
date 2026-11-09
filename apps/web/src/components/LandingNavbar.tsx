'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Thématiques', href: '#thematiques' },
    { label: 'Tarifs', href: '#tarifs' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E8E8E8] shadow-sm'
          : 'bg-white/60 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#235037] flex items-center justify-center">
              <span className="text-xs font-bold text-white">PTV</span>
            </div>
            <span className="font-semibold text-[#1a2e22] ">PayeTaVie</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#5A6B61]  hover:text-[#1a2e22] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#5A6B61]  hover:text-[#1a2e22] transition-colors px-4 py-2 rounded-lg hover:bg-[#EEF7F1]/80 /80"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#5A6B61] hover:bg-[#EEF7F1] transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#E8E8E8] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#5A6B61]  hover:text-[#1a2e22] py-2.5 px-3 rounded-lg hover:bg-[#EEF7F1]  transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-3 border-t border-[#E8E8E8] mt-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-center py-2.5 rounded-lg border border-[#E8E8E8] text-[#5A6B61]  hover:bg-[#EEF7F1]  transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold text-center py-2.5 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
