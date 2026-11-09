'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import Link from 'next/link'
import { Lock, ArrowRight, Eye, EyeOff, FileText, Bell, CheckCircle2, Shield } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(translateAuthError(error.message))
      setLoading(false)
    } else {
      await supabase.auth.signOut()
      router.push('/auth/login?reset=success')
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5E9AF]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/4 relative overflow-hidden flex-col justify-between p-8 xl:p-10 bg-[#235037]">
        <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[280px] h-[280px] rounded-full bg-[#EBA7CB]/10 blur-3xl" />
        <div className="absolute inset-0 dot-grid-white opacity-[0.06]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-[18px] bg-white/15 flex items-center justify-center border border-white/20 group-hover:bg-white/25 transition-colors">
              <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>PayeTaVie</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-3" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              Gérez votre admin<br />simplement
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Tout ce qu&apos;il faut pour maîtriser votre vie administrative.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: FileText, text: 'Documents organisés' },
              { icon: Bell, text: 'Rappels intelligents' },
              { icon: CheckCircle2, text: 'Checklists guidées' },
              { icon: Shield, text: 'Données sécurisées' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBA7CB]/20 border border-[#EBA7CB]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EBA7CB]" />
            <p className="text-white/80 text-xs">Des milliers d&apos;utilisateurs</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:w-3/4 flex items-center justify-center px-6 py-12 relative overflow-y-auto overflow-x-hidden bg-[#F5E9AF]">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#EBA7CB]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[0%] left-[-80px] w-[350px] h-[350px] rounded-full bg-[#235037]/8 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[480px] relative z-10 mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-14 h-14 rounded-[22px] bg-[#235037] flex items-center justify-center shadow-lg shadow-[#235037]/25">
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-caprasimo)' }}>P</span>
              </div>
              <span className="text-2xl font-bold text-[#235037]" style={{ fontFamily: 'var(--font-caprasimo)' }}>PayeTaVie</span>
            </Link>
          </div>

          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF7F1] border border-[#235037]/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#235037]" />
              <span className="text-[11px] font-semibold text-[#235037] uppercase tracking-wider">Nouveau mot de passe</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#235037] mb-2" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              Choisissez un nouveau mot de passe
            </h1>
            <p className="text-[#5A6B61] text-base">
              Minimum 6 caractères. Choisissez un mot de passe fort.
            </p>
          </div>

          <div className="bg-white rounded-[28px] shadow-lg shadow-black/8 p-8 animate-slide-up">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-scale-in">
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-[#235037]">
                  Nouveau mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-[#5A6B61] group-focus-within:text-[#235037] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 rounded-[14px] bg-[#FAFAFA] border border-[#E8E8E8] text-[#1a2e22] placeholder-[#5A6B61]/60 focus:outline-none focus:border-[#235037] focus:ring-2 focus:ring-[#235037]/10 transition-all duration-200 text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5A6B61] hover:text-[#235037] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmation" className="block text-sm font-semibold text-[#235037]">
                  Confirmer le mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-[#5A6B61] group-focus-within:text-[#235037] transition-colors" />
                  </div>
                  <input
                    id="confirmation"
                    name="confirmation"
                    type={showConfirmation ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 rounded-[14px] bg-[#FAFAFA] border border-[#E8E8E8] text-[#1a2e22] placeholder-[#5A6B61]/60 focus:outline-none focus:border-[#235037] focus:ring-2 focus:ring-[#235037]/10 transition-all duration-200 text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(!showConfirmation)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5A6B61] hover:text-[#235037] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmation ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-[15px] font-semibold text-white bg-[#235037] hover:bg-[#1a3d2a] active:bg-[#162d20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235037] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-[0_4px_10px_rgba(35,80,55,0.25)] hover:shadow-[0_6px_16px_rgba(35,80,55,0.3)] mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <span>Enregistrer le mot de passe</span>
                    <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6 animate-fade-in">
            <Link
              href="/auth/login"
              className="text-sm text-[#5A6B61] hover:text-[#235037] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
