'use client'

import { useState } from 'react'
import { addBookmark, removeBookmark } from '@/app/actions/bookmarks'
import type { Bookmark } from '@/types'
import { Link2, ExternalLink, Heart, ChevronRight } from 'lucide-react'
import type { PlanName } from '@/types'
import UpgradePrompt from '@/components/UpgradePrompt'

interface BookmarksSectionProps {
  topicSlug: string
  initialBookmarks: Bookmark[]
  resources: Array<{ name: string; url: string }>
  plan?: PlanName
  bookmarksCount?: number
  bookmarksLimit?: number
}

export default function BookmarksSection({ topicSlug, initialBookmarks, resources, plan, bookmarksCount, bookmarksLimit }: BookmarksSectionProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const bookmarkUrls = new Set(bookmarks.map(b => b.resource_url))
  const bookmarkLimitReached = plan === 'free' && bookmarksCount !== undefined && bookmarksLimit !== undefined && bookmarksCount >= bookmarksLimit

  const handleToggleBookmark = async (resourceName: string, resourceUrl: string) => {
    const existingBookmark = bookmarks.find(b => b.resource_url === resourceUrl)

    if (existingBookmark) {
      const result = await removeBookmark(existingBookmark.id)
      if (result.success) {
        setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id))
      }
    } else {
      const result = await addBookmark(topicSlug, resourceName, resourceUrl)
      if (result.data) {
        setBookmarks([...bookmarks, result.data])
      }
    }
  }

  return (
    <div className="glass-card rounded-[2rem] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ressources officielles</h2>
      </div>

      {bookmarkLimitReached && (
        <div className="mb-4">
          <UpgradePrompt
            requiredPlan="essentiel"
            currentCount={bookmarksCount}
            limit={bookmarksLimit}
            resourceLabel="favoris"
          />
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Mes favoris</h3>
          <div className="flex flex-wrap gap-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/30"
              >
                <a
                  href={bookmark.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium text-sm group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors">
                    {bookmark.resource_name}
                  </span>
                </a>
                <button
                  onClick={() => handleToggleBookmark(bookmark.resource_name, bookmark.resource_url)}
                  className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 transition-all"
                  title="Retirer des favoris"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {resources.map((resource, index) => {
          const isBookmarked = bookmarkUrls.has(resource.url)
          return (
            <div
              key={index}
              className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
            >
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 flex-1"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shadow-sm">
                  <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  {resource.name}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
              </a>
              <button
                onClick={() => handleToggleBookmark(resource.name, resource.url)}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
