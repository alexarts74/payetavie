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
    setLoadingItems(prev => new Set(prev).add(index))

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

      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    })
  }

  return (
    <div className="card rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EEF7F1] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#235037]" />
          </div>
          <h2 className="text-lg font-semibold text-[#235037]">Checklist</h2>
        </div>
        <div className="text-sm font-medium text-[#5A6B61]">
          {completedCount}/{totalCount} ({progressPercent}%)
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#235037] transition-all duration-500 ease-out"
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
                  ? 'border-[#235037]/20 bg-[#EEF7F1]'
                  : 'border-[#E8E8E8] bg-white hover:bg-[#EEF7F1]/50 hover:border-[#235037]/20'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#235037]'
                  : 'bg-[#EEF7F1] group-hover:bg-[#235037]/10'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-[#5A6B61] animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-[#235037]" />
                )}
              </div>
              <p className={`text-sm leading-relaxed flex-1 pt-0.5 transition-all duration-300 ${
                isCompleted
                  ? 'text-[#5A6B61] line-through'
                  : 'text-[#1a2e22] group-hover:text-[#235037]'
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
