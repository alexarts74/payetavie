'use client'

import { useState, useTransition } from 'react'
import { X, Settings, Check, Crown, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  FileText,
  Briefcase,
  Heart,
  DollarSign,
  Home,
  Shield,
  Stethoscope,
  Users,
  Receipt,
  Rocket,
  type LucideIcon,
} from 'lucide-react'
import { updateSelectedTopics } from '@/app/actions/preferences'
import { ALL_TOPIC_SLUGS } from '@/lib/profile-topics'
import type { PlanName } from '@/types'

type Topic = { slug: string; title: string; icon: LucideIcon }
type Category = { name: string; icon: LucideIcon; topics: Topic[] }

const categories: Category[] = [
  {
    name: 'Travail',
    icon: Briefcase,
    topics: [
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
    ],
  },
  {
    name: 'Finances',
    icon: FileText,
    topics: [
      { slug: 'impots', title: 'Impots', icon: FileText },
      { slug: 'assurances', title: 'Assurances', icon: Shield },
    ],
  },
  {
    name: 'Sante',
    icon: Stethoscope,
    topics: [
      { slug: 'mutuelle', title: 'Mutuelle', icon: Heart },
      { slug: 'sante', title: 'Sante', icon: Stethoscope },
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

type ManageTopicsModalProps = {
  isOpen: boolean
  onClose: () => void
  currentTopics: string[]
  maxTopics?: number
  plan?: PlanName
}

const FREELANCE_SLUGS = new Set(['freelance-clients', 'freelance-facturation'])

export default function ManageTopicsModal({ isOpen, onClose, currentTopics, maxTopics, plan }: ManageTopicsModalProps) {
  const canAccessPro = plan === 'pro'
  const initialTopics = canAccessPro ? currentTopics : currentTopics.filter(s => !FREELANCE_SLUGS.has(s))
  const [selected, setSelected] = useState<Set<string>>(new Set(initialTopics))
  const [isPending, startTransition] = useTransition()
  const [limitBump, setLimitBump] = useState<string | null>(null)

  if (!isOpen) return null

  const hasTopicLimit = maxTopics !== undefined && maxTopics !== Infinity
  const isAtLimit = hasTopicLimit && selected.size >= maxTopics

  const toggleSlug = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        if (hasTopicLimit && next.size >= maxTopics) return prev
        next.add(slug)
      }
      return next
    })
  }

  const toggleCategory = (category: Category) => {
    setSelected(prev => {
      const next = new Set(prev)
      const allSelected = category.topics.every(t => next.has(t.slug))
      for (const topic of category.topics) {
        if (allSelected) {
          next.delete(topic.slug)
        } else {
          if (hasTopicLimit && next.size >= maxTopics) break
          next.add(topic.slug)
        }
      }
      return next
    })
  }

  const selectAll = () => {
    const slugs = canAccessPro ? ALL_TOPIC_SLUGS : ALL_TOPIC_SLUGS.filter(s => !FREELANCE_SLUGS.has(s))
    setSelected(new Set(hasTopicLimit ? slugs.slice(0, maxTopics) : slugs))
  }
  const resetSelection = () => setSelected(new Set(currentTopics))

  const handleSave = () => {
    startTransition(async () => {
      await updateSelectedTopics([...selected])
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#235037] flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a2e22]">Gérer mes sujets</h2>
              <p className="text-xs text-[#5A6B61]">{selected.size} sujet{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A6B61] hover:text-[#1a2e22] hover:bg-[#EEF7F1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Plan info banner */}
          {plan === 'free' && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDEEF6] border border-[#EBA7CB]/40">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-[#235037] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a2e22]">
                    Plan Gratuit — {selected.size}/{maxTopics} sujets
                  </p>
                  <p className="text-xs text-[#5A6B61] mt-0.5">
                    Passez au plan Essentiel pour débloquer tous les sujets en illimité.
                  </p>
                  <Link
                    href="/pricing?required=essentiel"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#235037] hover:text-[#1a3d2a] transition-colors"
                  >
                    Voir les plans <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isAtLimit && plan === 'free' && (
            <div
              id="limit-banner"
              className={`mb-4 p-3 rounded-xl bg-red-50 border border-red-200 transition-all ${limitBump ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
            >
              <p className="text-sm font-medium text-red-700">
                Limite atteinte ! Déselectionnez un sujet ou passez au plan Essentiel.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {categories.map((category) => {
              const CategoryIcon = category.icon
              const allCatSelected = category.topics.every(t => selected.has(t.slug))
              const someCatSelected = category.topics.some(t => selected.has(t.slug))
              return (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-[#5A6B61]" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#5A6B61]">
                        {category.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`flex items-center justify-center w-5 h-5 rounded border transition-all duration-200 ${
                        allCatSelected
                          ? 'bg-[#235037] border-[#235037]'
                          : someCatSelected
                            ? 'bg-[#235037]/40 border-[#235037]/60'
                            : 'border-[#E8E8E8] hover:border-[#235037]/40'
                      }`}
                      aria-label={allCatSelected ? `Désactiver ${category.name}` : `Activer ${category.name}`}
                    >
                      {(allCatSelected || someCatSelected) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.topics.map((topic) => {
                      const TopicIcon = topic.icon
                      const isSelected = selected.has(topic.slug)
                      const isDisabled = !isSelected && isAtLimit
                      return (
                        <button
                          key={topic.slug}
                          onClick={() => {
                            if (isDisabled) {
                              setLimitBump(topic.slug)
                              setTimeout(() => setLimitBump(null), 500)
                            } else {
                              toggleSlug(topic.slug)
                            }
                          }}
                          title={isDisabled ? 'Limite atteinte — passez au plan Essentiel' : undefined}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-[#235037]/30 bg-[#EEF7F1]'
                              : isDisabled
                                ? `border-[#E8E8E8] opacity-55 ${limitBump === topic.slug ? 'animate-shake' : ''}`
                                : 'border-[#E8E8E8] opacity-50 hover:opacity-80 hover:bg-[#EEF7F1]/50'
                          }`}
                        >
                          <TopicIcon className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-[#235037]' : 'text-[#5A6B61]'
                          }`} />
                          <span className={`text-sm font-medium flex-1 text-left ${
                            isSelected ? 'text-[#1a2e22]' : 'text-[#5A6B61]'
                          }`}>
                            {topic.title}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#235037] flex-shrink-0" />
                          )}
                          {isDisabled && (
                            <Crown className="w-3.5 h-3.5 text-[#EBA7CB] ml-auto flex-shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Section Independant */}
            <div className="border-t border-[#E8E8E8] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-[#235037]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#235037]">
                  Independant
                </span>
              </div>
              {/* URSSAF — disponible pour tous */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {(() => {
                  const slug = 'urssaf'
                  const isSelected = selected.has(slug)
                  const isDisabled = !isSelected && isAtLimit
                  return (
                    <button
                      key={slug}
                      onClick={() => {
                        if (isDisabled) {
                          setLimitBump(slug)
                          setTimeout(() => setLimitBump(null), 500)
                        } else {
                          toggleSlug(slug)
                        }
                      }}
                      title={isDisabled ? 'Limite atteinte — passez au plan Essentiel' : undefined}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#235037]/30 bg-[#EEF7F1]'
                          : isDisabled
                            ? `border-[#E8E8E8] opacity-55 ${limitBump === slug ? 'animate-shake' : ''}`
                            : 'border-[#E8E8E8] opacity-50 hover:opacity-80 hover:bg-[#EEF7F1]/50'
                      }`}
                    >
                      <Briefcase className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#235037]' : 'text-[#5A6B61]'}`} />
                      <span className={`text-sm font-medium flex-1 text-left ${isSelected ? 'text-[#1a2e22]' : 'text-[#5A6B61]'}`}>
                        URSSAF / Cotisations
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#235037] flex-shrink-0" />}
                      {isDisabled && <Crown className="w-3.5 h-3.5 text-[#EBA7CB] ml-auto flex-shrink-0" />}
                    </button>
                  )
                })()}
              </div>
              {/* Module Freelance Pro */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#5A6B61]">Module Facturation</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBA7CB]/30 text-[10px] font-bold text-[#235037] uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> Pro
                </span>
              </div>
              {canAccessPro ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { slug: 'freelance-clients', title: 'Clients', icon: Users },
                    { slug: 'freelance-facturation', title: 'Facturation', icon: Receipt },
                  ].map(({ slug, title, icon: Icon }) => (
                    <div
                      key={slug}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#235037]/20 bg-[#EEF7F1]"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-[#235037]" />
                      <span className="text-sm font-medium text-[#235037]">{title}</span>
                      <Check className="w-4 h-4 ml-auto text-[#235037] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#E8E8E8] bg-[#FDEEF6]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBA7CB]/20 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-5 h-5 text-[#235037]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a2e22]">
                        Gérez vos clients et votre facturation
                      </p>
                      <p className="text-xs text-[#5A6B61] mt-0.5">
                        Factures, devis, gestion clients — 9,99€/mois
                      </p>
                    </div>
                    <Link
                      href="/pricing?required=pro"
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white text-xs font-semibold transition-colors"
                    >
                      Découvrir
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E8E8] flex-shrink-0">
          <div className="flex items-center gap-2">
            {!hasTopicLimit ? (
              <>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium text-[#235037] hover:text-[#1a3d2a] transition-colors"
                >
                  Tout sélectionner
                </button>
                <span className="text-[#E8E8E8]">|</span>
              </>
            ) : null}
            <button
              onClick={resetSelection}
              className="text-xs font-medium text-[#5A6B61] hover:text-[#1a2e22] transition-colors"
            >
              Réinitialiser
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || selected.size === 0}
            className="px-5 py-2 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
