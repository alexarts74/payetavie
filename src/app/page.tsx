import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const topics = [
    { name: 'Impots', icon: '📊' },
    { name: 'URSSAF', icon: '💼' },
    { name: 'Mutuelle', icon: '🏥' },
    { name: 'Fiches de paie', icon: '💰' },
    { name: 'CAF', icon: '🤝' },
    { name: 'Logement', icon: '🏠' },
    { name: 'Assurances', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/30 dark:to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center animate-fade-in">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 shadow-sm mb-8">
              <span className="text-4xl font-bold text-white">PTV</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">
                PayeTaVie
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 max-w-3xl mx-auto mb-4 font-medium">
              Votre assistant administratif personnel
            </p>
            <p className="text-lg text-zinc-700 dark:text-zinc-400 max-w-2xl mx-auto mb-12">
              Comprenez et gerez tous les aspects de la vie adulte sans stress
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/register"
                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors duration-150"
              >
                <span className="relative z-10">Creer mon compte gratuitement</span>
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 glass-card font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-all duration-300"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="relative py-20 sm:py-24">
        {/* Background separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              <span className="gradient-text">
                Tout ce dont vous avez besoin
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-400 max-w-2xl mx-auto">
              Des guides clairs et des checklists pour chaque demarche administrative
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {topics.map((topic, index) => (
              <div
                key={topic.name}
                className="group relative glass-card rounded-2xl p-6 sm:p-8 cursor-pointer animate-slide-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-5xl mb-4 text-center">
                    {topic.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {topic.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative glass-card-heavy border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up stagger-1" style={{ opacity: 0 }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 shadow-sm">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">TL;DR clair</h3>
              <p className="text-zinc-700 dark:text-zinc-400">
                Resumes rapides pour comprendre l&apos;essentiel en quelques secondes
              </p>
            </div>
            <div className="text-center animate-slide-up stagger-2" style={{ opacity: 0 }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 shadow-sm">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Checklists pratiques</h3>
              <p className="text-zinc-700 dark:text-zinc-400">
                Des listes d&apos;actions concretes pour ne rien oublier
              </p>
            </div>
            <div className="text-center animate-slide-up stagger-3" style={{ opacity: 0 }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 shadow-sm">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Notes personnelles</h3>
              <p className="text-zinc-700 dark:text-zinc-400">
                Gardez vos informations importantes a portee de main
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative py-20 sm:py-24 border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              <span className="gradient-text">Plans simples et transparents</span>
            </h2>
            <p className="text-lg text-zinc-700 dark:text-zinc-400 max-w-2xl mx-auto">
              Choisissez le plan qui correspond a vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Gratuit */}
            <div className="glass-card rounded-2xl p-8 animate-slide-up" style={{ opacity: 0 }}>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Gratuit</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Pour decouvrir PayeTaVie</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">0€</span>
                <span className="text-sm text-zinc-500 ml-1">pour toujours</span>
              </div>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                <li>3 thematiques</li>
                <li>5 documents</li>
                <li>10 rappels actifs</li>
                <li>Checklists & guides</li>
              </ul>
              <Link
                href="/auth/register"
                className="block w-full py-3 text-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Essentiel */}
            <div className="glass-card rounded-2xl p-8 border-2 border-indigo-500 dark:border-indigo-400 relative animate-slide-up stagger-1" style={{ opacity: 0 }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                Populaire
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Essentiel</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Pour gerer votre vie admin</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">4,99€</span>
                <span className="text-sm text-zinc-500 ml-1">/mois</span>
              </div>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                <li>Tout illimite</li>
                <li>Depenses & budgets</li>
                <li>Export calendrier</li>
                <li>Annuaire</li>
                <li>Notifications email</li>
              </ul>
              <Link
                href="/auth/register"
                className="block w-full py-3 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-md shadow-indigo-500/20"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
