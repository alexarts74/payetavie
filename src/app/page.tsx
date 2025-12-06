import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/topics')
  }

  const topics = [
    { name: 'Impôts', icon: '📊' },
    { name: 'URSSAF', icon: '💼' },
    { name: 'Mutuelle', icon: '🏥' },
    { name: 'Fiches de paie', icon: '💰' },
    { name: 'CAF', icon: '🤝' },
    { name: 'Logement', icon: '🏠' },
    { name: 'Banque', icon: '🏦' },
    { name: 'Assurances', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50 mb-8">
              <span className="text-4xl font-bold text-white">PTV</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PayeTaVie
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-700 max-w-3xl mx-auto mb-4 font-medium">
              Votre assistant administratif personnel
            </p>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-12">
              Comprenez et gérez tous les aspects de la vie adulte sans stress
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 transform"
              >
                <span className="relative z-10">Créer mon compte gratuitement</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tout ce dont vous avez besoin
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto">
              Des guides clairs et des checklists pour chaque démarche administrative
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {topics.map((topic, index) => (
              <div
                key={topic.name}
                className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {topic.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 text-center group-hover:text-blue-600 transition-colors">
                    {topic.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white/50 backdrop-blur-sm border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">TL;DR clair</h3>
              <p className="text-zinc-600">
                Résumés rapides pour comprendre l'essentiel en quelques secondes
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Checklists pratiques</h3>
              <p className="text-zinc-600">
                Des listes d'actions concrètes pour ne rien oublier
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/30">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Notes personnelles</h3>
              <p className="text-zinc-600">
                Gardez vos informations importantes à portée de main
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
