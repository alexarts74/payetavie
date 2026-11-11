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
  Gift,
  type LucideIcon,
} from 'lucide-react'
import ManageTopicsModal from '@/components/ManageTopicsModal'
import { PLAN_LIMITS } from '@/lib/stripe'
import type { PlanName } from '@/types'

type NavLinksProps = {
  onNavigate?: () => void
  selectedTopics?: string[]
  plan?: PlanName
  isCollapsed?: boolean
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

export default function NavLinks({ onNavigate, selectedTopics, plan, isCollapsed = false }: NavLinksProps) {
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
      if (prev.has(categoryName)) return new Set()
      return new Set([categoryName])
    })
  }

  // ── Mode réduit : icônes seulement ──────────────────────────────────────
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon
          const hasActiveTopic = category.topics.some(t => isTopicActive(t.slug))
          const firstTopicHref = category.topics.length === 1
            ? `/topics/${category.topics[0].slug}`
            : `/topics/${category.topics[0].slug}`

          return (
            <Link
              key={category.name}
              href={firstTopicHref}
              onClick={onNavigate}
              title={category.name}
              className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
                hasActiveTopic ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <CategoryIcon className="w-[18px] h-[18px] text-white" />
            </Link>
          )
        })}

        <>
          <div className="my-2 mx-3 border-t border-white/10" />
          <Link
            href="/annuaire"
            onClick={onNavigate}
            title="Annuaire"
            className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
              pathname === '/annuaire' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <MapPin className="w-[18px] h-[18px] text-white" />
          </Link>
          <Link
            href="/aides"
            onClick={onNavigate}
            title="Aides & droits"
            className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
              pathname === '/aides' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Gift className="w-[18px] h-[18px] text-white" />
          </Link>
        </>

        {canAccessPro && (
          <>
            <div className="my-2 mx-3 border-t border-white/10" />
            {freelanceLinks.map(({ slug, title, icon: Icon, href }) => (
              <Link
                key={slug}
                href={href}
                onClick={onNavigate}
                title={title}
                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
                  pathname.startsWith(href) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-[18px] h-[18px] text-white" />
              </Link>
            ))}
          </>
        )}

        {selectedTopics && (
          <div className="pt-2">
            <button
              onClick={() => setIsManageOpen(true)}
              title="Gérer mes sujets"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Settings className="w-[18px] h-[18px]" />
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

  // ── Mode complet ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-0.5">
      {filteredCategories.length === 0 && !canAccessPro && (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-white/50 mb-2">Aucun sujet selectionne</p>
          <button
            onClick={() => setIsManageOpen(true)}
            className="text-xs font-medium text-white/80 hover:text-white"
          >
            Gerer mes sujets
          </button>
        </div>
      )}
      {filteredCategories.map((category, categoryIndex) => {
        const CategoryIcon = category.icon
        const isLastCategory = categoryIndex === filteredCategories.length - 1
        const isSingleTopic = category.topics.length === 1 && category.topics[0].title === category.name
        const hasActiveTopic = category.topics.some(topic => isTopicActive(topic.slug))

        if (isSingleTopic) {
          const topic = category.topics[0]
          const isActive = isTopicActive(topic.slug)
          return (
            <div key={category.name}>
              <Link
                href={`/topics/${topic.slug}`}
                onClick={onNavigate}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                  isActive ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <CategoryIcon className="w-3.5 h-3.5 text-white transition-colors duration-200" />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
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
                hasActiveTopic && !isOpen ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isOpen || hasActiveTopic ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <CategoryIcon className="w-3.5 h-3.5 text-white transition-colors duration-200" />
                </div>
                <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 text-left truncate ${
                  isOpen || hasActiveTopic ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  {category.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-all duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="py-1 ml-[22px] border-l border-white/15">
                {category.topics.map((topic) => {
                  const TopicIcon = topic.icon
                  const isActive = isTopicActive(topic.slug)
                  return (
                    <div key={topic.slug} className="relative">
                      <Link
                        href={`/topics/${topic.slug}`}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 px-3 py-2 ml-3 mr-1 rounded-lg transition-all duration-200 group relative ${
                          isActive ? 'bg-white/15' : 'hover:bg-white/10'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#EBA7CB]" />
                        )}
                        <TopicIcon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                        }`} />
                        <span className={`text-[12px] tracking-wide leading-tight transition-colors duration-200 ${
                          isActive ? 'text-white font-semibold' : 'text-white/70 font-semibold group-hover:text-white'
                        }`}>
                          {topic.title}
                        </span>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {!isLastCategory && <div className="h-1" />}
          </div>
        )
      })}

      <>
        <div className="my-3 border-t border-white/10" />
        <Link
          href="/annuaire"
          onClick={onNavigate}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
            pathname === '/annuaire' ? 'bg-white/15' : 'hover:bg-white/10'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
            pathname === '/annuaire' ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-white transition-colors duration-200" />
          </div>
          <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 ${
            pathname === '/annuaire' ? 'text-white' : 'text-white/70 group-hover:text-white'
          }`}>
            Annuaire
          </span>
        </Link>
        <Link
          href="/aides"
          onClick={onNavigate}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
            pathname === '/aides' ? 'bg-white/15' : 'hover:bg-white/10'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
            pathname === '/aides' ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <Gift className="w-3.5 h-3.5 text-white transition-colors duration-200" />
          </div>
          <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 ${
            pathname === '/aides' ? 'text-white' : 'text-white/70 group-hover:text-white'
          }`}>
            Aides & droits
          </span>
        </Link>
      </>

      {canAccessPro && (
        <>
          <div className="my-3 border-t border-white/10" />
          <div className="px-3 pb-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-white/60" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Freelance</span>
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
                        ? 'bg-white/15 border border-white/10'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'
                    }`}>
                      <Icon className="w-3.5 h-3.5 text-white transition-colors duration-200" />
                    </div>
                    <span className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
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

      {selectedTopics && (
        <div className="pt-2">
          <button
            onClick={() => setIsManageOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
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
