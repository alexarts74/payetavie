import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPreferences } from '@/app/actions/preferences'
import Link from 'next/link'
import {
  FileText,
  Briefcase,
  Heart,
  DollarSign,
  HandHeart,
  Home,
  Shield,
  Stethoscope,
  Pill,
  TestTube,
  ArrowRight,
} from 'lucide-react'
import TopicToggleButton from '@/components/TopicToggleButton'

const categories = [
  {
    name: 'Travail',
    icon: Briefcase,
    topics: [
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
    ],
  },
  {
    name: 'Sante & Medical',
    icon: Stethoscope,
    topics: [
      { slug: 'mutuelle', title: 'Mutuelle', icon: Heart },
      { slug: 'medecin-generaliste', title: 'Medecin generaliste', icon: Stethoscope },
      { slug: 'pharmacie', title: 'Pharmacie', icon: Pill },
      { slug: 'analyses-medicales', title: 'Analyses medicales', icon: TestTube },
    ],
  },
  {
    name: 'Logement',
    icon: Home,
    topics: [
      { slug: 'logement', title: 'Logement', icon: Home },
    ],
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

  const { data: preferences } = await getUserPreferences()
  const selectedTopics = preferences?.selected_topics
  const hasPreferences = !!selectedTopics && selectedTopics.length > 0

  // Split categories into selected and other topics
  const selectedCategories = hasPreferences
    ? categories
        .map(cat => ({ ...cat, topics: cat.topics.filter(t => selectedTopics.includes(t.slug)) }))
        .filter(cat => cat.topics.length > 0)
    : categories

  const otherCategories = hasPreferences
    ? categories
        .map(cat => ({ ...cat, topics: cat.topics.filter(t => !selectedTopics.includes(t.slug)) }))
        .filter(cat => cat.topics.length > 0)
    : []

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {hasPreferences ? 'Mes sujets' : 'Tous les topics'}
          </h1>
          <p className="text-zinc-700 dark:text-zinc-400">
            {hasPreferences
              ? 'Les sujets que vous suivez pour gerer votre vie administrative'
              : 'Explorez tous les sujets disponibles pour gerer votre vie administrative'}
          </p>
        </div>

        {/* Selected topics */}
        <div className="space-y-8">
          {selectedCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <div
                key={category.name}
                className="glass-card rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: `${categoryIndex * 0.1}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{category.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.topics.map((topic) => {
                    const TopicIcon = topic.icon
                    return (
                      <Link
                        key={topic.slug}
                        href={`/topics/${topic.slug}`}
                        className="group flex items-center gap-4 p-4 rounded-xl glass-card transition-all duration-150 hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center">
                          <TopicIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                            {topic.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-500 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Other available topics */}
        {otherCategories.length > 0 && (
          <>
            <div className="mt-12 mb-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Autres sujets disponibles
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Ajoutez des sujets pour les retrouver dans votre sidebar
              </p>
            </div>

            <div className="space-y-8">
              {otherCategories.map((category, categoryIndex) => {
                const CategoryIcon = category.icon
                return (
                  <div
                    key={`other-${category.name}`}
                    className="glass-card rounded-2xl p-6 opacity-70 animate-slide-up"
                    style={{ animationDelay: `${categoryIndex * 0.1}s`, opacity: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <h2 className="text-2xl font-semibold text-zinc-500 dark:text-zinc-400">{category.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.topics.map((topic) => {
                        const TopicIcon = topic.icon
                        return (
                          <div
                            key={topic.slug}
                            className="flex items-center gap-4 p-4 rounded-xl glass-card transition-all duration-300"
                          >
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <TopicIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-zinc-500 dark:text-zinc-400">
                                {topic.title}
                              </h3>
                            </div>
                            <TopicToggleButton slug={topic.slug} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
