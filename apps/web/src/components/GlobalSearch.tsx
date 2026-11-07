'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  LayoutDashboard,
  User,
  Crown,
  Wallet,
  PieChart,
  RefreshCw,
  Users,
  Receipt,
  FileText,
  Landmark,
  Stethoscope,
  Pill,
  FlaskConical,
  Home,
  ShieldCheck,
  HeartPulse,
  ClipboardList,
} from 'lucide-react'
import type { PlanName } from '@/types'

type SearchItem = {
  title: string
  subtitle: string
  href: string
  icon: React.ElementType
  keywords: string[]
  section: string
}

type GlobalSearchProps = {
  selectedTopics?: string[]
  plan?: PlanName
  className?: string
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const TOPIC_ITEMS: Record<string, { title: string; icon: React.ElementType; keywords: string[]; section: string; href: string }> = {
  impots: {
    title: 'Impôts',
    icon: Landmark,
    keywords: ['impots', 'impôts', 'taxes', 'fiscal', 'declaration', 'déclaration', 'ir'],
    section: 'Administration',
    href: '/topics/impots',
  },
  urssaf: {
    title: 'URSSAF / Cotisations',
    icon: ClipboardList,
    keywords: ['urssaf', 'cotisations', 'charges', 'sociales', 'independant', 'indépendant'],
    section: 'Administration',
    href: '/topics/urssaf',
  },
  'fiches-de-paie': {
    title: 'Fiches de paie',
    icon: FileText,
    keywords: ['fiches', 'paie', 'salaire', 'bulletin', 'fiche de paie'],
    section: 'Administration',
    href: '/topics/fiches-de-paie',
  },
  caf: {
    title: 'CAF / Aides',
    icon: Users,
    keywords: ['caf', 'aides', 'allocations', 'prestations', 'famille'],
    section: 'Administration',
    href: '/topics/caf',
  },
  assurances: {
    title: 'Assurances',
    icon: ShieldCheck,
    keywords: ['assurances', 'assurance', 'auto', 'habitation', 'responsabilite'],
    section: 'Santé & Logement',
    href: '/topics/assurances',
  },
  mutuelle: {
    title: 'Mutuelle',
    icon: HeartPulse,
    keywords: ['mutuelle', 'sante', 'santé', 'complementaire', 'remboursement'],
    section: 'Santé & Logement',
    href: '/topics/mutuelle',
  },
  'medecin-generaliste': {
    title: 'Médecin généraliste',
    icon: Stethoscope,
    keywords: ['medecin', 'médecin', 'generaliste', 'généraliste', 'docteur', 'consultation'],
    section: 'Santé & Logement',
    href: '/topics/medecin-generaliste',
  },
  pharmacie: {
    title: 'Pharmacie',
    icon: Pill,
    keywords: ['pharmacie', 'medicaments', 'médicaments', 'ordonnance'],
    section: 'Santé & Logement',
    href: '/topics/pharmacie',
  },
  'analyses-medicales': {
    title: 'Analyses médicales',
    icon: FlaskConical,
    keywords: ['analyses', 'medicales', 'médicales', 'labo', 'laboratoire', 'bilan'],
    section: 'Santé & Logement',
    href: '/topics/analyses-medicales',
  },
  logement: {
    title: 'Logement',
    icon: Home,
    keywords: ['logement', 'appartement', 'maison', 'loyer', 'locataire', 'proprio'],
    section: 'Santé & Logement',
    href: '/topics/logement',
  },
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>

  const normalizedQuery = normalize(query.trim())
  const normalizedText = normalize(text)
  const index = normalizedText.indexOf(normalizedQuery)

  if (index === -1) return <span>{text}</span>

  return (
    <span>
      {text.slice(0, index)}
      <mark className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded px-0.5 not-italic font-semibold">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </span>
  )
}

export default function GlobalSearch({ selectedTopics, plan, className }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canAccessEssentiel = plan === 'essentiel' || plan === 'pro'
  const canAccessPro = plan === 'pro'

  const searchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [
      {
        title: 'Tableau de bord',
        subtitle: 'Navigation',
        href: '/dashboard',
        icon: LayoutDashboard,
        keywords: ['dashboard', 'tableau', 'bord', 'accueil'],
        section: 'Navigation',
      },
      {
        title: 'Profil',
        subtitle: 'Navigation',
        href: '/profile',
        icon: User,
        keywords: ['profil', 'compte', 'utilisateur', 'parametres'],
        section: 'Navigation',
      },
      {
        title: 'Tarifs',
        subtitle: 'Navigation',
        href: '/pricing',
        icon: Crown,
        keywords: ['tarifs', 'plans', 'abonnement', 'prix', 'upgrade'],
        section: 'Navigation',
      },
    ]

    // Topics filtrés par selectedTopics
    const topicSlugs = selectedTopics ?? Object.keys(TOPIC_ITEMS)
    for (const slug of topicSlugs) {
      const topic = TOPIC_ITEMS[slug]
      if (topic) {
        items.push({
          title: topic.title,
          subtitle: topic.section,
          href: topic.href,
          icon: topic.icon,
          keywords: topic.keywords,
          section: topic.section,
        })
      }
    }

    if (canAccessEssentiel) {
      items.push(
        {
          title: 'Dépenses',
          subtitle: 'Finances',
          href: '/depenses',
          icon: Wallet,
          keywords: ['depenses', 'dépenses', 'argent', 'finances', 'transactions'],
          section: 'Finances',
        },
        {
          title: 'Budgets',
          subtitle: 'Finances',
          href: '/depenses/budgets',
          icon: PieChart,
          keywords: ['budgets', 'budget mensuel', 'enveloppes'],
          section: 'Finances',
        },
        {
          title: 'Dépenses récurrentes',
          subtitle: 'Finances',
          href: '/depenses/recurrents',
          icon: RefreshCw,
          keywords: ['recurrents', 'récurrents', 'abonnements', 'charges fixes', 'mensuel'],
          section: 'Finances',
        }
      )
    }

    if (canAccessPro) {
      items.push(
        {
          title: 'Clients',
          subtitle: 'Freelance',
          href: '/freelance/clients',
          icon: Users,
          keywords: ['clients', 'freelance', 'contacts', 'entreprises'],
          section: 'Freelance',
        },
        {
          title: 'Facturation',
          subtitle: 'Freelance',
          href: '/freelance/facturation',
          icon: Receipt,
          keywords: ['facturation', 'factures', 'devis', 'invoices', 'freelance'],
          section: 'Freelance',
        }
      )
    }

    return items
  }, [selectedTopics, canAccessEssentiel, canAccessPro])

  const filteredItems = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return searchItems.slice(0, 8)

    const scored = searchItems.map(item => {
      const normalizedTitle = normalize(item.title)
      const normalizedSubtitle = normalize(item.subtitle)
      const keywordsMatch = item.keywords.some(kw => normalize(kw).includes(q))

      let score = 0
      if (normalizedTitle.startsWith(q)) score = 3
      else if (normalizedTitle.includes(q)) score = 2
      else if (normalizedSubtitle.includes(q)) score = 1
      else if (keywordsMatch) score = 1

      return { item, score }
    })

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item)
  }, [query, searchItems])

  // Group by section
  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    for (const item of filteredItems) {
      if (!groups[item.section]) groups[item.section] = []
      groups[item.section].push(item)
    }
    return groups
  }, [filteredItems])

  const showSectionLabels = Object.keys(groupedItems).length > 1

  const navigate = useCallback((href: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(href)
  }, [router])

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset activeIndex quand filteredItems change
  useEffect(() => {
    setActiveIndex(0)
  }, [filteredItems])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredItems[activeIndex]
      if (item) navigate(item.href)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  let globalIndex = 0

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un module..."
          className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-zinc-950/40 overflow-hidden">
          <div className="py-1.5">
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                {showSectionLabels && (
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                      {section}
                    </span>
                  </div>
                )}
                {items.map(item => {
                  const currentIndex = globalIndex++
                  const isActive = currentIndex === activeIndex
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      onClick={() => navigate(item.href)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors duration-100 ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-tight">
                          <HighlightedText text={item.title} query={query} />
                        </div>
                        {showSectionLabels ? null : (
                          <div className="text-[11px] text-zinc-400 leading-tight">{item.subtitle}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim() && filteredItems.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-zinc-950/40 overflow-hidden">
          <div className="py-4 px-3 text-center text-[13px] text-zinc-400">
            Aucun résultat pour &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  )
}
