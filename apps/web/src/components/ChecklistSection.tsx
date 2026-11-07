'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toggleChecklistItem } from '@/app/actions/checklists'

interface ChecklistSectionProps {
  items: string[]
  topicSlug: string
  initialProgress: number[]
}

export default function ChecklistSection({ items, topicSlug, initialProgress }: ChecklistSectionProps) {
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set(initialProgress))
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set())
  const [, startTransition] = useTransition()

  const completedCount = completedItems.size
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function handleToggle(index: number) {
    // Ajouter à l'état de chargement
    setLoadingItems(prev => new Set(prev).add(index))

    // Mise à jour optimiste
    const wasCompleted = completedItems.has(index)
    setCompletedItems(prev => {
      const next = new Set(prev)
      if (wasCompleted) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })

    startTransition(async () => {
      const result = await toggleChecklistItem(topicSlug, index)

      if (!result.success) {
        // Revenir en arrière si erreur
        setCompletedItems(prev => {
          const next = new Set(prev)
          if (wasCompleted) {
            next.add(index)
          } else {
            next.delete(index)
          }
          return next
        })
      }

      // Retirer de l'état de chargement
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    })
  }

  return (
    <div className="glass-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Checklist</h2>
        </div>
        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-400">
          {completedCount}/{totalCount} ({progressPercent}%)
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, index) => {
          const isCompleted = completedItems.has(index)
          const isLoading = loadingItems.has(index)

          return (
            <button
              key={index}
              onClick={() => handleToggle(index)}
              disabled={isLoading}
              className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 text-left w-full ${
                isCompleted
                  ? 'border-indigo-200 dark:border-indigo-700/50 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600/50'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? 'bg-indigo-600 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-zinc-500 dark:text-zinc-500 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-500 dark:text-zinc-500 group-hover:text-indigo-500" />
                )}
              </div>
              <p className={`text-sm leading-relaxed flex-1 pt-0.5 transition-all duration-300 ${
                isCompleted
                  ? 'text-zinc-600 dark:text-zinc-500 line-through'
                  : 'text-zinc-700 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
              }`}>
                {item}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
