'use client'

import { useState, useEffect } from 'react'
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
  Building2,
  Calendar,
  GraduationCap,
  BookOpen,
  Car,
  CarFront,
  Bus,
  Plane,
  Wallet,
  Users,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'

type NavLinksProps = {
  onNavigate?: () => void
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
    name: 'Administration & Finances',
    icon: Wallet,
    topics: [
      { slug: 'impots', title: 'Impôts', icon: FileText },
      { slug: 'urssaf', title: 'URSSAF / Cotisations sociales', icon: Briefcase },
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
      { slug: 'assurances', title: 'Assurances', icon: Shield },
    ],
  },
  {
    name: 'Santé & Médical',
    icon: Stethoscope,
    topics: [
      { slug: 'mutuelle', title: 'Mutuelle', icon: Heart },
      { slug: 'medecin-generaliste', title: 'Médecin généraliste', icon: Stethoscope },
      { slug: 'pharmacie', title: 'Pharmacie', icon: Pill },
      { slug: 'analyses-medicales', title: 'Analyses médicales', icon: TestTube },
    ],
  },
  {
    name: 'Travail & Carrière',
    icon: Briefcase,
    topics: [
      { slug: 'contrat-de-travail', title: 'Contrat de travail', icon: FileText },
      { slug: 'conges-rtt', title: 'Congés & RTT', icon: Calendar },
      { slug: 'formation-professionnelle', title: 'Formation professionnelle', icon: GraduationCap },
      { slug: 'chomage', title: 'Chômage', icon: Building2 },
    ],
  },
  {
    name: 'Études & Formation',
    icon: GraduationCap,
    topics: [
      { slug: 'cours-examens', title: 'Cours & Examens', icon: BookOpen },
      { slug: 'inscriptions-etudiantes', title: 'Inscriptions', icon: FileText },
      { slug: 'bourses-etudiantes', title: 'Bourses étudiantes', icon: HandHeart },
      { slug: 'stage-alternance', title: 'Stage & Alternance', icon: Briefcase },
    ],
  },
  {
    name: 'Logement & Vie quotidienne',
    icon: Home,
    topics: [
      { slug: 'logement', title: 'Logement', icon: Home },
    ],
  },
  {
    name: 'Transport & Mobilité',
    icon: Car,
    topics: [
      { slug: 'permis-conduire', title: 'Permis de conduire', icon: CarFront },
      { slug: 'vehicule', title: 'Véhicule', icon: Car },
      { slug: 'transports-communs', title: 'Transports en commun', icon: Bus },
    ],
  },
  {
    name: 'Autre',
    icon: Users,
    topics: [
      { slug: 'voyages', title: 'Voyages', icon: Plane },
    ],
  },
]

export default function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname()
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  // Ouvrir automatiquement la catégorie qui contient le topic actif
  useEffect(() => {
    const activeCategory = categories.find(cat =>
      cat.topics.some(topic => pathname === `/topics/${topic.slug}`)
    )
    if (activeCategory) {
      setOpenCategories(new Set([activeCategory.name]))
    }
  }, [pathname])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  return (
    <div className="space-y-1">
      {categories.map((category, categoryIndex) => {
        const CategoryIcon = category.icon
        const isLastCategory = categoryIndex === categories.length - 1
        const isOpen = openCategories.has(category.name)
        const hasActiveTopic = category.topics.some(topic => pathname === `/topics/${topic.slug}`)

        return (
          <div key={category.name}>
            {/* En-tête de catégorie (cliquable) */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-zinc-50 group"
            >
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
                <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-700 uppercase tracking-wider transition-colors">
                  {category.name}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Topics de la catégorie (avec transition) */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-0 py-1">
                {category.topics.map((topic, topicIndex) => {
                  const TopicIcon = topic.icon
                  const isActive = pathname === `/topics/${topic.slug}`
                  const isLastTopic = topicIndex === category.topics.length - 1

                  return (
                    <div key={topic.slug}>
                      <Link
                        href={`/topics/${topic.slug}`}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-4 py-2.5 ml-4 mr-2 rounded-lg transition-all group relative ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                            : 'hover:bg-zinc-50'
                        }`}
                      >
                        <TopicIcon 
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-blue-600'
                              : 'text-zinc-600'
                          }`} 
                        />
                        <span 
                          className={`text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-blue-700 font-semibold'
                              : 'text-zinc-700'
                          }`}
                        >
                          {topic.title}
                        </span>
                      </Link>
                      
                      {/* Séparateur après chaque topic (sauf le dernier de la catégorie) */}
                      {!isLastTopic && (
                        <div className="px-4 py-0.5 ml-4 mr-2">
                          <div className="h-px bg-zinc-100" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Séparateur entre catégories (sauf la dernière) */}
            {!isLastCategory && (
              <div className="px-4 py-2">
                <div className="h-px bg-zinc-200" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

