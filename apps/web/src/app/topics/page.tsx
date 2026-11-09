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
          .map(t => ({ ...t, categoryName: cat.name }))
      )
    : categories.flatMap(cat =>
        cat.topics.map(t => ({ ...t, categoryName: cat.name }))
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
          <h1 className="text-2xl font-bold text-[#1a2e22] mb-1">
            {hasPreferences ? 'Mes sujets' : 'Tous les sujets'}
          </h1>
          <p className="text-sm text-[#5A6B61]">
            {hasPreferences
              ? 'Les sujets que vous suivez pour gérer votre vie administrative'
              : 'Explorez tous les sujets disponibles pour gérer votre vie administrative'}
          </p>
          <div className="mt-4 h-px bg-[#E8E8E8]" />
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
                  className="group card rounded-xl p-4 flex flex-col gap-3 transition-all duration-150 hover:border-[#235037]/20 hover:-translate-y-0.5 animate-slide-up"
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EEF7F1]">
                    <TopicIcon className="w-4 h-4 text-[#235037]" />
                  </div>
                  <p className="text-sm font-medium text-[#1a2e22] group-hover:text-[#235037] transition-colors leading-snug flex-1">
                    {topic.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#EEF7F1] text-[#235037]">
                      {topic.categoryName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5A6B61] group-hover:text-[#235037] transition-colors" />
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
              <h2 className="text-sm font-semibold text-[#1a2e22] mb-0.5">
                Autres sujets disponibles
              </h2>
              <p className="text-xs text-[#5A6B61]">
                Ajoutez des sujets pour les retrouver dans votre sidebar
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allOtherTopics.map((topic) => {
                const TopicIcon = topic.icon
                return (
                  <div
                    key={topic.slug}
                    className="card rounded-xl p-4 flex flex-col gap-3 opacity-60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EEF7F1] flex items-center justify-center">
                      <TopicIcon className="w-4 h-4 text-[#5A6B61]" />
                    </div>
                    <p className="text-sm font-medium text-[#5A6B61] leading-snug flex-1">
                      {topic.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6B61]">
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
