'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Users,
  Receipt,
  ChevronDown,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import ManageTopicsModal from '@/components/ManageTopicsModal'
import type { PlanName } from '@/types'

type NavLinksProps = {
  onNavigate?: () => void
  selectedTopics?: string[]
  plan?: PlanName
}

type Topic = {
  slug: string
  title: string
  icon: LucideIcon
}

type Category = {
  name: string
  icon: LucideIcon
  topics: Topic[]
}

const categories: Category[] = [
  {
    name: 'Travail',
    icon: Briefcase,
    topics: [
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
    ],
  },
  {
    name: 'Sante',
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
  {
    name: 'Freelance',
    icon: Briefcase,
    topics: [
      { slug: 'freelance-clients', title: 'Clients', icon: Users },
      { slug: 'freelance-facturation', title: 'Facturation', icon: Receipt },
      { slug: 'impots', title: 'Impots', icon: FileText },
      { slug: 'urssaf', title: 'URSSAF / Cotisations sociales', icon: Briefcase },
      { slug: 'assurances', title: 'Assurances', icon: Shield },
    ],
  },
]

export default function NavLinks({ onNavigate, selectedTopics, plan }: NavLinksProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const [isManageOpen, setIsManageOpen] = useState(false)

  // Filter categories based on selectedTopics and plan
  const filteredCategories = useMemo(() => {
    const canAccessPro = plan === 'pro'
    // Hide Freelance category for non-pro users
    const planFiltered = canAccessPro ? categories : categories.filter(cat => cat.name !== 'Freelance')
    if (!selectedTopics) return planFiltered
    return planFiltered
      .map(cat => ({ ...cat, topics: cat.topics.filter(t => selectedTopics.includes(t.slug)) }))
      .filter(cat => cat.topics.length > 0)
  }, [selectedTopics, plan])

  // Helper to get the href for a topic slug
  const getTopicHref = (slug: string) => {
    if (slug.startsWith('freelance-')) {
      return `/freelance/${slug.replace('freelance-', '')}`
    }
    return `/topics/${slug}`
  }

  // Helper to check if a topic is active
  const isTopicActive = (slug: string) => {
    if (slug.startsWith('freelance-')) {
      return pathname.startsWith(`/freelance/${slug.replace('freelance-', '')}`)
    }
    return pathname === `/topics/${slug}`
  }

  // Determine which category should be open based on pathname
  const activeCategoryName = useMemo(() => {
    const activeCategory = filteredCategories.find(cat =>
      cat.topics.some(topic => isTopicActive(topic.slug))
    )
    return activeCategory?.name || null
  }, [pathname, filteredCategories])

  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    return activeCategoryName ? new Set([activeCategoryName]) : new Set()
  })

  // Ouvrir automatiquement la categorie qui contient le topic actif quand le pathname change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname && activeCategoryName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync state with URL changes
      setOpenCategories(new Set([activeCategoryName]))
    }
    prevPathnameRef.current = pathname
  }, [pathname, activeCategoryName])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => {
      // Si la categorie est deja ouverte, on la ferme
      if (prev.has(categoryName)) {
        return new Set()
      }
      // Sinon, on ferme toutes les autres et on ouvre seulement celle-ci
      return new Set([categoryName])
    })
  }

  return (
    <div className="space-y-0.5">
      {filteredCategories.length === 0 && (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Aucun sujet selectionne</p>
          <button
            onClick={() => setIsManageOpen(true)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Gerer mes sujets
          </button>
        </div>
      )}
      {filteredCategories.map((category, categoryIndex) => {
        const CategoryIcon = category.icon
        const isLastCategory = categoryIndex === filteredCategories.length - 1
        const isSingleTopic = category.topics.length === 1 && category.topics[0].title === category.name
        const hasActiveTopic = category.topics.some(
          topic => isTopicActive(topic.slug)
        )

        // Categorie avec un seul topic identique au nom → lien direct
        if (isSingleTopic) {
          const topic = category.topics[0]
          const isActive = isTopicActive(topic.slug)
          return (
            <div key={category.name}>
              <Link
                href={getTopicHref(topic.slug)}
                onClick={onNavigate}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-50/50 dark:bg-indigo-500/10'
                    : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-zinc-100/80 dark:bg-zinc-800/60 group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-700/60'
                }`}>
                  <CategoryIcon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`} />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isActive
                    ? 'text-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                }`}>
                  {category.name}
                </span>
              </Link>
              {!isLastCategory && <div className="h-1" />}
            </div>
          )
        }

        const isOpen = openCategories.has(category.name)

        return (
          <div key={category.name}>
            {/* En-tete de categorie (cliquable) */}
            <button
              onClick={() => toggleCategory(category.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                hasActiveTopic && !isOpen
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10'
                  : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isOpen || hasActiveTopic
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-zinc-100/80 dark:bg-zinc-800/60 group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-700/60'
                }`}>
                  <CategoryIcon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isOpen || hasActiveTopic
                      ? 'text-white'
                      : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`} />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isOpen || hasActiveTopic
                    ? 'text-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                }`}>
                  {category.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Topics de la categorie (avec transition) */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="py-1 ml-[22px] border-l border-zinc-200/80 dark:border-zinc-700/40">
                {category.topics.map((topic) => {
                  const TopicIcon = topic.icon
                  const isActive = isTopicActive(topic.slug)

                  return (
                    <div key={topic.slug} className="relative">
                      <Link
                        href={getTopicHref(topic.slug)}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 px-3 py-2 ml-3 mr-1 rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/50'
                            : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-indigo-600" />
                        )}
                        <TopicIcon
                          className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'
                          }`}
                        />
                        <span
                          className={`text-[12px] tracking-wide leading-tight transition-colors duration-200 ${
                            isActive
                              ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-zinc-600 dark:text-zinc-400 font-semibold group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                          }`}
                        >
                          {topic.title}
                        </span>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Espacement entre categories (sauf la derniere) */}
            {!isLastCategory && (
              <div className="h-1" />
            )}
          </div>
        )
      })}

      {/* Bouton Gerer mes sujets */}
      {selectedTopics && (
        <div className="pt-2">
          <button
            onClick={() => setIsManageOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-all duration-200"
          >
            <Settings className="w-3.5 h-3.5" />
            Gerer mes sujets
          </button>
        </div>
      )}

      <ManageTopicsModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        currentTopics={selectedTopics ?? []}
        plan={plan}
      />
    </div>
  )
}
