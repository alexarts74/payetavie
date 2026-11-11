'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Gift } from 'lucide-react'
import type { Aide, ProfileType } from '@payetavie/shared'

const CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  logement: { label: 'Logement', color: 'text-blue-700', bg: 'bg-blue-100' },
  emploi: { label: 'Emploi', color: 'text-green-700', bg: 'bg-green-100' },
  sante: { label: 'Santé', color: 'text-red-700', bg: 'bg-red-100' },
  famille: { label: 'Famille', color: 'text-purple-700', bg: 'bg-purple-100' },
  formation: { label: 'Formation', color: 'text-amber-700', bg: 'bg-amber-100' },
  independant: { label: 'Indépendant', color: 'text-[#235037]', bg: 'bg-[#EEF7F1]' },
}

const PROFILE_LABELS: Record<ProfileType, string> = {
  etudiant: 'Étudiant',
  salarie: 'Salarié',
  independant: 'Indépendant',
  recherche_emploi: 'En recherche d\'emploi',
  autre: 'Autre',
}

interface Props {
  aides: Aide[]
  allAides: Aide[]
  profileType: ProfileType
}

export default function AidesMoteur({ aides, allAides, profileType }: Props) {
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [expandedAide, setExpandedAide] = useState<string | null>(null)

  const displayedAides = showAll ? allAides : aides
  const filtered = selectedCategorie
    ? displayedAides.filter(a => a.categorie === selectedCategorie)
    : displayedAides

  const categoriesPresentes = Array.from(new Set(displayedAides.map(a => a.categorie)))

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF7F1] border border-[#235037]/20 mb-3">
            <Gift className="w-3.5 h-3.5 text-[#235037]" />
            <span className="text-[11px] font-semibold text-[#235037] uppercase tracking-wider">Aides & droits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#235037] mb-2" style={{ fontFamily: 'var(--font-caprasimo)' }}>
            Vos aides disponibles
          </h1>
          <p className="text-sm text-[#5A6B61]">
            {aides.length} aide{aides.length !== 1 ? 's' : ''} trouvée{aides.length !== 1 ? 's' : ''} pour le profil{' '}
            <span className="font-semibold text-[#235037]">{PROFILE_LABELS[profileType]}</span>
          </p>
        </div>

        {/* Toggle tous les profils */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategorie(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !selectedCategorie
                  ? 'bg-[#235037] text-white'
                  : 'bg-[#EEF7F1] text-[#235037] hover:bg-[#235037]/10'
              }`}
            >
              Toutes ({displayedAides.length})
            </button>
            {categoriesPresentes.map(cat => {
              const info = CATEGORIES[cat]
              const count = displayedAides.filter(a => a.categorie === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategorie(selectedCategorie === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategorie === cat
                      ? `${info.bg} ${info.color}`
                      : 'bg-[#EEF7F1] text-[#5A6B61] hover:bg-[#235037]/10'
                  }`}
                >
                  {info.label} ({count})
                </button>
              )
            })}
          </div>
          <button
            onClick={() => { setShowAll(!showAll); setSelectedCategorie(null) }}
            className="text-xs text-[#5A6B61] hover:text-[#235037] font-medium transition-colors flex-shrink-0"
          >
            {showAll ? 'Mon profil uniquement' : 'Voir toutes les aides'}
          </button>
        </div>

        {/* Liste des aides */}
        <div className="space-y-3 animate-slide-up">
          {filtered.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center">
              <Gift className="w-10 h-10 text-[#5A6B61] mx-auto mb-3" />
              <p className="text-sm text-[#5A6B61]">Aucune aide dans cette catégorie pour votre profil.</p>
            </div>
          ) : (
            filtered.map(aide => {
              const catInfo = CATEGORIES[aide.categorie]
              const isExpanded = expandedAide === aide.id
              const isEligible = aides.some(a => a.id === aide.id)

              return (
                <div
                  key={aide.id}
                  className={`card rounded-2xl overflow-hidden transition-all duration-200 ${!isEligible ? 'opacity-60' : ''}`}
                >
                  <button
                    className="w-full text-left p-5"
                    onClick={() => setExpandedAide(isExpanded ? null : aide.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${catInfo.bg} ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          <span className="text-[10px] font-medium text-[#5A6B61] bg-[#F5F5F5] rounded-full px-2 py-0.5">
                            {aide.organisme}
                          </span>
                          {!isEligible && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                              Autre profil
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-[#1a2e22] leading-snug">{aide.titre}</h3>
                        {aide.montantMax && (
                          <p className="text-xs font-medium text-[#235037] mt-1">{aide.montantMax}</p>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-[#5A6B61] flex-shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-[#5A6B61] flex-shrink-0 mt-0.5" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-[#E8E8E8]/60">
                      <p className="text-sm text-[#5A6B61] mt-4 mb-4 leading-relaxed">{aide.description}</p>

                      {aide.conditions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-[#1a2e22] uppercase tracking-wide mb-2">Conditions</p>
                          <ul className="space-y-1">
                            {aide.conditions.map((cond, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[#5A6B61]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#235037] mt-1.5 flex-shrink-0" />
                                {cond}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aide.url && (
                        <a
                          href={aide.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#235037] hover:text-[#1a3d2a] transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Accéder au site officiel
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
