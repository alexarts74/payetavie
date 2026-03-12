'use client'

import { useTransition } from 'react'
import { Plus } from 'lucide-react'
import { toggleTopic } from '@/app/actions/preferences'

export default function TopicToggleButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await toggleTopic(slug)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 transition-all disabled:opacity-50 flex-shrink-0"
    >
      <Plus className="w-3.5 h-3.5" />
      {isPending ? '...' : 'Ajouter'}
    </button>
  )
}
