'use client'

import { useState, useTransition } from 'react'
import { X, Settings, Check, Crown, Lock, ArrowRight } from 'lucide-react'
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
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
    ],
  },
  {
    name: 'Finances',
    icon: FileText,
    topics: [
      { slug: 'impots', title: 'Impots', icon: FileText },
      { slug: 'urssaf', title: 'URSSAF / Cotisations sociales', icon: Briefcase },
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

type ManageTopicsModalProps = {
  isOpen: boolean
  onClose: () => void
  currentTopics: string[]
  maxTopics?: number
  plan?: PlanName
}

export default function ManageTopicsModal({ isOpen, onClose, currentTopics, maxTopics, plan }: ManageTopicsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentTopics))
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const canAccessPro = plan === 'pro'
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

  const selectAll = () => setSelected(new Set(hasTopicLimit ? ALL_TOPIC_SLUGS.slice(0, maxTopics) : ALL_TOPIC_SLUGS))
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] glass-card rounded-2xl shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-700/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Gerer mes sujets</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{selected.size} sujet{selected.size > 1 ? 's' : ''} selectionne{selected.size > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Plan info banner */}
          {plan === 'free' && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-700/30">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Plan Gratuit — {selected.size}/{maxTopics} sujets
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Passez au plan Essentiel pour debloquer tous les sujets en illimite.
                  </p>
                  <Link
                    href="/pricing?required=essentiel"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Voir les plans <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isAtLimit && plan === 'free' && (
            <div className="mb-4 p-3 rounded-xl bg-red-50/80 dark:bg-red-900/15 border border-red-200/60 dark:border-red-700/30">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Limite atteinte ! Deselectionnez un sujet ou passez au plan Essentiel.
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
                      <CategoryIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {category.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`flex items-center justify-center w-5 h-5 rounded border transition-all duration-200 ${
                        allCatSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : someCatSelected
                            ? 'bg-indigo-600/40 border-indigo-400 dark:border-indigo-500'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                      aria-label={allCatSelected ? `Desactiver ${category.name}` : `Activer ${category.name}`}
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
                          onClick={() => !isDisabled && toggleSlug(topic.slug)}
                          disabled={isDisabled}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/10'
                              : isDisabled
                                ? 'border-zinc-200 dark:border-zinc-700/40 opacity-30 cursor-not-allowed'
                                : 'border-zinc-200 dark:border-zinc-700/40 opacity-50 hover:opacity-80 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                          }`}
                        >
                          <TopicIcon className={`w-4 h-4 flex-shrink-0 ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`} />
                          <span className={`text-sm font-medium flex-1 text-left ${
                            isSelected
                              ? 'text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}>
                            {topic.title}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Module Freelance Pro */}
            <div className="border-t border-zinc-200/80 dark:border-zinc-700/40 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Module Freelance
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
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
                      className="flex items-center gap-3 p-3 rounded-xl border border-purple-200/60 dark:border-purple-700/30 bg-purple-50/30 dark:bg-purple-900/10"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{title}</span>
                      <Check className="w-4 h-4 ml-auto text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-purple-200 dark:border-purple-800/40 bg-purple-50/30 dark:bg-purple-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Gerez vos clients et votre facturation
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Factures, devis, gestion clients — 9,99€/mois
                      </p>
                    </div>
                    <Link
                      href="/pricing?required=pro"
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
                    >
                      Decouvrir
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-700/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            {!hasTopicLimit ? (
              <>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Tout selectionner
                </button>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
              </>
            ) : null}
            <button
              onClick={resetSelection}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Reinitialiser
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || selected.size === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-sm transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
