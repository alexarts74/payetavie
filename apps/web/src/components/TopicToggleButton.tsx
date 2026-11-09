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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#235037] bg-[#EEF7F1] hover:bg-[#235037]/10 border border-[#235037]/20 transition-all disabled:opacity-50 flex-shrink-0"
    >
      <Plus className="w-3.5 h-3.5" />
      {isPending ? '...' : 'Ajouter'}
    </button>
  )
}
