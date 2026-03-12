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
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/40 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/30 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-400/20 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top — Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/30 transition-colors">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <span className="text-2xl font-bold text-white">PayeTaVie</span>
            </Link>
          </div>

          {/* Center — Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                Gerez votre admin<br />en toute simplicite
              </h2>
              <p className="text-indigo-100 text-lg max-w-md">
                Tout ce qu&apos;il faut pour maitriser votre vie administrative, au meme endroit.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: FileText, text: 'Documents organises par categorie' },
                { icon: Bell, text: 'Rappels pour ne rien oublier' },
                { icon: CheckCircle2, text: 'Checklists pas a pas' },
                { icon: Shield, text: 'Donnees securisees et privees' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shrink-0 group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-emerald-400', 'bg-sky-400', 'bg-amber-400', 'bg-rose-400'].map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-indigo-700 flex items-center justify-center`}>
                  <span className="text-[10px] font-bold text-white">{['A', 'M', 'S', 'L'][i]}</span>
                </div>
              ))}
            </div>
            <p className="text-indigo-200 text-sm">
              Rejoignez des utilisateurs qui simplifient leur quotidien
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 relative">
        {/* Subtle background pattern for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <span className="text-2xl font-bold gradient-text">PayeTaVie</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Bon retour parmi nous
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Connectez-vous pour acceder a votre espace
            </p>
          </div>

          {/* Form */}
          <div className="animate-slide-up">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 p-4 animate-scale-in">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
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
                    className="block w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
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
                    className="block w-full pl-11 pr-12 py-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-[15px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/25"
              >
                {loading ? (
                  <>
                    <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400 dark:text-zinc-500">
                  Pas encore inscrit ?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              href="/auth/register"
              className="w-full group flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/30 transition-all duration-150"
            >
              <span>Creer un compte</span>
              <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Back to home */}
          <div className="text-center mt-8 animate-fade-in">
            <Link
              href="/"
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors inline-flex items-center gap-1.5"
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
