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
  MapPin,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import ManageTopicsModal from '@/components/ManageTopicsModal'
import { PLAN_LIMITS } from '@/lib/stripe'
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
    name: 'Finances',
    icon: FileText,
    topics: [
      { slug: 'impots', title: 'Impots', icon: FileText },
      { slug: 'urssaf', title: 'URSSAF / Cotisations', icon: Briefcase },
      { slug: 'assurances', title: 'Assurances', icon: Shield },
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
]

const freelanceLinks = [
  { slug: 'freelance-clients', title: 'Clients', icon: Users, href: '/freelance/clients' },
  { slug: 'freelance-facturation', title: 'Facturation', icon: Receipt, href: '/freelance/facturation' },
  { slug: 'freelance-profil', title: 'Profil pro', icon: UserCog, href: '/freelance/profil' },
]

export default function NavLinks({ onNavigate, selectedTopics, plan }: NavLinksProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const [isManageOpen, setIsManageOpen] = useState(false)

  const canAccessPro = plan === 'pro'
  const canAccessEssentiel = plan === 'essentiel' || plan === 'pro'

  const filteredCategories = useMemo(() => {
    if (!selectedTopics) return categories
    return categories
      .map(cat => ({ ...cat, topics: cat.topics.filter(t => selectedTopics.includes(t.slug)) }))
      .filter(cat => cat.topics.length > 0)
  }, [selectedTopics])

  const isTopicActive = (slug: string) => {
    if (slug.startsWith('freelance-')) {
      return pathname.startsWith(`/freelance/${slug.replace('freelance-', '')}`)
    }
    return pathname === `/topics/${slug}`
  }

  const activeCategoryName = useMemo(() => {
    const activeCategory = filteredCategories.find(cat =>
      cat.topics.some(topic => isTopicActive(topic.slug))
    )
    return activeCategory?.name || null
  }, [pathname, filteredCategories])

  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    return activeCategoryName ? new Set([activeCategoryName]) : new Set()
  })

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && activeCategoryName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync state with URL changes
      setOpenCategories(new Set([activeCategoryName]))
    }
    prevPathnameRef.current = pathname
  }, [pathname, activeCategoryName])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => {
      if (prev.has(categoryName)) {
        return new Set()
      }
      return new Set([categoryName])
    })
  }

  return (
    <div className="space-y-0.5">
      {filteredCategories.length === 0 && !canAccessPro && (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-[#5A6B61] mb-2">Aucun sujet selectionne</p>
          <button
            onClick={() => setIsManageOpen(true)}
            className="text-xs font-medium text-[#235037] hover:text-[#1a3d2a]"
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

        if (isSingleTopic) {
          const topic = category.topics[0]
          const isActive = isTopicActive(topic.slug)
          return (
            <div key={category.name}>
              <Link
                href={`/topics/${topic.slug}`}
                onClick={onNavigate}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#EEF7F1]'
                    : 'hover:bg-[#F5E9AF]/60'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#235037]'
                    : 'bg-[#EEF7F1] group-hover:bg-[#235037]/10'
                }`}>
                  <CategoryIcon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#235037]'
                  }`} />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isActive
                    ? 'text-[#235037]'
                    : 'text-[#5A6B61] group-hover:text-[#235037]'
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
            <button
              onClick={() => toggleCategory(category.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                hasActiveTopic && !isOpen
                  ? 'bg-[#EEF7F1]'
                  : 'hover:bg-[#F5E9AF]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isOpen || hasActiveTopic
                    ? 'bg-[#235037]'
                    : 'bg-[#EEF7F1] group-hover:bg-[#235037]/10'
                }`}>
                  <CategoryIcon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isOpen || hasActiveTopic
                      ? 'text-white'
                      : 'text-[#235037]'
                  }`} />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isOpen || hasActiveTopic
                    ? 'text-[#235037]'
                    : 'text-[#5A6B61] group-hover:text-[#235037]'
                }`}>
                  {category.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5A6B61] group-hover:text-[#235037] transition-all duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="py-1 ml-[22px] border-l border-[#E8E8E8]">
                {category.topics.map((topic) => {
                  const TopicIcon = topic.icon
                  const isActive = isTopicActive(topic.slug)

                  return (
                    <div key={topic.slug} className="relative">
                      <Link
                        href={`/topics/${topic.slug}`}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 px-3 py-2 ml-3 mr-1 rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-[#EEF7F1]'
                            : 'hover:bg-[#F5E9AF]/60'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#235037]" />
                        )}
                        <TopicIcon
                          className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                            isActive
                              ? 'text-[#235037]'
                              : 'text-[#5A6B61] group-hover:text-[#235037]'
                          }`}
                        />
                        <span
                          className={`text-[12px] tracking-wide leading-tight transition-colors duration-200 ${
                            isActive
                              ? 'text-[#235037] font-semibold'
                              : 'text-[#5A6B61] font-semibold group-hover:text-[#235037]'
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

            {!isLastCategory && (
              <div className="h-1" />
            )}
          </div>
        )
      })}

      {/* Section Annuaire (Essentiel+) */}
      {canAccessEssentiel && (
        <>
          <div className="my-3 border-t border-[#E8E8E8]" />
          <Link
            href="/annuaire"
            onClick={onNavigate}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
              pathname === '/annuaire'
                ? 'bg-[#EEF7F1]'
                : 'hover:bg-[#F5E9AF]/60'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
              pathname === '/annuaire'
                ? 'bg-[#235037]'
                : 'bg-[#EEF7F1] group-hover:bg-[#235037]/10'
            }`}>
              <MapPin className={`w-3.5 h-3.5 transition-colors duration-200 ${
                pathname === '/annuaire'
                  ? 'text-white'
                  : 'text-[#235037]'
              }`} />
            </div>
            <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 ${
              pathname === '/annuaire'
                ? 'text-[#235037]'
                : 'text-[#5A6B61] group-hover:text-[#235037]'
            }`}>
              Annuaire
            </span>
          </Link>
        </>
      )}

      {/* Section Freelance (Pro uniquement) */}
      {canAccessPro && (
        <>
          <div className="my-3 border-t border-[#E8E8E8]" />
          <div className="px-3 pb-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#235037]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#235037]">Freelance</span>
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#EBA7CB] text-[9px] font-bold text-[#235037] uppercase tracking-wider">Pro</span>
            </div>
            <div className="space-y-0.5">
              {freelanceLinks.map(({ slug, title, icon: Icon, href }) => {
                const isActive = pathname.startsWith(href)
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#EEF7F1] border border-[#235037]/15'
                        : 'hover:bg-[#EEF7F1]/60 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#235037]'
                        : 'bg-[#EEF7F1] group-hover:bg-[#235037]/10'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-[#235037]'
                      }`} />
                    </div>
                    <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-[#235037]'
                        : 'text-[#5A6B61] group-hover:text-[#235037]'
                    }`}>
                      {title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Bouton Gerer mes sujets */}
      {selectedTopics && (
        <div className="pt-2">
          <button
            onClick={() => setIsManageOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#5A6B61] hover:text-[#235037] hover:bg-[#EEF7F1] transition-all duration-200"
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
        maxTopics={plan ? PLAN_LIMITS[plan].topics : undefined}
      />
    </div>
  )
}
