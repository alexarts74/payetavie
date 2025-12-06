import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Zap,
  CheckCircle2,
  PenSquare,
  Clock,
  Heart,
  BookOpen,
  Shield
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'TL;DR clair',
    description: 'Résumés rapides pour comprendre l\'essentiel en quelques secondes',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: CheckCircle2,
    title: 'Checklists pratiques',
    description: 'Des listes d\'actions concrètes pour ne rien oublier dans vos démarches',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: BookOpen,
    title: 'FAQ complètes',
    description: 'Réponses aux questions les plus fréquentes sur chaque sujet',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: PenSquare,
    title: 'Notes personnelles',
    description: 'Gardez vos informations importantes à portée de main pour chaque topic',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Clock,
    title: 'Rappels personnalisés',
    description: 'Créez des rappels avec dates d\'échéance pour ne manquer aucun délai',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: Heart,
    title: 'Favoris',
    description: 'Sauvegardez vos ressources officielles préférées pour un accès rapide',
    color: 'from-indigo-500 to-blue-600'
  },
]

export default async function TopicsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header minimaliste */}
        <div className="mb-16 text-center pt-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-900 mb-6">
            Bienvenue sur <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PayeTaVie</span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Votre assistant personnel pour comprendre et gérer tous les aspects administratifs de la vie adulte
          </p>
        </div>

        {/* Section principale */}
        <div className="space-y-16">
          {/* Qu'est-ce que PayeTaVie */}
          <section>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3">Qu'est-ce que PayeTaVie ?</h2>
                <p className="text-zinc-600 leading-relaxed mb-4">
                  PayeTaVie est votre guide complet pour naviguer dans les méandres de l'administration française. 
                  Que vous soyez jeune actif, indépendant ou simplement en quête de clarté, nous vous accompagnons 
                  dans la compréhension des impôts, cotisations, mutuelles, aides sociales et bien plus encore.
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  Chaque sujet est expliqué de manière claire et accessible, avec des checklists pratiques, 
                  des FAQ détaillées et des ressources officielles. Personnalisez votre expérience avec des notes 
                  et des rappels pour ne rien oublier.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl border border-blue-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Comment ça marche */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">
              Comment ça marche ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Explorez les sujets</h3>
                <p className="text-sm text-zinc-600">
                  Parcourez les différents topics dans la barre latérale pour trouver ce qui vous intéresse
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Consultez les guides</h3>
                <p className="text-sm text-zinc-600">
                  Lisez les TL;DR, suivez les checklists et consultez les FAQ pour chaque sujet
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Personnalisez</h3>
                <p className="text-sm text-zinc-600">
                  Ajoutez vos notes, créez des rappels et sauvegardez vos ressources favorites
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

