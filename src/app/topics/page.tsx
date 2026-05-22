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

type CategoryColors = {
  iconBg: string
  iconColor: string
  hoverBorder: string
  badge: string
}

const categoryColors: Record<string, CategoryColors> = {
  'Travail': {
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-700',
    badge: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400',
  },
  'Finances': {
    iconBg: 'bg-blue-50 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-700',
    badge: 'bg-blue-50 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400',
  },
  'Sante & Medical': {
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-700',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  'Logement': {
    iconBg: 'bg-amber-50 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-700',
    badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
}

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
    name: 'Finances',
    icon: FileText,
    topics: [
      { slug: 'impots', title: 'Impots', icon: FileText },
      { slug: 'urssaf', title: 'URSSAF / Cotisations', icon: Briefcase },
      { slug: 'assurances', title: 'Assurances', icon: Shield },
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

  const allSelectedTopics = hasPreferences
    ? categories.flatMap(cat =>
        cat.topics
          .filter(t => selectedTopics.includes(t.slug))
          .map(t => ({ ...t, categoryName: cat.name, colors: categoryColors[cat.name] }))
      )
    : categories.flatMap(cat =>
        cat.topics.map(t => ({ ...t, categoryName: cat.name, colors: categoryColors[cat.name] }))
      )

  const allOtherTopics = hasPreferences
    ? categories.flatMap(cat =>
        cat.topics
          .filter(t => !selectedTopics.includes(t.slug))
          .map(t => ({ ...t, categoryName: cat.name }))
      )
    : []

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {hasPreferences ? 'Mes sujets' : 'Tous les sujets'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {hasPreferences
              ? 'Les sujets que vous suivez pour gérer votre vie administrative'
              : 'Explorez tous les sujets disponibles pour gérer votre vie administrative'}
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-zinc-200 via-zinc-100 to-transparent dark:from-zinc-700 dark:via-zinc-800 dark:to-transparent" />
        </div>

        {/* Grille — topics sélectionnés */}
        {allSelectedTopics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allSelectedTopics.map((topic, i) => {
              const TopicIcon = topic.icon
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className={`group glass-card rounded-xl p-4 flex flex-col gap-3 transition-all duration-150 ${topic.colors.hoverBorder} hover:-translate-y-0.5 animate-slide-up`}
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${topic.colors.iconBg}`}>
                    <TopicIcon className={`w-4 h-4 ${topic.colors.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors leading-snug flex-1">
                    {topic.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${topic.colors.badge}`}>
                      {topic.categoryName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Autres sujets */}
        {allOtherTopics.length > 0 && (
          <>
            <div className="mt-8 mb-4">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                Autres sujets disponibles
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ajoutez des sujets pour les retrouver dans votre sidebar
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allOtherTopics.map((topic) => {
                const TopicIcon = topic.icon
                return (
                  <div
                    key={topic.slug}
                    className="glass-card rounded-xl p-4 flex flex-col gap-3 opacity-60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <TopicIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-snug flex-1">
                      {topic.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {topic.categoryName}
                      </span>
                      <TopicToggleButton slug={topic.slug} />
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
