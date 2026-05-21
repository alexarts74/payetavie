'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Eye, EyeOff, FileText, Bell, CheckCircle2, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Format d\'email invalide')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error('[LOGIN ERROR]', {
        message: error.message,
        status: error.status,
        code: (error as unknown as Record<string, unknown>).code,
        name: error.name,
        cause: error.cause,
        stack: error.stack,
      })
      setError(translateAuthError(error.message))
      setLoading(false)
    } else {
      console.log('[LOGIN OK]', { userId: data.user?.id, session: !!data.session })
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Panel — Branding (1/4) */}
      <div className="hidden lg:flex lg:w-1/4 relative overflow-hidden flex-col justify-between p-8 xl:p-10">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" />
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-indigo-400/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[280px] h-[280px] rounded-full bg-violet-400/30 blur-3xl" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid-white opacity-[0.08]" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/30 transition-colors">
              <span className="text-base font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-white">PayeTaVie</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-3">
              Gerez votre admin<br />simplement
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Tout ce qu&apos;il faut pour maitriser votre vie administrative.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: FileText, text: 'Documents organises' },
              { icon: Bell, text: 'Rappels intelligents' },
              { icon: CheckCircle2, text: 'Checklists guidees' },
              { icon: Shield, text: 'Donnees securisees' },
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

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {['bg-emerald-400', 'bg-sky-400', 'bg-amber-400', 'bg-rose-400'].map((color, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-indigo-700 flex items-center justify-center`}>
                <span className="text-[9px] font-bold text-white">{['A', 'M', 'S', 'L'][i]}</span>
              </div>
            ))}
          </div>
          <p className="text-indigo-200 text-xs">Des milliers d&apos;utilisateurs</p>
        </div>
      </div>

      {/* Right Panel — Form (3/4) */}
      <div className="flex-1 lg:w-3/4 flex items-center justify-center px-6 py-12 relative overflow-y-auto overflow-x-hidden bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30">
        <div className="absolute inset-0 app-bg opacity-40 pointer-events-none" />
        {/* Orbs */}
        <div className="absolute top-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[5%] left-[10%] w-[280px] h-[280px] rounded-full bg-violet-200/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[480px] relative z-10 mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 flex items-center justify-center">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <span className="text-2xl font-bold gradient-text">PayeTaVie</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Connexion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              Bon retour parmi nous
            </h1>
            <p className="text-zinc-500 text-base">
              Connectez-vous pour acceder a votre espace
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white/85 backdrop-blur-sm border border-white/70 shadow-xl shadow-indigo-500/8 rounded-3xl p-8 animate-slide-up">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-scale-in">
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-[18px] w-[18px] text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-[15px]"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-zinc-400">Pas encore inscrit ?</span>
              </div>
            </div>

            {/* Register link */}
            <Link
              href="/auth/register"
              className="w-full group flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[15px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all duration-150"
            >
              <span>Creer un compte</span>
              <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6 animate-fade-in">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Retour a l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
