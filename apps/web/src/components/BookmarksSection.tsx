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
    <div className="card rounded-[2rem] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#EEF7F1] flex items-center justify-center">
          <Link2 className="w-5 h-5 text-[#235037]" />
        </div>
        <h2 className="text-lg font-semibold text-[#235037]">Ressources officielles</h2>
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
          <h3 className="text-sm font-semibold text-[#5A6B61] mb-3">Mes favoris</h3>
          <div className="flex flex-wrap gap-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-[#235037]/20 bg-[#EEF7F1]"
              >
                <a
                  href={bookmark.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-[#235037]" />
                  </div>
                  <span className="text-[#235037] font-medium text-sm group-hover:text-[#1a3d2a] transition-colors">
                    {bookmark.resource_name}
                  </span>
                </a>
                <button
                  onClick={() => handleToggleBookmark(bookmark.resource_name, bookmark.resource_url)}
                  className="p-2 rounded-lg hover:bg-white/60 text-[#235037] transition-all"
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
              className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-[#E8E8E8] bg-white hover:bg-[#EEF7F1]/50 hover:border-[#235037]/20 transition-all duration-300"
            >
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 flex-1"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EEF7F1] flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-[#235037]" />
                </div>
                <span className="text-[#235037] font-medium text-sm group-hover:text-[#1a3d2a] transition-colors">
                  {resource.name}
                </span>
                <ChevronRight className="w-4 h-4 text-[#5A6B61] group-hover:text-[#235037] transition-all" />
              </a>
              <button
                onClick={() => handleToggleBookmark(resource.name, resource.url)}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-[#EEF7F1] text-[#235037]'
                    : 'hover:bg-[#EEF7F1] text-[#5A6B61] hover:text-[#235037]'
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
