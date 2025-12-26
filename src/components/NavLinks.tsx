'use client'

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
} from 'lucide-react'

type NavLinksProps = {
  onNavigate?: () => void
}

const topics = [
  { slug: 'impots', title: 'Impôts', icon: FileText },
  { slug: 'urssaf', title: 'URSSAF / Cotisations sociales', icon: Briefcase },
  { slug: 'mutuelle', title: 'Mutuelle / Santé', icon: Heart },
  { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
  { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
  { slug: 'logement', title: 'Logement', icon: Home },
  { slug: 'assurances', title: 'Assurances', icon: Shield },
]

// Groupes de topics pour les séparateurs
const topicGroups = [
  { name: 'Administratif', topics: ['impots', 'urssaf'] },
  { name: 'Santé & Social', topics: ['mutuelle', 'fiches-de-paie', 'caf'] },
  { name: 'Vie pratique', topics: ['logement', 'assurances'] },
]

export default function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-0">
      {topics.map((topic, index) => {
        const Icon = topic.icon
        const isActive = pathname === `/topics/${topic.slug}`
        const isLast = index === topics.length - 1
        
        return (
          <div key={topic.slug}>
            <Link
              href={`/topics/${topic.slug}`}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                  : 'hover:bg-zinc-50'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors ${
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
            
            {/* Séparateur après chaque item (sauf le dernier) */}
            {!isLast && (
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

